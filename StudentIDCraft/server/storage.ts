import { nanoid } from 'nanoid';
import { 
  type User, type InsertUser, 
  type Student, type InsertStudent,
  type SavedCard, type InsertSavedCard
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Student methods
  getStudentById(id: number): Promise<Student | undefined>;
  getStudentByUniqueId(uniqueId: string): Promise<Student | undefined>;
  getAllStudents(): Promise<Student[]>;
  createStudent(student: InsertStudent): Promise<Student>;
  
  // SavedCard methods
  getSavedCardById(id: number): Promise<SavedCard | undefined>;
  getSavedCardByUniqueId(uniqueId: string): Promise<SavedCard | undefined>;
  getAllSavedCards(): Promise<SavedCard[]>;
  createSavedCard(card: InsertSavedCard): Promise<SavedCard>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: User[] = [];
  private students: Student[] = [];
  private savedCards: SavedCard[] = [];
  private nextIds = { user: 1, student: 1, savedCard: 1 };

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.find(user => user.id === id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return this.users.find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const newUser: User = {
      ...user as any,
      id: this.nextIds.user++,
      createdAt: new Date()
    };
    this.users.push(newUser);
    return newUser;
  }

  // Student methods
  async getStudentById(id: number): Promise<Student | undefined> {
    return this.students.find(student => student.id === id);
  }

  async getStudentByUniqueId(uniqueId: string): Promise<Student | undefined> {
    return this.students.find(student => student.uniqueId === uniqueId);
  }

  async getAllStudents(): Promise<Student[]> {
    return [...this.students].sort((a, b) => {
      if (!a.createdAt || !b.createdAt) return 0;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async createStudent(student: InsertStudent): Promise<Student> {
    const newStudent: Student = {
      ...student as any,
      id: this.nextIds.student++,
      createdAt: new Date(),
      uniqueId: student.uniqueId || nanoid()
    };
    this.students.push(newStudent);
    return newStudent;
  }

  // SavedCard methods
  async getSavedCardById(id: number): Promise<SavedCard | undefined> {
    const card = this.savedCards.find(card => card.id === id);
    if (!card) return undefined;
    
    const processed = { ...card };
    if (processed.studentId) {
      const student = this.students.find(s => s.id === processed.studentId);
      if (student) {
        (processed as any).student = student;
      }
    }
    
    return processed;
  }

  async getSavedCardByUniqueId(uniqueId: string): Promise<SavedCard | undefined> {
    const card = this.savedCards.find(card => card.uniqueId === uniqueId);
    if (!card) return undefined;
    
    const processed = { ...card };
    if (processed.studentId) {
      const student = this.students.find(s => s.id === processed.studentId);
      if (student) {
        (processed as any).student = student;
      }
    }
    
    return processed;
  }

  async getAllSavedCards(): Promise<SavedCard[]> {
    return this.savedCards
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      })
      .map(card => {
        const processed = { ...card };
        if (processed.studentId) {
          const student = this.students.find(s => s.id === processed.studentId);
          if (student) {
            (processed as any).student = student;
          }
        }
        return processed;
      });
  }

  async createSavedCard(card: InsertSavedCard): Promise<SavedCard> {
    // Process the card data
    const processedCard: any = { ...card };
    
    // Handle student reference
    if (processedCard.student && typeof processedCard.student === 'object') {
      const uniqueId = processedCard.student.uniqueId;
      if (uniqueId) {
        const student = await this.getStudentByUniqueId(uniqueId);
        if (student) {
          processedCard.studentId = student.id;
        } else {
          // If student doesn't exist, save it first
          const savedStudent = await this.createStudent(processedCard.student);
          processedCard.studentId = savedStudent.id;
        }
      }
      
      // Remove the full student object as we only need the studentId reference
      delete processedCard.student;
    }
    
    // If we don't have a studentId by now, we can't save the card
    if (!processedCard.studentId) {
      throw new Error("Cannot save card: No valid student reference");
    }
    
    const newCard: SavedCard = {
      ...processedCard,
      id: this.nextIds.savedCard++,
      createdAt: new Date(),
      uniqueId: processedCard.uniqueId || nanoid()
    };
    this.savedCards.push(newCard);
    
    // Return the saved card with the student info populated
    const returnedCard = { ...newCard };
    const student = this.students.find(s => s.id === newCard.studentId);
    if (student) {
      (returnedCard as any).student = student;
    }
    
    return returnedCard;
  }
}

// Use MemStorage instead of DatabaseStorage
export const storage = new MemStorage();
