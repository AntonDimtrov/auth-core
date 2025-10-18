import crypto from "crypto";

const SALT_LENGTH = 16;
const HASH_LENGTH = 64;

export async function hashPassword(password) {
  const salt = crypto.randomBytes(SALT_LENGTH);
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(password, salt, HASH_LENGTH, (err, derivedKey) => {
      if (err) reject(err);
      else resolve(derivedKey);
    });
  });

  return {
    salt: salt.toString("base64"),
    hash: derivedKey.toString("base64"),
  };
}

export async function verifyPassword(password, storedHash, storedSalt) {
  const derivedKey = await new Promise((resolve, reject) => {
    crypto.scrypt(
      password,
      Buffer.from(storedSalt, "base64"),
      HASH_LENGTH,
      (err, dk) => {
        if (err) reject(err);
        else resolve(dk);
      }
    );
  });

  const storedKey = Buffer.from(storedHash, "base64");
  return crypto.timingSafeEqual(derivedKey, storedKey);
}
