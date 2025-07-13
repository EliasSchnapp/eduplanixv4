import { users, grades, homework, events, type User, type InsertUser, type Grade, type InsertGrade, type Homework, type InsertHomework, type Event, type InsertEvent } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  getGradesByUserId(userId: number): Promise<Grade[]>;
  createGrade(grade: InsertGrade & { userId: number }): Promise<Grade>;
  updateGrade(id: number, grade: Partial<InsertGrade>): Promise<Grade | undefined>;
  deleteGrade(id: number): Promise<boolean>;
  getGradeById(id: number): Promise<Grade | undefined>;
  getHomeworkByUserId(userId: number): Promise<Homework[]>;
  createHomework(homework: InsertHomework & { userId: number }): Promise<Homework>;
  updateHomework(id: number, homework: Partial<InsertHomework>): Promise<Homework | undefined>;
  deleteHomework(id: number): Promise<boolean>;
  getHomeworkById(id: number): Promise<Homework | undefined>;
  getEventsByUserId(userId: number): Promise<Event[]>;
  createEvent(event: InsertEvent & { userId: number }): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  getEventById(id: number): Promise<Event | undefined>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getGradesByUserId(userId: number): Promise<Grade[]> {
    const userGrades = await db
      .select()
      .from(grades)
      .where(eq(grades.userId, userId))
      .orderBy(grades.createdAt);
    return userGrades.reverse(); // Most recent first
  }

  async createGrade(gradeData: InsertGrade & { userId: number }): Promise<Grade> {
    const [grade] = await db
      .insert(grades)
      .values(gradeData)
      .returning();
    return grade;
  }

  async updateGrade(id: number, gradeData: Partial<InsertGrade>): Promise<Grade | undefined> {
    const [updatedGrade] = await db
      .update(grades)
      .set(gradeData)
      .where(eq(grades.id, id))
      .returning();
    return updatedGrade || undefined;
  }

  async deleteGrade(id: number): Promise<boolean> {
    const result = await db.delete(grades).where(eq(grades.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getGradeById(id: number): Promise<Grade | undefined> {
    const [grade] = await db.select().from(grades).where(eq(grades.id, id));
    return grade || undefined;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async deleteUser(id: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();
    return updatedUser || undefined;
  }

  async getHomeworkByUserId(userId: number): Promise<Homework[]> {
    const userHomework = await db
      .select()
      .from(homework)
      .where(eq(homework.userId, userId))
      .orderBy(homework.dueDate);
    return userHomework;
  }

  async createHomework(homeworkData: InsertHomework & { userId: number }): Promise<Homework> {
    const [newHomework] = await db
      .insert(homework)
      .values(homeworkData)
      .returning();
    return newHomework;
  }

  async updateHomework(id: number, homeworkData: Partial<InsertHomework>): Promise<Homework | undefined> {
    const [updatedHomework] = await db
      .update(homework)
      .set(homeworkData)
      .where(eq(homework.id, id))
      .returning();
    return updatedHomework || undefined;
  }

  async deleteHomework(id: number): Promise<boolean> {
    const result = await db.delete(homework).where(eq(homework.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getHomeworkById(id: number): Promise<Homework | undefined> {
    const [homeworkItem] = await db.select().from(homework).where(eq(homework.id, id));
    return homeworkItem || undefined;
  }

  async getEventsByUserId(userId: number): Promise<Event[]> {
    const userEvents = await db
      .select()
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(events.startDate);
    return userEvents;
  }

  async createEvent(eventData: InsertEvent & { userId: number }): Promise<Event> {
    const [newEvent] = await db
      .insert(events)
      .values(eventData)
      .returning();
    return newEvent;
  }

  async updateEvent(id: number, eventData: Partial<InsertEvent>): Promise<Event | undefined> {
    const [updatedEvent] = await db
      .update(events)
      .set(eventData)
      .where(eq(events.id, id))
      .returning();
    return updatedEvent || undefined;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async getEventById(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event || undefined;
  }
}

export const storage = new DatabaseStorage();
