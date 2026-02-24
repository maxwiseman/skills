import { buildRepo, PKT_FLUSH, pktLine } from "@/lib/git";
import {
	getMarketplaceConfig,
	getMarketplaceGitFiles,
	getSkillGitFiles,
	getSkills,
} from "@/lib/skills";

export const dynamic = "force-dynamic";
const GIT_SUFFIX_RE = /\.git$/;

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ slug: string }> }
) {
	const { slug: rawSlug } = await params;
	const { searchParams } = new URL(request.url);

	if (searchParams.get("service") !== "git-upload-pack") {
		return new Response("Not Found", { status: 404 });
	}

	const slug = rawSlug.replace(GIT_SUFFIX_RE, "");
	const skills = getSkills();

	let files: Awaited<ReturnType<typeof getSkillGitFiles>>;
	if (slug === "marketplace") {
		files = await getMarketplaceGitFiles(skills, getMarketplaceConfig());
	} else {
		const skill = skills.find((s) => s.slug === slug);
		if (!skill) {
			return new Response("Not Found", { status: 404 });
		}
		files = await getSkillGitFiles(slug, skill);
	}

	const { commitSha } = buildRepo(files);

	const caps =
		"shallow side-band-64k ofs-delta symref=HEAD:refs/heads/main agent=git/2.0";

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
