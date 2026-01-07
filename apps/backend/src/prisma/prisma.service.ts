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
  private _readClient: PrismaClient;

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

  get read(): PrismaClient {
    return this._readClient || this;
  }

  async onModuleInit() {
    await this.$connect();

    // 13.D.01 Initialize Read Replica Client
    // If DATABASE_URL_SLAVE is provided, use it. Otherwise, fallback to the primary connection.
    const readUrl = process.env.DATABASE_URL_SLAVE || process.env.DATABASE_URL;
    if (readUrl && readUrl !== process.env.DATABASE_URL) {
      this._readClient = new PrismaClient({
        datasources: { db: { url: readUrl } },
        log: ['error'], // Minimize logs on read replica
      });
      await this._readClient.$connect();
      this.logger.log('Connected to Read Replica Database');
    } else {
      this._readClient = this; // Fallback to self (Master)
    }

    // Apply middleware to BOTH master and read client
    const applyMiddleware = (client: PrismaClient) => {
      // 2.I.01 & 2.I.07 Column-level encryption
      client.$use(async (params, next) => {
        if (!params.model) return next(params);
        const encryptionMap: Record<string, string[]> = {
          HealthProfile: ['medicalHistory', 'medications', 'allergies', 'conditions'],
          KycDocument: ['documentUrl'],
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
          if (['create', 'update', 'createMany', 'updateMany'].includes(params.action) && params.args.data) {
             if (Array.isArray(params.args.data)) params.args.data.forEach(encryptObject);
             else encryptObject(params.args.data);
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
          if (Array.isArray(result)) result.forEach(decryptObject);
          else decryptObject(result);
        }
        return result;
      });

      // 2.I.02 Soft Delete
      client.$use(async (params, next) => {
        const softDeleteModels = ['Tenant', 'User', 'Student', 'StaffProfile', 'Class', 'Section', 'AdmissionSession'];
        if (params.model && softDeleteModels.includes(params.model)) {
          if (params.action === 'delete') {
            params.action = 'update';
            params.args['data'] = { deletedAt: new Date() };
          }
          if (params.action === 'deleteMany') {
            params.action = 'updateMany';
            if (params.args.data) params.args.data['deletedAt'] = new Date();
            else params.args['data'] = { deletedAt: new Date() };
          }
          if (params.action === 'findUnique' || params.action === 'findFirst') {
            params.action = 'findFirst';
            if (!params.args.where) params.args.where = { deletedAt: null };
            else if (params.args.where.deletedAt === undefined) params.args.where['deletedAt'] = null;
          }
          if (['findMany', 'count', 'aggregate', 'groupBy'].includes(params.action)) {
             if (params.args.where) {
               if (params.args.where.deletedAt == undefined) params.args.where['deletedAt'] = null;
             } else {
               params.args['where'] = { deletedAt: null };
             }
          }
        }
        return next(params);
      });
    };

    applyMiddleware(this);
    if (this._readClient !== this) {
       applyMiddleware(this._readClient);
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    if (this._readClient && this._readClient !== this) {
      await this._readClient.$disconnect();
    }
  }
}
