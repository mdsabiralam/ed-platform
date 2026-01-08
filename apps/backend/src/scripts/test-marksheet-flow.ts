import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Testing Marksheet Flow...');
  const tenantId = 'test-tenant-marksheet';

  // Cleanup
  try {
    await prisma.class.deleteMany({ where: { tenantId } });
    await prisma.marksheetTemplate.deleteMany({ where: { tenantId } });
    await prisma.tenant.delete({ where: { id: tenantId } });
  } catch (e) {
      // Ignore if not exists
  }

  // 1. Create Tenant
  await prisma.tenant.create({
      data: {
          id: tenantId,
          name: 'Test School',
          subdomain: 'test-marksheet',
      }
  });

  // 2. Create Template
  console.log('Creating Template...');
  const template = await prisma.marksheetTemplate.create({
      data: {
          tenantId,
          name: 'Junior Template',
          structureJson: { some: 'json' },
          disclaimerText: 'Original Disclaimer',
          pageSize: 'A4'
      }
  });
  console.log('Template created:', template.id);

  // 3. Update Template (Simulate PUT)
  console.log('Updating Template...');
  const updatedTemplate = await prisma.marksheetTemplate.update({
      where: { id: template.id },
      data: {
          disclaimerText: 'Updated Disclaimer',
          backgroundImageUrl: 'https://via.placeholder.com/img.png'
      }
  });

  if (updatedTemplate.disclaimerText !== 'Updated Disclaimer') throw new Error('Update failed');
  console.log('Template updated.');

  // 4. Create Class
  const cls = await prisma.class.create({
      data: {
          tenantId,
          name: 'Class 1'
      }
  });

  // 5. Assign Template (Simulate PUT assign-template)
  console.log('Assigning Template...');
  const updatedClass = await prisma.class.update({
      where: { id: cls.id },
      data: { templateId: template.id }
  });

  if (updatedClass.templateId !== template.id) throw new Error('Assignment failed');
  console.log('Template assigned to class.');

  console.log('Flow Verification Successful.');
}

main()
  .catch(e => {
      console.error(e);
      process.exit(1);
  })
  .finally(async () => {
      await prisma.$disconnect();
  });
