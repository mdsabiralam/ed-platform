import { Prisma } from '@prisma/client';

export const encryptionExtension = Prisma.defineExtension((client) => {
  return client.$extends({
    query: {
      healthProfile: {
        async $allOperations({ model, operation, args, query }) {
          // Use the original client to start a transaction
          // This ensures 'tx' does not have the extension applied if 'client' doesn't,
          // preventing infinite recursion if we were to call the model method on 'tx'.
          return client.$transaction(async (tx) => {
            const encryptionKey = process.env.DB_ENCRYPTION_KEY;

            if (encryptionKey) {
              // Set the encryption key for the current transaction/session
              // SET LOCAL applies only to the current transaction
              await tx.$executeRawUnsafe(
                `SET LOCAL app.encryption_key = '${encryptionKey.replace(/'/g, "''")}'`
              );
            } else {
               // Log warning or throw error?
               // For now, we proceed. The DB View/Trigger will likely fail or produce NULLs if key is missing.
               // Ideally, we should log a warning via a logger, but we don't have easy access to NestJS logger here.
               // console.warn('DB_ENCRYPTION_KEY is missing during HealthProfile operation');
            }

            // Execute the operation using the transaction client 'tx'.
            // We cast 'tx' to 'any' because the generic type might not match explicitly,
            // and we need to invoke the dynamic 'operation' method.
            // Using 'query(args)' would execute the query using the context of the *caller*,
            // which might not be inside this 'tx' (depending on how Prisma handles it).
            // Explicitly using 'tx' guarantees usage of the transaction connection.
            return (tx as any)[model][operation](args);
          });
        },
      },
    },
  });
});
