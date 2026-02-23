import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import CopyButton from "@/components/copy-button";
import SkillContent from "@/components/skill-content";
import { getMarketplaceConfig, getSkills } from "@/lib/skills";

export const dynamic = "force-static";

interface Props {
	params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
	const skills = getSkills();
	return skills.map((skill) => ({ slug: skill.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const skill = getSkills().find((s) => s.slug === slug);
	if (!skill) {
		return {};
	}
	return { title: `/${skill.slug} — ${skill.description}` };
}

export default async function SkillPage({ params }: Props) {
	const { slug } = await params;
	const skills = getSkills();
	const skill = skills.find((s) => s.slug === slug);
	if (!skill) {
		notFound();
	}

	const config = getMarketplaceConfig();
	const installCmd = `/plugin install ${skill.slug}@${config.name}`;

	const CATEGORY_COLORS: Record<string, string> = {
		quality: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
		git: "bg-orange-500/10 text-orange-600 dark:text-orange-400",
		debugging: "bg-red-500/10 text-red-600 dark:text-red-400",
		performance: "bg-green-500/10 text-green-600 dark:text-green-400",
		testing: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
		documentation: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
		general: "bg-muted text-muted-foreground",
	};

	const categoryColor =
		CATEGORY_COLORS[skill.category] ?? CATEGORY_COLORS.general;

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
					<div className="mb-2 flex flex-wrap items-center gap-3">
						<h1 className="font-mono font-semibold text-2xl">/{skill.slug}</h1>
						<span
							className={`rounded-full px-2.5 py-0.5 text-xs capitalize ${categoryColor}`}
						>
							{skill.category}
						</span>
						<span className="text-muted-foreground text-xs">
							v{skill.version}
						</span>
					</div>
					<p className="text-muted-foreground">{skill.description}</p>

					{skill.tags.length > 0 && (
						<div className="mt-3 flex flex-wrap gap-1.5">
							{skill.tags.map((tag) => (
								<span
									className="rounded border px-2 py-0.5 font-mono text-muted-foreground text-xs"
									key={tag}
								>
									{tag}
								</span>
							))}
						</div>
					)}

					<div className="mt-4 flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2">
						<code className="flex-1 truncate font-mono text-sm">
							{installCmd}
						</code>
						<CopyButton text={installCmd} />
					</div>
				</div>

				<div className="border-t pt-6">
					<SkillContent content={skill.content} />
				</div>

				{skill.author && (
					<p className="mt-6 text-muted-foreground text-xs">
						by {skill.author}
						{skill.license && ` · ${skill.license}`}
					</p>
				)}
			</div>
		</div>
	);
}
