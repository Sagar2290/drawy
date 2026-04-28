import bcrypt from "bcrypt";

export async function compareHash(myPlaintextPassword: string, hash: string) {
  return await bcrypt.compare(myPlaintextPassword, hash);
}

export async function createHash(
  myPlaintextPassword: string,
  salt: string | number = 12,
) {
  return bcrypt.hash(myPlaintextPassword, salt);
}
