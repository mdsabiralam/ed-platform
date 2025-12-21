import * as fs from 'fs';
import * as path from 'path';

const source = path.join(__dirname, 'ERD.svg');
// ব্যাকএন্ড ফোল্ডার থেকে মোবাইল ফোল্ডারে যাওয়ার পাথ
const destDir = path.join(__dirname, '../../../mobile/assets'); 
const dest = path.join(destDir, 'backend_erd.svg');

console.log('📂 Sharing ERD with Mobile Team (2.J.07)...');

if (!fs.existsSync(source)) {
  console.error('❌ ERD.svg not found in prisma folder. Please run "npx prisma generate" first.');
  process.exit(1);
}

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

fs.copyFileSync(source, dest);
console.log(`✅ ERD successfully copied to: ${dest}`);
console.log('📱 Mobile team can now reference this file for local DB mirroring.');