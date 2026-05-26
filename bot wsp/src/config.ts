import dotenv from 'dotenv';
dotenv.config();

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`Missing required env var: ${name}`);
  return val;
}

const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  jwtSecret: requireEnv('JWT_SECRET'),
  superAdminToken: requireEnv('SUPER_ADMIN_TOKEN'),
};

export default config;
