import { ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import InstallCommandBox from "@/components/install-command-box";
import SkillContent from "@/components/skill-content";
import { SkillFileTree } from "@/components/skill-file-tree";
import { getMarketplaceConfig, getSkillFiles, getSkills } from "@/lib/skills";

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
	const files = getSkillFiles(skill.slug).filter((file) => {
		if (file.path === "SKILL.md") {
			return false;
		}
		return !(
			file.path.startsWith("agents/") || file.path.startsWith("assets/")
		);
	});

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
						<h1 className="font-mono font-semibold text-2xl">/{skill.slug}</h1>
						{/*<CategoryPill category={skill.category} className="px-2.5 py-0.5" />*/}
						<span className="font-mono text-muted-foreground text-sm">
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

					<div className="mt-4">
						<InstallCommandBox
							marketplaceName={config.name}
							skillSlug={skill.slug}
						/>
					</div>
				</div>

				{files.length > 0 && (
					<div className="mb-6">
						<SkillFileTree files={files} />
					</div>
				)}

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
