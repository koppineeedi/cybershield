import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Vulnerability Scanner
  scanner: router({
    scan: protectedProcedure
      .input(z.object({
        target: z.string().min(1),
        scanType: z.enum(["ip", "url"]),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const scan = await db.createVulnerabilityScan({
            userId: ctx.user.id,
            targetIpOrUrl: input.target,
            scanType: input.scanType,
            threatLevel: "safe",
            vulnerabilities: JSON.stringify([]),
            analysis: "",
          });
          return scan;
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),
    getUserScans: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          return await db.getUserVulnerabilityScans(ctx.user.id);
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),
  }),

  // Job Fraud Detector
  jobDetector: router({
    analyze: protectedProcedure
      .input(z.object({
        jobTitle: z.string().min(1),
        companyName: z.string().min(1),
        jobDescription: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const report = await db.createFakeJobReport({
            userId: ctx.user.id,
            jobTitle: input.jobTitle,
            companyName: input.companyName,
            jobDescription: input.jobDescription,
            verdict: "real",
            redFlags: JSON.stringify([]),
            analysis: "",
          });
          return report;
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),
    getUserReports: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          return await db.getUserFakeJobReports(ctx.user.id);
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),
    getAllReports: publicProcedure
      .query(async () => {
        try {
          return await db.getAllFakeJobReports();
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),
  }),

  // Company Verifier
  companyVerifier: router({
    verify: protectedProcedure
      .input(z.object({
        companyName: z.string().min(1),
        website: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          const profile = await db.getOrCreateCompanyProfile(input.companyName, input.website);
          return profile;
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),
    getProfile: publicProcedure
      .input(z.object({
        companyName: z.string().min(1),
      }))
      .query(async ({ input }) => {
        try {
          return await db.getCompanyProfile(input.companyName);
        } catch (error) {
          throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
        }
      }),
  }),
});

export type AppRouter = typeof appRouter;
