const fs = require('fs');
async function test() {
  const res = await fetch('https://loremflickr.com/600/400/kitten?lock=1');
  const buffer = await res.arrayBuffer();
  fs.writeFileSync('test_cat.jpg', Buffer.from(buffer));
  console.log(fs.readFileSync('test_cat.jpg').toString('hex').substring(0, 40));
}
test();
