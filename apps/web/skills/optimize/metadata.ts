import type { PluginMetadata } from "@/lib/plugin-metadata";

const metadata: PluginMetadata = {
	slug: "optimize",
	name: "optimize",
	description: "Identify and fix performance bottlenecks in the selected code",
	version: "1.0.0",
	category: "performance",
	tags: ["performance", "optimization", "profiling", "memory"],
	author: { name: "Skills Marketplace" },
	license: "MIT",
	skillDefaults: { version: "1.0.0" },
};

export default metadata;
