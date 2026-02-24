import type { PluginMetadata } from "@/lib/plugin-metadata";

const metadata: PluginMetadata = {
	slug: "fullstack-launchpad",
	name: "Fullstack Launchpad",
	description:
		"Plan, scaffold, and ship production-ready apps with structured workflows and release discipline.",
	version: "1.0.0",
	category: "quality",
	tags: ["planning", "architecture", "release", "fullstack"],
	author: { name: "Skills Marketplace" },
	license: "MIT",
	icon: "rocket",
	skillDefaults: { version: "1.0.0" },
};

export default metadata;
