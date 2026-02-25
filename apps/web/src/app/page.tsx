import MarketplaceBrowser from "@/components/marketplace-browser";
import { getCategories, getMarketplaceConfig, getPlugins } from "@/lib/skills";

export const dynamic = "force-dynamic";

export default function Home() {
	const plugins = getPlugins();
	const config = getMarketplaceConfig();
	const categories = getCategories(plugins);
	const skillCount = plugins.reduce(
		(total, plugin) => total + plugin.skills.length,
		0
	);

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
						<span>{plugins.length} plugins</span>
						<span>·</span>
						<span>{skillCount} skills</span>
						<span>·</span>
						<span>{categories.length} categories</span>
					</div>
				</div>
			</div>
			<MarketplaceBrowser
				categories={categories}
				marketplaceName={config.name}
				plugins={plugins}
			/>
		</div>
	);
}
