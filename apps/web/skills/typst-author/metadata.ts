import type { PluginMetadata } from "@/lib/plugin-metadata";

const metadata: PluginMetadata = {
	slug: "typst-author",
	name: "typst-author",
	description:
		"Generate idiomatic Typst (.typ) code, edit existing Typst files, and answer Typst syntax questions. Use when working with Typst files (*.typ) or when the user mentions Typst markup, document creation, or formatting.",
	version: "1.0.0",
	category: "documentation",
	tags: ["typst", "typesetting", "docs", "pdf"],
	author: { name: "Max's Skills" },
	license: "MIT",
	codex: {
		interface: {
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
