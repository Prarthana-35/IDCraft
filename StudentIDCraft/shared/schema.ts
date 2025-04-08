import { pgTable, text, serial, integer, boolean, varchar, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Student schema
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  rollNumber: varchar("roll_number", { length: 50 }).notNull(),
  classDivision: varchar("class_division", { length: 50 }).notNull(),
  rackNumber: varchar("rack_number", { length: 50 }).notNull(),
  busRoute: varchar("bus_route", { length: 100 }).notNull(),
  allergies: text("allergies").notNull(), // Storing as JSON string and parsing client-side
  photo: text("photo").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  uniqueId: varchar("unique_id", { length: 100 }).notNull(),
  // Additional fields
  emergencyContact: varchar("emergency_contact", { length: 100 }),
  bloodGroup: varchar("blood_group", { length: 20 }),
  dateOfBirth: varchar("date_of_birth", { length: 50 }),
  address: text("address"),
  parentName: varchar("parent_name", { length: 100 }),
  parentPhone: varchar("parent_phone", { length: 50 }),
  customFields: text("custom_fields"), // Storing as JSON string
});

export const insertStudentSchema = createInsertSchema(students).omit({
  id: true,
  createdAt: true
});

// Saved Cards schema
export const savedCards = pgTable("saved_cards", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id).notNull(),
  template: integer("template").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  uniqueId: varchar("unique_id", { length: 100 }).notNull(),
  customLayout: text("custom_layout"), // Storing as JSON string
});

export const insertSavedCardSchema = createInsertSchema(savedCards).omit({
  id: true, 
  createdAt: true
});

export type InsertStudent = z.infer<typeof insertStudentSchema>;
export type Student = typeof students.$inferSelect;
export type InsertSavedCard = z.infer<typeof insertSavedCardSchema>;
export type SavedCard = typeof savedCards.$inferSelect;
