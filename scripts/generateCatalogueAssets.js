import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const productsDir = path.resolve(__dirname, '../client/public/images/products');
const categoriesDir = path.resolve(__dirname, '../client/public/images/categories');

if (!fs.existsSync(productsDir)) fs.mkdirSync(productsDir, { recursive: true });
if (!fs.existsSync(categoriesDir)) fs.mkdirSync(categoriesDir, { recursive: true });

// Helper to generate SVG string
const generateProductSvg = ({ title, category, brand, pack, color1, color2, iconType }) => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="400" height="400">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="8" stdDeviation="12" flood-color="#000000" flood-opacity="0.12"/>
    </filter>
  </defs>

  <!-- Product Canvas -->
  <rect width="400" height="400" rx="20" fill="url(#bg)"/>
  <rect x="20" y="20" width="360" height="360" rx="16" fill="#FFFFFF" opacity="0.4"/>

  <!-- Category Chip -->
  <rect x="35" y="35" width="130" height="26" rx="13" fill="#176B45" />
  <text x="100" y="52" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="700" font-size="11" fill="#FFFFFF" text-anchor="middle" letter-spacing="0.5">${category.toUpperCase()}</text>

  <!-- Verification Badge -->
  <circle cx="345" cy="48" r="14" fill="#F1B84B" />
  <path d="M339 48 L343 52 L351 44" fill="none" stroke="#202820" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>

  <!-- Central Product Container -->
  <g filter="url(#shadow)">
    <rect x="90" y="90" width="220" height="220" rx="28" fill="#FFFFFF" stroke="#E2E4DE" stroke-width="2"/>
    <!-- Product Graphic Accent -->
    <circle cx="200" cy="180" r="65" fill="${color1}" opacity="0.35"/>
    <rect x="135" y="130" width="130" height="100" rx="16" fill="${color2}" opacity="0.85"/>
    <text x="200" y="185" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="800" font-size="22" fill="#FFFFFF" text-anchor="middle">${brand}</text>
  </g>

  <!-- Product Labels -->
  <text x="200" y="338" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="700" font-size="17" fill="#202820" text-anchor="middle">${title}</text>
  <rect x="150" y="352" width="100" height="22" rx="11" fill="#F0F2EB" />
  <text x="200" y="367" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="600" font-size="12" fill="#525B53" text-anchor="middle">${pack}</text>
</svg>`;
};

const generateCategorySvg = ({ name, color1, color2 }) => {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
  <defs>
    <linearGradient id="cbg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}"/>
      <stop offset="100%" stop-color="${color2}"/>
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="24" fill="url(#cbg)"/>
  <circle cx="100" cy="90" r="48" fill="#FFFFFF" opacity="0.9" />
  <rect x="75" y="70" width="50" height="40" rx="8" fill="${color1}" />
  <text x="100" y="165" font-family="'Plus Jakarta Sans', system-ui, sans-serif" font-weight="700" font-size="13" fill="#202820" text-anchor="middle">${name}</text>
</svg>`;
};

// Placeholder fallback SVG
const placeholderSvg = generateProductSvg({
  title: 'VyaparSetu Product',
  category: 'Grocery',
  brand: 'Verified',
  pack: 'Standard Pack',
  color1: '#E8F5EE',
  color2: '#176B45',
});
fs.writeFileSync(path.join(productsDir, 'placeholder.svg'), placeholderSvg);

// Categories
const categoriesList = [
  { slug: 'dairy-breakfast', name: 'Dairy & Breakfast', color1: '#E0F2FE', color2: '#0284C7' },
  { slug: 'atta-staples', name: 'Atta & Staples', color1: '#FEF3C7', color2: '#D97706' },
  { slug: 'cooking-essentials', name: 'Cooking Essentials', color1: '#FFEDD5', color2: '#EA580C' },
  { slug: 'snacks-packaged-food', name: 'Snacks & Packaged Food', color1: '#FCE7F3', color2: '#DB2777' },
  { slug: 'fruits', name: 'Fresh Fruits', color1: '#DCFCE7', color2: '#16A34A' },
  { slug: 'vegetables', name: 'Fresh Vegetables', color1: '#D1FAE5', color2: '#059669' },
  { slug: 'beverages', name: 'Beverages', color1: '#CFFAFE', color2: '#0891B2' },
  { slug: 'household', name: 'Household Essentials', color1: '#EDE9FE', color2: '#7C3AED' },
  { slug: 'personal-care', name: 'Personal Care', color1: '#FEE2E2', color2: '#E11D48' },
  { slug: 'event-supplies', name: 'Event & Bulk Supplies', color1: '#FEF9C3', color2: '#CA8A04' },
];

for (const cat of categoriesList) {
  const catSvg = generateCategorySvg({ name: cat.name, color1: cat.color1, color2: cat.color2 });
  fs.writeFileSync(path.join(categoriesDir, `${cat.slug}.svg`), catSvg);
}
fs.writeFileSync(path.join(categoriesDir, 'default.svg'), generateCategorySvg({ name: 'All Categories', color1: '#E8F5EE', color2: '#176B45' }));

console.log(`Generated ${categoriesList.length} category SVG assets and base placeholders.`);
