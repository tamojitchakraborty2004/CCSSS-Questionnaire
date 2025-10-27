import jsPDF from 'jspdf';
import type { AssessmentResult } from '@shared/schema';
import { CORE_QUESTIONS, MODULES } from '@shared/schema';

export function generatePDFReport(
  result: AssessmentResult,
  coreResponses: Array<{ questionId: string; rating: number }>,
  moduleResponses: Array<{ questionId: string; rating: number }>
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  let yPosition = 20;

  // Helper function to add text with word wrap
  const addText = (text: string, fontSize: number, isBold: boolean = false, maxWidth?: number) => {
    doc.setFontSize(fontSize);
    if (isBold) {
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setFont('helvetica', 'normal');
    }

    const lines = doc.splitTextToSize(text, maxWidth || pageWidth - 40);
    doc.text(lines, 20, yPosition);
    yPosition += lines.length * (fontSize * 0.4) + 5;
  };

  // Check if new page is needed
  const checkNewPage = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // Title
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  addText('Combined College Student Stress Scale (CCSSS)', 18, true);
  addText('Assessment Report', 12, false);

  doc.setTextColor(0, 0, 0);
  yPosition += 10;

  // Date
  addText(`Completed: ${new Date(result.completedAt).toLocaleString('en-US', {
    dateStyle: 'long',
    timeStyle: 'short'
  })}`, 10);

  yPosition += 5;

  // Summary Box
  checkNewPage(60);
  doc.setFillColor(240, 240, 255);
  doc.roundedRect(15, yPosition, pageWidth - 30, 55, 3, 3, 'F');
  yPosition += 10;

  addText('Overall Results', 14, true);
  addText(`Total Score: ${result.totalScore} / ${result.maxScore} (${result.percentage.toFixed(1)}%)`, 11);
  addText(`Stress Level: ${result.stressLevel}`, 11, true);
  
  if (result.dominantCategories.length > 0) {
    addText(`Primary Stress Areas: ${result.dominantCategories.join(', ')}`, 10);
  }

  yPosition += 10;

  // Category Breakdown
  checkNewPage(80);
  addText('Category Breakdown', 14, true);
  yPosition += 5;

  // Core Score
  doc.setDrawColor(99, 102, 241);
  doc.setLineWidth(0.5);
  doc.line(20, yPosition, pageWidth - 20, yPosition);
  yPosition += 5;
  addText(`Core Assessment: ${result.coreScore} / 40`, 11);
  yPosition += 2;

  // Module Scores
  const moduleColors: Record<string, [number, number, number]> = {
    'Academic Pressures': [139, 92, 246],
    'Social & Relationships': [244, 63, 94],
    'Financial & Practical Concerns': [245, 158, 11],
    'Health & Lifestyle': [16, 185, 129],
  };

  Object.entries(result.moduleScores).forEach(([category, score]) => {
    checkNewPage(15);
    const color = moduleColors[category] || [100, 100, 100];
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 5;
    addText(`${category}: ${score} / 20`, 11);
    yPosition += 2;
  });

  // Interpretation
  checkNewPage(60);
  yPosition += 10;
  addText('Interpretation', 14, true);
  yPosition += 5;

  let interpretation = '';
  if (result.stressLevel === 'Low') {
    interpretation = 'Your stress levels are currently well-managed. You demonstrate good coping mechanisms and balance in your academic and personal life. Continue to maintain healthy habits and be mindful of any changes in your stress patterns.';
  } else if (result.stressLevel === 'Moderate') {
    interpretation = 'You are experiencing moderate levels of stress. While this is common among college students, it\'s important to implement stress management strategies. Consider: regular exercise, adequate sleep, time management techniques, and seeking support when needed.';
  } else {
    interpretation = 'You are experiencing high levels of stress that may be significantly impacting your wellbeing. We strongly recommend: speaking with a counselor or mental health professional, reaching out to campus support services, prioritizing self-care, and creating a plan to address your primary stressors.';
  }

  addText(interpretation, 10, false, pageWidth - 40);

  // Core Questions Section
  checkNewPage(40);
  yPosition += 10;
  addText('Core Assessment Responses', 14, true);
  yPosition += 5;

  CORE_QUESTIONS.forEach((question, index) => {
    checkNewPage(25);
    const response = coreResponses.find(r => r.questionId === question.id);
    const rating = response ? response.rating : 0;
    const ratingLabels = ['Not at all', 'Rarely', 'Sometimes', 'Often', 'Very Often'];
    
    addText(`${index + 1}. ${question.text}`, 9);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(`Response: ${rating} - ${ratingLabels[rating]}`, 25, yPosition);
    yPosition += 8;
  });

  // Module Questions Section
  if (moduleResponses.length > 0) {
    checkNewPage(40);
    yPosition += 10;
    addText('Module Responses', 14, true);
    yPosition += 5;

    Object.entries(result.moduleScores).forEach(([moduleName]) => {
      const module = MODULES.find(m => m.name === moduleName);
      if (!module) return;

      checkNewPage(40);
      addText(moduleName, 12, true);
      yPosition += 3;

      module.questions.forEach((question, index) => {
        checkNewPage(25);
        const response = moduleResponses.find(r => r.questionId === question.id);
        const rating = response ? response.rating : 0;
        const ratingLabels = ['Not at all', 'Rarely', 'Sometimes', 'Often', 'Very Often'];
        
        addText(`${index + 1}. ${question.text}`, 9);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.text(`Response: ${rating} - ${ratingLabels[rating]}`, 25, yPosition);
        yPosition += 8;
      });

      yPosition += 5;
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      'Combined College Student Stress Scale (CCSSS) - Confidential Report',
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - 20, pageHeight - 10, { align: 'right' });
  }

  // Save the PDF
  const fileName = `CCSSS-Report-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
