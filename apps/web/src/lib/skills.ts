import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;

export { CATEGORY_HEX } from "./categories";

export interface CodexTool {
	description?: string;
	transport?: string;
	type: string;
	url?: string;
	value: string;
}

export interface CodexMetadata {
	dependencies?: {
		tools?: CodexTool[];
	};
	interface?: {
		brand_color?: string;
		default_prompt?: string;
		display_name?: string;
		icon_large?: string;
		icon_small?: string;
		short_description?: string;
	};
	policy?: {
		allow_implicit_invocation?: boolean;
	};
}

export interface SkillFrontmatter {
	author: string;
	category: string;
	description: string;
	homepage?: string;
	license?: string;
	name: string;
	tags: string[];
	version: string;
}

export interface Skill extends SkillFrontmatter {
	codex?: CodexMetadata;
	content: string;
	slug: string;
}

export interface MarketplaceConfig {
	metadata: { description: string; version: string };
	name: string;
	owner: { name: string; email?: string };
}

function parseFrontmatter(raw: string): {
	data: Record<string, unknown>;
	content: string;
} {
	const match = raw.match(FRONTMATTER_RE);
	if (!match) {
		return { data: {}, content: raw };
	}

	const data: Record<string, unknown> = {};
	for (const line of match[1].split("\n")) {
		const colonIdx = line.indexOf(":");
		if (colonIdx === -1) {
			continue;
		}
		const key = line.slice(0, colonIdx).trim();
		const value = line.slice(colonIdx + 1).trim();
		if (value.startsWith("[") && value.endsWith("]")) {
			data[key] = value
				.slice(1, -1)
				.split(",")
				.map((s) => s.trim())
				.filter(Boolean);
		} else {
			data[key] = value;
		}
	}

	return { data, content: match[2] };
}

export function getSkills(): Skill[] {
	const skillsDir = join(process.cwd(), "skills");
	if (!existsSync(skillsDir)) {
		return [];
	}

	const entries = readdirSync(skillsDir, { withFileTypes: true });
	const skills: Skill[] = [];

	for (const entry of entries) {
		if (!entry.isDirectory()) {
			continue;
		}
		const skillFile = join(skillsDir, entry.name, "SKILL.md");
		if (!existsSync(skillFile)) {
			continue;
		}

		const raw = readFileSync(skillFile, "utf-8");
		const { data, content } = parseFrontmatter(raw);

		const codexFile = join(skillsDir, entry.name, "agents", "openai.yaml");
		const codex = existsSync(codexFile)
			? (parseYaml(readFileSync(codexFile, "utf-8")) as CodexMetadata)
			: undefined;

		skills.push({
			slug: entry.name,
			name: (data.name as string) || entry.name,
			description: (data.description as string) || "",
			version: (data.version as string) || "1.0.0",
			category: (data.category as string) || "general",
			tags: (data.tags as string[]) || [],
			author: (data.author as string) || "",
			license: data.license as string | undefined,
			homepage: data.homepage as string | undefined,
			content,
			codex,
		});
	}

	return skills.sort((a, b) => a.name.localeCompare(b.name));
}

export function getMarketplaceConfig(): MarketplaceConfig {
	const configPath = join(process.cwd(), "marketplace.config.json");
	if (!existsSync(configPath)) {
		return {
			name: "skills",
			owner: { name: "Skills Marketplace" },
			metadata: {
				description: "A collection of Claude Code skills",
				version: "1.0.0",
			},
		};
	}
	return JSON.parse(readFileSync(configPath, "utf-8")) as MarketplaceConfig;
}

export function getCategories(skills: Skill[]): string[] {
	const cats = new Set(skills.map((s) => s.category));
	return Array.from(cats).sort();
}

export interface SkillFile {
	content: string;
	path: string;
}

export function getSkillFiles(slug: string): SkillFile[] {
	const skillDir = join(process.cwd(), "skills", slug);
	if (!existsSync(skillDir)) {
		return [];
	}

	const files: SkillFile[] = [];

	function walk(dir: string, prefix: string) {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
			if (entry.isDirectory()) {
				walk(join(dir, entry.name), rel);
			} else {
				files.push({
					path: rel,
					content: readFileSync(join(dir, entry.name), "utf-8"),
				});
			}
		}
	}

	walk(skillDir, "");
	return files.sort((a, b) => a.path.localeCompare(b.path));
}
