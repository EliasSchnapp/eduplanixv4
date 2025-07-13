import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("user"),
});

export const grades = pgTable("grades", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: text("subject").notNull(),
  description: text("description"),
  grade: real("grade").notNull(),
  weight: real("weight").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const homework = pgTable("homework", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  subject: text("subject").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  dueDate: timestamp("due_date").notNull(),
  isCompleted: boolean("is_completed").notNull().default(false),
  priority: text("priority").notNull().default("medium"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  type: text("type").notNull().default("event"),
  color: text("color").notNull().default("#3b82f6"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  role: true,
}).extend({
  role: z.enum(["admin", "user"]).optional(),
});

export const insertGradeSchema = createInsertSchema(grades).pick({
  subject: true,
  description: true,
  grade: true,
  weight: true,
}).extend({
  grade: z.number().min(1).max(6),
  weight: z.number().min(0.1).max(5),
});

export const insertHomeworkSchema = createInsertSchema(homework).pick({
  subject: true,
  title: true,
  description: true,
  dueDate: true,
  priority: true,
}).extend({
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().transform((val) => new Date(val)),
});

export const updateHomeworkSchema = createInsertSchema(homework).pick({
  subject: true,
  title: true,
  description: true,
  dueDate: true,
  priority: true,
  isCompleted: true,
}).extend({
  priority: z.enum(["low", "medium", "high"]),
});

export const insertEventSchema = z.object({
  title: z.string().min(1, "Titel ist erforderlich"),
  description: z.string().optional(),
  type: z.enum(["event", "appointment", "meeting", "reminder"]),
  color: z.string().default("#67e8f9"),
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
});

export const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertGrade = z.infer<typeof insertGradeSchema>;
export type Grade = typeof grades.$inferSelect;
export type InsertHomework = z.infer<typeof insertHomeworkSchema>;
export type Homework = typeof homework.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;
export type LoginRequest = z.infer<typeof loginSchema>;
