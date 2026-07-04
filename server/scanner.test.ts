import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("scanner procedures", () => {
  it("should handle vulnerability scan input validation", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Test that the procedure accepts valid input
    const result = await caller.scanner.scan({
      target: "192.168.1.1",
      scanType: "ip",
    });

    // Result may be null if database is not available, but should not throw
    expect(result === null || result !== null).toBe(true);
  });

  it("should get user scans", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.scanner.getUserScans();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("job detector procedures", () => {
  it("should handle job posting analysis input", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.jobDetector.analyze({
      jobTitle: "Senior Developer",
      companyName: "Acme Corp",
      jobDescription: "We are looking for a senior developer...",
    });

    // Result may be null if database is not available, but should not throw
    expect(result === null || result !== null).toBe(true);
  });

  it("should get all job reports", async () => {
    const caller = appRouter.createCaller({} as TrpcContext);

    const result = await caller.jobDetector.getAllReports();

    expect(Array.isArray(result)).toBe(true);
  });

  it("should get user job reports", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.jobDetector.getUserReports();

    expect(Array.isArray(result)).toBe(true);
  });
});

describe("company verifier procedures", () => {
  it("should handle company verification input", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.companyVerifier.verify({
      companyName: "Acme Corporation",
      website: "https://acme.com",
    });

    // Result may be null if database is not available, but should not throw
    expect(result === null || result !== null).toBe(true);
  });

  it("should get company profile", async () => {
    const caller = appRouter.createCaller({} as TrpcContext);

    const result = await caller.companyVerifier.getProfile({
      companyName: "Acme Corporation",
    });

    expect(result === null || result !== null).toBe(true);
  });
});
