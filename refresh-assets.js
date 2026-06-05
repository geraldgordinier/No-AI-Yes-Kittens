import fs from 'fs';
import path from 'path';
import https from 'https';

const kittensDir = 'public/extension/kittens';
const iconsDir = 'public/extension/icons';

async function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error('Failed to fetch ' + url + ': ' + res.statusCode));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function main() {
  if (!fs.existsSync(kittensDir)) fs.mkdirSync(kittensDir, { recursive: true });
  if (!fs.existsSync(iconsDir)) fs.mkdirSync(iconsDir, { recursive: true });

  console.log('Downloading kittens...');
  const catIds = [
    'yMSecCHsIBc', '7AIDE8v_1AQ', 'mJaD10XeD7w', 'l0D4I8uV4v4', 'gKXKBY-C-Dk',
    'nKC772R_qwg', 'OqtaFaA_jFw', 'zK-zR4e1K28', 'NodtnCsLdTE', '915TEPh-BZE'
  ];
  for (let i = 1; i <= 10; i++) {
    const url = `https://images.unsplash.com/photo-${catIds[i-1]}?w=600&q=80`;
    await download(url, path.join(kittensDir, `kitten${i}.jpg`));
    console.log(`Downloaded kitten${i}.jpg`);
  }

  console.log('Downloading icons...');
  const twemojiIconUrl = 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/1f431.png';
  await download(twemojiIconUrl, path.join(iconsDir, 'icon-16.png'));
  await download(twemojiIconUrl, path.join(iconsDir, 'icon-48.png'));
  await download(twemojiIconUrl, path.join(iconsDir, 'icon-128.png'));
  console.log('Icons downloaded.');
}

main().catch(console.error);
