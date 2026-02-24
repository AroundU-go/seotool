import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// SEOzapp logo as base64 — we'll draw a text-based logo instead
function drawLogo(doc: jsPDF, pageWidth: number) {
  // Logo background strip
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 18, 'F');

  // "SEO" in dark
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  const seoText = 'SEO';
  const seoWidth = doc.getTextWidth(seoText);
  const logoX = (pageWidth - seoWidth - doc.getTextWidth('zapp')) / 2;
  doc.text(seoText, logoX, 12);

  // "zapp" in accent blue
  doc.setTextColor(41, 98, 255);
  doc.text('zapp', logoX + seoWidth, 12);

  // Thin accent line below logo
  doc.setDrawColor(41, 98, 255);
  doc.setLineWidth(0.5);
  doc.line(14, 17, pageWidth - 14, 17);
}

function checkPageBreak(doc: jsPDF, yPos: number, needed: number): number {
  const pageHeight = doc.internal.pageSize.height;
  if (yPos + needed > pageHeight - 25) {
    doc.addPage();
    drawLogo(doc, doc.internal.pageSize.width);
    return 30; // Start below logo on new page
  }
  return yPos;
}

export function generateFixGuidePdf(website: string, data: {
  seoAnalysis: unknown;
  aiVisibility: unknown;
  aiBotChecker: unknown;
  loadingSpeed: unknown;
}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // ── Logo on first page ──
  drawLogo(doc, pageWidth);

  // ── Header bar ──
  doc.setFillColor(41, 98, 255);
  doc.rect(0, 20, pageWidth, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  const headerText = `SEO FIX GUIDE: ${website.toUpperCase()}`;
  const headerLines = doc.splitTextToSize(headerText, pageWidth - 40);
  doc.text(headerLines, pageWidth / 2, 35, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  let yPos = 60;

  // ── SCORES SECTION ──
  const seoData = data.seoAnalysis as Record<string, unknown>;
  const seoSummary = seoData?.summary as { overall_score?: number; grade?: string } || {};
  const seoScores = seoData?.scores as { buckets?: Record<string, number> } || {};

  if (seoData) {
    yPos = checkPageBreak(doc, yPos, 50);

    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(245, 245, 250);
    doc.roundedRect(14, yPos, pageWidth - 28, 35, 3, 3, 'FD');

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(`Overall Score: ${seoSummary.overall_score ?? 'N/A'}/100`, 20, yPos + 12);

    if (seoSummary.grade) {
      doc.setFontSize(12);
      doc.text(`Grade: ${seoSummary.grade}`, 20, yPos + 22);
    }

    // Buckets in a row
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    let xPos = 100;
    if (seoScores.buckets) {
      Object.entries(seoScores.buckets).forEach(([k, v]) => {
        if (xPos > pageWidth - 40) {
          xPos = 100;
        }
        doc.text(`${k.replace(/_/g, ' ')}: ${v}`, xPos, yPos + 12);
        xPos += 40;
      });
    }
    yPos += 45;
  }

  // ── SPEED SECTION ──
  const speedData = data.loadingSpeed as Record<string, unknown>;
  if (speedData?.summary) {
    const summary = speedData.summary as { performance_grade?: { score?: number; grade?: string }; load_time_ms?: number };

    yPos = checkPageBreak(doc, yPos, 50);

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('Performance & Speed', 14, yPos);
    yPos += 8;

    const head = [['Metric', 'Value', 'Score/Grade']];
    const body: string[][] = [];

    if (summary.performance_grade) {
      body.push(['Performance Grade', summary.performance_grade.grade || '-', summary.performance_grade.score?.toString() || '-']);
    }
    if (summary.load_time_ms) {
      body.push(['Load Time', `${(summary.load_time_ms / 1000).toFixed(2)}s`, '-']);
    }

    if (body.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head,
        body,
        theme: 'grid',
        headStyles: { fillColor: [46, 204, 113] },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 9, cellPadding: 4 },
      });
      yPos = (doc as any).lastAutoTable?.finalY + 12 || yPos + 40;
    }
  }

  // ── ISSUES & FINDINGS ──
  yPos = checkPageBreak(doc, yPos, 30);

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text('Issues & Recommendations', 14, yPos);
  yPos += 8;

  const findings = (seoData?.findings as Array<{ category?: string; severity?: string; issue?: string; fix?: string }> || [])
    .sort((a, b) => {
      const severityWeight: Record<string, number> = {
        critical: 3, error: 3, high: 2, medium: 1, warning: 1, low: 0, info: 0
      };
      const weightA = severityWeight[a.severity?.toLowerCase() || ''] || 0;
      const weightB = severityWeight[b.severity?.toLowerCase() || ''] || 0;
      return weightB - weightA;
    });

  const issuesBody = findings.map(f => [
    f.severity?.toUpperCase() || 'INFO',
    f.category?.replace(/_/g, ' ') || 'General',
    f.issue || '',
    f.fix || ''
  ]);

  if (issuesBody.length > 0) {
    autoTable(doc, {
      startY: yPos,
      head: [['Severity', 'Category', 'Issue', 'Recommendation']],
      body: issuesBody,
      theme: 'striped',
      headStyles: { fillColor: [231, 76, 60] },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 22 },
        1: { cellWidth: 28 },
        2: { cellWidth: 55 },
        3: { cellWidth: 'auto' }
      },
      styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
      margin: { left: 14, right: 14 },
    });
    yPos = (doc as any).lastAutoTable?.finalY + 12 || yPos + 15;
  } else {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(80, 80, 80);
    doc.text('No major issues found. Great job!', 14, yPos);
    yPos += 15;
  }

  // ── AI VISIBILITY ──
  const aiVisData = data.aiVisibility as Record<string, unknown>;
  const aiScore = aiVisData?.score ?? (aiVisData?.ai_score as any)?.total;
  const aiSuggestions = aiVisData?.suggestions as Array<{ priority?: string; category?: string; message?: string }>;

  if (aiScore !== undefined || (Array.isArray(aiSuggestions) && aiSuggestions.length > 0)) {
    doc.addPage();
    drawLogo(doc, pageWidth);
    yPos = 30;

    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text('AI Search Visibility', 14, yPos);
    yPos += 10;

    if (aiScore !== undefined) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`AI Visibility Score: ${aiScore}/100`, 14, yPos);
      yPos += 12;
    }

    if (Array.isArray(aiSuggestions) && aiSuggestions.length > 0) {
      const aiBody = aiSuggestions.map(s => [s.priority || '', s.category || '', s.message || '']);
      autoTable(doc, {
        startY: yPos,
        head: [['Priority', 'Category', 'Suggestion']],
        body: aiBody,
        theme: 'grid',
        headStyles: { fillColor: [155, 89, 182] },
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
        margin: { left: 14, right: 14 },
      });
    }
  }

  // ── AI BOT CHECKER ──
  const aiBotData = data.aiBotChecker as Record<string, unknown>;
  if (aiBotData) {
    const bots = aiBotData.bots as Record<string, { allowed?: boolean; rule?: string }> | undefined;
    const robotsFound = aiBotData.robots_found as boolean | undefined;
    const aiBotsAllowed = aiBotData.ai_bots_allowed as boolean | undefined;

    if (bots || robotsFound !== undefined) {
      yPos = (doc as any).lastAutoTable?.finalY + 15 || yPos + 15;
      yPos = checkPageBreak(doc, yPos, 40);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(30, 30, 30);
      doc.text('AI Bot Access', 14, yPos);
      yPos += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`robots.txt found: ${robotsFound ? 'Yes' : 'No'}`, 14, yPos);
      yPos += 7;
      doc.text(`AI bots allowed: ${aiBotsAllowed ? 'Yes' : aiBotsAllowed === false ? 'No' : 'Unknown'}`, 14, yPos);
      yPos += 10;

      if (bots && Object.keys(bots).length > 0) {
        const botBody = Object.entries(bots).map(([name, info]) => [
          name,
          info.allowed ? 'Allowed' : 'Blocked',
          info.rule || '-'
        ]);
        autoTable(doc, {
          startY: yPos,
          head: [['Bot', 'Status', 'Rule']],
          body: botBody,
          theme: 'grid',
          headStyles: { fillColor: [39, 174, 96] },
          styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
          margin: { left: 14, right: 14 },
        });
      }
    }
  }

  // ── FOOTER on every page ──
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(9);
    doc.setTextColor(150);
    const footerText = `Page ${i} of ${pageCount}  •  Powered by SEOzapp`;
    const textWidth = doc.getTextWidth(footerText);
    doc.text(footerText, (pageWidth - textWidth) / 2, doc.internal.pageSize.height - 10);
  }

  doc.save(`seo-report-${website.replace(/[^a-z0-9]/gi, '-')}.pdf`);
}
