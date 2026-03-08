import { assessments, type Assessment, type InsertAssessment } from "@shared/schema";
import { db } from "./db";
import { eq, or } from "drizzle-orm";

export interface IStorage {
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAllAssessments(): Promise<Assessment[]>;
  findByEmailOrStudentId(email: string, studentId: string): Promise<Assessment | null>;
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
    const result = await db
      .select()
      .from(assessments)
      .where(
        or(
          eq(assessments.email, email),
          eq(assessments.studentId, studentId)
        )
      )
      .limit(1);
    return result[0] ?? null;
  }
}

export const storage = new DatabaseStorage();