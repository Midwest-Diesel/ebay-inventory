import { execSync } from "child_process";


const args = process.argv.slice(2);
if (args.length === 0) {
  console.error('Please provide at least one integration test name.');
  process.exit(1);
}

const files = args.map((name) => `src/tests/integration/${name}.test.ts`).join(' ');

execSync(`vitest run --project integration --maxWorkers 1 ${files}`, { stdio: 'inherit' });
