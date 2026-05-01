import { assessments, type Assessment, type InsertAssessment } from "@shared/schema";
import { db } from "./db";
import { eq, or } from "drizzle-orm";

export interface IStorage {
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
  getAllAssessments(): Promise<any[]>;
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

  async getAllAssessments(): Promise<any[]> {
    const result = await db
      .select({
        id: assessments.id,
        studentId: assessments.studentId,
        name: assessments.name,
        email: assessments.email,
        age: assessments.age,
        gender: assessments.gender,
        qualification: (assessments as any).qualification,
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
        // pdf_data intentionally excluded to save bandwidth
      })
      .from(assessments);

    return result.sort((a, b) => b.id - a.id);
  }

  async findByEmailOrStudentId(email: string, studentId: string): Promise<Assessment | null> {
    const result = await db
      .select()
      .from(assessments)
      .where(or(eq(assessments.email, email), eq(assessments.studentId, studentId)))
      .limit(1);
    return result[0] ?? null;
  }
}

export const storage = new DatabaseStorage();