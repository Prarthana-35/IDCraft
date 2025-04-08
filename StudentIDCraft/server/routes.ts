import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertStudentSchema, insertSavedCardSchema } from "@shared/schema";
import { nanoid } from "nanoid";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Student routes
  app.get("/api/students", async (req: Request, res: Response) => {
    try {
      const students = await storage.getAllStudents();
      res.json(students);
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({ error: "Failed to fetch students" });
    }
  });

  app.post("/api/students", async (req: Request, res: Response) => {
    try {
      const validatedData = insertStudentSchema.parse({
        ...req.body,
        uniqueId: nanoid(),
      });
      
      const student = await storage.createStudent(validatedData);
      res.status(201).json(student);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Error creating student:", error);
        res.status(500).json({ error: "Failed to create student" });
      }
    }
  });

  app.get("/api/students/:uniqueId", async (req: Request, res: Response) => {
    try {
      const { uniqueId } = req.params;
      const student = await storage.getStudentByUniqueId(uniqueId);
      
      if (!student) {
        return res.status(404).json({ error: "Student not found" });
      }
      
      res.json(student);
    } catch (error) {
      console.error("Error fetching student:", error);
      res.status(500).json({ error: "Failed to fetch student" });
    }
  });

  // Saved Cards routes
  app.get("/api/saved-cards", async (req: Request, res: Response) => {
    try {
      const cards = await storage.getAllSavedCards();
      
      // Get complete student data for each card
      const populatedCards = await Promise.all(
        cards.map(async (card) => {
          const student = await storage.getStudentById(card.studentId);
          return {
            ...card,
            student
          };
        })
      );
      
      res.json(populatedCards);
    } catch (error) {
      console.error("Error fetching saved cards:", error);
      res.status(500).json({ error: "Failed to fetch saved cards" });
    }
  });

  app.post("/api/saved-cards", async (req: Request, res: Response) => {
    try {
      // First, make sure the student exists or create a new one
      let studentId = req.body.studentId;
      
      if (!studentId && req.body.student) {
        // Create a new student if not exists
        const studentData = {
          ...req.body.student,
          uniqueId: nanoid()
        };
        
        const validatedStudentData = insertStudentSchema.parse(studentData);
        const newStudent = await storage.createStudent(validatedStudentData);
        studentId = newStudent.id;
      }
      
      // Then create the saved card
      const cardData = {
        studentId,
        template: req.body.template,
        uniqueId: nanoid()
      };
      
      const validatedCardData = insertSavedCardSchema.parse(cardData);
      const card = await storage.createSavedCard(validatedCardData);
      
      // Return the card with the student data
      const student = await storage.getStudentById(card.studentId);
      
      res.status(201).json({
        ...card,
        student
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
      } else {
        console.error("Error creating saved card:", error);
        res.status(500).json({ error: "Failed to create saved card" });
      }
    }
  });

  app.get("/api/saved-cards/:uniqueId", async (req: Request, res: Response) => {
    try {
      const { uniqueId } = req.params;
      const card = await storage.getSavedCardByUniqueId(uniqueId);
      
      if (!card) {
        return res.status(404).json({ error: "Saved card not found" });
      }
      
      // Get the student data
      const student = await storage.getStudentById(card.studentId);
      
      res.json({
        ...card,
        student
      });
    } catch (error) {
      console.error("Error fetching saved card:", error);
      res.status(500).json({ error: "Failed to fetch saved card" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
