import type { Express } from "express";
import { createServer, type Server } from "http";
import session from "express-session";
import { storage } from "./storage";
import { loginSchema, insertGradeSchema, insertUserSchema, insertHomeworkSchema, updateHomeworkSchema, insertEventSchema } from "@shared/schema";
import { z } from "zod";

declare module "express-session" {
  interface SessionData {
    userId: number;
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Session middleware
  app.use(session({
    secret: process.env.SESSION_SECRET || "grade-management-secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // Set to true in production with HTTPS
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  }));

  // Authentication middleware
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session?.userId) {
      return res.status(401).json({ message: "Authentication required" });
    }
    next();
  };

  // Login endpoint
  app.post("/api/login", async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByUsername(username);
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      req.session.userId = user.id;
      res.json({ user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Logout endpoint
  app.post("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  // Check authentication status
  app.get("/api/me", requireAuth, async (req, res) => {
    try {
      const user = await storage.getUser(req.session.userId!);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all grades for current user
  app.get("/api/grades", requireAuth, async (req, res) => {
    try {
      const grades = await storage.getGradesByUserId(req.session.userId!);
      res.json(grades);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create new grade
  app.post("/api/grades", requireAuth, async (req, res) => {
    try {
      const gradeData = insertGradeSchema.parse(req.body);
      const grade = await storage.createGrade({
        ...gradeData,
        userId: req.session.userId!,
      });
      res.status(201).json(grade);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update grade
  app.put("/api/grades/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const gradeData = insertGradeSchema.partial().parse(req.body);
      
      // Check if grade exists and belongs to user
      const existingGrade = await storage.getGradeById(id);
      if (!existingGrade || existingGrade.userId !== req.session.userId!) {
        return res.status(404).json({ message: "Grade not found" });
      }

      const updatedGrade = await storage.updateGrade(id, gradeData);
      if (!updatedGrade) {
        return res.status(404).json({ message: "Grade not found" });
      }

      res.json(updatedGrade);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete grade
  app.delete("/api/grades/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if grade exists and belongs to user
      const existingGrade = await storage.getGradeById(id);
      if (!existingGrade || existingGrade.userId !== req.session.userId!) {
        return res.status(404).json({ message: "Grade not found" });
      }

      const deleted = await storage.deleteGrade(id);
      if (!deleted) {
        return res.status(404).json({ message: "Grade not found" });
      }

      res.json({ message: "Grade deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all users (admin only)
  app.get("/api/users", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || (currentUser.username !== "EliasSchnapp" && currentUser.role !== "admin")) {
        return res.status(403).json({ message: "Access denied" });
      }

      const users = await storage.getAllUsers();
      const usersWithoutPasswords = users.map(user => ({
        id: user.id,
        username: user.username,
        role: user.role
      }));
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create new user (admin only)
  app.post("/api/users", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || (currentUser.username !== "EliasSchnapp" && currentUser.role !== "admin")) {
        return res.status(403).json({ message: "Access denied" });
      }

      const userData = insertUserSchema.parse(req.body);
      
      // Check if username already exists
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }

      const newUser = await storage.createUser(userData);
      res.status(201).json({ 
        id: newUser.id, 
        username: newUser.username,
        role: newUser.role
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete user (admin only)
  app.delete("/api/users/:id", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || (currentUser.username !== "EliasSchnapp" && currentUser.role !== "admin")) {
        return res.status(403).json({ message: "Access denied" });
      }

      const id = parseInt(req.params.id);
      
      // Only prevent deletion of the main admin EliasSchnapp
      const userToDelete = await storage.getUser(id);
      if (userToDelete && userToDelete.username === "EliasSchnapp") {
        return res.status(400).json({ message: "Cannot delete main admin user EliasSchnapp" });
      }

      const deleted = await storage.deleteUser(id);
      if (!deleted) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "User deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Reset user password (admin only)
  app.patch("/api/users/:id/password", requireAuth, async (req, res) => {
    try {
      const currentUser = await storage.getUser(req.session.userId!);
      if (!currentUser || (currentUser.username !== "EliasSchnapp" && currentUser.role !== "admin")) {
        return res.status(403).json({ message: "Access denied" });
      }

      const id = parseInt(req.params.id);
      const { newPassword } = req.body;

      if (!newPassword || newPassword.length < 3) {
        return res.status(400).json({ message: "Password must be at least 3 characters long" });
      }

      const userToUpdate = await storage.getUser(id);
      if (!userToUpdate) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update password using the updateUser method
      const updatedUser = await storage.updateUser(id, { password: newPassword });
      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update password" });
      }

      res.json({ message: "Password updated successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all homework for current user
  app.get("/api/homework", requireAuth, async (req, res) => {
    try {
      const homework = await storage.getHomeworkByUserId(req.session.userId!);
      res.json(homework);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create new homework
  app.post("/api/homework", requireAuth, async (req, res) => {
    try {
      const homeworkData = insertHomeworkSchema.parse(req.body);
      const homework = await storage.createHomework({
        ...homeworkData,
        userId: req.session.userId!,
      });
      res.status(201).json(homework);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update homework
  app.put("/api/homework/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const homeworkData = insertHomeworkSchema.partial().parse(req.body);
      
      // Check if homework exists and belongs to user
      const existingHomework = await storage.getHomeworkById(id);
      if (!existingHomework || existingHomework.userId !== req.session.userId!) {
        return res.status(404).json({ message: "Homework not found" });
      }

      const updatedHomework = await storage.updateHomework(id, homeworkData);
      if (!updatedHomework) {
        return res.status(404).json({ message: "Homework not found" });
      }

      res.json(updatedHomework);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete homework
  app.delete("/api/homework/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if homework exists and belongs to user
      const existingHomework = await storage.getHomeworkById(id);
      if (!existingHomework || existingHomework.userId !== req.session.userId!) {
        return res.status(404).json({ message: "Homework not found" });
      }

      const deleted = await storage.deleteHomework(id);
      if (!deleted) {
        return res.status(404).json({ message: "Homework not found" });
      }

      res.json({ message: "Homework deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Toggle homework completion
  app.patch("/api/homework/:id/toggle", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if homework exists and belongs to user
      const existingHomework = await storage.getHomeworkById(id);
      if (!existingHomework || existingHomework.userId !== req.session.userId!) {
        return res.status(404).json({ message: "Homework not found" });
      }

      const updatedHomework = await storage.updateHomework(id, { 
        isCompleted: !existingHomework.isCompleted 
      } as any);
      if (!updatedHomework) {
        return res.status(404).json({ message: "Homework not found" });
      }

      res.json(updatedHomework);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Get all events for current user
  app.get("/api/events", requireAuth, async (req, res) => {
    try {
      const events = await storage.getEventsByUserId(req.session.userId!);
      res.json(events);
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create new event
  app.post("/api/events", requireAuth, async (req, res) => {
    try {
      const eventData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent({
        ...eventData,
        userId: req.session.userId!,
      });
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update event
  app.put("/api/events/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const eventData = insertEventSchema.partial().parse(req.body);
      
      // Check if event exists and belongs to user
      const existingEvent = await storage.getEventById(id);
      if (!existingEvent || existingEvent.userId !== req.session.userId!) {
        return res.status(404).json({ message: "Event not found" });
      }

      const updatedEvent = await storage.updateEvent(id, eventData);
      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.json(updatedEvent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid input", errors: error.errors });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Delete event
  app.delete("/api/events/:id", requireAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Check if event exists and belongs to user
      const existingEvent = await storage.getEventById(id);
      if (!existingEvent || existingEvent.userId !== req.session.userId!) {
        return res.status(404).json({ message: "Event not found" });
      }

      const deleted = await storage.deleteEvent(id);
      if (!deleted) {
        return res.status(404).json({ message: "Event not found" });
      }

      res.json({ message: "Event deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
