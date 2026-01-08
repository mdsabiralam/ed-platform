import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing Signature Flow...');
  const tenantId = 'test-tenant-sig';

  // Cleanup
  try {
    // Delete dependent records first if any (e.g., sections referring to staff)
    // For this test, mostly simple.
    await prisma.staffProfile.deleteMany({ where: { tenantId } });
    await prisma.marksheetTemplate.deleteMany({ where: { tenantId } });
    await prisma.tenant.delete({ where: { id: tenantId } });
    await prisma.user.deleteMany({ where: { email: 'principal@test.com' } });
  } catch (e) {}

  // 1. Create Tenant
  await prisma.tenant.create({
      data: {
          id: tenantId,
          name: 'Signature School',
          subdomain: 'test-sig',
      }
  });

  // 2. Create User for Staff
  const user = await prisma.user.create({
      data: {
          email: 'principal@test.com',
          passwordHash: 'hash',
      }
  });

  // 3. Create Staff Profile (Principal) with Signature
  const principal = await prisma.staffProfile.create({
      data: {
          userId: user.id,
          tenantId,
          designation: 'Principal',
          joiningDate: new Date(),
          signatureUrl: 'https://via.placeholder.com/100x50.png?text=Signature'
      }
  });
  console.log('Principal created with signature:', principal.signatureUrl);

  // 4. Create Template with Principal Signature block
  const template = await prisma.marksheetTemplate.create({
      data: {
          tenantId,
          name: 'Sig Template',
          structureJson: {
              header: { logoPosition: 'left', schoolNameFontSize: 24, showAddress: true },
              studentInfo: { fields: ['name'], layout: 'list' },
              marksTable: { visible_columns: ['subject'], showTotal: true },
              footer: {
                  signatures: [{ title: 'Principal', position: 'right' }],
                  showDate: true
              }
          },
          pageSize: 'A4'
      }
  });

  console.log('Template created. ID:', template.id);
  console.log('Please verify via API /preview/' + template.id + ' that signature renders.');

  // Verify logic manually
  const fetchedPrincipal = await prisma.staffProfile.findFirst({
      where: { designation: 'Principal', tenantId }
  });

  if (fetchedPrincipal?.signatureUrl !== principal.signatureUrl) throw new Error('Signature mismatch');
  console.log('Verification logic passed.');
}

main()
  .catch(e => {
      console.error(e);
      process.exit(1);
  })
  .finally(async () => {
      await prisma.$disconnect();
  });
