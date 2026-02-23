import {
	buildRepo,
	buildShallowResponse,
	buildUploadPackResponse,
} from "@/lib/git";
import {
	getMarketplaceConfig,
	getMarketplaceGitFiles,
	getSkillGitFiles,
	getSkills,
} from "@/lib/skills";

export const dynamic = "force-dynamic";

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ slug: string }> }
) {
	const { slug: rawSlug } = await params;
	const slug = rawSlug.replace(/\.git$/, "");
	const skills = getSkills();

	let files: ReturnType<typeof getSkillGitFiles>;
	if (slug === "marketplace") {
		files = getMarketplaceGitFiles(skills, getMarketplaceConfig());
	} else {
		const skill = skills.find((s) => s.slug === slug);
		if (!skill) {
			return new Response("Not Found", { status: 404 });
		}
		files = getSkillGitFiles(slug, skill);
	}

	const requestBody = await request.text();
	const hasDeepen = requestBody.includes("deepen");
	const hasDone = requestBody.includes("done");

	const { commitSha, objects } = buildRepo(files);

	// git shallow clone uses two HTTP POST round-trips:
	//   POST 1: want + deepen (no done)  → shallow + flush only
	//   POST 2: want + deepen + done     → shallow + flush + NAK + packfile
	// Both requests include `deepen`, so both responses need shallow boundaries.
	// Non-shallow clones send done in the first POST and get NAK + packfile.
	let body: Buffer;
	if (hasDeepen && !hasDone) {
		body = buildShallowResponse(commitSha);
	} else {
		body = buildUploadPackResponse(objects, hasDeepen ? commitSha : undefined);
	}

	// Buffer is a Uint8Array at runtime; cast needed due to ArrayBufferLike vs ArrayBuffer
	return new Response(body as unknown as BodyInit, {
		headers: {
			"Content-Type": "application/x-git-upload-pack-result",
			"Cache-Control": "no-cache",
		},
	});
}
