import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// File paths
const packageJsonPath = path.join(rootDir, 'package.json');
const tauriConfPath = path.join(rootDir, 'src-tauri', 'tauri.conf.json');
const cargoTomlPath = path.join(rootDir, 'src-tauri', 'Cargo.toml');
const versionTsPath = path.join(rootDir, 'src', 'version.ts');

// Read current package.json version
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
let [major, minor, patch] = pkg.version.split('.').map(Number);

const arg = (process.argv[2] || 'patch').toLowerCase();

if (arg === 'major') {
  major += 1;
  minor = 0;
  patch = 0;
} else if (arg === 'minor') {
  minor += 1;
  patch = 0;
} else if (arg === 'patch') {
  patch += 1;
} else if (/^\d+\.\d+\.\d+$/.test(arg)) {
  [major, minor, patch] = arg.split('.').map(Number);
} else {
  console.error(`Invalid version argument: ${arg}. Use 'patch', 'minor', 'major', or 'x.y.z'`);
  process.exit(1);
}

const newVersion = `${major}.${minor}.${patch}`;
console.log(`\n📦 Bumping application version: ${pkg.version} ➔ ${newVersion}\n`);

// 1. Update package.json
pkg.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log(`✅ Updated package.json`);

// 2. Update src-tauri/tauri.conf.json
if (fs.existsSync(tauriConfPath)) {
  const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
  tauriConf.version = newVersion;
  fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n', 'utf8');
  console.log(`✅ Updated src-tauri/tauri.conf.json`);
}

// 3. Update src-tauri/Cargo.toml
if (fs.existsSync(cargoTomlPath)) {
  let cargoContent = fs.readFileSync(cargoTomlPath, 'utf8');
  cargoContent = cargoContent.replace(/version\s*=\s*"[^"]+"/, `version = "${newVersion}"`);
  fs.writeFileSync(cargoTomlPath, cargoContent, 'utf8');
  console.log(`✅ Updated src-tauri/Cargo.toml`);
}

// 4. Update src/version.ts
const versionTsContent = `// Single Source of Truth for Application Version
// This file is automatically synchronized during releases via scripts/bump-version.js
export const APP_VERSION = '${newVersion}';
export const APP_NAME = 'PDF Studio Pro';
export const GITHUB_REPO_URL = 'https://github.com/eekilinc/pdfstudio';
`;
fs.writeFileSync(versionTsPath, versionTsContent, 'utf8');
console.log(`✅ Updated src/version.ts`);

console.log(`\n🎉 Version ${newVersion} synchronized across all project files successfully!\n`);
