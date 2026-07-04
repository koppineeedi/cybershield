import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with custom signup/login, 2FA, and security features.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Optional for custom auth. */
  openId: varchar("openId", { length: 64 }).unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: varchar("passwordHash", { length: 255 }), // For custom signup/login
  loginMethod: varchar("loginMethod", { length: 64 }), // 'oauth', 'email', 'phone'
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  twoFactorEnabled: int("twoFactorEnabled").default(0).notNull(), // 0 = false, 1 = true
  twoFactorMethod: mysqlEnum("twoFactorMethod", ["email", "totp", "sms"]), // 2FA method
  totpSecret: varchar("totpSecret", { length: 255 }), // TOTP secret for authenticator apps
  phoneNumber: varchar("phoneNumber", { length: 20 }), // For SMS 2FA
  isEmailVerified: int("isEmailVerified").default(0).notNull(), // 0 = false, 1 = true
  accountLocked: int("accountLocked").default(0).notNull(), // 0 = false, 1 = true
  failedLoginAttempts: int("failedLoginAttempts").default(0).notNull(),
  lastFailedLoginAt: timestamp("lastFailedLoginAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// 2FA tokens table
export const twoFactorTokens = mysqlTable("two_factor_tokens", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  token: varchar("token", { length: 255 }).notNull().unique(),
  tokenType: mysqlEnum("tokenType", ["email_verification", "2fa_code", "password_reset"]).notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  isUsed: int("isUsed").default(0).notNull(), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TwoFactorToken = typeof twoFactorTokens.$inferSelect;
export type InsertTwoFactorToken = typeof twoFactorTokens.$inferInsert;

// User sessions table
export const userSessions = mysqlTable("user_sessions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  sessionToken: varchar("sessionToken", { length: 255 }).notNull().unique(),
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = typeof userSessions.$inferInsert;

// Audit logs table
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId"),
  action: varchar("action", { length: 255 }).notNull(), // 'login', 'logout', 'scan', 'report', etc.
  details: text("details"), // JSON string with additional details
  ipAddress: varchar("ipAddress", { length: 45 }),
  userAgent: text("userAgent"),
  status: mysqlEnum("status", ["success", "failure"]).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

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

// Real-time notifications table
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  type: mysqlEnum("type", ["scan_complete", "threat_detected", "job_flagged", "security_alert", "system"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  message: text("message"),
  relatedScanId: int("relatedScanId"), // Link to vulnerability scan if applicable
  relatedReportId: int("relatedReportId"), // Link to job report if applicable
  isRead: int("isRead").default(0).notNull(), // 0 = false, 1 = true
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;

// User activity feed table
export const activityFeed = mysqlTable("activity_feed", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  activityType: varchar("activityType", { length: 255 }).notNull(), // 'scan', 'report', 'verification', etc.
  description: text("description"),
  metadata: text("metadata"), // JSON string with additional data
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ActivityFeed = typeof activityFeed.$inferSelect;
export type InsertActivityFeed = typeof activityFeed.$inferInsert;
