import { afterAll, beforeAll, describe, expect, test } from "bun:test";
import type { PluginMetadata } from "@/lib/plugin-metadata";
import {
	getPluginBySlug,
	getPluginGitFiles,
	validatePluginMetadata,
} from "@/lib/skills";

let originalCwd = "";

beforeAll(() => {
	originalCwd = process.cwd();
	const webDir = originalCwd.endsWith("/apps/web")
		? originalCwd
		: `${originalCwd}/apps/web`;
	process.chdir(webDir);
});

afterAll(() => {
	process.chdir(originalCwd);
});

describe("plugin metadata validation", () => {
	test("rejects duplicate plugin slugs", () => {
		const dupes: PluginMetadata[] = [
			{
				slug: "dup",
				name: "dup",
				description: "first",
				version: "1.0.0",
				category: "test",
				tags: ["a"],
				author: { name: "A" },
			},
			{
				slug: "dup",
				name: "dup-2",
				description: "second",
				version: "1.0.0",
				category: "test",
				tags: ["b"],
				author: { name: "B" },
			},
		];

		expect(() => validatePluginMetadata(dupes)).toThrow(
			"Duplicate plugin slug dup"
		);
	});
});

describe("plugin git export", () => {
	test("includes generated compatibility files", async () => {
		const plugin = getPluginBySlug("typst-author");
		expect(plugin).toBeDefined();
		if (!plugin) {
			throw new Error("Expected typst-author plugin to exist");
		}

		const files = await getPluginGitFiles("typst-author", plugin);
		const paths = new Set(files.map((file) => file.path));

		expect(paths.has(".claude-plugin/plugin.json")).toBe(true);
		expect(paths.has("agents/openai.yaml")).toBe(true);
		expect(paths.has(".lsp.json")).toBe(true);
		expect(paths.has("skills/typst-author/SKILL.md")).toBe(true);

		const skillFile = files.find(
			(file) => file.path === "skills/typst-author/SKILL.md"
		);
		expect(skillFile?.content.includes("version: 1.0.0")).toBe(true);
	});
});
