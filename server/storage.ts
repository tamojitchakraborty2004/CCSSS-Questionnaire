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

  async getAllAssessments(limit = 20): Promise<any[]> {
    const result = await db
      .select({
        id: assessments.id,
        studentId: assessments.studentId,
        name: assessments.name,
        email: assessments.email,
        age: assessments.age,
        gender: assessments.gender,
        qualification: assessments.qualification,
        semester: assessments.semester,
        scholarType: assessments.scholarType,

        coreResponses: assessments.coreResponses,
        moduleResponses: assessments.moduleResponses,
        moduleScores: assessments.moduleScores,

        coreScore: assessments.coreScore,
        totalScore: assessments.totalScore,
        maxScore: assessments.maxScore,
        percentage: assessments.percentage,
        stressLevel: assessments.stressLevel,
        dominantCategories: assessments.dominantCategories,

        interpretation: assessments.interpretation, 

        createdAt: assessments.createdAt,
      })
      .from(assessments);

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