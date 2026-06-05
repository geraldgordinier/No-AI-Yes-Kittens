import fs from 'fs';
import path from 'path';

const kittensDir = 'public/extension/kittens';
const iconsDir = 'public/extension/icons';

async function download(url, dest) {
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const ab = await res.arrayBuffer();
  fs.writeFileSync(dest, Buffer.from(ab));
  console.log('Downloaded', dest);
}

async function main() {
  if (!fs.existsSync(kittensDir)) fs.mkdirSync(kittensDir, { recursive: true });
  if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

  const catRes = await fetch('https://api.thecatapi.com/v1/images/search?limit=10');
  const cats = await catRes.json();
  
  for (let i = 1; i <= 10; i++) {
    await download(cats[i-1].url, path.join(kittensDir, `kitten${i}.jpg`));
  }

  const twemojiIconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f431.png';
  await download(twemojiIconUrl, path.join(iconsDir, 'icon-16.png'));
  await download(twemojiIconUrl, path.join(iconsDir, 'icon-48.png'));
  await download(twemojiIconUrl, path.join(iconsDir, 'icon-128.png'));
}

main().catch(console.error);
