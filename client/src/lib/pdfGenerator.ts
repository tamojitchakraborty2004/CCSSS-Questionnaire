import jsPDF from 'jspdf';
import type { AssessmentResult } from '@shared/schema';

interface UserInfo {
  name: string;
  email: string;
  age: string;
  studentId: string;
  gender: string;
  semester: string;
  scholarType: string;
  qualification: string;
}

type RGB = [number, number, number];

// ── Chart renderers ────────────────────────────────────────────────────────

function renderBarChart(
  categories: { name: string; score: number; max: number; color: string }[]
): string {
  const W = 900;
  const ROW = 64;
  const PAD_X = 16;
  const PAD_Y = 16;
  const H = categories.length * ROW + PAD_Y * 2;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  // Background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  const LABEL_W = 190;
  const SCORE_W = 80;
  const BAR_W = W - LABEL_W - SCORE_W - PAD_X * 2 - 20;

  categories.forEach((cat, i) => {
    const y = PAD_Y + i * ROW;
    const midY = y + ROW / 2;
    const pct = cat.score / cat.max;
    const filled = Math.max(pct * BAR_W, 4);
    const shortName = cat.name
      .replace('& Practical Concerns', '')
      .replace('& Relationships', '')
      .trim();

    // Row bg alternating
    ctx.fillStyle = i % 2 === 0 ? '#fafafa' : '#ffffff';
    ctx.fillRect(0, y, W, ROW);

    // Label
    ctx.fillStyle = '#374151';
    ctx.font = '600 15px Arial';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(shortName, PAD_X, midY);

    // Track
    const barX = PAD_X + LABEL_W;
    const barY = midY - 11;
    const barH = 22;
    ctx.fillStyle = '#e5e7eb';
    ctx.beginPath();
    ctx.roundRect(barX, barY, BAR_W, barH, 6);
    ctx.fill();

    // Fill
    ctx.fillStyle = cat.color;
    ctx.beginPath();
    ctx.roundRect(barX, barY, filled, barH, 6);
    ctx.fill();

    // Pct inside bar
    if (pct > 0.1) {
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 13px Arial';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'left';
      ctx.fillText(`${Math.round(pct * 100)}%`, barX + 10, midY);
    }

    // Score right
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 15px Arial';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${cat.score} / ${cat.max}`, W - PAD_X, midY);

    // Divider
    if (i < categories.length - 1) {
      ctx.strokeStyle = '#f0f0f0';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, y + ROW);
      ctx.lineTo(W, y + ROW);
      ctx.stroke();
    }
  });

  return canvas.toDataURL('image/png');
}

function renderPieChart(
  slices: { name: string; score: number; color: string }[]
): string {
  const W = 900;
  const H = 300;
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  const total = slices.reduce((s, d) => s + d.score, 0) || 1;
  const cx = 150, cy = H / 2, R = 120, HOLE = 58;
  let angle = -Math.PI / 2;

  // Shadow
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.10)';
  ctx.shadowBlur = 12;

  slices.forEach(slice => {
    if (!slice.score) return;
    const sweep = (slice.score / total) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, angle, angle + sweep);
    ctx.closePath();
    ctx.fillStyle = slice.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    angle += sweep;
  });
  ctx.restore();

  // Donut hole
  ctx.beginPath();
  ctx.arc(cx, cy, HOLE, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  // Centre label
  ctx.fillStyle = '#374151';
  ctx.font = 'bold 17px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Stress', cx, cy - 10);
  ctx.fillText('Split', cx, cy + 10);

  // Legend — right side
  const LX = 320;
  const legendH = slices.length * 70;
  const legendStartY = (H - legendH) / 2 + 10;

  slices.forEach((slice, i) => {
    const ly = legendStartY + i * 70;
    const pct = Math.round((slice.score / total) * 100);
    const shortName = slice.name
      .replace('& Practical Concerns', '')
      .replace('& Relationships', '')
      .trim();

    // Colour block
    ctx.fillStyle = slice.color;
    ctx.beginPath();
    ctx.roundRect(LX, ly, 22, 22, 4);
    ctx.fill();

    // Name
    ctx.fillStyle = '#111827';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${shortName}`, LX + 32, ly + 2);

    // Pct + score
    ctx.fillStyle = '#6b7280';
    ctx.font = '13px Arial';
    ctx.fillText(`${pct}%  ·  ${slice.score} / 20`, LX + 32, ly + 22);

    // Bar track
    const BW = 520;
    ctx.fillStyle = '#e5e7eb';
    ctx.beginPath();
    ctx.roundRect(LX + 32, ly + 42, BW, 12, 4);
    ctx.fill();

    // Bar fill
    ctx.fillStyle = slice.color;
    ctx.beginPath();
    ctx.roundRect(LX + 32, ly + 42, Math.max((pct / 100) * BW, 6), 12, 4);
    ctx.fill();
  });

  return canvas.toDataURL('image/png');
}

function renderRadarChart(
  axes: { label: string; value: number; max: number; color: string }[]
): string {
  const SIZE = 700;
  const canvas = document.createElement('canvas');
  canvas.width = SIZE; canvas.height = SIZE;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, SIZE, SIZE);

  const cx = SIZE / 2, cy = SIZE / 2, R = 240;
  const N = axes.length;
  const step = (Math.PI * 2) / N;

  const pt = (i: number, r: number) => ({
    x: cx + r * Math.cos(i * step - Math.PI / 2),
    y: cy + r * Math.sin(i * step - Math.PI / 2),
  });

  // Grid rings
  [0.25, 0.5, 0.75, 1].forEach(ratio => {
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const p = pt(i, R * ratio);
      i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.strokeStyle = ratio === 1 ? '#cbd5e1' : '#e2e8f0';
    ctx.lineWidth = ratio === 1 ? 1.5 : 1;
    ctx.stroke();

    // Ring fill alternating
    if (ratio % 0.5 === 0) {
      ctx.fillStyle = ratio === 0.5 ? 'rgba(238,242,255,0.4)' : 'rgba(224,231,255,0.25)';
      ctx.fill();
    }
  });

  // Spokes
  for (let i = 0; i < N; i++) {
    const p = pt(i, R);
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 1.2;
    ctx.stroke();
  }

  // Data polygon fill
  ctx.beginPath();
  axes.forEach((ax, i) => {
    const r = (ax.value / ax.max) * R;
    const p = pt(i, r);
    i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.fillStyle = 'rgba(99, 102, 241, 0.15)';
  ctx.fill();

  // Data polygon stroke
  ctx.beginPath();
  axes.forEach((ax, i) => {
    const r = (ax.value / ax.max) * R;
    const p = pt(i, r);
    i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y);
  });
  ctx.closePath();
  ctx.strokeStyle = '#6366f1';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Dots
  axes.forEach((ax, i) => {
    const r = (ax.value / ax.max) * R;
    const p = pt(i, r);
    ctx.beginPath();
    ctx.arc(p.x, p.y, 8, 0, Math.PI * 2);
    ctx.fillStyle = ax.color;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  });

  // Axis labels
  axes.forEach((ax, i) => {
    const p = pt(i, R + 38);
    const shortName = ax.label
      .replace('& Practical Concerns', '')
      .replace('& Relationships', '')
      .trim();

    ctx.fillStyle = '#1f2937';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(shortName, p.x, p.y - 8);

    ctx.fillStyle = ax.color;
    ctx.font = 'bold 14px Arial';
    ctx.fillText(`${ax.value} / ${ax.max}`, p.x, p.y + 12);
  });

  // Ring % labels along top spoke
  [0.25, 0.5, 0.75].forEach(ratio => {
    const p = pt(0, R * ratio);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${Math.round(ratio * 100)}%`, p.x + 4, p.y - 4);
  });

  return canvas.toDataURL('image/png');
}

// ── Main PDF ───────────────────────────────────────────────────────────────

export async function generatePDFReport(
  result: AssessmentResult,
  _coreResponses: Array<{ questionId: string; rating: number }>,
  _moduleResponses: Array<{ questionId: string; rating: number }>,
  userInfo: UserInfo,
  interpretation: string
): Promise<string> {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 14;
  const IW = W - M * 2;

  const CLR = {
    indigo:  [79,  70,  229] as RGB,
    purple:  [124, 58,  237] as RGB,
    rose:    [225, 29,  72]  as RGB,
    amber:   [180, 83,  9]   as RGB,
    emerald: [5,   150, 105] as RGB,
    dark:    [17,  24,  39]  as RGB,
    slate:   [51,  65,  85]  as RGB,
    gray:    [107, 114, 128] as RGB,
    silver:  [209, 213, 219] as RGB,
    linen:   [249, 250, 251] as RGB,
    mist:    [238, 242, 255] as RGB,
    white:   [255, 255, 255] as RGB,
  };

  const moduleRgb: Record<string, RGB> = {
    'Academic Pressures':             CLR.purple,
    'Social & Relationships':         CLR.rose,
    'Financial & Practical Concerns': CLR.amber,
    'Health & Lifestyle':             CLR.emerald,
  };
  const moduleHex: Record<string, string> = {
    'Academic Pressures':             '#7c3aed',
    'Social & Relationships':         '#e11d48',
    'Financial & Practical Concerns': '#b45309',
    'Health & Lifestyle':             '#059669',
  };
  const stressRgb: Record<string, RGB> = {
    Low: CLR.emerald, Moderate: CLR.amber, High: CLR.rose,
  };

  const f  = (c: RGB) => doc.setFillColor(c[0], c[1], c[2]);
  const tk = (c: RGB) => doc.setTextColor(c[0], c[1], c[2]);
  const dr = (c: RGB) => doc.setDrawColor(c[0], c[1], c[2]);
  const B  = (s: number) => { doc.setFont('helvetica', 'bold');   doc.setFontSize(s); };
  const N  = (s: number) => { doc.setFont('helvetica', 'normal'); doc.setFontSize(s); };

  let y = 0;
  const chk = (need: number) => { if (y + need > H - 14) { doc.addPage(); y = M; } };
  const gap = (n: number) => { y += n; };

  const secTitle = (label: string) => {
    chk(14); gap(5);
    f(CLR.indigo); doc.rect(M, y - 5, 3, 9, 'F');
    tk(CLR.dark); B(11); doc.text(label, M + 7, y);
    gap(5);
    dr(CLR.silver); doc.setLineWidth(0.25);
    doc.line(M, y, W - M, y);
    gap(5);
  };

  // ── HEADER ────────────────────────────────────────────────────────────────
  f(CLR.dark); doc.rect(0, 0, W, 36, 'F');
  f(CLR.indigo); doc.rect(0, 36, W, 1.8, 'F');
  f(CLR.purple); doc.rect(0, 0, 4, 36, 'F');

  y = 12; tk(CLR.white); B(18);
  doc.text('CCSSS Assessment Report', W / 2, y, { align: 'center' });
  y = 21; tk([185, 185, 225] as RGB); N(9);
  doc.text('Combined College Student Stress Scale', W / 2, y, { align: 'center' });
  y = 29; tk([130, 135, 175] as RGB); N(7.5);
  doc.text('Confidential Research Document  ·  CCSSS Research Project', W / 2, y, { align: 'center' });

  y = 44;

  // ── DEMOGRAPHICS ──────────────────────────────────────────────────────────
  secTitle('Student Information');

  const grid = [
    ['Name',      userInfo.name,        'Roll No.',  userInfo.studentId],
    ['Age',       userInfo.age,         'Gender',    userInfo.gender],
    ['Email',     userInfo.email,       'Semester',  userInfo.semester],
    ['Residence', userInfo.scholarType, 'Date',      new Date(result.completedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })],
  ];

  const c1 = M + 2, c2 = W / 2 + 2, LW = 22;
  grid.forEach(([l1, v1, l2, v2]) => {
    tk(CLR.gray); N(8); doc.text(`${l1}:`, c1, y);
    tk(CLR.dark); B(8); doc.text(v1 || '—', c1 + LW, y);
    tk(CLR.gray); N(8); doc.text(`${l2}:`, c2, y);
    tk(CLR.dark); B(8); doc.text(v2 || '—', c2 + LW, y);
    y += 7;
  });
  gap(4);

  // ── SCORE CARD ────────────────────────────────────────────────────────────
  secTitle('Overall Result');
  const sc = stressRgb[result.stressLevel] || CLR.gray;

  f(CLR.linen); dr(CLR.silver); doc.setLineWidth(0.3);
  doc.roundedRect(M, y, IW, 20, 3, 3, 'FD');
  f(sc); doc.rect(M, y, 4, 20, 'F');

  tk(sc); B(18); doc.text(`${result.percentage}%`, M + 12, y + 13);
  tk(CLR.dark); B(9); doc.text(`${result.totalScore} / ${result.maxScore} points`, M + 38, y + 9);
  tk(CLR.gray); N(8); doc.text(`Stress Classification: ${result.stressLevel}`, M + 38, y + 16);

  f(sc); doc.roundedRect(W - M - 34, y + 5, 32, 10, 3, 3, 'F');
  tk(CLR.white); B(8);
  doc.text(`${result.stressLevel} Stress`, W - M - 18, y + 12, { align: 'center' });

  y += 26;

  // ── BAR CHART ─────────────────────────────────────────────────────────────
  secTitle('Category Score Breakdown');

  const allCats = [
    { name: 'Core Assessment', score: result.coreScore, max: 40, color: '#4f46e5', rgb: CLR.indigo },
    ...Object.entries(result.moduleScores).map(([name, score]) => ({
      name, score, max: 20,
      color: moduleHex[name] || '#6b7280',
      rgb: moduleRgb[name] || CLR.gray,
    })),
  ];

  try {
    const barImg = renderBarChart(allCats.map(c => ({ name: c.name, score: c.score, max: c.max, color: c.color })));
    const barH = allCats.length * 13 + 4;
    chk(barH);
    doc.addImage(barImg, 'PNG', M, y, IW, barH);
    y += barH + 4;
  } catch {
    allCats.forEach(cat => {
      chk(8); tk(CLR.dark); N(9);
      doc.text(`${cat.name}: ${cat.score}/${cat.max}`, M + 4, y); y += 7;
    });
  }

  // ── DONUT CHART ───────────────────────────────────────────────────────────
  if (Object.keys(result.moduleScores).length > 0) {
    secTitle('Stress Distribution by Module');

    const pieSlices = Object.entries(result.moduleScores).map(([name, score]) => ({
      name, score, color: moduleHex[name] || '#6b7280',
    }));

    try {
      const pieImg = renderPieChart(pieSlices);
      const pieH = pieSlices.length * 13 + 10;
      chk(pieH);
      doc.addImage(pieImg, 'PNG', M, y, IW, pieH);
      y += pieH + 4;
    } catch {
      pieSlices.forEach(s => {
        chk(8); tk(CLR.dark); N(9);
        doc.text(`${s.name}: ${s.score}/20`, M + 4, y); y += 7;
      });
    }
  }

  // ── RADAR CHART ───────────────────────────────────────────────────────────
  if (allCats.length >= 3) {
    secTitle('Stress Profile — Radar Chart');

    const radarAxes = allCats.map(c => ({
      label: c.name, value: c.score, max: c.max, color: c.color,
    }));

    try {
      const radarImg = renderRadarChart(radarAxes);
      const radarH = 88;
      chk(radarH);
      doc.addImage(radarImg, 'PNG', M + (IW - radarH) / 2, y, radarH, radarH);
      y += radarH + 4;
    } catch {
      tk(CLR.gray); N(8);
      doc.text('Radar chart unavailable.', M + 4, y); y += 8;
    }
  }

  // ── AI INTERPRETATION ─────────────────────────────────────────────────────
  secTitle('Personalised AI Interpretation');

  const interpStr = interpretation || 'Interpretation not available.';
  const interpLines = doc.splitTextToSize(interpStr, IW - 12);
  const interpH = interpLines.length * 5.2 + 14;
  chk(interpH + 4);

  f(CLR.mist); dr(CLR.indigo); doc.setLineWidth(0.35);
  doc.roundedRect(M, y, IW, interpH, 3, 3, 'FD');
  f(CLR.indigo); doc.rect(M, y, 3, interpH, 'F');

  f(CLR.indigo); doc.roundedRect(W - M - 32, y + 3, 30, 7, 2, 2, 'F');
  tk(CLR.white); B(6.5);
  doc.text('AI-Generated', W - M - 17, y + 7.5, { align: 'center' });

  y += 9;
  tk(CLR.dark); N(8.5);
  interpLines.forEach((line: string) => { chk(6); doc.text(line, M + 6, y); y += 5.2; });
  y += 6;

  // ── PRIMARY STRESS AREAS ──────────────────────────────────────────────────
  if (result.dominantCategories.length > 0) {
    secTitle('Primary Stress Areas');
    result.dominantCategories.forEach(cat => {
      chk(12);
      const rgb = moduleRgb[cat] || CLR.gray;
      f(rgb); doc.roundedRect(M, y, IW, 9, 2, 2, 'F');
      tk(CLR.white); B(8.5); doc.text(cat, M + 6, y + 6);
      const score = result.moduleScores[cat];
      if (score !== undefined) { N(7.5); doc.text(`${score} / 20`, W - M - 4, y + 6, { align: 'right' }); }
      y += 12;
    });
    gap(2);
  }

  // ── FOOTER ────────────────────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    f(CLR.dark); doc.rect(0, H - 11, W, 11, 'F');
    f(CLR.indigo); doc.rect(0, H - 11, W, 1, 'F');
    tk([150, 155, 200] as RGB); N(7);
    doc.text('CCSSS  ·  Confidential  ·  CCSSS Research Project', W / 2, H - 4, { align: 'center' });
    tk([120, 125, 180] as RGB); B(7);
    doc.text(`${i} / ${totalPages}`, W - M, H - 4, { align: 'right' });
  }

  const base64 = doc.output('datauristring');
  const filename = `CCSSS-${userInfo.studentId || 'Report'}-${new Date().toISOString().split('T')[0]}.pdf`;

  // Trigger browser download
  const link = document.createElement('a');
  link.href = base64;
  link.download = filename;
  link.click();

  return base64;
}