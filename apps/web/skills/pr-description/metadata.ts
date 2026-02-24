import type { PluginMetadata } from "@/lib/plugin-metadata";

const metadata: PluginMetadata = {
	slug: "pr-description",
	name: "pr-description",
	description:
		"Write a clear pull request title and description from git diff and commits",
	version: "1.0.0",
	category: "git",
	tags: ["git", "pull-request", "documentation", "collaboration"],
	author: { name: "Skills Marketplace" },
	license: "MIT",
	skillDefaults: { version: "1.0.0" },
};

export default metadata;
