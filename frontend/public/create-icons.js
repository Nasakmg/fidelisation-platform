const fs = require('fs');

// Créer une icône SVG simple
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="100" fill="#EAB308"/>
  <text x="256" y="320" font-size="280" text-anchor="middle" fill="black">🎯</text>
</svg>`;

fs.writeFileSync('icon.svg', svg);
console.log('SVG créé !');