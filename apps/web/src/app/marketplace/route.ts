import { getMarketplaceConfig, getSkills } from "@/lib/skills";

export const dynamic = "force-dynamic";

export function GET(request: Request) {
	const config = getMarketplaceConfig();
	const skills = getSkills();
	const origin = new URL(request.url).origin;

	const plugins = skills.map((skill) => ({
		name: skill.slug,
		source: {
			source: "url",
			url: `${origin}/api/git/${skill.slug}.git`,
		},
		description: skill.description,
		version: skill.version,
		author: skill.author ? { name: skill.author } : undefined,
		category: skill.category,
		tags: skill.tags,
		license: skill.license,
		homepage: skill.homepage,
	}));

	const marketplace = {
		name: config.name,
		owner: config.owner,
		metadata: config.metadata,
		plugins,
	};

	return Response.json(marketplace, {
		headers: {
			"Access-Control-Allow-Origin": "*",
			"Cache-Control": "public, max-age=60",
		},
	});
}
