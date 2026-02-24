import { buildRepo, PKT_FLUSH, pktLine } from "@/lib/git";
import {
	getMarketplaceConfig,
	getMarketplaceGitFiles,
	getPluginGitFiles,
	getPlugins,
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
	const plugins = getPlugins();

	let files: Awaited<ReturnType<typeof getPluginGitFiles>>;
	if (slug === "marketplace") {
		files = await getMarketplaceGitFiles(plugins, getMarketplaceConfig());
	} else {
		const plugin = plugins.find((plugin) => plugin.slug === slug);
		if (!plugin) {
			return new Response("Not Found", { status: 404 });
		}
		files = await getPluginGitFiles(slug, plugin);
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
