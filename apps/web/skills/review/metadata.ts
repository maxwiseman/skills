import type { PluginMetadata } from "@/lib/plugin-metadata";

const metadata: PluginMetadata = {
	slug: "review",
	name: "review",
	description:
		"Review code for bugs, security vulnerabilities, and performance issues",
	version: "1.0.0",
	category: "quality",
	tags: ["code-review", "security", "performance", "bugs"],
	author: { name: "Skills Marketplace" },
	license: "MIT",
	skillDefaults: { version: "1.0.0" },
};

export default metadata;
