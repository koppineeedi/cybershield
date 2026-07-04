import { eq, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, vulnerabilityScans, fakeJobReports, companyProfiles, type VulnerabilityScan, type FakeJobReport, type CompanyProfile, type InsertVulnerabilityScan, type InsertFakeJobReport, type InsertCompanyProfile } from "../drizzle/schema";
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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
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

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Vulnerability Scan queries
export async function createVulnerabilityScan(scan: InsertVulnerabilityScan): Promise<VulnerabilityScan | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.insert(vulnerabilityScans).values(scan);
    const id = (result as any).insertId;
    if (!id) return null;
    const rows = await db.select().from(vulnerabilityScans).where(eq(vulnerabilityScans.id, id)).limit(1);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error creating vulnerability scan:", error);
    return null;
  }
}

export async function getUserVulnerabilityScans(userId: number): Promise<VulnerabilityScan[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(vulnerabilityScans).where(eq(vulnerabilityScans.userId, userId)).orderBy(desc(vulnerabilityScans.createdAt));
}

// Fake Job Report queries
export async function createFakeJobReport(report: InsertFakeJobReport): Promise<FakeJobReport | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const result = await db.insert(fakeJobReports).values(report);
    const id = (result as any).insertId;
    if (!id) return null;
    const rows = await db.select().from(fakeJobReports).where(eq(fakeJobReports.id, id)).limit(1);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error creating fake job report:", error);
    return null;
  }
}

export async function getUserFakeJobReports(userId: number): Promise<FakeJobReport[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(fakeJobReports).where(eq(fakeJobReports.userId, userId)).orderBy(desc(fakeJobReports.createdAt));
}

export async function getAllFakeJobReports(): Promise<FakeJobReport[]> {
  const db = await getDb();
  if (!db) return [];
  
  return db.select().from(fakeJobReports).orderBy(desc(fakeJobReports.createdAt));
}

// Company Profile queries
export async function getOrCreateCompanyProfile(companyName: string, website?: string): Promise<CompanyProfile | null> {
  const db = await getDb();
  if (!db) return null;
  
  try {
    const existing = await db.select().from(companyProfiles).where(eq(companyProfiles.companyName, companyName)).limit(1);
    if (existing.length > 0) return existing[0];
    
    const newProfile: InsertCompanyProfile = { companyName, website };
    const result = await db.insert(companyProfiles).values(newProfile);
    const id = (result as any).insertId;
    if (!id) return null;
    const rows = await db.select().from(companyProfiles).where(eq(companyProfiles.id, id)).limit(1);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    console.error("Error getting or creating company profile:", error);
    return null;
  }
}

export async function getCompanyProfile(companyName: string): Promise<CompanyProfile | null> {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.select().from(companyProfiles).where(eq(companyProfiles.companyName, companyName)).limit(1);
  return result.length > 0 ? result[0] : null;
}

export async function updateCompanyProfile(companyName: string, updates: Partial<Omit<CompanyProfile, 'id' | 'companyName' | 'createdAt'>>): Promise<CompanyProfile | null> {
  const db = await getDb();
  if (!db) return null;
  
  await db.update(companyProfiles).set(updates).where(eq(companyProfiles.companyName, companyName));
  return getCompanyProfile(companyName);
}
