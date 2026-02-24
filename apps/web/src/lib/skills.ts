import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { parse as parseYaml } from "yaml";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const TABLER_ICON_URL =
	"https://cdn.jsdelivr.net/npm/@tabler/icons@3.21.0/icons/outline";
const TABLER_ICON_NAME_RE = /^[a-z0-9-]+$/;
const tablerIconCache = new Map<string, Promise<string | undefined>>();

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
	icon?: string;
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

	try {
		const parsed = parseYaml(match[1]);
		return {
			data:
				parsed && typeof parsed === "object"
					? (parsed as Record<string, unknown>)
					: {},
			content: match[2],
		};
	} catch {
		return { data: {}, content: match[2] };
	}
}

function escapeYamlString(value: string): string {
	return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function fetchTablerIconSvg(iconName: string): Promise<string | undefined> {
	if (!TABLER_ICON_NAME_RE.test(iconName)) {
		return undefined;
	}

	const cached = tablerIconCache.get(iconName);
	if (cached) {
		return cached;
	}

	const request = fetch(`${TABLER_ICON_URL}/${iconName}.svg`)
		.then(async (response) => {
			if (!response.ok) {
				return undefined;
			}
			const svg = await response.text();
			return svg.trimStart().startsWith("<svg") ? svg : undefined;
		})
		.catch(() => undefined);

	tablerIconCache.set(iconName, request);
	return request;
}

function buildGeneratedOpenAIYaml(skill: Skill, iconPath?: string): string {
	const name = escapeYamlString(skill.name);
	const description = escapeYamlString(skill.description);
	let yaml =
		"interface:\n" +
		`  display_name: "${name}"\n` +
		`  short_description: "${description}"\n`;

	if (iconPath) {
		const safePath = escapeYamlString(iconPath);
		yaml += `  icon_large: "${safePath}"\n`;
		yaml += `  icon_small: "${safePath}"\n`;
	}

	return yaml;
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
			icon: data.icon as string | undefined,
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

export async function getMarketplaceGitFiles(
	skills: Skill[],
	config: MarketplaceConfig
): Promise<SkillFile[]> {
	const files: SkillFile[] = [];

	// plugin.json at repo root (required alongside marketplace.json)
	files.push({
		path: ".claude-plugin/plugin.json",
		content: JSON.stringify(
			{ name: config.name, version: config.metadata.version },
			null,
			2
		),
	});

	// Root marketplace catalog with relative-path sources (git-based marketplace)
	const catalog = JSON.stringify(
		{
			name: config.name,
			owner: config.owner,
			metadata: config.metadata,
			plugins: skills.map((skill) => ({
				name: skill.slug,
				source: `./plugins/${skill.slug}`,
				description: skill.description,
				version: skill.version,
				category: skill.category,
				tags: skill.tags.length > 0 ? skill.tags : undefined,
				author: skill.author ? { name: skill.author } : undefined,
				license: skill.license ?? undefined,
				homepage: skill.homepage ?? undefined,
			})),
		},
		null,
		2
	);
	files.push({ path: ".claude-plugin/marketplace.json", content: catalog });

	for (const skill of skills) {
		const skillFiles = getSkillFiles(skill.slug);
		const prefix = `plugins/${skill.slug}`;
		const iconName = skill.icon?.trim().toLowerCase();

		for (const f of skillFiles) {
			if (f.path === "SKILL.md") {
				// Convert SKILL.md to a Claude Code command file — strip marketplace
				// frontmatter fields, keep only description + body content.
				const commandMd = `---\ndescription: ${skill.description}\n---\n\n${skill.content}`;
				files.push({
					path: `${prefix}/commands/${skill.slug}.md`,
					content: commandMd,
				});
			} else {
				files.push({ path: `${prefix}/${f.path}`, content: f.content });
			}
		}

		const skillHasIconFile = skillFiles.some(
			(f) => f.path === "assets/icon.svg"
		);
		const hasTablerIcon = iconName && TABLER_ICON_NAME_RE.test(iconName);
		const shouldGenerateIcon = !skillHasIconFile && Boolean(hasTablerIcon);
		if (shouldGenerateIcon) {
			const svg = await fetchTablerIconSvg(iconName);
			if (svg) {
				files.push({
					path: `${prefix}/assets/icon.svg`,
					content: svg,
				});
			}
		}

		// Inject plugin.json if not on disk
		if (!skillFiles.some((f) => f.path === ".claude-plugin/plugin.json")) {
			files.push({
				path: `${prefix}/.claude-plugin/plugin.json`,
				content: JSON.stringify(
					{
						name: skill.slug,
						description: skill.description,
						version: skill.version,
					},
					null,
					2
				),
			});
		}

		// Inject agents/openai.yaml if not on disk
		if (!skillFiles.some((f) => f.path === "agents/openai.yaml")) {
			const hasVirtualIconFile = files.some(
				(f) => f.path === `${prefix}/assets/icon.svg`
			);
			const iconPath =
				skillHasIconFile || hasVirtualIconFile ? "assets/icon.svg" : undefined;
			files.push({
				path: `${prefix}/agents/openai.yaml`,
				content: buildGeneratedOpenAIYaml(skill, iconPath),
			});
		}
	}

	return files.sort((a, b) => a.path.localeCompare(b.path));
}

export async function getSkillGitFiles(
	slug: string,
	skill: Skill
): Promise<SkillFile[]> {
	const rawFiles = getSkillFiles(slug);
	const iconName = skill.icon?.trim().toLowerCase();

	// Move SKILL.md to skills/{slug}/SKILL.md so Claude Code auto-discovers it
	// as a /{slug} slash command (the documented plugin structure).
	const files: SkillFile[] = rawFiles.map((f) =>
		f.path === "SKILL.md" ? { ...f, path: `skills/${slug}/SKILL.md` } : f
	);
	const hasIconFile = files.some((f) => f.path === "assets/icon.svg");
	const hasTablerIcon = iconName && TABLER_ICON_NAME_RE.test(iconName);
	const shouldGenerateIcon = !hasIconFile && Boolean(hasTablerIcon);
	if (shouldGenerateIcon) {
		const svg = await fetchTablerIconSvg(iconName);
		if (svg) {
			files.push({ path: "assets/icon.svg", content: svg });
		}
	}

	// Inject agents/openai.yaml if not present on disk
	const hasOpenAIYaml = files.some((f) => f.path === "agents/openai.yaml");
	if (!hasOpenAIYaml) {
		const hasVirtualIconFile = files.some((f) => f.path === "assets/icon.svg");
		const iconPath =
			hasIconFile || hasVirtualIconFile ? "assets/icon.svg" : undefined;
		const yaml = buildGeneratedOpenAIYaml(skill, iconPath);
		files.push({ path: "agents/openai.yaml", content: yaml });
	}

	// Inject .claude-plugin/plugin.json — required for Claude Code to recognise
	// the repo as a plugin. No commands field needed; auto-discovery handles it.
	const hasPluginJson = files.some(
		(f) => f.path === ".claude-plugin/plugin.json"
	);
	if (!hasPluginJson) {
		const pluginJson = JSON.stringify(
			{ name: slug, description: skill.description, version: skill.version },
			null,
			2
		);
		files.push({ path: ".claude-plugin/plugin.json", content: pluginJson });
	}

	return files.sort((a, b) => a.path.localeCompare(b.path));
}
