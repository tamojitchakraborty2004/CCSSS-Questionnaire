import { assessments, type Assessment, type InsertAssessment } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAllAssessments(): Promise<Assessment[]>;
  findByEmailOrStudentId(email: string, studentId: string): Promise<Assessment | null>;
  updatePdfData(id: number, pdfData: string, interpretation: string): Promise<void>;
  getAssessmentById(id: number): Promise<Assessment | null>;
}

export class DatabaseStorage implements IStorage {
  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const [assessment] = await db
      .insert(assessments)
      .values(insertAssessment)
      .returning();
    return assessment;
  }

  async getAllAssessments(): Promise<Assessment[]> {
    const result = await db.select().from(assessments);
    return result.sort((a, b) => b.id - a.id);
  }

  async findByEmailOrStudentId(email: string, studentId: string): Promise<Assessment | null> {
    const { or, eq } = await import("drizzle-orm");
    const result = await db
      .select()
      .from(assessments)
      .where(or(eq(assessments.email, email), eq(assessments.studentId, studentId)))
      .limit(1);
    return result[0] ?? null;
  }

  async updatePdfData(id: number, pdfData: string, interpretation: string): Promise<void> {
    await db
      .update(assessments)
      .set({ pdfData, interpretation })
      .where(eq(assessments.id, id));
  }

  async getAssessmentById(id: number): Promise<Assessment | null> {
    const result = await db
      .select()
      .from(assessments)
      .where(eq(assessments.id, id))
      .limit(1);
    return result[0] ?? null;
  }
}

export const storage = new DatabaseStorage();