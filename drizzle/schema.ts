import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

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

/**
 * Projects: Espaços de trabalho do usuário
 */
export const projects = mysqlTable("projects", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type InsertProject = typeof projects.$inferInsert;

/**
 * Sources: Arquivos e URLs carregados
 */
export const sources = mysqlTable("sources", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  type: mysqlEnum("type", ["pdf", "doc", "video", "audio", "image", "csv", "json", "url"]).notNull(),
  originalName: varchar("originalName", { length: 255 }).notNull(),
  storageKey: varchar("storageKey", { length: 512 }),
  url: varchar("url", { length: 512 }),
  contentHash: varchar("contentHash", { length: 64 }),
  extractedText: text("extractedText"),
  metadata: json("metadata"),
  processedAt: timestamp("processedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Source = typeof sources.$inferSelect;
export type InsertSource = typeof sources.$inferInsert;

/**
 * Canvas Items: Elementos no canvas infinito (resumos, mapas, tabelas, etc)
 */
export const canvasItems = mysqlTable("canvas_items", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  type: mysqlEnum("type", ["summary", "mindmap", "table", "card", "image", "infographic"]).notNull(),
  title: varchar("title", { length: 255 }),
  content: json("content").notNull(),
  position: json("position"),
  connections: json("connections"),
  generatedBy: varchar("generatedBy", { length: 64 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CanvasItem = typeof canvasItems.$inferSelect;
export type InsertCanvasItem = typeof canvasItems.$inferInsert;

/**
 * Chat Messages: Histórico de conversas
 */
export const chatMessages = mysqlTable("chat_messages", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  userId: int("userId").notNull(),
  role: mysqlEnum("role", ["user", "assistant"]).notNull(),
  content: text("content").notNull(),
  sourceContext: json("sourceContext"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;

/**
 * User Preferences: Preferências de estilo e formato
 */
export const userPreferences = mysqlTable("user_preferences", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  preferredFormats: json("preferredFormats"),
  stylePreferences: json("stylePreferences"),
  researchPermission: boolean("researchPermission").default(false).notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserPreference = typeof userPreferences.$inferSelect;
export type InsertUserPreference = typeof userPreferences.$inferInsert;

/**
 * Canvas Snapshots: Versionamento do canvas
 */
export const canvasSnapshots = mysqlTable("canvas_snapshots", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  version: int("version").notNull(),
  data: json("data").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type CanvasSnapshot = typeof canvasSnapshots.$inferSelect;
export type InsertCanvasSnapshot = typeof canvasSnapshots.$inferInsert;

/**
 * Outputs: Entregáveis gerados (mapas mentais, infográficos, apresentações)
 */
export const outputs = mysqlTable("outputs", {
  id: int("id").autoincrement().primaryKey(),
  projectId: int("projectId").notNull(),
  type: mysqlEnum("type", ["mindmap", "infographic", "report", "presentation", "video"]).notNull(),
  title: varchar("title", { length: 255 }).notNull(),
  content: json("content"),
  storageKey: varchar("storageKey", { length: 512 }),
  status: mysqlEnum("status", ["generating", "completed", "failed"]).default("generating").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Output = typeof outputs.$inferSelect;
export type InsertOutput = typeof outputs.$inferInsert;

/**
 * Relations (Drizzle ORM)
 */
export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  preferences: many(userPreferences),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  sources: many(sources),
  canvasItems: many(canvasItems),
  chatMessages: many(chatMessages),
  outputs: many(outputs),
  snapshots: many(canvasSnapshots),
}));

export const sourcesRelations = relations(sources, ({ one }) => ({
  project: one(projects, { fields: [sources.projectId], references: [projects.id] }),
}));

export const canvasItemsRelations = relations(canvasItems, ({ one }) => ({
  project: one(projects, { fields: [canvasItems.projectId], references: [projects.id] }),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  project: one(projects, { fields: [chatMessages.projectId], references: [projects.id] }),
  user: one(users, { fields: [chatMessages.userId], references: [users.id] }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, { fields: [userPreferences.userId], references: [users.id] }),
}));

export const canvasSnapshotsRelations = relations(canvasSnapshots, ({ one }) => ({
  project: one(projects, { fields: [canvasSnapshots.projectId], references: [projects.id] }),
}));

export const outputsRelations = relations(outputs, ({ one }) => ({
  project: one(projects, { fields: [outputs.projectId], references: [projects.id] }),
}));
