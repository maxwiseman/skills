import type { PluginMetadata } from "@/lib/plugin-metadata";

const metadata: PluginMetadata = {
	slug: "commit",
	name: "commit",
	description: "Generate a conventional commit message from staged changes",
	version: "1.0.0",
	category: "git",
	tags: ["git", "commit", "conventional-commits", "changelog"],
	author: { name: "Skills Marketplace" },
	license: "MIT",
	skillDefaults: { version: "1.0.0" },
};

export default metadata;
