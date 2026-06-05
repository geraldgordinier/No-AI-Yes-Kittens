const fs = require('fs');
const { Readable } = require('stream');
const { finished } = require('stream/promises');

async function download(url, dest) {
  console.log('Downloading', url, 'to', dest);
  const res = await fetch(url);
  const fileStream = fs.createWriteStream(dest);
  await finished(Readable.fromWeb(res.body).pipe(fileStream));
}

async function run() {
  fs.mkdirSync('extension/icons', { recursive: true });
  fs.mkdirSync('extension/kittens', { recursive: true });
  
  // Cat emoji from twemoji
  const iconUrl = 'https://raw.githubusercontent.com/twitter/twemoji/master/assets/72x72/1f431.png';
  await download(iconUrl, 'extension/icons/icon-128.png');
  await download(iconUrl, 'extension/icons/icon-48.png');
  await download(iconUrl, 'extension/icons/icon-16.png');
  
  const kittenUrls = [
    "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&q=80",
    "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=600&q=80",
    "https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600&q=80",
    "https://images.unsplash.com/photo-1533738363-b7f9aef128ce?w=600&q=80",
    "https://images.unsplash.com/photo-1529778458726-17b1ff4eb392?w=600&q=80",
    "https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=600&q=80",
    "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=600&q=80",
    "https://images.unsplash.com/photo-1555685812-4b943f1cb0eb?w=600&q=80",
    "https://images.unsplash.com/photo-1513245543132-31f507417b26?w=600&q=80",
    "https://images.unsplash.com/photo-1501820488136-72669149e0d4?w=600&q=80"
  ];
  
  for (let i = 0; i < kittenUrls.length; i++) {
    await download(kittenUrls[i], `extension/kittens/kitten${i+1}.jpg`);
  }
}

run().catch(console.error);
