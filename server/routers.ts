import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { TRPCError } from "@trpc/server";
import { invokeLLM } from "./_core/llm";

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
          // Use LLM to analyze the target for vulnerabilities
          const analysisPrompt = `You are a cybersecurity expert. Analyze the following ${input.scanType === "ip" ? "IP address" : "URL"} for potential security vulnerabilities and threats: ${input.target}

Provide a JSON response with:
- threatLevel: "safe" | "warning" | "critical"
- vulnerabilities: array of detected issues
- analysis: brief explanation of findings

Be realistic but cautious in your assessment. Consider common security issues like outdated SSL, open ports, DNS issues, malware indicators, etc.`;

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are a cybersecurity threat analysis system. Respond only with valid JSON.",
              },
              {
                role: "user",
                content: analysisPrompt,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "vulnerability_analysis",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    threatLevel: {
                      type: "string",
                      enum: ["safe", "warning", "critical"],
                      description: "Threat level assessment",
                    },
                    vulnerabilities: {
                      type: "array",
                      items: { type: "string" },
                      description: "List of detected vulnerabilities",
                    },
                    analysis: {
                      type: "string",
                      description: "Detailed analysis of findings",
                    },
                  },
                  required: ["threatLevel", "vulnerabilities", "analysis"],
                  additionalProperties: false,
                },
              },
            },
          });

          const messageContent = response.choices[0].message.content;
          const contentStr = typeof messageContent === 'string' ? messageContent : '';
          const analysisData = JSON.parse(contentStr || "{}");

          const scan = await db.createVulnerabilityScan({
            userId: ctx.user.id,
            targetIpOrUrl: input.target,
            scanType: input.scanType,
            threatLevel: analysisData.threatLevel || "safe",
            vulnerabilities: JSON.stringify(analysisData.vulnerabilities || []),
            analysis: analysisData.analysis || "",
          });
          return scan;
        } catch (error) {
          console.error("Error in vulnerability scan:", error);
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
          // Use LLM to analyze the job posting for fraud indicators
          const analysisPrompt = `You are a job fraud detection expert. Analyze this job posting for red flags and fraud indicators:

Job Title: ${input.jobTitle}
Company: ${input.companyName}
Description: ${input.jobDescription}

Provide a JSON response with:
- verdict: "real" | "suspicious" | "fake"
- redFlags: array of detected red flags
- analysis: explanation of your assessment

Consider common job scam indicators: unusually high salary, vague responsibilities, requests for upfront payment, poor grammar, unrealistic benefits, work-from-home guarantees, etc.`;

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are a job fraud detection system. Respond only with valid JSON.",
              },
              {
                role: "user",
                content: analysisPrompt,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "job_fraud_analysis",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    verdict: {
                      type: "string",
                      enum: ["real", "suspicious", "fake"],
                      description: "Job posting verdict",
                    },
                    redFlags: {
                      type: "array",
                      items: { type: "string" },
                      description: "List of detected red flags",
                    },
                    analysis: {
                      type: "string",
                      description: "Detailed analysis of findings",
                    },
                  },
                  required: ["verdict", "redFlags", "analysis"],
                  additionalProperties: false,
                },
              },
            },
          });

          const messageContent = response.choices[0].message.content;
          const contentStr = typeof messageContent === 'string' ? messageContent : '';
          const analysisData = JSON.parse(contentStr || "{}");

          const report = await db.createFakeJobReport({
            userId: ctx.user.id,
            jobTitle: input.jobTitle,
            companyName: input.companyName,
            jobDescription: input.jobDescription,
            verdict: analysisData.verdict || "real",
            redFlags: JSON.stringify(analysisData.redFlags || []),
            analysis: analysisData.analysis || "",
          });
          return report;
        } catch (error) {
          console.error("Error in job fraud analysis:", error);
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
          // Use LLM to verify company legitimacy across platforms
          const verificationPrompt = `You are a company verification expert. Verify the legitimacy of this company:

Company Name: ${input.companyName}
Website: ${input.website || "Not provided"}

Provide a JSON response with:
- isVerified: boolean
- platformVerdicts: array of platform verification results
- analysis: explanation of verification findings

Check against known platforms: LinkedIn, Crunchbase, BBB, SEC Filings, official website, etc.`;

          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content: "You are a company verification system. Respond only with valid JSON.",
              },
              {
                role: "user",
                content: verificationPrompt,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "company_verification",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    isVerified: {
                      type: "boolean",
                      description: "Overall verification status",
                    },
                    platformVerdicts: {
                      type: "array",
                      items: {
                        type: "object",
                        properties: {
                          platform: { type: "string" },
                          verified: { type: "boolean" },
                          status: { type: "string" },
                        },
                        required: ["platform", "verified", "status"],
                      },
                      description: "Verification results per platform",
                    },
                    analysis: {
                      type: "string",
                      description: "Detailed verification analysis",
                    },
                  },
                  required: ["isVerified", "platformVerdicts", "analysis"],
                  additionalProperties: false,
                },
              },
            },
          });

          const messageContent = response.choices[0].message.content;
          const contentStr = typeof messageContent === 'string' ? messageContent : '';
          const analysisData = JSON.parse(contentStr || "{}");

          const profile = await db.getOrCreateCompanyProfile(
            input.companyName,
            input.website
          );

          if (profile) {
            // Update profile with verification data
            return {
              ...profile,
              isVerified: analysisData.isVerified,
              platformVerdicts: analysisData.platformVerdicts,
              analysis: analysisData.analysis,
            };
          }

          return null;
        } catch (error) {
          console.error("Error in company verification:", error);
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
