import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const artwork = JSON.parse(
	await readFile(new URL("src/components/brand/artwork.json", root), "utf8"),
);
const palette = artwork.colors;
const brandDirectory = new URL("public/brand/", root);
await mkdir(brandDirectory, { recursive: true });

function svg(width, height, content) {
	return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="Hold Shelf"><title>Hold Shelf</title>${content}</svg>\n`;
}

function logo(variant, symbolColor, textColor, compact = false) {
	const layout = artwork.layouts[variant];
	const symbol = variant === "wordmark" ? "" : `<g transform="${layout.symbolTransform}"><path fill="${symbolColor}" d="${compact ? artwork.smallSymbol : artwork.symbol}"/></g>`;
	const wordmark = variant === "symbol" ? "" : `<g transform="${layout.wordmarkTransform}"><path fill="${textColor}" d="${artwork.wordmark}"/></g>`;
	return svg(layout.width, layout.height, symbol + wordmark);
}

async function png(source, output, width) {
	await sharp(Buffer.from(source)).resize({ width }).png().toFile(fileURLToPath(output));
}

const treatments = {
	light: [palette.teal, palette.ink],
	dark: [palette.mint, palette.mint],
	black: ["#000000", "#000000"],
	white: ["#ffffff", "#ffffff"],
};

for (const variant of ["horizontal", "stacked", "symbol", "wordmark"]) {
	for (const [treatment, colors] of Object.entries(treatments)) {
		const source = logo(variant, ...colors);
		const filename = `hold-shelf-${variant}-${treatment}`;
		await writeFile(new URL(`${filename}.svg`, brandDirectory), source);
		await png(source, new URL(`${filename}.png`, brandDirectory), variant === "symbol" ? 512 : variant === "horizontal" || variant === "wordmark" ? 1600 : 1024);
	}
}
await writeFile(new URL("hold-shelf-symbol-small.svg", brandDirectory), logo("symbol", "currentColor", "currentColor", true));

const favicon = svg(32, 32, `<style>path{fill:${palette.teal}}@media(prefers-color-scheme:dark){path{fill:${palette.mint}}}</style><path d="${artwork.smallSymbol}"/>`);
await writeFile(new URL("public/favicon.svg", root), favicon);
for (const size of [16, 32]) {
	await png(logo("symbol", palette.teal, palette.ink, size === 16), new URL(`public/favicon-${size}x${size}.png`, root), size);
}

// Native app icons have a full-bleed background. Maskable content stays within
// the central 80%-diameter safe circle, including the mark's corners.
function appIcon(scale) {
	const offset = (512 - 32 * scale) / 2;
	return svg(512, 512, `<rect width="512" height="512" fill="${palette.background}"/><g transform="translate(${offset} ${offset}) scale(${scale})"><path fill="${palette.teal}" d="${artwork.symbol}"/></g>`);
}
for (const [name, size] of [["logo192.png", 192], ["logo512.png", 512], ["apple-touch-icon.png", 180]]) {
	await png(appIcon(11.5), new URL(`public/${name}`, root), size);
}
await png(appIcon(9.6), new URL("public/logo-maskable-512.png", root), 512);
for (const size of [16, 32, 48, 128]) {
	await png(logo("symbol", palette.teal, palette.ink, size === 16), new URL(`extension/icons/icon-${size}.png`, root), size);
}

const horizontal = artwork.layouts.horizontal;
const scale = 840 / horizontal.width;
const social = svg(1200, 630, `<rect width="1200" height="630" fill="${palette.ink}"/><g transform="translate(180 ${(630 - horizontal.height * scale) / 2}) scale(${scale})">${logo("horizontal", palette.mint, palette.mint)}</g>`);
await writeFile(new URL("social-card.svg", brandDirectory), social);
await png(social, new URL("social-card.png", brandDirectory), 1200);
await copyFile(new URL("licenses/source-serif-4.txt", root), new URL("source-serif-4-license.txt", brandDirectory));
console.log("Generated production logos, favicons, app icons, extension icons, and social card.");
