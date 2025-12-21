import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';

// Encryption helpers for 2.I.01
const ALGORITHM = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret_key_32_bytes_long!!';
const IV_LENGTH = 16;
const KEY = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);

function encrypt(text: string): string {
  if (!text) return text;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  if (!text || !text.includes(':')) return text;
  try {
    const textParts = text.split(':');
    const ivHex = textParts.shift();
    if (!ivHex) return text;
    const iv = Buffer.from(ivHex, 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (e) {
    return text;
  }
}

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    // 2.I.04 Set up SSL/TLS enforcement for all DB connections
    const url = process.env.DATABASE_URL;
    const isProduction = process.env.NODE_ENV === 'production';
    let datasources: { db: { url: string } } | undefined = undefined;

    if (isProduction && url && !url.includes('sslmode=')) {
      const separator = url.includes('?') ? '&' : '?';
      datasources = {
        db: {
          url: `${url}${separator}sslmode=require`,
        },
      };
    }

    super({
      log: ['info', 'warn', 'error'], // লগিং এনাবল করা হলো
      datasources,
    });
  }

  async onModuleInit() {
    await this.$connect();

    // 2.I.01 & 2.I.07 Column-level encryption (HealthProfile & KycDocument)
    this.$use(async (params, next) => {
      if (!params.model) return next(params);

      const encryptionMap: Record<string, string[]> = {
        HealthProfile: ['medicalHistory', 'medications', 'allergies', 'conditions'],
        KycDocument: ['documentUrl'], // 2.I.07 Secure URL storage
      };

      const sensitiveFields = encryptionMap[params.model];

      if (sensitiveFields) {
        
        const encryptObject = (obj: any) => {
          if (!obj) return;
          for (const field of sensitiveFields) {
            if (obj[field] && typeof obj[field] === 'string') {
              obj[field] = encrypt(obj[field]);
            }
          }
        };

        if (['create', 'update', 'createMany', 'updateMany'].includes(params.action)) {
          if (params.args.data) {
            if (Array.isArray(params.args.data)) {
              params.args.data.forEach(encryptObject);
            } else {
              encryptObject(params.args.data);
            }
          }
        }
        if (params.action === 'upsert') {
          if (params.args.create) encryptObject(params.args.create);
          if (params.args.update) encryptObject(params.args.update);
        }
      }

      const result = await next(params);

      if (sensitiveFields && result) {
        const decryptObject = (obj: any) => {
          if (!obj) return;
          for (const field of sensitiveFields) {
            if (obj[field] && typeof obj[field] === 'string') {
              obj[field] = decrypt(obj[field]);
            }
          }
        };

        if (Array.isArray(result)) {
          result.forEach(decryptObject);
        } else {
          decryptObject(result);
        }
      }

      return result;
    });

    // 2.I.02 Soft Delete Middleware
    this.$use(async (params, next) => {
      // যেসব মডেলে soft delete আছে
      const softDeleteModels = ['Tenant', 'User', 'Student', 'StaffProfile', 'Class', 'Section', 'AdmissionSession'];
      
      if (params.model && softDeleteModels.includes(params.model)) {
        if (params.action === 'delete') {
          // Delete -> Update deletedAt
          params.action = 'update';
          params.args['data'] = { deletedAt: new Date() };
        }
        if (params.action === 'deleteMany') {
          // DeleteMany -> UpdateMany deletedAt
          params.action = 'updateMany';
          if (params.args.data != undefined) {
            params.args.data['deletedAt'] = new Date();
          } else {
            params.args['data'] = { deletedAt: new Date() };
          }
        }
        if (params.action === 'findUnique' || params.action === 'findFirst') {
           // findUnique কে findFirst এ পরিবর্তন করা যাতে ফিল্টার যোগ করা যায়
           params.action = 'findFirst';
           if (!params.args.where) {
             params.args.where = { deletedAt: null };
           } else if (params.args.where.deletedAt === undefined) {
             params.args.where['deletedAt'] = null;
           }
        }
        if (['findMany', 'count', 'aggregate', 'groupBy'].includes(params.action)) {
           if (params.args.where) {
             if (params.args.where.deletedAt == undefined) {
               params.args.where['deletedAt'] = null;
             }
           } else {
             params.args['where'] = { deletedAt: null };
           }
        }
      }
      return next(params);
    });

    // 2.I.03 Create a database user for "Read-Only" analytics
    // Note: This is handled via SQL script. Please run 'prisma/create_analytics_user.sql' in your database.

    // 2.I.06 Implement "Audit Trigger" for critical tables (Fees/Marks)
    // Note: This is handled via SQL script. Please run 'prisma/audit_triggers.sql' in your database.

    // 2.I.07 Create kyc_documents table with secure URL storage
    // Note: Table creation is handled via SQL script 'prisma/create_kyc_documents.sql'.
    // Encryption logic is handled in the middleware above.

    // 2.I.08 Define password_policies in global_configs
    // Note: This is handled via SQL script. Please run 'prisma/setup_password_policy.sql' in your database.

    // 2.I.09 Test SQL injection vulnerability on search inputs
    // Middleware to warn about Raw SQL usage where injection risks might exist
    this.$use(async (params, next) => {
      const rawActions = ['executeRaw', 'queryRaw', 'runCommandRaw', 'executeRawUnsafe', 'queryRawUnsafe'];
      if (rawActions.includes(params.action)) {
        this.logger.warn(`⚠️  Raw SQL usage detected: ${params.action}. Ensure manual sanitization to prevent SQL Injection.`);
      }
      return next(params);
    });

    // 2.I.10 Document GDPR/DPDP compliance strategy
    // Note: Please refer to 'prisma/GDPR_COMPLIANCE.md' for the detailed strategy.

    // 2.J.01 Verify all tables are created in the cloud DB
    // Note: Run 'npx ts-node prisma/verify_tables.ts' to list all tables.

    // 2.J.02 Verify RLS policies are active and working
    // Note: Run 'npx ts-node prisma/verify_rls.ts' to check RLS status.

    // 2.J.03 Check if the 'analytics_reader' user has correct permissions
    // Note: Run 'npx ts-node prisma/verify_analytics_permissions.ts' to verify.

    // 2.J.03 (Part 2) Verify pgvector is ready for embeddings
    // Note: Run 'npx ts-node prisma/verify_pgvector.ts' to verify.

    // 2.J.04 Check database latency from Backend
    // Note: Run 'npx ts-node prisma/check_db_latency.ts' to check latency.

    // 2.J.05 Commit schema.prisma to Git
    // Note: This is a manual Git operation. Please run git commands to commit the schema.

    // 2.J.06 Generate Entity Relationship Diagram (ERD)
    // Note: Run 'npx prisma generate' to create 'prisma/ERD.svg'.

    // 2.J.07 Share ERD with Mobile team for local DB mirroring
    // Note: Run 'npx ts-node prisma/share_erd.ts' to copy ERD to mobile app.

    // 2.J.08 Merge feature/database-setup into dev branch
    // Note: This is a Git operation. Ensure all changes are committed, then merge into dev.
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}