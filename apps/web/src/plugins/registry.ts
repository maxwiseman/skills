import type { PluginMetadata } from "@/lib/plugin-metadata";
import commit from "../../skills/commit/metadata";
import debug from "../../skills/debug/metadata";
import explain from "../../skills/explain/metadata";
import optimize from "../../skills/optimize/metadata";
import prDescription from "../../skills/pr-description/metadata";
import refactor from "../../skills/refactor/metadata";
import release from "../../skills/release/metadata";
import review from "../../skills/review/metadata";
import test from "../../skills/test/metadata";
import typstAuthor from "../../skills/typst-author/metadata";

export const PLUGIN_REGISTRY: PluginMetadata[] = [
	commit,
	debug,
	explain,
	optimize,
	prDescription,
	refactor,
	release,
	review,
	test,
	typstAuthor,
];
