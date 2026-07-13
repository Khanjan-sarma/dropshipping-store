/**
 * Generate a bcrypt hash for the admin password.
 * Usage:  npx tsx scripts/hash-password.ts "your-strong-password"
 * Copy the printed hash into ADMIN_PASSWORD_HASH in your .env.
 */
import bcrypt from "bcryptjs";

async function main() {
  const password = process.argv[2];
  if (!password) {
    console.error('Usage: npx tsx scripts/hash-password.ts "your-password"');
    process.exit(1);
  }
  const hash = await bcrypt.hash(password, 10);
  console.log(hash);
}

main();
