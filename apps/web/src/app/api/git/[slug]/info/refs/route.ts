import { buildRepo, PKT_FLUSH, pktLine } from "@/lib/git";
import { getSkillGitFiles, getSkills } from "@/lib/skills";

export const dynamic = "force-dynamic";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ slug: string }> }
) {
	const { slug: rawSlug } = await params;
	const { searchParams } = new URL(request.url);

	if (searchParams.get("service") !== "git-upload-pack") {
		return new Response("Not Found", { status: 404 });
	}

	const slug = rawSlug.replace(/\.git$/, "");
	const skill = getSkills().find((s) => s.slug === slug);
	if (!skill) {
		return new Response("Not Found", { status: 404 });
	}

	const files = getSkillGitFiles(slug, skill);
	const { commitSha } = buildRepo(files);

	const caps =
		"side-band-64k ofs-delta symref=HEAD:refs/heads/main agent=git/2.0";

	const body = Buffer.concat([
		pktLine("# service=git-upload-pack\n"),
		PKT_FLUSH,
		pktLine(`${commitSha} HEAD\0${caps}\n`),
		pktLine(`${commitSha} refs/heads/main\n`),
		PKT_FLUSH,
	]);

	// Buffer is a Uint8Array at runtime; cast needed due to ArrayBufferLike vs ArrayBuffer
	return new Response(body as unknown as BodyInit, {
		headers: {
			"Content-Type": "application/x-git-upload-pack-advertisement",
			"Cache-Control": "no-cache",
		},
	});
}
