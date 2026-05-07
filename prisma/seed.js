/**
 * @deprecated Utilisez `npx prisma db seed` (package.json → `tsx prisma/seed.ts`).
 * Conservé pour compatibilité : délègue à seed.ts afin que `schengen_flag` et le reste
 * ne divergent jamais de la logique TypeScript (lib/schengen-members).
 */
const path = require('path');
const { execSync } = require('child_process');

async function main() {
  console.log('[prisma/seed.js] Délégation vers prisma/seed.ts …');
  execSync('npx tsx prisma/seed.ts', { stdio: 'inherit', cwd: path.join(__dirname, '..') });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
