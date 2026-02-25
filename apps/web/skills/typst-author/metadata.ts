import type { PluginMetadata } from "@/lib/plugin-metadata";

const metadata: PluginMetadata = {
	slug: "typst-author",
	name: "Typst Author",
	description:
		"Generate idiomatic Typst (.typ) code, edit existing Typst files",
	version: "1.0.0",
	category: "documentation",
	tags: ["typst", "typesetting", "docs", "pdf"],
	author: { name: "Max Wiseman" },
	license: "MIT",
	codex: {
		interface: {
			brand_color: "#239DAD",
			display_name: "Typst Author",
			short_description: "Work with Typst files",
			icon_small: "./assets/typst-small.svg",
			icon_large: "./assets/typst-small.svg",
		},
	},
	claude: {
		lspServers: {
			typst: {
				command: "tinymist",
				args: ["lsp"],
				extensionToLanguage: {
					".typ": "typst",
					".typc": "typst",
				},
			},
		},
	},
	skillDefaults: { version: "1.0.0" },
};

export default metadata;
