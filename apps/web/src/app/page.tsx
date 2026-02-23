import MarketplaceBrowser from "@/components/marketplace-browser";
import { getCategories, getMarketplaceConfig, getSkills } from "@/lib/skills";

export const dynamic = "force-dynamic";

export default function Home() {
	const skills = getSkills();
	const config = getMarketplaceConfig();
	const categories = getCategories(skills);

	return (
		<div className="flex flex-col">
			<div className="border-b px-6 py-8">
				<div className="mx-auto max-w-4xl">
					<div className="mb-1 flex items-center gap-2">
						<span className="font-mono text-muted-foreground text-xs">
							/plugin marketplace add {config.name}
						</span>
					</div>
					<h1 className="mb-2 font-semibold text-2xl tracking-tight">
						{config.name}
					</h1>
					<p className="text-muted-foreground">{config.metadata.description}</p>
					<div className="mt-3 flex items-center gap-4 text-muted-foreground text-sm">
						<span>{skills.length} skills</span>
						<span>·</span>
						<span>{categories.length} categories</span>
						<span>·</span>
						<span>by {config.owner.name}</span>
					</div>
				</div>
			</div>
			<MarketplaceBrowser
				categories={categories}
				marketplaceName={config.name}
				skills={skills}
			/>
		</div>
	);
}
