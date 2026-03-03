import { SignJWT, jwtVerify } from "jose";

const secret = process.env.JWT_SECRET;
if (!secret) throw new Error("JWT_SECRET must be set");
const SECRET = new TextEncoder().encode(secret);

export async function createToken(payload: { phone: string; userId: string }) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("45d")
    .sign(SECRET);
}

export async function verifyToken(token: string): Promise<{ phone: string; userId: string }> {
  const { payload } = await jwtVerify(token, SECRET);
  if (
    !payload ||
    typeof payload.phone !== "string" ||
    typeof payload.userId !== "string" ||
    !payload.phone.trim() ||
    !payload.userId.trim()
  ) {
    throw new Error("Invalid token payload");
  }
  return { phone: payload.phone, userId: payload.userId };
}
