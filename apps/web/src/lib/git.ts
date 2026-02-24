import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";

export interface GitObject {
	data: Buffer;
	sha: string;
	type: "blob" | "commit" | "tree";
}

function gitSha(type: string, data: Buffer): string {
	const header = Buffer.from(`${type} ${data.length}\0`);
	return createHash("sha1")
		.update(Buffer.concat([header, data]))
		.digest("hex");
}

export function createBlob(content: Buffer | string): GitObject {
	const data = Buffer.isBuffer(content)
		? content
		: Buffer.from(content, "utf-8");
	return { type: "blob", sha: gitSha("blob", data), data };
}

export function createTree(
	entries: Array<{ mode: string; name: string; sha: string }>
): GitObject {
	const sorted = [...entries].sort((a, b) => {
		const aKey = a.mode === "40000" ? `${a.name}/` : a.name;
		const bKey = b.mode === "40000" ? `${b.name}/` : b.name;
		if (aKey < bKey) {
			return -1;
		}
		if (aKey > bKey) {
			return 1;
		}
		return 0;
	});

	const chunks: Buffer[] = [];
	for (const entry of sorted) {
		chunks.push(Buffer.from(`${entry.mode} ${entry.name}\0`));
		chunks.push(Buffer.from(entry.sha, "hex"));
	}

	const data = Buffer.concat(chunks);
	return { type: "tree", sha: gitSha("tree", data), data };
}

export function createCommit(treeSha: string, message: string): GitObject {
	// Fixed timestamp for deterministic SHAs (stable until file content changes)
	const ts = "1700000000 +0000";
	const author = "Skills Marketplace <noreply@skills.local>";
	const text = `tree ${treeSha}\nauthor ${author} ${ts}\ncommitter ${author} ${ts}\n\n${message}\n`;
	const data = Buffer.from(text, "utf-8");
	return { type: "commit", sha: gitSha("commit", data), data };
}

export function buildRepo(files: Array<{ content: string; path: string }>): {
	commitSha: string;
	objects: GitObject[];
} {
	const objects: GitObject[] = [];

	function buildTree(
		fileList: Array<{ content: string; path: string }>
	): GitObject {
		const directFiles: Array<{ name: string; obj: GitObject }> = [];
		const subdirs = new Map<string, Array<{ content: string; path: string }>>();

		for (const file of fileList) {
			const slash = file.path.indexOf("/");
			if (slash === -1) {
				const blob = createBlob(file.content);
				objects.push(blob);
				directFiles.push({ name: file.path, obj: blob });
			} else {
				const dir = file.path.slice(0, slash);
				const rest = file.path.slice(slash + 1);
				if (!subdirs.has(dir)) {
					subdirs.set(dir, []);
				}
				subdirs.get(dir)?.push({ path: rest, content: file.content });
			}
		}

		const entries: Array<{ mode: string; name: string; sha: string }> = [];

		for (const { name, obj } of directFiles) {
			entries.push({ name, sha: obj.sha, mode: "100644" });
		}

		for (const [dir, subFiles] of subdirs) {
			const subtree = buildTree(subFiles);
			entries.push({ name: dir, sha: subtree.sha, mode: "40000" });
		}

		const tree = createTree(entries);
		objects.push(tree);
		return tree;
	}

	const rootTree = buildTree(files);
	const commit = createCommit(rootTree.sha, "Initial commit");
	objects.push(commit);

	return { commitSha: commit.sha, objects };
}

export function buildPackfile(objects: GitObject[]): Buffer {
	const typeMap: Record<string, number> = { commit: 1, tree: 2, blob: 3 };

	const chunks: Buffer[] = [Buffer.from("PACK")];

	const version = Buffer.allocUnsafe(4);
	version.writeUInt32BE(2, 0);
	chunks.push(version);

	const count = Buffer.allocUnsafe(4);
	count.writeUInt32BE(objects.length, 0);
	chunks.push(count);

	for (const obj of objects) {
		const type = typeMap[obj.type] ?? 0;
		const size = obj.data.length;

		// Type/size varint: first byte has type in bits [6:4], size nibble in [3:0].
		// Arithmetic equivalents used to avoid bitwise operators flagged by linter.
		let firstByte = (type % 8) * 16 + (size % 16);
		let remaining = Math.floor(size / 16);
		if (remaining > 0) {
			firstByte += 128; // set MSB continuation bit
		}

		const headerBytes: number[] = [firstByte];
		while (remaining > 0) {
			let b = remaining % 128;
			remaining = Math.floor(remaining / 128);
			if (remaining > 0) {
				b += 128; // set MSB continuation bit
			}
			headerBytes.push(b);
		}

		chunks.push(Buffer.from(headerBytes));
		chunks.push(deflateSync(obj.data));
	}

	const pack = Buffer.concat(chunks);
	const checksum = createHash("sha1").update(pack).digest();
	return Buffer.concat([pack, checksum]);
}

export function pktLine(data: Buffer | string): Buffer {
	const payload = Buffer.isBuffer(data) ? data : Buffer.from(data, "utf-8");
	const len = payload.length + 4;
	return Buffer.concat([
		Buffer.from(len.toString(16).padStart(4, "0"), "utf-8"),
		payload,
	]);
}

export const PKT_FLUSH = Buffer.from("0000", "utf-8");

/**
 * Build the shallow-acknowledgement response for the first POST in a
 * two-round-trip shallow clone.  git sends `want + deepen` without `done`
 * first; the server must reply with only `shallow <sha> + flush` and nothing
 * else.  git then sends a second POST that includes `done`, at which point the
 * full NAK + packfile response is sent via buildUploadPackResponse.
 */
export function buildShallowResponse(commitSha: string): Buffer {
	return Buffer.concat([pktLine(`shallow ${commitSha}\n`), PKT_FLUSH]);
}

/**
 * Build the upload-pack response body (NAK + side-band-64k packfile).
 * When the client sent `deepen`, pass shallowCommitSha so we emit
 * `shallow <sha> + flush` before the NAK — required on every POST that
 * includes `deepen`, including the final one with `done`.
 */
export function buildUploadPackResponse(
	objects: GitObject[],
	shallowCommitSha?: string
): Buffer {
	const packfile = buildPackfile(objects);
	const chunks: Buffer[] = [];

	if (shallowCommitSha) {
		chunks.push(pktLine(`shallow ${shallowCommitSha}\n`));
		chunks.push(PKT_FLUSH);
	}

	chunks.push(pktLine("NAK\n"));

	// side-band-64k:
	// pkt-line max is 65520 bytes total (4-byte hex length + payload),
	// and side-band uses 1 payload byte for the band designator.
	// So max pack data per packet is 65520 - 4 - 1 = 65515.
	const MAX_CHUNK = 65_515;
	let offset = 0;

	while (offset < packfile.length) {
		const slice = packfile.subarray(offset, offset + MAX_CHUNK);
		offset += MAX_CHUNK;
		const packet = Buffer.allocUnsafe(1 + slice.length);
		packet[0] = 0x01; // band 1 = data
		slice.copy(packet, 1);
		chunks.push(pktLine(packet));
	}

	chunks.push(PKT_FLUSH);
	return Buffer.concat(chunks);
}
