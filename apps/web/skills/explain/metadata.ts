import type { PluginMetadata } from "@/lib/plugin-metadata";

const metadata: PluginMetadata = {
	slug: "explain",
	name: "explain",
	description: "Explain what a piece of code does in plain language",
	version: "1.0.0",
	category: "documentation",
	tags: ["explain", "documentation", "learning", "onboarding"],
	author: { name: "Skills Marketplace" },
	icon: "text-plus",
	license: "MIT",
	skillDefaults: { version: "1.0.0" },
};

export default metadata;
