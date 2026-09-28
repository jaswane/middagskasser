// Crop and label actual browser captures. No UI content is reconstructed.
const sharp = require('../../node_modules/sharp');
const path = require('node:path');
const file = (name) => path.join(__dirname, name);
const label = (text, width) => Buffer.from(`<svg width="${width}" height="48"><rect width="100%" height="100%" fill="#eef0e9"/><text x="20" y="31" font-family="Arial" font-size="20" fill="#182b2b">${text}</text></svg>`);
(async () => {
  const mobile = [];
  for (const [i, name] of ['before', 'after'].entries()) {
    mobile.push({ input: label(`${i ? 'ETTER' : 'FØR'} · 360 CSS px`, 610), left: i * 630, top: 0 });
    mobile.push({ input: await sharp(file(`${name}-mobile-comparison.png`)).extract({left:60,top:190,width:610,height:700}).png().toBuffer(), left:i*630, top:48 });
  }
  await sharp({create:{width:1240,height:748,channels:3,background:'#fbfaf7'}}).composite(mobile).png().toFile(file('mobile-before-after.png'));
  const before = await sharp(file('before-selector-price.png')).extract({left:590,top:1224,width:1700,height:680}).resize({width:1000}).png().toBuffer();
  const after = await sharp(file('after-selector-card.png')).resize({width:1000}).png().toBuffer();
  await sharp({create:{width:1000,height:1008,channels:3,background:'#fbfaf7'}}).composite([
    {input:label('FØR · pris i selector-resultatet',1000),left:0,top:0},
    {input:before,left:0,top:48},
    {input:label('ETTER · kilder, kontrolldato og prisavgrensning',1000),left:0,top:448},
    {input:after,left:0,top:496},
  ]).png().toFile(file('selector-before-after.png'));
})();
