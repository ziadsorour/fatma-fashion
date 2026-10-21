import fs from 'fs';
import path from 'path';
import https from 'https';

const images = [
  // Hero & Collection
  {
    url: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1000&auto=format&fit=crop&q=85',
    dest: 'public/images/hero-fashion.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=1000&auto=format&fit=crop&q=85',
    dest: 'public/images/featured-collection.jpg',
  },

  // Categories
  {
    url: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400&auto=format&fit=crop&q=80',
    dest: 'public/images/categories/tops.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&auto=format&fit=crop&q=80',
    dest: 'public/images/categories/sweaters.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&auto=format&fit=crop&q=80',
    dest: 'public/images/categories/pants.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&auto=format&fit=crop&q=80',
    dest: 'public/images/categories/dresses.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&auto=format&fit=crop&q=80',
    dest: 'public/images/categories/sets.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&auto=format&fit=crop&q=80',
    dest: 'public/images/categories/outerwear.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=400&auto=format&fit=crop&q=80',
    dest: 'public/images/categories/accessories.jpg',
  },

  // 14 Products
  {
    url: 'https://images.unsplash.com/photo-1534126511673-b6899657816a?w=800&auto=format&fit=crop&q=80',
    dest: 'public/images/products/classic-cotton-blouse.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
    dest: 'public/images/products/printed-tshirt.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=800&auto=format&fit=crop&q=80',
    dest: 'public/images/products/satin-crop-top.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&auto=format&fit=crop&q=80',
    dest: 'public/images/products/oversized-sweater.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&auto=format&fit=crop&q=80',
    dest: 'public/images/products/wool-cardigan.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1509551388413-e18d0ac5d495?w=800&auto=format&fit=crop&q=80',
    dest: 'public/images/products/wide-leg-linen-pants.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=800&auto=format&fit=crop&q=80',
    dest: 'public/images/products/mom-fit-jeans.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=800&auto=format&fit=crop&q=80',
    dest: 'public/images/products/floral-midi-dress.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&auto=format&fit=crop&q=80',
    dest: 'public/images/products/glitter-evening-dress.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&auto=format&fit=crop&q=80',
    dest: 'public/images/products/casual-cotton-dress.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&auto=format&fit=crop&q=80',
    dest: 'public/images/products/cotton-athleisure-set.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1548142813-c348350df52b?w=800&auto=format&fit=crop&q=80',
    dest: 'public/images/products/formal-blazer-set.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80',
    dest: 'public/images/products/faux-leather-jacket.jpg',
  },
  {
    url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800&auto=format&fit=crop&q=80',
    dest: 'public/images/products/leather-handbag.jpg',
  },
];

function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const fullPath = path.resolve(process.cwd(), destPath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });

    const file = fs.createWriteStream(fullPath);
    https.get(url, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (!redirectUrl) return reject(new Error('Redirect without location'));
        return downloadFile(redirectUrl, destPath).then(resolve).catch(reject);
      }

      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: HTTP ${response.statusCode}`));
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Saved: ${destPath}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(fullPath, () => {});
      reject(err);
    });
  });
}

async function main() {
  console.log('Downloading high-quality fashion images...');
  for (const item of images) {
    try {
      await downloadFile(item.url, item.dest);
    } catch (err) {
      console.error(`Error downloading ${item.dest}:`, err);
    }
  }
  console.log('All downloads completed!');
}

main();
