import { CATEGORY_HEX } from "@/lib/categories";

function hexToOklchHue(hex: string): number {
	const r = Number.parseInt(hex.slice(1, 3), 16) / 255;
	const g = Number.parseInt(hex.slice(3, 5), 16) / 255;
	const b = Number.parseInt(hex.slice(5, 7), 16) / 255;

	const toLinear = (c: number) =>
		c <= 0.040_45 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;

	const rl = toLinear(r);
	const gl = toLinear(g);
	const bl = toLinear(b);

	const l = Math.cbrt(
		0.412_221_470_8 * rl + 0.536_332_536_3 * gl + 0.051_445_992_9 * bl
	);
	const m = Math.cbrt(
		0.211_903_498_2 * rl + 0.680_699_545_1 * gl + 0.107_396_956_6 * bl
	);
	const s = Math.cbrt(
		0.088_302_461_9 * rl + 0.281_718_837_6 * gl + 0.629_978_700_5 * bl
	);

	const a = 1.977_998_495_1 * l - 2.428_592_205 * m + 0.450_593_709_9 * s;
	const bVal = 0.025_904_037_1 * l + 0.782_771_766_2 * m - 0.808_675_766 * s;

	return (Math.atan2(bVal, a) * 180) / Math.PI;
}

interface Props {
	category: string;
	className?: string;
}

export function CategoryPill({ category, className }: Props) {
	const hex = CATEGORY_HEX[category] ?? CATEGORY_HEX.general;
	const hue = hexToOklchHue(hex).toFixed(1);

	return (
		<span
			className={`category-pill rounded-full px-2 py-0.5 text-xs capitalize ${className ?? ""}`}
			style={{ "--hue": hue } as React.CSSProperties}
		>
			{category}
		</span>
	);
}
