import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, vulnerabilityScans, fakeJobReports, companyProfiles, 
  twoFactorTokens, userSessions, auditLogs, notifications, activityFeed,
  type VulnerabilityScan, type FakeJobReport, type CompanyProfile, 
  type InsertVulnerabilityScan, type InsertFakeJobReport, type InsertCompanyProfile,
  type TwoFactorToken, type InsertTwoFactorToken, type UserSession, type InsertUserSession,
  type AuditLog, type InsertAuditLog, type Notification, type InsertNotification,
  type ActivityFeed, type InsertActivityFeed, type User
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ User Management ============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId && !user.email) {
    throw new Error("User openId or email is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      email: user.email || "",
    };
    const updateSet: Record<string, unknown> = {};

    if (user.openId) {
      values.openId = user.openId;
    }

    const textFields = ["name", "loginMethod", "passwordHash"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserByEmail(email: string): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number): Promise<User | undefined> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createUser(user: InsertUser): Promise<User> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const result = await db.insert(users).values(user);
  const userId = result[0].insertId;
  const newUser = await getUserById(Number(userId));
  if (!newUser) throw new Error("Failed to create user");
  return newUser;
}

export async function updateUser(id: number, updates: Partial<InsertUser>): Promise<User> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  await db.update(users).set(updates).where(eq(users.id, id));
  const updated = await getUserById(id);
  if (!updated) throw new Error("Failed to update user");
  return updated;
}

// ============ 2FA Tokens ============

export async function createTwoFactorToken(token: InsertTwoFactorToken): Promise<TwoFactorToken> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(twoFactorTokens).values(token);
  const tokenId = result[0].insertId;
  const newToken = await db.select().from(twoFactorTokens).where(eq(twoFactorTokens.id, Number(tokenId))).limit(1);
  if (!newToken || newToken.length === 0) throw new Error("Failed to create token");
  return newToken[0];
}

export async function getTwoFactorToken(token: string): Promise<TwoFactorToken | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(twoFactorTokens).where(eq(twoFactorTokens.token, token)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function markTwoFactorTokenAsUsed(token: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(twoFactorTokens).set({ isUsed: 1 }).where(eq(twoFactorTokens.token, token));
}

// ============ User Sessions ============

export async function createUserSession(session: InsertUserSession): Promise<UserSession> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(userSessions).values(session);
  const sessionId = result[0].insertId;
  const newSession = await db.select().from(userSessions).where(eq(userSessions.id, Number(sessionId))).limit(1);
  if (!newSession || newSession.length === 0) throw new Error("Failed to create session");
  return newSession[0];
}

export async function getUserSession(sessionToken: string): Promise<UserSession | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(userSessions).where(eq(userSessions.sessionToken, sessionToken)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function deleteUserSession(sessionToken: string): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.delete(userSessions).where(eq(userSessions.sessionToken, sessionToken));
}

// ============ Audit Logs ============

export async function createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(auditLogs).values(log);
  const logId = result[0].insertId;
  const newLog = await db.select().from(auditLogs).where(eq(auditLogs.id, Number(logId))).limit(1);
  if (!newLog || newLog.length === 0) throw new Error("Failed to create audit log");
  return newLog[0];
}

// ============ Notifications ============

export async function createNotification(notification: InsertNotification): Promise<Notification> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(notifications).values(notification);
  const notifId = result[0].insertId;
  const newNotif = await db.select().from(notifications).where(eq(notifications.id, Number(notifId))).limit(1);
  if (!newNotif || newNotif.length === 0) throw new Error("Failed to create notification");
  return newNotif[0];
}

export async function getUserNotifications(userId: number): Promise<Notification[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(notifications).where(eq(notifications.userId, userId));
}

export async function markNotificationAsRead(notificationId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.update(notifications).set({ isRead: 1 }).where(eq(notifications.id, notificationId));
}

// ============ Activity Feed ============

export async function createActivityFeedEntry(entry: InsertActivityFeed): Promise<ActivityFeed> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(activityFeed).values(entry);
  const entryId = result[0].insertId;
  const newEntry = await db.select().from(activityFeed).where(eq(activityFeed.id, Number(entryId))).limit(1);
  if (!newEntry || newEntry.length === 0) throw new Error("Failed to create activity entry");
  return newEntry[0];
}

export async function getUserActivityFeed(userId: number, limit: number = 50): Promise<ActivityFeed[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(activityFeed).where(eq(activityFeed.userId, userId)).orderBy(activityFeed.createdAt).limit(limit);
}

// ============ Existing Scanner Functions ============

export async function createVulnerabilityScan(scan: InsertVulnerabilityScan): Promise<VulnerabilityScan> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(vulnerabilityScans).values(scan);
  const scanId = result[0].insertId;
  const newScan = await db.select().from(vulnerabilityScans).where(eq(vulnerabilityScans.id, Number(scanId))).limit(1);
  if (!newScan || newScan.length === 0) throw new Error("Failed to create scan");
  return newScan[0];
}

export async function getUserVulnerabilityScans(userId: number): Promise<VulnerabilityScan[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(vulnerabilityScans).where(eq(vulnerabilityScans.userId, userId));
}

export async function createFakeJobReport(report: InsertFakeJobReport): Promise<FakeJobReport> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(fakeJobReports).values(report);
  const reportId = result[0].insertId;
  const newReport = await db.select().from(fakeJobReports).where(eq(fakeJobReports.id, Number(reportId))).limit(1);
  if (!newReport || newReport.length === 0) throw new Error("Failed to create report");
  return newReport[0];
}

export async function getUserFakeJobReports(userId: number): Promise<FakeJobReport[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(fakeJobReports).where(eq(fakeJobReports.userId, userId));
}

export async function getAllFakeJobReports(): Promise<FakeJobReport[]> {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(fakeJobReports);
}

export async function createCompanyProfile(profile: InsertCompanyProfile): Promise<CompanyProfile> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(companyProfiles).values(profile);
  const profileId = result[0].insertId;
  const newProfile = await db.select().from(companyProfiles).where(eq(companyProfiles.id, Number(profileId))).limit(1);
  if (!newProfile || newProfile.length === 0) throw new Error("Failed to create company profile");
  return newProfile[0];
}

export async function getCompanyProfile(companyName: string): Promise<CompanyProfile | undefined> {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(companyProfiles).where(eq(companyProfiles.companyName, companyName)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}
