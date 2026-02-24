import { getMarketplaceConfig, getPlugins } from "@/lib/skills";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
	const config = getMarketplaceConfig();
	const plugins = getPlugins();
	const origin = new URL(request.url).origin;

	const marketplacePlugins = plugins.map((plugin) => ({
		name: plugin.slug,
		source: {
			source: "url",
			url: `${origin}/api/git/${plugin.slug}.git`,
		},
		description: plugin.description,
		version: plugin.version,
		author: { name: plugin.author.name },
		category: plugin.category,
		tags: plugin.tags,
		license: plugin.license,
		homepage: plugin.homepage,
	}));

	const marketplace = {
		name: config.name,
		owner: config.owner,
		metadata: config.metadata,
		plugins: marketplacePlugins,
	};

	return Response.json(marketplace, {
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Cache-Control": "public, max-age=60",
		},
	});
}
