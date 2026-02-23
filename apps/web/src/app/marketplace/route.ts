import { getMarketplaceConfig, getSkills } from "@/lib/skills";

export const dynamic = "force-static";

export function GET() {
	const config = getMarketplaceConfig();
	const skills = getSkills();
	const githubRepo = process.env.GITHUB_REPO;

	const plugins = skills.map((skill) => {
		const source = githubRepo
			? { source: "github", repo: githubRepo, ref: "main" }
			: `./apps/web/skills/${skill.slug}`;

		return {
			name: skill.slug,
			source,
			description: skill.description,
			version: skill.version,
			author: skill.author ? { name: skill.author } : undefined,
			category: skill.category,
			tags: skill.tags,
			license: skill.license,
			homepage: skill.homepage,
			strict: false,
			commands: ["./SKILL.md"],
		};
	});

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
