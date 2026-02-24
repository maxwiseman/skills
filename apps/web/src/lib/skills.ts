import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { parse as parseYaml, stringify as stringifyYaml } from "yaml";
import type {
	CodexInterfaceConfig,
	PluginMetadata,
	PluginSkillDefaults,
} from "@/lib/plugin-metadata";
import { PLUGIN_REGISTRY } from "@/plugins/registry";

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/;
const SKILL_MARKDOWN_PATH_RE = /^skills\/[^/]+\/SKILL\.md$/u;
const TABLER_ICON_URL =
	"https://cdn.jsdelivr.net/npm/@tabler/icons@3.21.0/icons/outline";
const TABLER_ICON_NAME_RE = /^[a-z0-9-]+$/;
const tablerIconCache = new Map<string, Promise<string | undefined>>();

export interface PluginSkill {
	content: string;
	description: string;
	name: string;
	slug: string;
}

export interface Plugin extends PluginMetadata {
	skills: PluginSkill[];
}

export interface MarketplaceConfig {
	metadata: { description: string; version: string };
	name: string;
	owner: { email?: string; name: string };
}

export interface PluginFile {
	content: string;
	path: string;
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
		const parsed = parseYaml(match[1] ?? "");
		return {
			data:
				parsed && typeof parsed === "object"
					? (parsed as Record<string, unknown>)
					: {},
			content: match[2] ?? "",
		};
	} catch {
		return { data: {}, content: match[2] ?? "" };
	}
}

function escapeYamlString(value: string): string {
	return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

function fetchTablerIconSvg(iconName: string): Promise<string | undefined> {
	if (!TABLER_ICON_NAME_RE.test(iconName)) {
		return Promise.resolve(undefined);
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

function renderGeneratedSkillFrontmatter(
	skill: PluginSkill,
	defaults: PluginSkillDefaults
): string {
	const frontmatter: Record<string, string> = {
		name: skill.name,
		description: skill.description,
	};

	for (const [key, value] of Object.entries(defaults)) {
		if (typeof value === "string" && value.length > 0) {
			frontmatter[key] = value;
		}
	}

	return `---\n${stringifyYaml(frontmatter)}---\n\n${skill.content}`;
}

function buildGeneratedOpenAIYaml(plugin: Plugin, iconPath?: string): string {
	const normalizePath = (value: string) =>
		value.startsWith("./") ? value.slice(2) : value;

	const fallbackInterface: CodexInterfaceConfig = {
		display_name: plugin.name,
		short_description: plugin.description,
	};

	const interfaceBlock = {
		...fallbackInterface,
		...plugin.codex?.interface,
	};

	if (iconPath) {
		interfaceBlock.icon_large ??= iconPath;
		interfaceBlock.icon_small ??= iconPath;
	}
	if (interfaceBlock.icon_large) {
		interfaceBlock.icon_large = normalizePath(interfaceBlock.icon_large);
	}
	if (interfaceBlock.icon_small) {
		interfaceBlock.icon_small = normalizePath(interfaceBlock.icon_small);
	}

	const payload = {
		interface: interfaceBlock,
		...(plugin.codex?.policy ? { policy: plugin.codex.policy } : {}),
		...(plugin.codex?.dependencies
			? { dependencies: plugin.codex.dependencies }
			: {}),
	};

	return stringifyYaml(payload);
}

function getPluginDir(slug: string): string {
	return join(process.cwd(), "skills", slug);
}

function shouldIgnoreGeneratedPath(path: string): boolean {
	return (
		path === "agents/openai.yaml" ||
		path === ".lsp.json" ||
		path.startsWith(".claude-plugin/")
	);
}

function listPluginSourceFiles(slug: string): PluginFile[] {
	const pluginDir = getPluginDir(slug);
	if (!existsSync(pluginDir)) {
		return [];
	}

	const files: PluginFile[] = [];

	function walk(dir: string, prefix: string) {
		for (const entry of readdirSync(dir, { withFileTypes: true })) {
			const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
			if (entry.isDirectory()) {
				walk(join(dir, entry.name), rel);
			} else if (!shouldIgnoreGeneratedPath(rel)) {
				files.push({
					path: rel,
					content: readFileSync(join(dir, entry.name), "utf-8"),
				});
			}
		}
	}

	walk(pluginDir, "");
	return files.sort((a, b) => a.path.localeCompare(b.path));
}

function readPluginSkills(slug: string): PluginSkill[] {
	const skillsDir = join(getPluginDir(slug), "skills");
	if (!existsSync(skillsDir)) {
		throw new Error(`Plugin ${slug} is missing a skills directory`);
	}

	const entries = readdirSync(skillsDir, { withFileTypes: true }).filter(
		(entry) => entry.isDirectory()
	);

	if (entries.length === 0) {
		throw new Error(`Plugin ${slug} must contain at least one skill`);
	}

	const skills = entries.map((entry) => {
		const skillSlug = entry.name;
		const skillPath = join(skillsDir, skillSlug, "SKILL.md");
		if (!existsSync(skillPath)) {
			throw new Error(`Plugin ${slug} is missing skills/${skillSlug}/SKILL.md`);
		}

		const raw = readFileSync(skillPath, "utf-8");
		const { data, content } = parseFrontmatter(raw);
		const name = (data.name as string | undefined)?.trim() ?? skillSlug;
		const description = (data.description as string | undefined)?.trim() ?? "";

		return {
			slug: skillSlug,
			name,
			description,
			content,
		};
	});

	const seen = new Set<string>();
	for (const skill of skills) {
		if (seen.has(skill.slug)) {
			throw new Error(`Plugin ${slug} has duplicate skill slug ${skill.slug}`);
		}
		seen.add(skill.slug);
	}

	return skills.sort((a, b) => a.name.localeCompare(b.name));
}

export function validatePluginMetadata(metadata: PluginMetadata[]): void {
	const slugs = new Set<string>();

	for (const plugin of metadata) {
		if (plugin.category.trim().length === 0) {
			throw new Error(`Plugin ${plugin.slug} is missing category`);
		}
		if (!Array.isArray(plugin.tags) || plugin.tags.length === 0) {
			throw new Error(`Plugin ${plugin.slug} is missing tags`);
		}
		if (slugs.has(plugin.slug)) {
			throw new Error(`Duplicate plugin slug ${plugin.slug}`);
		}
		slugs.add(plugin.slug);
	}
}

export function validatePluginStructure(plugin: Plugin): void {
	const pluginDir = getPluginDir(plugin.slug);
	if (!existsSync(pluginDir)) {
		throw new Error(`Plugin folder does not exist: ${plugin.slug}`);
	}

	if (basename(pluginDir) !== plugin.slug) {
		throw new Error(`Plugin slug mismatch for ${plugin.slug}`);
	}

	if (plugin.skills.length === 0) {
		throw new Error(`Plugin ${plugin.slug} has no skills`);
	}
}

export function getPlugins(): Plugin[] {
	validatePluginMetadata(PLUGIN_REGISTRY);

	const plugins = PLUGIN_REGISTRY.map((metadata) => {
		const skills = readPluginSkills(metadata.slug);
		const plugin: Plugin = {
			...metadata,
			skills,
		};
		validatePluginStructure(plugin);
		return plugin;
	});

	return plugins.sort((a, b) => a.name.localeCompare(b.name));
}

export function getPluginBySlug(slug: string): Plugin | undefined {
	return getPlugins().find((plugin) => plugin.slug === slug);
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

export function getCategories(plugins: Plugin[]): string[] {
	const categories = new Set(plugins.map((plugin) => plugin.category));
	return Array.from(categories).sort();
}

export function getPluginFiles(slug: string): PluginFile[] {
	return listPluginSourceFiles(slug);
}

function buildPluginJson(plugin: Plugin): string {
	return JSON.stringify(
		{
			name: plugin.slug,
			description: plugin.description,
			version: plugin.version,
			...(plugin.claude?.lspServers
				? { lspServers: plugin.claude.lspServers }
				: {}),
		},
		null,
		2
	);
}

function withPrefix(path: string, prefix: string): string {
	return prefix ? `${prefix}/${path}` : path;
}

function isGeneratedSkillMarkdown(path: string): boolean {
	return SKILL_MARKDOWN_PATH_RE.test(path);
}

function buildGeneratedCommandFile(
	skill: PluginSkill,
	prefix: string
): PluginFile {
	return {
		path: withPrefix(`commands/${skill.slug}.md`, prefix),
		content:
			`---\ndescription: ${escapeYamlString(skill.description)}\n---\n\n` +
			skill.content,
	};
}

function buildGeneratedSkillFile(
	plugin: Plugin,
	skill: PluginSkill,
	prefix: string
): PluginFile {
	return {
		path: withPrefix(`skills/${skill.slug}/SKILL.md`, prefix),
		content: renderGeneratedSkillFrontmatter(skill, {
			version: plugin.version,
			...plugin.skillDefaults,
		}),
	};
}

function collectPluginSourceFiles(
	plugin: Plugin,
	prefix: string
): PluginFile[] {
	const rawFiles = listPluginSourceFiles(plugin.slug);
	return rawFiles
		.filter((file) => file.path !== "metadata.ts")
		.filter((file) => !isGeneratedSkillMarkdown(file.path))
		.map((file) => ({
			path: withPrefix(file.path, prefix),
			content: file.content,
		}));
}

async function maybeAppendGeneratedIconFile(
	plugin: Plugin,
	files: PluginFile[],
	prefix: string
): Promise<void> {
	const iconPath = withPrefix("assets/icon.svg", prefix);
	const hasIconFile = files.some((file) => file.path === iconPath);
	const iconName = plugin.icon?.trim().toLowerCase();

	if (hasIconFile || !iconName || !TABLER_ICON_NAME_RE.test(iconName)) {
		return;
	}

	const svg = await fetchTablerIconSvg(iconName);
	if (svg) {
		files.push({ path: iconPath, content: svg });
	}
}

function appendGeneratedMetadataFiles(
	plugin: Plugin,
	files: PluginFile[],
	prefix: string
): void {
	const iconFilePath = withPrefix("assets/icon.svg", prefix);
	const hasIconFile = files.some((file) => file.path === iconFilePath);
	const iconPath = hasIconFile ? "assets/icon.svg" : undefined;

	files.push({
		path: withPrefix("agents/openai.yaml", prefix),
		content: buildGeneratedOpenAIYaml(plugin, iconPath),
	});
	files.push({
		path: withPrefix(".claude-plugin/plugin.json", prefix),
		content: buildPluginJson(plugin),
	});

	if (plugin.claude?.lspServers) {
		files.push({
			path: withPrefix(".lsp.json", prefix),
			content: JSON.stringify(plugin.claude.lspServers, null, 2),
		});
	}
}

async function buildPluginExportFiles(
	plugin: Plugin,
	prefix = ""
): Promise<PluginFile[]> {
	const files = collectPluginSourceFiles(plugin, prefix);

	for (const skill of plugin.skills) {
		files.push(buildGeneratedCommandFile(skill, prefix));
		files.push(buildGeneratedSkillFile(plugin, skill, prefix));
	}

	await maybeAppendGeneratedIconFile(plugin, files, prefix);
	appendGeneratedMetadataFiles(plugin, files, prefix);

	return files.sort((a, b) => a.path.localeCompare(b.path));
}

export async function getMarketplaceGitFiles(
	plugins: Plugin[],
	config: MarketplaceConfig
): Promise<PluginFile[]> {
	const files: PluginFile[] = [];

	files.push({
		path: ".claude-plugin/plugin.json",
		content: JSON.stringify(
			{ name: config.name, version: config.metadata.version },
			null,
			2
		),
	});

	const catalog = JSON.stringify(
		{
			name: config.name,
			owner: config.owner,
			metadata: config.metadata,
			plugins: plugins.map((plugin) => ({
				name: plugin.slug,
				source: `./plugins/${plugin.slug}`,
				description: plugin.description,
				version: plugin.version,
				category: plugin.category,
				tags: plugin.tags.length > 0 ? plugin.tags : undefined,
				author: plugin.author?.name ? { name: plugin.author.name } : undefined,
				license: plugin.license ?? undefined,
				homepage: plugin.homepage ?? undefined,
			})),
		},
		null,
		2
	);

	files.push({ path: ".claude-plugin/marketplace.json", content: catalog });

	for (const plugin of plugins) {
		const pluginFiles = await buildPluginExportFiles(
			plugin,
			`plugins/${plugin.slug}`
		);
		files.push(...pluginFiles);
	}

	return files.sort((a, b) => a.path.localeCompare(b.path));
}

export async function getPluginGitFiles(
	slug: string,
	plugin: Plugin
): Promise<PluginFile[]> {
	if (plugin.slug !== slug) {
		throw new Error(`Plugin slug mismatch for ${slug}`);
	}
	return await buildPluginExportFiles(plugin);
}
