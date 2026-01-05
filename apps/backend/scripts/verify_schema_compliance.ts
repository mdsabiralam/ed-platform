import * as fs from 'fs';
import * as path from 'path';

const schemaPath = path.join(__dirname, '../prisma/schema.prisma');

function verifySchema() {
  console.log('🔍 Verifying Schema Definitions...');

  if (!fs.existsSync(schemaPath)) {
    console.error('❌ schema.prisma not found!');
    process.exit(1);
  }

  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

  const checks = [
    { name: 'Institute', regex: /model\s+Institute\s+\{/ },
    { name: 'Institute Table Map', regex: /@@map\("institutes"\)/ },
    { name: 'User', regex: /model\s+User\s+\{/ },
    { name: 'Profile', regex: /model\s+Profile\s+\{/ },
    { name: 'Student', regex: /model\s+Student\s+\{/ },
    { name: 'Finance (ChartOfAccount)', regex: /model\s+ChartOfAccount\s+\{/ },
    { name: 'Transport (Vehicle)', regex: /model\s+TransportVehicle\s+\{/ },
    { name: 'Transport (Route)', regex: /model\s+TransportRoute\s+\{/ },
  ];

  let allPassed = true;

  checks.forEach(check => {
    if (check.regex.test(schemaContent)) {
      console.log(`✅ ${check.name} defined.`);
    } else {
      console.error(`❌ ${check.name} MISSING.`);
      allPassed = false;
    }
  });

  // Verify no "Tenant" model exists
  if (/model\s+Tenant\s+\{/.test(schemaContent)) {
    console.error('❌ Tenant model still exists (Should be renamed to Institute).');
    allPassed = false;
  } else {
    console.log('✅ Tenant model correctly removed/renamed.');
  }

  if (allPassed) {
    console.log('\n🎉 Schema Verification PASSED.');
  } else {
    console.error('\n⚠️ Schema Verification FAILED.');
    process.exit(1);
  }
}

verifySchema();
