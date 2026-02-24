import type { PluginMetadata } from "@/lib/plugin-metadata";

const metadata: PluginMetadata = {
	slug: "refactor",
	name: "refactor",
	description:
		"Refactor selected code for clarity, maintainability, and idiomatic style",
	version: "1.0.0",
	category: "quality",
	tags: ["refactor", "clean-code", "maintainability", "patterns"],
	author: { name: "Skills Marketplace" },
	license: "MIT",
	skillDefaults: { version: "1.0.0" },
};

export default metadata;
