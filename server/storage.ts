import { assessments, type Assessment, type InsertAssessment } from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  createAssessment(assessment: InsertAssessment): Promise<Assessment>;
}

export class DatabaseStorage implements IStorage {
  async createAssessment(insertAssessment: InsertAssessment): Promise<Assessment> {
    const [assessment] = await db
      .insert(assessments)
      .values(insertAssessment)
      .returning();
    return assessment;
  }
}

export const storage = new DatabaseStorage();
