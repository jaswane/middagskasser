const path=require('node:path');process.chdir(path.join(__dirname,'../..'));const sharp=require('../../node_modules/sharp');
(async()=>{
await sharp('public/favicon.svg').resize(180,180).png().toFile('public/apple-touch-icon.png');
await sharp('public/favicon.svg').resize(32,32).png().toFile('public/favicon-32.png');
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#fbfaf7"/><rect x="70" y="76" width="68" height="68" rx="14" fill="#304dcc"/><text x="104" y="124" text-anchor="middle" font-family="Georgia" font-size="46" fill="white">m</text><text x="163" y="124" font-family="Arial" font-weight="700" font-size="36" fill="#182b2b">Middagskasser.no</text><text x="70" y="300" font-family="Georgia" font-size="76" fill="#182b2b">Hvilken matkasse</text><text x="70" y="395" font-family="Georgia" font-size="76" fill="#182b2b">passer dere?</text><text x="70" y="512" font-family="Arial" font-size="30" fill="#304dcc">HelloFresh og Godtlevert · samme kriterier</text></svg>';
await sharp(Buffer.from(svg)).png().toFile('public/og.png');
console.log(await sharp('public/brands/hellofresh-logo.png').metadata());
})();

