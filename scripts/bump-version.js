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
let [major, minor, patch] = (pkg.version || '0.1.0').split('.').map(Number);

let rawArg = (process.argv[2] || 'patch').trim();
if (rawArg.startsWith('v') || rawArg.startsWith('V')) {
  rawArg = rawArg.slice(1);
}

const arg = rawArg.toLowerCase();

if (arg === 'major') {
  major += 1;
  minor = 0;
  patch = 0;
} else if (arg === 'minor') {
  minor += 1;
  patch = 0;
} else if (arg === 'patch') {
  patch += 1;
} else if (/^\d+\.\d+\.\d+$/.test(rawArg)) {
  [major, minor, patch] = rawArg.split('.').map(Number);
} else if (/^\d+\.\d+$/.test(rawArg)) {
  [major, minor] = rawArg.split('.').map(Number);
  patch = 0;
} else if (/^\d+$/.test(rawArg)) {
  major = Number(rawArg);
  minor = 0;
  patch = 0;
} else {
  console.error(`Invalid version argument: ${rawArg}. Use 'patch', 'minor', 'major', or '1.1.0'`);
  process.exit(1);
}

const newVersion = `${major}.${minor}.${patch}`;
console.log(`\n📦 Synchronizing Application Version: ${pkg.version} ➔ ${newVersion}\n`);

// 1. Update package.json
pkg.version = newVersion;
fs.writeFileSync(packageJsonPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
console.log(`✅ Updated package.json (${newVersion})`);

// 2. Update src-tauri/tauri.conf.json
if (fs.existsSync(tauriConfPath)) {
  const tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf8'));
  tauriConf.version = newVersion;
  fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2) + '\n', 'utf8');
  console.log(`✅ Updated src-tauri/tauri.conf.json (${newVersion})`);
}

// 3. Update src-tauri/Cargo.toml
if (fs.existsSync(cargoTomlPath)) {
  let cargoContent = fs.readFileSync(cargoTomlPath, 'utf8');
  cargoContent = cargoContent.replace(/version\s*=\s*"[^"]+"/, `version = "${newVersion}"`);
  fs.writeFileSync(cargoTomlPath, cargoContent, 'utf8');
  console.log(`✅ Updated src-tauri/Cargo.toml (${newVersion})`);
}

// 4. Update src/version.ts
const versionTsContent = `// Single Source of Truth for Application Version
// This file is automatically synchronized during releases via scripts/bump-version.js
export const APP_VERSION = '${newVersion}';
export const APP_NAME = 'PDF Studio Pro';
export const GITHUB_REPO_URL = 'https://github.com/eekilinc/pdfstudio';
`;
fs.writeFileSync(versionTsPath, versionTsContent, 'utf8');
console.log(`✅ Updated src/version.ts (${newVersion})`);

console.log(`\n🎉 Version ${newVersion} synchronized across all project files successfully!\n`);
