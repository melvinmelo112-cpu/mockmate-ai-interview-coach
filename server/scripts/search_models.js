import fs from 'fs';
import path from 'path';

const searchTerms = ['gemini-3.8-flash', 'gemini-2.5-flash', 'gemini-3.5-flash-lite', 'GEMINI_MODEL'];
const excludeDirs = ['node_modules', 'dist', '.git', '.gemini', '.system_generated'];

function searchDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const relPath = path.relative(process.cwd(), fullPath);
    if (excludeDirs.some(d => relPath.split(path.sep).includes(d))) continue;

    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchDir(fullPath);
    } else if (stat.isFile() && (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.json') || file.startsWith('.env') || file.endsWith('.md'))) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');
      lines.forEach((line, idx) => {
        searchTerms.forEach(term => {
          if (line.includes(term)) {
            console.log(`${relPath}:${idx + 1} [${term}] -> ${line.trim()}`);
          }
        });
      });
    }
  }
}

searchDir(process.cwd());
