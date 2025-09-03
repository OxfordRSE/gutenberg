#!/usr/bin/env tsx
import { refreshMaterial } from '../lib/search/manageMaterial.ts';

async function main() {
  try {
    await refreshMaterial();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
main();
