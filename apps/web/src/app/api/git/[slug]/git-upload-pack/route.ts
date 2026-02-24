import {
	buildRepo,
	buildShallowResponse,
	buildUploadPackResponse,
} from "@/lib/git";
import {
	getMarketplaceConfig,
	getMarketplaceGitFiles,
	getPluginGitFiles,
	getPlugins,
} from "@/lib/skills";

export const dynamic = "force-dynamic";
const GIT_SUFFIX_RE = /\.git$/;

export async function POST(
	request: Request,
	{ params }: { params: Promise<{ slug: string }> }
) {
	const { slug: rawSlug } = await params;
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
