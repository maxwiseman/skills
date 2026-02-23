"use client";

import Link from "next/link";
import type { Skill } from "@/lib/skills";
import CopyButton from "./copy-button";

interface Props {
	marketplaceName: string;
	skill: Skill;
}

const CATEGORY_COLORS: Record<string, string> = {
	quality: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
	git: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
	debugging: "bg-red-500/10 text-red-600 dark:text-red-400",
	performance: "bg-green-500/10 text-green-600 dark:text-green-400",
	testing: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
	documentation: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
	general: "bg-muted text-muted-foreground",
};

export function SkillCard({ skill, marketplaceName }: Props) {
	const installCmd = `/plugin install ${skill.slug}@${marketplaceName}`;
	const categoryColor =
		CATEGORY_COLORS[skill.category] ?? CATEGORY_COLORS.general;

	return (
		<div className="relative flex flex-col gap-3 rounded-lg border bg-card p-4 transition-colors hover:border-foreground/20">
			<Link
				className="absolute inset-0 rounded-lg"
				href={`/skills/${skill.slug}`}
			/>

			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0">
					<div className="flex items-center gap-2">
						<span className="font-medium font-mono text-sm">/{skill.slug}</span>
						<span className="text-muted-foreground text-xs">
							v{skill.version}
						</span>
					</div>
					<p className="mt-0.5 text-muted-foreground text-sm leading-snug">
						{skill.description}
					</p>
				</div>
				<span
					className={`shrink-0 rounded-full px-2 py-0.5 text-xs capitalize ${categoryColor}`}
				>
					{skill.category}
				</span>
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

			<div className="relative flex items-center justify-between gap-2 rounded border bg-muted/50 px-2.5 py-1.5">
				<span className="truncate font-mono text-muted-foreground text-xs">
					{installCmd}
				</span>
				<CopyButton text={installCmd} />
			</div>
		</div>
	);
}
