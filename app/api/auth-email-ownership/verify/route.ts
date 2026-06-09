import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import prisma from "@/lib/prisma-base";

const OTP_LENGTH = 6;
const MAX_ATTEMPTS = 3;
const OWNERSHIP_TTL_MS = 10 * 60 * 1000;
const OWNERSHIP_OTP_TYPE = "sign-in";

const bodySchema = z.object({
  email: z.string().trim().email(),
  otp: z.string().trim().length(OTP_LENGTH),
});

export async function POST(request: Request) {
  const parsed = bodySchema.safeParse(await request.json().catch(() => null));

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter the 6-digit code sent to your email." },
      { status: 400 }
    );
  }

  const email = parsed.data.email.toLowerCase();
  const otpIdentifier = `${OWNERSHIP_OTP_TYPE}-otp-${email}`;
  const verification = await prisma.verification.findFirst({
    where: { identifier: otpIdentifier },
  });

  if (!verification) {
    return NextResponse.json(
      { error: "The verification code is invalid. Request a new code." },
      { status: 400 }
    );
  }

  if (verification.expiresAt < new Date()) {
    await prisma.verification.deleteMany({ where: { identifier: otpIdentifier } });
    return NextResponse.json(
      { error: "The verification code has expired. Request a new code." },
      { status: 400 }
    );
  }

  const [storedOtp, attemptsValue] = splitAtLastColon(verification.value);
  const attempts = Number.parseInt(attemptsValue || "0", 10);

  if (attempts >= MAX_ATTEMPTS) {
    await prisma.verification.deleteMany({ where: { identifier: otpIdentifier } });
    return NextResponse.json(
      { error: "Too many attempts. Request a new code." },
      { status: 403 }
    );
  }

  if (!safeEqual(hashValue(parsed.data.otp), storedOtp)) {
    await prisma.verification.updateMany({
      where: { identifier: otpIdentifier },
      data: { value: `${storedOtp}:${attempts + 1}` },
    });
    return NextResponse.json(
      { error: "The verification code is invalid. Check it and try again." },
      { status: 400 }
    );
  }

  await prisma.verification.deleteMany({ where: { identifier: otpIdentifier } });

  const [user, ownershipToken] = await Promise.all([
    prisma.user.findUnique({
      where: { email },
      select: { id: true },
    }),
    createOwnershipToken(email),
  ]);

  return NextResponse.json({
    exists: Boolean(user),
    token: ownershipToken,
  });
}

async function createOwnershipToken(email: string) {
  const token = randomBytes(32).toString("base64url");
  const identifier = getOwnershipIdentifier(email);

  await prisma.verification.deleteMany({ where: { identifier } });
  await prisma.verification.create({
    data: {
      identifier,
      value: hashValue(token),
      expiresAt: new Date(Date.now() + OWNERSHIP_TTL_MS),
    },
  });

  return token;
}

function getOwnershipIdentifier(email: string) {
  return `email-ownership-${email}`;
}

function hashValue(value: string) {
  return createHash("sha256").update(value).digest("base64url");
}

function splitAtLastColon(input: string) {
  const index = input.lastIndexOf(":");
  if (index === -1) return [input, ""] as const;
  return [input.slice(0, index), input.slice(index + 1)] as const;
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}
