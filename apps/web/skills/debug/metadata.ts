import type { PluginMetadata } from "@/lib/plugin-metadata";

const metadata: PluginMetadata = {
	slug: "debug",
	name: "debug",
	description:
		"Systematically diagnose and fix errors, exceptions, and unexpected behavior",
	version: "1.0.0",
	category: "debugging",
	tags: ["debug", "errors", "troubleshooting", "stack-traces"],
	author: { name: "Skills Marketplace" },
	license: "MIT",
	skillDefaults: { version: "1.0.0" },
};

export default metadata;
