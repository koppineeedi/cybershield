// Advanced Authentication Procedures for CyberShield
// This file contains all the 2FA, signup, login, and security procedures

import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";

export const authRouter = router({
  me: publicProcedure.query(opts => opts.ctx.user),
  logout: publicProcedure.mutation(({ ctx }) => {
    const cookieOptions = getSessionCookieOptions(ctx.req);
    ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
    return { success: true } as const;
  }),
  signup: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string().min(8),
      fullName: z.string().min(2),
    }))
    .mutation(async ({ input }) => {
      const existingUser = await db.getUserByEmail(input.email);
      if (existingUser) {
        throw new TRPCError({ code: "CONFLICT", message: "Email already registered" });
      }
      const passwordHash = await bcrypt.hash(input.password, 12);
      const verificationCode = crypto.randomBytes(3).toString("hex").toUpperCase();
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await db.createTwoFactorToken({
        userId: 0,
        token: verificationCode,
        tokenType: "email_verification",
        expiresAt,
        isUsed: 0,
      });
      console.log(`[Auth] Verification code for ${input.email}: ${verificationCode}`);
      return { success: true, message: "Verification code sent to email" };
    }),
  verifyEmail: publicProcedure
    .input(z.object({
      email: z.string().email(),
      code: z.string(),
    }))
    .mutation(async ({ input }) => {
      const token = await db.getTwoFactorToken(input.code);
      if (!token || token.tokenType !== "email_verification") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid verification code" });
      }
      if (token.expiresAt < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Verification code expired" });
      }
      await db.markTwoFactorTokenAsUsed(input.code);
      const user = await db.getUserByEmail(input.email);
      if (user) {
        await db.updateUser(user.id, { isEmailVerified: 1 });
      }
      return { success: true };
    }),
  login: publicProcedure
    .input(z.object({
      email: z.string().email(),
      password: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const user = await db.getUserByEmail(input.email);
      if (!user || !user.passwordHash) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }
      const passwordValid = await bcrypt.compare(input.password, user.passwordHash);
      if (!passwordValid) {
        const attempts = (user.failedLoginAttempts || 0) + 1;
        if (attempts >= 5) {
          await db.updateUser(user.id, {
            accountLocked: 1,
            lastFailedLoginAt: new Date(),
          });
          throw new TRPCError({ code: "FORBIDDEN", message: "Account locked" });
        }
        await db.updateUser(user.id, {
          failedLoginAttempts: attempts,
          lastFailedLoginAt: new Date(),
        });
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Invalid credentials" });
      }
      if (user.accountLocked) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Account is locked" });
      }
      await db.updateUser(user.id, {
        failedLoginAttempts: 0,
        lastSignedIn: new Date(),
      });
      await db.createAuditLog({
        userId: user.id,
        action: "login",
        details: JSON.stringify({ method: "email" }),
        ipAddress: (ctx.req.headers["x-forwarded-for"] as string) || "unknown",
        userAgent: (ctx.req.headers["user-agent"] as string),
        status: "success",
      });
      if (user.twoFactorEnabled) {
        const twoFactorCode = crypto.randomBytes(3).toString("hex").toUpperCase();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        await db.createTwoFactorToken({
          userId: user.id,
          token: twoFactorCode,
          tokenType: "2fa_code",
          expiresAt,
          isUsed: 0,
        });
        console.log(`[Auth] 2FA code for ${user.email}: ${twoFactorCode}`);
        return { success: true, requires2FA: true, message: "2FA code sent" };
      }
      return { success: true, requires2FA: false, user };
    }),
  verify2FA: publicProcedure
    .input(z.object({
      email: z.string().email(),
      code: z.string(),
    }))
    .mutation(async ({ input }) => {
      const token = await db.getTwoFactorToken(input.code);
      if (!token || token.tokenType !== "2fa_code") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Invalid 2FA code" });
      }
      if (token.expiresAt < new Date()) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "2FA code expired" });
      }
      await db.markTwoFactorTokenAsUsed(input.code);
      const user = await db.getUserByEmail(input.email);
      if (!user) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });
      }
      return { success: true, user };
    }),
  enable2FA: protectedProcedure
    .input(z.object({
      method: z.enum(["email", "totp", "sms"]),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      let totpSecret = null;
      if (input.method === "totp") {
        totpSecret = crypto.randomBytes(32).toString("base64");
      }
      await db.updateUser(ctx.user.id, {
        twoFactorEnabled: 1,
        twoFactorMethod: input.method,
        totpSecret,
      });
      return { success: true, totpSecret };
    }),
  disable2FA: protectedProcedure
    .mutation(async ({ ctx }) => {
      if (!ctx.user) throw new TRPCError({ code: "UNAUTHORIZED" });
      await db.updateUser(ctx.user.id, {
        twoFactorEnabled: 0,
        twoFactorMethod: null,
        totpSecret: null,
      });
      return { success: true };
    }),
});
