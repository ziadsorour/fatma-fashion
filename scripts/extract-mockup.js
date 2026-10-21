const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

const desktopMockup = 'C:/Users/sorour/.gemini/antigravity/brain/cbcc3cf9-08b2-415e-99cf-710d850b1796/.user_uploaded/media_1792590618744_8279fed3.jpg';
const outputDir = path.join(__dirname, '..', 'public', 'images', 'mockup-assets');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function extractAssets() {
  const img = sharp(desktopMockup);
  const metadata = await img.metadata();
  console.log(`Source width: ${metadata.width}, height: ${metadata.height}`);

  // 1. Logo
  await sharp(desktopMockup)
    .extract({ left: 350, top: 25, width: 260, height: 105 })
    .toFile(path.join(outputDir, 'fatma-logo-clean.png'));
  console.log('Extracted logo');

  // 2. Hero Banner (full width of hero)
  await sharp(desktopMockup)
    .extract({ left: 0, top: 138, width: 959, height: 298 })
    .toFile(path.join(outputDir, 'hero-banner.jpg'));
  console.log('Extracted hero banner');

  // 3. Featured Collection left card
  await sharp(desktopMockup)
    .extract({ left: 30, top: 588, width: 400, height: 236 })
    .toFile(path.join(outputDir, 'featured-collection-card.jpg'));
  console.log('Extracted featured collection card');

  // 4. Products
  // Product 1: Striped Knit Sweater
  await sharp(desktopMockup)
    .extract({ left: 452, top: 588, width: 147, height: 154 })
    .toFile(path.join(outputDir, 'product-striped-sweater.jpg'));

  // Product 2: Cozy Set
  await sharp(desktopMockup)
    .extract({ left: 614, top: 588, width: 147, height: 154 })
    .toFile(path.join(outputDir, 'product-cozy-set.jpg'));

  // Product 3: Little Black Dress
  await sharp(desktopMockup)
    .extract({ left: 777, top: 588, width: 147, height: 154 })
    .toFile(path.join(outputDir, 'product-black-dress.jpg'));
  console.log('Extracted 3 featured products');

  // 5. Category Circles (Approx 92px wide each, distributed across width)
  const categoryCoords = [
    { name: 'tops', left: 65, top: 450, width: 92, height: 92 },
    { name: 'sweaters', left: 190, top: 450, width: 92, height: 92 },
    { name: 'pants', left: 317, top: 450, width: 92, height: 92 },
    { name: 'dresses', left: 442, top: 450, width: 92, height: 92 },
    { name: 'sets', left: 569, top: 450, width: 92, height: 92 },
    { name: 'outerwear', left: 695, top: 450, width: 92, height: 92 },
    { name: 'accessories', left: 820, top: 450, width: 92, height: 92 },
  ];

  for (const cat of categoryCoords) {
    await sharp(desktopMockup)
      .extract({ left: cat.left, top: cat.top, width: cat.width, height: cat.height })
      .toFile(path.join(outputDir, `category-${cat.name}.jpg`));
  }
  console.log('Extracted all 7 categories');
}

extractAssets().catch(console.error);
