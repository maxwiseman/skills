import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import InstallCommandBox from "@/components/install-command-box";
import SkillContent from "@/components/skill-content";
import { SkillFileTree } from "@/components/skill-file-tree";
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

	return (
		<div className="px-6 py-6">
			<div className="mx-auto max-w-3xl">
				<Link
					className="mb-6 inline-flex items-center gap-1.5 text-muted-foreground text-sm hover:text-foreground"
					href="/"
				>
					<ArrowLeft className="h-3.5 w-3.5" />
					Back to marketplace
				</Link>

				<div className="mb-6">
					<div className="mb-2 flex flex-wrap items-baseline gap-3">
						<h1 className="font-mono font-semibold text-2xl">/{plugin.slug}</h1>
						<span className="font-mono text-muted-foreground text-sm">
							v{plugin.version}
						</span>
						<span className="rounded-full border px-2 py-0.5 text-xs capitalize">
							{plugin.category}
						</span>
					</div>

					<p className="text-muted-foreground">{plugin.description}</p>

					{plugin.tags.length > 0 && (
						<div className="mt-3 flex flex-wrap gap-1.5">
							{plugin.tags.map((tag) => (
								<span
									className="rounded border px-2 py-0.5 font-mono text-muted-foreground text-xs"
									key={tag}
								>
									{tag}
								</span>
							))}
						</div>
					)}

					<div className="mt-4">
						<InstallCommandBox
							marketplaceName={config.name}
							pluginSlug={plugin.slug}
						/>
					</div>
				</div>

				<div className="space-y-4">
					{plugin.skills.map((skill) => {
						const skillFiles = files
							.filter((file) => file.path.startsWith(`skills/${skill.slug}/`))
							.filter((file) => file.path !== `skills/${skill.slug}/SKILL.md`)
							.map((file) => ({
								...file,
								path: file.path.replace(`skills/${skill.slug}/`, ""),
							}));

						return (
							<details
								className="group overflow-hidden rounded-lg border"
								key={skill.slug}
							>
								<summary className="flex cursor-pointer list-none items-center justify-between gap-2 bg-muted/30 px-4 py-3">
									<div>
										<div className="font-mono text-sm">/{skill.slug}</div>
										<p className="text-muted-foreground text-sm">
											{skill.description}
										</p>
									</div>
									<span className="text-muted-foreground text-xs group-open:hidden">
										Expand
									</span>
									<span className="hidden text-muted-foreground text-xs group-open:inline">
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
