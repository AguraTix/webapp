#!/usr/bin/env node

/**
 * Script to remove console statements from built files for production
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, '../dist');

function removeConsoleFromFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Remove console.log, console.error, console.warn, console.debug, console.info
    content = content.replace(/console\.(log|error|warn|debug|info|table|group|groupEnd|time|timeEnd)\([^)]*\);?/g, '');
    
    // Remove empty lines that might be left
    content = content.replace(/^\s*[\r\n]/gm, '');
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Cleaned console statements from: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dir) {
  if (!fs.existsSync(dir)) {
    console.log('❌ Dist directory not found. Run build first.');
    return;
  }

  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      processDirectory(filePath);
    } else if (file.endsWith('.js') || file.endsWith('.mjs')) {
      removeConsoleFromFile(filePath);
    }
  });
}

console.log('🧹 Removing console statements from production build...');
processDirectory(distDir);
console.log('✨ Console cleanup complete!');