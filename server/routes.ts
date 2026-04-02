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
        "gender",
        "semester",
        "scholar_type",
        "qualification",
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
          a.gender ?? "",
          a.semester ?? "",
          a.scholarType ?? "",
          (a as any).qualification ?? "",
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


  // ── Gemini LLM Interpretation ─────────────────────────────────────────────
  app.post("/api/interpret", async (req, res) => {
    try {
      const { coreScore, moduleScores, totalScore, maxScore, percentage, stressLevel, dominantCategories, coreResponses, moduleResponses } = req.body;

      const GROQ_API_KEY = process.env.GROQ_API_KEY;
      if (!GROQ_API_KEY) {
        return res.status(500).json({ error: "Groq API key not configured" });
      }

      const responsesSummary = [
        ...coreResponses.map((r: any) => `Q${r.questionId}: ${r.rating}/4`),
        ...moduleResponses.map((r: any) => `Q${r.questionId}: ${r.rating}/4`),
      ].join(', ');

      const moduleSummary = Object.entries(moduleScores as Record<string, number>)
        .map(([name, score]) => `${name}: ${score}/20`)
        .join(', ');

      const prompt = `You are a compassionate student wellness counselor analyzing a stress assessment result. Provide a personalized, empathetic interpretation.

Assessment Data:
- Overall Stress Level: ${stressLevel}
- Total Score: ${totalScore}/${maxScore} (${percentage}%)
- Core Assessment Score: ${coreScore}/40
- Module Scores: ${moduleSummary || 'No additional modules'}
- Dominant Stress Areas: ${dominantCategories.join(', ') || 'None identified'}
- Response Summary: ${responsesSummary}

Write a 3-4 sentence personalized interpretation that:
1. Acknowledges their specific stress level warmly and without judgment
2. Identifies which specific areas are most affecting them based on the scores
3. Gives 2-3 concrete, actionable suggestions tailored to their dominant stress areas
4. Ends with an encouraging, motivating statement

Keep the tone warm, professional, and supportive. Do not use bullet points - write in flowing paragraphs. Do not mention score numbers directly.`;

      const https = await import('https');
      const postData = JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 400,
      });

      const interpretation = await new Promise<string>((resolve, reject) => {
        const options = {
          hostname: 'api.groq.com',
          path: '/openai/v1/chat/completions',
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Length': Buffer.byteLength(postData),
          },
        };

        const req = https.request(options, (res: any) => {
          let body = '';
          res.on('data', (chunk: any) => body += chunk);
          res.on('end', () => {
            try {
              const data = JSON.parse(body);
              const text = data?.choices?.[0]?.message?.content;
              if (text) resolve(text);
              else reject(new Error('No interpretation returned: ' + JSON.stringify(data)));
            } catch (e) {
              reject(e);
            }
          });
        });

        req.on('error', reject);
        req.write(postData);
        req.end();
      });

      res.json({ interpretation });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });


  // ── Save PDF to DB ────────────────────────────────────────────────────────
  app.post("/api/assessments/:id/pdf", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { pdfData, interpretation } = req.body;
      if (!pdfData) return res.status(400).json({ error: "No PDF data provided" });
      await storage.updatePdfData(id, pdfData, interpretation || '');
      res.json({ ok: true });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // ── Admin: download PDF for a specific submission ─────────────────────────
  app.get("/api/admin/pdf/:id", requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const assessment = await storage.getAssessmentById(id);
      if (!assessment) return res.status(404).json({ error: "Assessment not found" });
      if (!assessment.pdfData) return res.status(404).json({ error: "PDF not yet generated for this submission" });

      // Strip the data URI prefix and decode base64 to binary buffer
      const raw = assessment.pdfData as string;
      const base64 = raw.includes(',') ? raw.split(',')[1] : raw;
      const buffer = Buffer.from(base64, 'base64');
      const date = assessment.createdAt ? new Date(assessment.createdAt).toISOString().split('T')[0] : 'report';
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="CCSSS-${assessment.studentId}-${date}.pdf"`);
      res.setHeader('Content-Length', buffer.length);
      res.end(buffer);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}