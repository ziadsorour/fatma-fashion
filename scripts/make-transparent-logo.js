const sharp = require('sharp');
const path = require('path');

async function makeLogoTransparent() {
  const inputPath = path.join(__dirname, '..', 'public', 'images', 'mockup-assets', 'fatma-logo-clean.png');
  const outputPath = path.join(__dirname, '..', 'public', 'images', 'fatma-logo-transparent.png');

  const { data, info } = await sharp(inputPath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const bgR = 243, bgG = 232, bgB = 226;
  const tolerance = 24;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    const dist = Math.sqrt((r - bgR) ** 2 + (g - bgG) ** 2 + (b - bgB) ** 2);
    if (dist < tolerance) {
      data[i + 3] = 0; // completely transparent
    } else if (dist < tolerance + 20) {
      data[i + 3] = Math.round(((dist - tolerance) / 20) * 255); // smooth anti-aliased edge
    }
  }

  await sharp(data, {
    raw: {
      width: info.width,
      height: info.height,
      channels: 4,
    },
  })
    .trim()
    .png()
    .toFile(outputPath);

  console.log('Successfully created transparent logo at', outputPath);
}

makeLogoTransparent().catch(console.error);
