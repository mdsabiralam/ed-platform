// TODO: Use ConfigService in production
export const jwtConstants = {
  secret: process.env.JWT_SECRET || 'secretKey',
};
