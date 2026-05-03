/**
 * Downloads profile images from rootsofprogress.org for fellows and advisory board.
 *
 * Usage: node scripts/download-images.mjs
 *
 * Fetches each profile page, extracts the profile image URL, and downloads
 * images to src/assets/images/fellows/ and src/assets/images/advisory/.
 */

import { mkdir, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const BASE_URL = 'https://rootsofprogress.org';

const fellowSlugs = [
  'brian-balkus', 'paige-lambermont', 'karthik-tadepalli', 'ariel-patton',
  'laura-mazer', 'sean-oneill-mcpartlin', 'pouya-nikmand', 'etienne-fortier-dubois',
  'nehal-udyavar', 'anton-leicht', 'ibis-slade', 'afra-wang', 'andrew-burleson',
  'steven-adler', 'venkatesh-ranjan', 'benedict-springbett', 'lesley-gao',
  'kelly-vedi', 'hiya-jain', 'sam-enright', 'elizabeth-van-nostrand',
  'adam-kroetsch', 'deric-tilson', 'alex-kustov', 'allison-lehman',
  'abby-shalekbriski', 'smrithi-sunil', 'ben-james', 'dominik-hermle',
  'duncan-mcclements', 'jannik-reigl', 'jeff-fong', 'jonah-messinger',
  'jordan-mcgillis', 'julius-simonelli', 'lauren-gilbert', 'quade-macdonald',
  'robert-long', 'rob-lheureux', 'rosie-campbell', 'ruxandra-teslo',
  'steve-newman', 'mary-hui', 'niko-mccarty', 'sarah-constantin', 'dynomight',
  'sean-fleming', 'andrew-miller', 'dean-ball', 'kevin-kohler', 'alex-telford',
  'connor-obrien', 'elle-griffin', 'fin-moorhouse', 'florian-metzler',
  'grant-dever', 'jacob-rintamaki', 'jenni-morales', 'jeremy-cote',
  'laura-london', 'maarten-boudry', 'madeline-zimmerman', 'malcolm-cochran',
  'max-tabarrok', 'ryan-puzycki', 'tina-marsh-dalton', 'raiany-romanni',
  'heidi-huang', 'michael-hill', 'tim-durham', 'grant-mulligan',
  'byron-cohen', 'rhishi-pethe', 'colleen-smith',
];

const advisorySlugs = [
  'blake-scholl', 'bob-mcgrew', 'ela-madej', 'holden-karnofsky', 'max-roser',
  'chandler-tuttle', 'emma-mcaleavy', 'mike-riggs', 'patrick-collison',
  'eli-dourado', 'tyler-cowen', 'andrej-karpathy', 'delian-asparouhov',
  'kanjun-qiu', 'timothy-b-lee', 'rob-tracinski', 'shreeda-segan',
  'noah-smith', 'tomas-pueyo', 'saloni-dattani', 'john-wilbanks',
  'greg-lukianoff', 'alex-kustov', 'brendan-mccord', 'kevin-esvelt',
  'alice-evans', 'virginia-postrel', 'elle-griffin', 'brian-potter',
];

async function extractImageUrl(pageUrl) {
  try {
    const res = await fetch(pageUrl);
    if (!res.ok) return null;
    const html = await res.text();
    // Look for the main profile image (wp-content/uploads)
    const match = html.match(/src="(https:\/\/rootsofprogress\.org\/wp-content\/uploads\/[^"]+(?:\.webp|\.jpg|\.jpeg|\.png))"/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

async function downloadImage(url, destPath) {
  try {
    const res = await fetch(url);
    if (!res.ok) return false;
    const buf = await res.arrayBuffer();
    await writeFile(destPath, Buffer.from(buf));
    return true;
  } catch {
    return false;
  }
}

async function processProfiles(type, slugs) {
  const dir = `src/assets/images/${type}`;
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });

  let downloaded = 0;
  let skipped = 0;

  for (const slug of slugs) {
    const pageUrl = `${BASE_URL}/${type === 'fellows' ? 'fellow' : 'advisory'}/${slug}/`;
    const imageUrl = await extractImageUrl(pageUrl);
    if (!imageUrl) {
      console.log(`  ⚠ No image found for ${slug}`);
      skipped++;
      continue;
    }
    const ext = path.extname(new URL(imageUrl).pathname) || '.webp';
    const destPath = `${dir}/${slug}${ext}`;
    const ok = await downloadImage(imageUrl, destPath);
    if (ok) {
      console.log(`  ✓ ${slug}${ext}`);
      downloaded++;
    } else {
      console.log(`  ✗ Failed to download for ${slug}`);
      skipped++;
    }
    // Small delay to avoid hammering the server
    await new Promise((r) => setTimeout(r, 200));
  }

  console.log(`\n${type}: ${downloaded} downloaded, ${skipped} skipped`);
}

console.log('Downloading fellow images...');
await processProfiles('fellows', fellowSlugs);

console.log('\nDownloading advisory images...');
await processProfiles('advisory', advisorySlugs);

console.log('\nDone!');
