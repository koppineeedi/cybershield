import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Vulnerability scans table
export const vulnerabilityScans = mysqlTable("vulnerability_scans", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  targetIpOrUrl: varchar("targetIpOrUrl", { length: 512 }).notNull(),
  scanType: mysqlEnum("scanType", ["ip", "url"]).notNull(),
  threatLevel: mysqlEnum("threatLevel", ["safe", "warning", "critical"]).notNull(),
  vulnerabilities: text("vulnerabilities"), // JSON string of vulnerabilities
  analysis: text("analysis"), // LLM analysis result
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VulnerabilityScan = typeof vulnerabilityScans.$inferSelect;
export type InsertVulnerabilityScan = typeof vulnerabilityScans.$inferInsert;

// Fake job reports table
export const fakeJobReports = mysqlTable("fake_job_reports", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  jobTitle: varchar("jobTitle", { length: 255 }).notNull(),
  companyName: varchar("companyName", { length: 255 }).notNull(),
  jobDescription: text("jobDescription").notNull(),
  verdict: mysqlEnum("verdict", ["real", "fake", "suspicious"]).notNull(),
  redFlags: text("redFlags"), // JSON string of detected red flags
  analysis: text("analysis"), // LLM analysis result
  reportCount: int("reportCount").default(1).notNull(), // How many users reported this
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type FakeJobReport = typeof fakeJobReports.$inferSelect;
export type InsertFakeJobReport = typeof fakeJobReports.$inferInsert;

// Company profiles table
export const companyProfiles = mysqlTable("company_profiles", {
  id: int("id").autoincrement().primaryKey(),
  companyName: varchar("companyName", { length: 255 }).notNull().unique(),
  website: varchar("website", { length: 512 }),
  isVerified: int("isVerified").default(0).notNull(), // 0 = false, 1 = true
  platformVerdicts: text("platformVerdicts"), // JSON string of platform verification results
  analysis: text("analysis"), // LLM company legitimacy analysis
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CompanyProfile = typeof companyProfiles.$inferSelect;
export type InsertCompanyProfile = typeof companyProfiles.$inferInsert;