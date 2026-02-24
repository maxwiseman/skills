import Link from "next/link";
import type { Plugin } from "@/lib/skills";
import { CategoryPill } from "./category-pill";
import InstallCommandBox from "./install-command-box";

interface Props {
	marketplaceName: string;
	plugin: Plugin;
}

export function SkillCard({ plugin, marketplaceName }: Props) {
	return (
		<div className="relative flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-foreground/20">
			<Link
				className="absolute inset-0 rounded-lg"
				href={`/plugins/${plugin.slug}`}
				prefetch
			/>

			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0">
					<div className="flex items-baseline gap-2">
						<span className="font-medium font-mono text-sm">
							/{plugin.slug}
						</span>
						<span className="font-mono text-muted-foreground text-xs">
							v{plugin.version}
						</span>
					</div>
					<p className="mt-0.5 text-muted-foreground text-sm leading-snug">
						{plugin.description}
					</p>
				</div>
				<CategoryPill category={plugin.category} className="shrink-0" />
			</div>

			{plugin.tags.length > 0 && (
				<div className="flex flex-wrap gap-1">
					{plugin.tags.map((tag) => (
						<span
							className="rounded border px-1.5 py-0.5 font-mono text-muted-foreground text-xs"
							key={tag}
						>
							{tag}
						</span>
					))}
				</div>
			)}

			<InstallCommandBox
				marketplaceName={marketplaceName}
				pluginSlug={plugin.slug}
				showSelector={false}
			/>
		</div>
	);
}
