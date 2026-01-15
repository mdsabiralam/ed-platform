import { Injectable, OnModuleInit, OnModuleDestroy, Logger, Optional } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ClsService } from 'nestjs-cls';
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

  constructor(
    @Optional() private readonly cls?: ClsService,
  ) {
    // 2.G.05 High Concurrency & Connection Pooling
    // Connection pooling is configured via the DATABASE_URL environment variable.
    // Example: postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=10
    // The query engine creates a connection pool with the specified limit.

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
      log: ['info', 'warn', 'error'],
      datasources,
    });
  }

  async onModuleInit() {
    await this.$connect();

    // 2.G.09 Application Level RLS Middleware
    // Automatically injects instituteId filter based on CLS context
    this.$use(async (params, next) => {
      // Check if we have an active CLS context and an instituteId
      const instituteId = this.cls?.get('instituteId');

      // List of models that should be scoped by instituteId
      // Note: 'Institute' model itself is scoped by 'id' usually, handled separately or excluded if admin access
      // Removed 'User' (Global) and 'Section' (Nested via Class) as they lack direct instituteId
      const instituteScopedModels = [
        'Student', 'StaffProfile', 'Class', 'Profile',
        'AdmissionSession', 'InstituteSubscription', 'SaasInvoice',
        'ChartOfAccount', 'LeaveType', 'KycDocument', 'ReferralLinkage'
      ];

      // Skip if no institute context (e.g. system background jobs, or public routes)
      // Also skip if model is not one of the scoped ones
      if (instituteId && params.model && instituteScopedModels.includes(params.model)) {

        // Handle Find operations
        if (['findUnique', 'findFirst', 'findMany', 'count', 'aggregate', 'groupBy'].includes(params.action)) {
          if (params.action === 'findUnique') {
            // findUnique only accepts unique fields. If we add a non-unique filter, we must use findFirst.
            params.action = 'findFirst';
            params.args.where = { ...params.args.where, instituteId };
          } else {
            if (!params.args.where) {
              params.args.where = { instituteId };
            } else {
              // Ensure we don't overwrite existing where clauses, but merge them
              // And enforce instituteId. If creating a complex query, manual handling might be needed,
              // but for top-level filter this is usually sufficient.
              // Note: This overrides any manual 'instituteId' passed in 'where', which is good for security.
              params.args.where = { ...params.args.where, instituteId };
            }
          }
        }

        // Handle Create operations - Auto-assign instituteId
        if (['create', 'createMany'].includes(params.action)) {
          if (params.action === 'create') {
            params.args.data = { ...params.args.data, instituteId };
          }
          if (params.action === 'createMany') {
             if (Array.isArray(params.args.data)) {
               params.args.data = params.args.data.map(item => ({ ...item, instituteId }));
             } else {
               params.args.data = { ...params.args.data, instituteId };
             }
          }
        }

        // Handle Update/Delete operations - Ensure scope
        if (['update', 'updateMany', 'delete', 'deleteMany'].includes(params.action)) {
           if (!params.args.where) {
             params.args.where = { instituteId };
           } else {
             params.args.where = { ...params.args.where, instituteId };
           }
        }
      }

      return next(params);
    });

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
    // Updated to use Institute instead of Tenant and isDeleted logic
    this.$use(async (params, next) => {
      const softDeleteModels = ['Institute', 'User', 'Student', 'StaffProfile', 'Class', 'Section', 'AdmissionSession'];
      
      if (params.model && softDeleteModels.includes(params.model)) {
        if (params.action === 'delete') {
          // Delete -> Update deletedAt and isDeleted
          params.action = 'update';
          params.args['data'] = { deletedAt: new Date(), isDeleted: true };
        }
        if (params.action === 'deleteMany') {
          // DeleteMany -> UpdateMany
          params.action = 'updateMany';
          if (params.args.data != undefined) {
            params.args.data['deletedAt'] = new Date();
            params.args.data['isDeleted'] = true;
          } else {
            params.args['data'] = { deletedAt: new Date(), isDeleted: true };
          }
        }
        if (params.action === 'findUnique' || params.action === 'findFirst') {
           // findUnique -> findFirst to allow filtering
           params.action = 'findFirst';
           if (!params.args.where) {
             params.args.where = { isDeleted: false };
           } else if (params.args.where.isDeleted === undefined) {
             params.args.where['isDeleted'] = false;
           }
        }
        if (['findMany', 'count', 'aggregate', 'groupBy'].includes(params.action)) {
           if (params.args.where) {
             if (params.args.where.isDeleted == undefined) {
               params.args.where['isDeleted'] = false;
             }
           } else {
             params.args['where'] = { isDeleted: false };
           }
        }
      }
      return next(params);
    });

    // 2.I.09 Test SQL injection vulnerability on search inputs
    this.$use(async (params, next) => {
      const rawActions = ['executeRaw', 'queryRaw', 'runCommandRaw', 'executeRawUnsafe', 'queryRawUnsafe'];
      if (rawActions.includes(params.action)) {
        this.logger.warn(`⚠️  Raw SQL usage detected: ${params.action}. Ensure manual sanitization to prevent SQL Injection.`);
      }
      return next(params);
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
