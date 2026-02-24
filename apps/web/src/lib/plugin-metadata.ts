export interface CodexToolDependency {
	description?: string;
	transport?: string;
	type: string;
	url?: string;
	value: string;
}

export interface CodexInterfaceConfig {
	brand_color?: string;
	default_prompt?: string;
	display_name?: string;
	icon_large?: string;
	icon_small?: string;
	short_description?: string;
}

export interface PluginLspServerConfig {
	args?: string[];
	command: string;
	extensionToLanguage?: Record<string, string>;
}

export interface PluginSkillDefaults {
	author?: string;
	homepage?: string;
	license?: string;
	version?: string;
}

export interface PluginMetadata {
	author: {
		email?: string;
		name: string;
	};
	category: string;
	claude?: {
		lspServers?: Record<string, PluginLspServerConfig>;
	};
	codex?: {
		dependencies?: {
			tools?: CodexToolDependency[];
		};
		interface?: CodexInterfaceConfig;
		policy?: {
			allow_implicit_invocation?: boolean;
		};
	};
	description: string;
	homepage?: string;
	icon?: string;
	license?: string;
	name: string;
	skillDefaults?: PluginSkillDefaults;
	slug: string;
	tags: string[];
	version: string;
}
