import type { PluginMetadata } from "@/lib/plugin-metadata";

const metadata: PluginMetadata = {
	slug: "release",
	name: "release",
	description:
		"Prepare and publish a new version release with changelog and git tags",
	version: "1.0.0",
	category: "git",
	tags: ["git", "release", "semver", "changelog", "versioning"],
	author: { name: "Skills Marketplace" },
	license: "MIT",
	codex: {
		policy: {
			allow_implicit_invocation: false,
		},
		dependencies: {
			tools: [
				{
					type: "cli",
					value: "git",
					description:
						"Required for tagging, pushing, and reading commit history",
				},
			],
		},
	},
	skillDefaults: { version: "1.0.0" },
};

export default metadata;
