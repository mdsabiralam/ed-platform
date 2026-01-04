import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import * as crypto from 'crypto';
import { encryptionExtension } from './extensions/encryption.extension';

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
    // This logic enforces encryption in transit for production environments.
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

    // 2.I.01 Apply encryption extension
    // We extend 'this' client and patch the current instance with the extended methods.
    // This allows us to keep the 'PrismaService' type compatible with DI while
    // transparently adding the extension logic.
    const extendedClient = this.$extends(encryptionExtension);
    Object.assign(this, extendedClient);

    // 2.I.01 & 2.I.07 Column-level encryption (HealthProfile & KycDocument)
    this.$use(async (params, next) => {
      if (!params.model) return next(params);

      const encryptionMap: Record<string, string[]> = {
        // HealthProfile: ['medicalHistory', 'medications', 'allergies', 'conditions'], // Removed: Now handled via pgcrypto & extension
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