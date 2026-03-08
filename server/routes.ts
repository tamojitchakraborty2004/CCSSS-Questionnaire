import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertAssessmentSchema, CORE_QUESTIONS, MODULES } from "@shared/schema";

// ── Admin password ─────────────────────────────────────────────────────────
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const auth = req.headers["x-admin-password"];
  if (auth !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

export async function registerRoutes(app: Express): Promise<Server> {

  // ── Pre-check duplicate (called from onboarding form) ───────────────────────
  app.post("/api/check-duplicate", async (req, res) => {
    try {
      const { email, studentId } = req.body;
      if (!email || !studentId) return res.status(400).json({ error: "Missing fields" });

      const existing = await storage.findByEmailOrStudentId(email, studentId);
      if (existing) {
        const reason = existing.email === email ? "email address" : "student ID";
        return res.status(409).json({ error: "duplicate", reason });
      }
      res.json({ ok: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Submit assessment ─────────────────────────────────────────────────────
  app.post("/api/assessments", async (req, res) => {
    try {
      const data = insertAssessmentSchema.parse(req.body);

      // Duplicate check — one submission per email and per student ID
      const existing = await storage.findByEmailOrStudentId(data.email, data.studentId);
      if (existing) {
        const reason = existing.email === data.email ? "email address" : "student ID";
        return res.status(409).json({
          error: "duplicate",
          reason,
          message: `An assessment has already been submitted with this ${reason}.`,
        });
      }

      const assessment = await storage.createAssessment(data);
      res.json(assessment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // ── Admin: get all submissions as JSON ────────────────────────────────────
  app.get("/api/admin/submissions", requireAdmin, async (req, res) => {
    try {
      const all = await storage.getAllAssessments();
      res.json({ count: all.length, submissions: all });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Admin: export all submissions as CSV ──────────────────────────────────
  app.get("/api/admin/export.csv", requireAdmin, async (req, res) => {
    try {
      const all = await storage.getAllAssessments();

      const allModuleQuestions = MODULES.flatMap(m => m.questions);

      const headers = [
        "id",
        "student_id",
        "name",
        "email",
        "age",
        ...CORE_QUESTIONS.map(q => q.id),
        ...allModuleQuestions.map(q => q.id),
        "core_score",
        "academic_score",
        "health_score",
        "financial_score",
        "social_score",
        "total_score",
        "max_score",
        "percentage",
        "stress_level",
        "dominant_categories",
        "submitted_at",
      ];

      const rows = all.map(a => {
        const coreResp = (a.coreResponses as Array<{ questionId: string; rating: number }>) || [];
        const moduleResp = (a.moduleResponses as Array<{ questionId: string; rating: number }>) || [];
        const moduleScores = (a.moduleScores as Record<string, number>) || {};

        const getCoreRating = (id: string) => {
          const r = coreResp.find(r => r.questionId === id);
          return r !== undefined ? r.rating : "";
        };

        const getModuleRating = (id: string) => {
          const r = moduleResp.find(r => r.questionId === id);
          return r !== undefined ? r.rating : "";
        };

        return [
          a.id,
          a.studentId,
          `"${a.name}"`,
          a.email,
          a.age,
          ...CORE_QUESTIONS.map(q => getCoreRating(q.id)),
          ...allModuleQuestions.map(q => getModuleRating(q.id)),
          a.coreScore,
          moduleScores["Academic Pressures"] ?? "",
          moduleScores["Health & Lifestyle"] ?? "",
          moduleScores["Financial & Practical Concerns"] ?? "",
          moduleScores["Social & Relationships"] ?? "",
          a.totalScore,
          a.maxScore,
          a.percentage,
          a.stressLevel,
          `"${(a.dominantCategories as string[]).join(", ")}"`,
          a.createdAt ? new Date(a.createdAt).toISOString() : "",
        ].join(",");
      });

      const csv = [headers.join(","), ...rows].join("\n");

      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename="ccsss-submissions-${new Date().toISOString().split("T")[0]}.csv"`);
      res.send(csv);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}