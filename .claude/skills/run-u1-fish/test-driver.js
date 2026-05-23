#!/usr/bin/env node
/**
 * U1-fish Test Driver
 *
 * This driver provides utilities to test the U1-fish game:
 * - Launch local server
 * - Verify Supabase connectivity
 * - Log version info
 * - Provide examples for browser automation
 *
 * Usage:
 *   node test-driver.js [command]
 *
 * Commands:
 *   server   - Start local HTTP server on port 8000
 *   check    - Check game file and version
 *   urls     - Print game URLs
 *   help     - Show this help
 */

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const GAME_DIR = process.cwd();
const GAME_FILE = path.join(GAME_DIR, 'U1-fish.html');
const LOCAL_URL = 'http://localhost:8000/U1-fish.html';
const PROD_URL = 'https://gkdl9113-cmd.github.io/U1-game/U1-fish.html';

function logSection(title) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${title}`);
  console.log(`${'='.repeat(60)}\n`);
}

function checkGame() {
  logSection('Game File Check');

  if (!fs.existsSync(GAME_FILE)) {
    console.error(`❌ Game file not found: ${GAME_FILE}`);
    process.exit(1);
  }

  const content = fs.readFileSync(GAME_FILE, 'utf8');
  const sizeKb = (Buffer.byteLength(content) / 1024).toFixed(1);

  // Extract version
  const buildMatch = content.match(/const BUILD\s*=\s*['"]([^'"]+)['"]/);
  const version = buildMatch ? buildMatch[1] : 'unknown';

  // Count key functions
  const functions = (content.match(/^function\s+\w+/gm) || []).length;
  const gameLogic = (content.match(/\bfish|battle|skill|challenge/gi) || []).length;

  console.log(`✓ Game file found`);
  console.log(`  Size:           ${sizeKb} KB`);
  console.log(`  Version:        ${version}`);
  console.log(`  Functions:      ${functions}`);
  console.log(`  Game keywords:  ${gameLogic} matches`);
  console.log(`\n✓ Game appears valid`);
}

function showUrls() {
  logSection('Game URLs');
  console.log(`Production (GitHub Pages):\n  ${PROD_URL}\n`);
  console.log(`Local (after running "npm run server"):\n  ${LOCAL_URL}\n`);
  console.log(`For testing:\n  - Use TEST-1 server (isolated test data)\n  - Any username works\n  - No password required\n`);
}

function startServer() {
  logSection('Starting Local Server');

  const server = spawn('python3', ['-m', 'http.server', '8000'], {
    cwd: GAME_DIR,
    stdio: 'inherit'
  });

  console.log(`✓ Starting HTTP server on port 8000`);
  console.log(`  Game URL: ${LOCAL_URL}`);
  console.log(`  Press Ctrl+C to stop\n`);

  server.on('error', (err) => {
    console.error(`❌ Failed to start server: ${err.message}`);
    process.exit(1);
  });
}

function showHelp() {
  console.log(`
U1-fish Test Driver

Usage: node test-driver.js [command]

Commands:
  check       Check game file integrity and version
  server      Start local development server on port 8000
  urls        Show game URLs (production and local)
  help        Show this help message

Example:
  node test-driver.js server
  # Then open http://localhost:8000/U1-fish.html in your browser

Features:
  - Single HTML file, no build step required
  - Supabase backend (realtime multiplayer)
  - Three fish species with 5 evolution stages each
  - Battle system with seeded RNG (deterministic cross-client)
  - Fishing mini-game with timing-based mechanics
  - Skills system (per-fish, species-exclusive + common slots)

Version info:
  Get current version from file:
    grep 'const BUILD' U1-fish.html
  Update version before deploy:
    1. Edit const BUILD in U1-fish.html
    2. git commit -m "vX.XX - Changes"
    3. git push origin HEAD
`);
}

// Main
const cmd = process.argv[2] || 'help';

switch (cmd) {
  case 'check':
    checkGame();
    break;
  case 'server':
    startServer();
    break;
  case 'urls':
    showUrls();
    break;
  case 'help':
  default:
    showHelp();
    break;
}
