import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import InstallCommandBox from "@/components/install-command-box";
import SkillContent from "@/components/skill-content";
import { SkillFileTree } from "@/components/skill-file-tree";
import { Separator } from "@/components/ui/separator";
import {
	getMarketplaceConfig,
	getPluginBySlug,
	getPluginFiles,
	getPlugins,
} from "@/lib/skills";

export const dynamic = "force-static";

interface Props {
	params: Promise<{ pluginSlug: string }>;
}

export function generateStaticParams() {
	return getPlugins().map((plugin) => ({ pluginSlug: plugin.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { pluginSlug } = await params;
	const plugin = getPluginBySlug(pluginSlug);
	if (!plugin) {
		return {};
	}

	return { title: `/${plugin.slug} — ${plugin.description}` };
}

export default async function PluginPage({ params }: Props) {
	const { pluginSlug } = await params;
	const plugin = getPluginBySlug(pluginSlug);
	if (!plugin) {
		notFound();
	}

	const config = getMarketplaceConfig();
	const files = getPluginFiles(plugin.slug);
	const visibleFiles = files.filter(
		(file) => file.path !== "metadata.ts" && !file.path.startsWith("assets/")
	);
	const pluginLevelFiles = visibleFiles.filter(
		(file) => !file.path.startsWith("skills/")
	);
	const isSingleSkillPlugin =
		plugin.skills.length === 1 &&
		(plugin.skills[0]?.name === plugin.slug ||
			plugin.skills[0]?.name === plugin.name);
	const singleSkill = plugin.skills[0];
	const singleSkillFiles =
		isSingleSkillPlugin && singleSkill
			? visibleFiles
					.filter((file) => file.path.startsWith(`skills/${singleSkill.slug}/`))
					.filter((file) => file.path !== `skills/${singleSkill.slug}/SKILL.md`)
					.map((file) => ({
						...file,
						path: file.path.replace(`skills/${singleSkill.slug}/`, ""),
					}))
			: [];
	const singleSkillCombinedFiles =
		isSingleSkillPlugin && singleSkill
			? [
					...pluginLevelFiles,
					...singleSkillFiles.map((file) => ({
						...file,
						path: `skills/${singleSkill.slug}/${file.path}`,
					})),
				]
			: [];

	return (
		<div className="px-6 py-8">
			<div className="mx-auto max-w-4xl">
				<Link
					className="mb-5 inline-flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground"
					href="/"
				>
					<ArrowLeft className="h-3.5 w-3.5" />
					Back to marketplace
				</Link>

				<div className="">
					<div className="mb-2 flex flex-wrap items-center gap-3">
						<h1 className="font-mono font-semibold text-3xl tracking-tight">
							/{plugin.slug}
						</h1>
						<span className="rounded-full border px-2 py-0.5 font-mono text-muted-foreground text-xs">
							v{plugin.version}
						</span>
						<span className="rounded-full border px-2 py-0.5 text-xs capitalize">
							{plugin.category}
						</span>
					</div>

					<p className="max-w-3xl text-muted-foreground">
						{plugin.description}
					</p>

					{plugin.tags.length > 0 && (
						<div className="my-4 flex flex-wrap gap-1.5">
							{plugin.tags.map((tag) => (
								<span
									className="rounded border bg-background px-2 py-0.5 font-mono text-muted-foreground text-xs"
									key={tag}
								>
									{tag}
								</span>
							))}
						</div>
					)}

					<InstallCommandBox
						marketplaceName={config.name}
						pluginSlug={plugin.slug}
					/>
					{/*<div className="mt-5 flex flex-wrap items-center gap-4 border-t pt-4 text-muted-foreground text-xs">
						<span className="inline-flex items-center gap-1.5">
							<Box className="size-3.5" />
							{plugin.skills.length}{" "}
							{plugin.skills.length === 1 ? "skill" : "skills"}
						</span>
						<span className="inline-flex items-center gap-1.5">
							<FolderTree className="size-3.5" />
							{pluginLevelFiles.length} shared{" "}
							{pluginLevelFiles.length === 1 ? "file" : "files"}
						</span>
					</div>*/}
				</div>

				{/*<div className="mt-4 py-1 sm:py-2">
					<div className="font-semibold text-2xl tracking-tight">
						Installation
					</div>
					<div className="text-muted-foreground">
						Install this plugin for Claude or Codex
					</div>
					<div className="mt-3">
						<InstallCommandBox
							marketplaceName={config.name}
							pluginSlug={plugin.slug}
						/>
					</div>
				</div>*/}

				<div className="mt-6 space-y-4">
					{isSingleSkillPlugin
						? singleSkillCombinedFiles.length > 0 && (
								<div className="space-y-2">
									{/*<h2 className="font-semibold text-2xl tracking-tight">
										Files
									</h2>*/}
									<SkillFileTree
										files={singleSkillCombinedFiles}
										header={false}
									/>
								</div>
							)
						: pluginLevelFiles.length > 0 && (
								<div className="space-y-2">
									{/*<h2 className="font-semibold text-2xl tracking-tight">
										Plugin Files
									</h2>*/}
									<SkillFileTree files={pluginLevelFiles} header={false} />
								</div>
							)}

					{/*<div className="mt-2 mb-2 font-semibold text-xl tracking-tight">
						Skills ({plugin.skills.length})
					</div>*/}

					<Separator className="my-12" />

					{plugin.skills.map((skill) => {
						const skillFiles = visibleFiles
							.filter((file) => file.path.startsWith(`skills/${skill.slug}/`))
							.filter((file) => file.path !== `skills/${skill.slug}/SKILL.md`)
							.map((file) => ({
								...file,
								path: file.path.replace(`skills/${skill.slug}/`, ""),
							}));

						if (
							(skill.name === plugin.slug || skill.name === plugin.name) &&
							plugin.skills.length === 1
						) {
							return (
								<div key={skill.slug}>
									<SkillContent content={skill.content} />
								</div>
							);
						}

						return (
							<details
								className="group overflow-hidden rounded-xl border bg-card"
								key={skill.slug}
							>
								<summary className="flex cursor-pointer list-none items-center justify-between gap-3 bg-muted/40 px-4 py-3.5">
									<div>
										<div className="font-medium font-mono text-sm">
											/{skill.slug}
										</div>
										{skill.description !== plugin.description && (
											<p className="mt-0.5 text-muted-foreground text-sm">
												{skill.description}
											</p>
										)}
									</div>
									<span className="rounded border bg-background px-2 py-1 text-muted-foreground text-xs group-open:hidden">
										Expand
									</span>
									<span className="hidden rounded border bg-background px-2 py-1 text-muted-foreground text-xs group-open:inline">
										Collapse
									</span>
								</summary>
								<div className="space-y-4 border-t p-4">
									{skillFiles.length > 0 && (
										<SkillFileTree files={skillFiles} />
									)}
									<SkillContent content={skill.content} />
								</div>
							</details>
						);
					})}
				</div>

				<p className="mt-6 text-muted-foreground text-xs">
					by {plugin.author.name}
					{plugin.license && ` · ${plugin.license}`}
				</p>
			</div>
		</div>
	);
}
