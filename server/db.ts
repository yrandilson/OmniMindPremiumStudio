import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, projects, sources, chatMessages, canvasItems, outputs, userPreferences } from "../drizzle/schema";
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

// ============ Projects ============

export async function createProject(userId: number, title: string, description?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(projects).values({
    userId,
    title,
    description,
  });
  
  return result;
}

export async function getUserProjects(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(projects)
    .where(eq(projects.userId, userId))
    .orderBy(desc(projects.createdAt));
}

export async function getProjectById(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

// ============ Sources ============

export async function createSource(projectId: number, type: string, originalName: string, storageKey?: string, url?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(sources).values({
    projectId,
    type: type as any,
    originalName,
    storageKey,
    url,
  });
}

export async function getProjectSources(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(sources)
    .where(eq(sources.projectId, projectId))
    .orderBy(desc(sources.createdAt));
}

export async function updateSourceContent(sourceId: number, extractedText: string, metadata?: Record<string, any>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(sources)
    .set({
      extractedText,
      metadata,
      processedAt: new Date(),
    })
    .where(eq(sources.id, sourceId));
}

// ============ Chat Messages ============

export async function createChatMessage(projectId: number, userId: number, role: "user" | "assistant", content: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(chatMessages).values({
    projectId,
    userId,
    role,
    content,
  });
}

export async function getProjectChatHistory(projectId: number, limit: number = 50, offset: number = 0) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(chatMessages)
    .where(eq(chatMessages.projectId, projectId))
    .orderBy(desc(chatMessages.createdAt))
    .limit(limit)
    .offset(offset);
}

// ============ Canvas Items ============

export async function createCanvasItem(projectId: number, type: string, content: Record<string, any>, title?: string, position?: any) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(canvasItems).values({
    projectId,
    type: type as any,
    content,
    title,
    position,
  });
}

export async function getProjectCanvasItems(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(canvasItems)
    .where(eq(canvasItems.projectId, projectId))
    .orderBy(desc(canvasItems.createdAt));
}

export async function updateCanvasItem(itemId: number, updates: Partial<typeof canvasItems.$inferInsert>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(canvasItems)
    .set(updates)
    .where(eq(canvasItems.id, itemId));
}

// ============ Outputs ============

export async function createOutput(projectId: number, type: string, title: string, content?: Record<string, any>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.insert(outputs).values({
    projectId,
    type: type as any,
    title,
    content,
  });
}

export async function getProjectOutputs(projectId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.select().from(outputs)
    .where(eq(outputs.projectId, projectId))
    .orderBy(desc(outputs.createdAt));
}

export async function updateOutputStatus(outputId: number, status: "generating" | "completed" | "failed", storageKey?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  return db.update(outputs)
    .set({
      status,
      storageKey,
    })
    .where(eq(outputs.id, outputId));
}

// ============ User Preferences ============

export async function getUserPreferences(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.select().from(userPreferences)
    .where(eq(userPreferences.userId, userId))
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}

export async function upsertUserPreferences(userId: number, preferredFormats?: any, stylePreferences?: any, researchPermission?: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getUserPreferences(userId);
  
  const updateData: any = {};
  if (preferredFormats !== undefined) updateData.preferredFormats = preferredFormats;
  if (stylePreferences !== undefined) updateData.stylePreferences = stylePreferences;
  if (researchPermission !== undefined) updateData.researchPermission = researchPermission;
  
  if (existing) {
    return db.update(userPreferences)
      .set(updateData)
      .where(eq(userPreferences.userId, userId));
  } else {
    return db.insert(userPreferences).values({
      userId,
      ...updateData,
    });
  }
}
