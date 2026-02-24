import type { PluginMetadata } from "@/lib/plugin-metadata";

const metadata: PluginMetadata = {
	slug: "test",
	name: "test",
	description: "Generate comprehensive unit tests for the selected code",
	version: "1.0.0",
	category: "testing",
	tags: ["testing", "unit-tests", "coverage", "tdd"],
	author: { name: "Skills Marketplace" },
	license: "MIT",
	skillDefaults: { version: "1.0.0" },
};

export default metadata;
