import Link from "next/link";
import type { Skill } from "@/lib/skills";
import { CategoryPill } from "./category-pill";
import InstallCommandBox from "./install-command-box";

interface Props {
	marketplaceName: string;
	skill: Skill;
}

export function SkillCard({ skill, marketplaceName }: Props) {
	return (
		<div className="relative flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-foreground/20">
			<Link
				className="absolute inset-0 rounded-lg"
				href={`/skills/${skill.slug}`}
				prefetch
			/>

			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0">
					<div className="flex items-baseline gap-2">
						<span className="font-medium font-mono text-sm">/{skill.slug}</span>
						<span className="font-mono text-muted-foreground text-xs">
							v{skill.version}
						</span>
					</div>
					<p className="mt-0.5 text-muted-foreground text-sm leading-snug">
						{skill.description}
					</p>
				</div>
				<CategoryPill category={skill.category} className="shrink-0" />
			</div>

			{skill.tags.length > 0 && (
				<div className="flex flex-wrap gap-1">
					{skill.tags.map((tag) => (
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
				showSelector={false}
				skillSlug={skill.slug}
			/>
		</div>
	);
}
