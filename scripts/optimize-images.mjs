import sharp from 'sharp';
import { readdir, readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';

const routePath = 'src/routes/index.tsx';
let route = await readFile(routePath, 'utf8');
let before = 0, after = 0;
for (const directory of ['src/assets', 'public']) {
  for (const name of await readdir(directory)) {
    if (!/\.(png|jpg)$/.test(name)) continue;
    const reference = directory === 'public' ? `/${name}` : `@/assets/${name}`;
    if (!route.includes(reference)) continue;
    const input = path.join(directory, name);
    const target = name.replace(/\.(png|jpg)$/, '.webp');
    const photo = /hero|portrait|founder|global-practice|\.jpg/.test(name);
    await sharp(input).resize({ width: photo ? 1600 : 1800, withoutEnlargement: true })
      .webp({ quality: photo ? 84 : 92, effort: 6 }).toFile(path.join(directory, target));
    before += (await stat(input)).size;
    after += (await stat(path.join(directory, target))).size;
    route = route.replaceAll(reference, reference.replace(/\.(png|jpg)$/, '.webp'));
  }
}
await writeFile(routePath, route);
console.log(JSON.stringify({ originalBytes: before, optimizedBytes: after, savedPercent: Math.round((1 - after / before) * 100) }));
