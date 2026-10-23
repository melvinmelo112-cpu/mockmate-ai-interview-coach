import { execSync } from 'child_process';

console.log('--- Environment Check for GEMINI_MODEL ---');
console.log('Current process.env.GEMINI_MODEL:', process.env.GEMINI_MODEL || '<unset>');

try {
  const userVal = execSync('powershell -NoProfile -Command "[System.Environment]::GetEnvironmentVariable(\'GEMINI_MODEL\', \'User\')"').toString().trim();
  console.log('User-level Windows GEMINI_MODEL:', userVal || '<unset>');
} catch (err) {
  console.log('User-level Windows GEMINI_MODEL: <error reading>', err.message);
}

try {
  const machineVal = execSync('powershell -NoProfile -Command "[System.Environment]::GetEnvironmentVariable(\'GEMINI_MODEL\', \'Machine\')"').toString().trim();
  console.log('Machine-level Windows GEMINI_MODEL:', machineVal || '<unset>');
} catch (err) {
  console.log('Machine-level Windows GEMINI_MODEL: <error reading>', err.message);
}

console.log('--- End of Environment Check ---');
