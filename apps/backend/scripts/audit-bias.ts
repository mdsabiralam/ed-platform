/**
 * Task 7: Bias Check (Fairness Testing)
 * Script to simulate checking Face Recognition model bias across demographics.
 * Usage: npx ts-node apps/backend/scripts/audit-bias.ts
 */

const demographics = [
  { group: 'Light Skin - Male', total: 100, failures: 1 },
  { group: 'Light Skin - Female', total: 100, failures: 2 },
  { group: 'Dark Skin - Male', total: 100, failures: 12 }, // Simulated bias
  { group: 'Dark Skin - Female', total: 100, failures: 10 },
];

function calculateFalseNegativeRate(group: any) {
  return (group.failures / group.total) * 100;
}

async function runBiasAudit() {
  console.log('Starting AI Bias Audit...');

  let biasDetected = false;
  const threshold = 5.0; // 5% max failure rate allowed

  for (const group of demographics) {
    const fnr = calculateFalseNegativeRate(group);
    console.log(`Group: ${group.group} | FNR: ${fnr.toFixed(2)}%`);

    if (fnr > threshold) {
      console.warn(`[WARNING] Bias detected for ${group.group}. FNR exceeds ${threshold}%`);
      biasDetected = true;
    }
  }

  if (biasDetected) {
    console.log('\nAudit Result: FAILED');
    console.log('Action Required: Adjust image preprocessing (e.g., gamma correction) for darker skin tones.');
    // In a real script, this might trigger a retraining pipeline or update config
    process.exit(1);
  } else {
    console.log('\nAudit Result: PASSED');
    process.exit(0);
  }
}

runBiasAudit();
