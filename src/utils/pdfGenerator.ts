import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ── Logo ──────────────────────────────────────────────────────
function drawLogo(doc: jsPDF, pageWidth: number) {
  doc.setFillColor(255, 255, 255);
  doc.rect(0, 0, pageWidth, 18, 'F');

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  const seoText = 'SEO';
  const seoWidth = doc.getTextWidth(seoText);
  const logoX = (pageWidth - seoWidth - doc.getTextWidth('zapp')) / 2;
  doc.text(seoText, logoX, 12);

  doc.setTextColor(41, 98, 255);
  doc.text('zapp', logoX + seoWidth, 12);

  doc.setDrawColor(41, 98, 255);
  doc.setLineWidth(0.5);
  doc.line(14, 17, pageWidth - 14, 17);
}

// ── Page break helper ─────────────────────────────────────────
function checkPageBreak(doc: jsPDF, yPos: number, needed: number): number {
  const pageHeight = doc.internal.pageSize.height;
  if (yPos + needed > pageHeight - 25) {
    doc.addPage();
    drawLogo(doc, doc.internal.pageSize.width);
    return 30;
  }
  return yPos;
}

// ── Section heading helper ────────────────────────────────────
function drawSectionHeading(doc: jsPDF, title: string, yPos: number): number {
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 30, 30);
  doc.text(title, 14, yPos);
  return yPos + 10;
}

// ── Get Y after autoTable ─────────────────────────────────────
function getTableEndY(doc: jsPDF, fallback: number): number {
  return (doc as any).lastAutoTable?.finalY + 12 || fallback + 15;
}

// ── Main export ───────────────────────────────────────────────
export function generateFixGuidePdf(website: string, data: {
  seoAnalysis: unknown;
  aiVisibility: unknown;
  aiBotChecker: unknown;
  loadingSpeed: unknown;
  topKeywords?: unknown;
  backlinkData?: unknown;
  newBacklinks?: unknown;
  poorBacklinks?: unknown;
}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const contentWidth = pageWidth - 28; // 14px margin each side

  // ── Logo on first page ──
  drawLogo(doc, pageWidth);

  // ── Header bar ──
  doc.setFillColor(41, 98, 255);
  doc.rect(0, 20, pageWidth, 30, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const headerText = `SEO FIX GUIDE: ${website.toUpperCase()}`;
  const headerLines: string[] = doc.splitTextToSize(headerText, contentWidth);
  // Center vertically within the 30px bar
  const headerStartY = 35 + (headerLines.length > 1 ? -4 : 0);
  doc.text(headerLines, pageWidth / 2, headerStartY, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  let yPos = 58;

  // ── SCORES SECTION ──────────────────────────────────────────
  const seoData = data.seoAnalysis as Record<string, unknown>;
  const seoSummary = (seoData?.summary as { overall_score?: number; grade?: string }) || {};
  const seoScores = (seoData?.scores as { buckets?: Record<string, number> }) || {};

  if (seoData) {
    yPos = checkPageBreak(doc, yPos, 55);

    let innerY = yPos + 8;

    // Overall Score
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 30, 30);
    doc.text(`Overall Score: ${seoSummary.overall_score ?? 'N/A'}/100`, 20, innerY);
    innerY += 8;

    // Grade
    if (seoSummary.grade) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);
      doc.text(`Grade: ${seoSummary.grade}`, 20, innerY);
      innerY += 8;
    }

    // Score buckets — each on its own line to prevent horizontal overflow
    if (seoScores.buckets) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);

      const bucketEntries = Object.entries(seoScores.buckets);
      const bucketsPerRow = 3;
      const colWidth = contentWidth / bucketsPerRow;

      for (let i = 0; i < bucketEntries.length; i += bucketsPerRow) {
        const rowBuckets = bucketEntries.slice(i, i + bucketsPerRow);
        rowBuckets.forEach(([k, v], j) => {
          const label = `${k.replace(/_/g, ' ')}: ${v}`;
          doc.text(label, 20 + j * colWidth, innerY);
        });
        innerY += 7;
      }
    }

    // Draw the background box to fit the content (spacing handled by yPos)
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(245, 245, 250);
    // Draw box behind (we need to draw it first, but since we already drew text, we'll draw a rect then redraw text)
    // Actually, let's use a simpler approach: just add spacing
    yPos = innerY + 8;
  }

  // ── SPEED SECTION ───────────────────────────────────────────
  const speedData = data.loadingSpeed as Record<string, unknown>;
  if (speedData?.summary) {
    const summary = speedData.summary as {
      performance_grade?: { score?: number; grade?: string };
      load_time_ms?: number;
      page_size_kb?: number;
      requests?: number;
    };

    yPos = checkPageBreak(doc, yPos, 50);
    yPos = drawSectionHeading(doc, 'Performance & Speed', yPos);

    const head = [['Metric', 'Value']];
    const body: string[][] = [];

    if (summary.performance_grade) {
      body.push([
        'Performance Grade',
        `${summary.performance_grade.grade || '-'} (Score: ${summary.performance_grade.score ?? '-'})`
      ]);
    }
    if (summary.load_time_ms) {
      body.push(['Load Time', `${(summary.load_time_ms / 1000).toFixed(2)}s`]);
    }
    if (summary.page_size_kb) {
      body.push(['Page Size', `${Math.round(summary.page_size_kb)} KB`]);
    }
    if (summary.requests) {
      body.push(['Total Requests', summary.requests.toString()]);
    }

    if (body.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head,
        body,
        theme: 'grid',
        headStyles: { fillColor: [46, 204, 113] },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak' },
        columnStyles: {
          0: { cellWidth: 50, fontStyle: 'bold' },
          1: { cellWidth: 'auto' },
        },
      });
      yPos = getTableEndY(doc, yPos);
    }
  }

  // ── ISSUES & FINDINGS ───────────────────────────────────────
  yPos = checkPageBreak(doc, yPos, 30);
  yPos = drawSectionHeading(doc, 'Issues & Recommendations', yPos);

  const findings = (
    (seoData?.findings as Array<{ category?: string; severity?: string; issue?: string; fix?: string }>) || []
  ).sort((a, b) => {
    const severityWeight: Record<string, number> = {
      critical: 3, error: 3, high: 2, medium: 1, warning: 1, low: 0, info: 0,
    };
    const weightA = severityWeight[a.severity?.toLowerCase() || ''] || 0;
    const weightB = severityWeight[b.severity?.toLowerCase() || ''] || 0;
    return weightB - weightA;
  });

  const issuesBody = findings.map((f) => [
    f.severity?.toUpperCase() || 'INFO',
    f.category?.replace(/_/g, ' ') || 'General',
    f.issue || '',
    f.fix || '',
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
        3: { cellWidth: 'auto' },
      },
      styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
      margin: { left: 14, right: 14 },
      didDrawPage: () => {
        drawLogo(doc, pageWidth);
      },
    });
    yPos = getTableEndY(doc, yPos);
  } else {
    doc.setFontSize(11);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(80, 80, 80);
    doc.text('No major issues found. Great job!', 14, yPos);
    yPos += 15;
  }

  // ── TOP KEYWORDS ────────────────────────────────────────────
  const tkData = data.topKeywords as Record<string, unknown> | null;
  if (tkData) {
    let kwList: Array<Record<string, unknown>> = [];
    if (Array.isArray(tkData.keywords)) {
      kwList = tkData.keywords;
    } else if (Array.isArray(tkData)) {
      kwList = tkData as any;
    } else {
      for (const val of Object.values(tkData)) {
        if (Array.isArray(val) && val.length > 0 && val[0]?.keyword) {
          kwList = val;
          break;
        }
      }
    }

    if (kwList.length > 0) {
      yPos = checkPageBreak(doc, yPos, 40);
      yPos = drawSectionHeading(doc, 'Top Search Keywords', yPos);

      const top10 = kwList.filter(k => (k.position as number || 99) <= 10).length;
      const top3 = kwList.filter(k => (k.position as number || 99) <= 3).length;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(`Total Keywords: ${kwList.length}`, 14, yPos);
      doc.text(`Top 10 Rankings: ${top10}`, 90, yPos);
      doc.text(`Top 3 Rankings: ${top3}`, 160, yPos);
      yPos += 10;

      const kwBody = kwList.slice(0, 15).map((kw) => [
        (kw.keyword as string) || '-',
        String(kw.position ?? '-'),
        String(kw.search_volume ?? '-'),
        String(kw.traffic ?? '-'),
        kw.cpc !== undefined ? `$${Number(kw.cpc).toFixed(2)}` : '-'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Keyword', 'Position', 'Volume', 'Traffic', 'CPC']],
        body: kwBody,
        theme: 'grid',
        headStyles: { fillColor: [41, 98, 255] }, // Blue
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 25 },
          2: { cellWidth: 30 },
          3: { cellWidth: 30 },
          4: { cellWidth: 'auto' },
        },
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
        margin: { left: 14, right: 14 },
      });
      yPos = getTableEndY(doc, yPos);
    }
  }

  // ── BACKLINKS ───────────────────────────────────────────────
  const bd = data.backlinkData as Record<string, unknown> | null;
  const nb = data.newBacklinks as Record<string, unknown> | null;
  const pb = data.poorBacklinks as Record<string, unknown> | null;

  if (bd || nb || pb) {
    const backlinks = (bd?.backlinks || bd?.data || []) as Array<Record<string, unknown>>;
    const totalBacklinks = (bd?.total_backlinks ?? bd?.total ?? backlinks.length ?? 0) as number;
    const referringDomains = (bd?.referring_domains ?? bd?.ref_domains ?? 0) as number;
    
    const newList = (nb?.new_backlinks || nb?.data || []) as Array<Record<string, unknown>>;
    const newTotal = (nb?.total ?? newList.length ?? 0) as number;
    
    const poorList = (pb?.poor_backlinks || pb?.data || []) as Array<Record<string, unknown>>;
    const poorTotal = (pb?.total ?? poorList.length ?? 0) as number;

    yPos = checkPageBreak(doc, yPos, 40);
    yPos = drawSectionHeading(doc, 'Backlink Analysis', yPos);

    // Summary stats
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(60, 60, 60);
    doc.text(`Total Backlinks: ${totalBacklinks}`, 14, yPos);
    doc.text(`Referring Domains: ${referringDomains}`, 100, yPos);
    yPos += 7;
    doc.text(`New Backlinks: ${newTotal}`, 14, yPos);
    doc.text(`Toxic Backlinks: ${poorTotal}`, 100, yPos);
    yPos += 12;

    // Top Backlinks Table
    if (backlinks.length > 0) {
      yPos = checkPageBreak(doc, yPos, 30);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text('Top Backlinks', 14, yPos);
      yPos += 5;

      const blBody = backlinks.slice(0, 10).map((bl) => [
        (bl.source_url as string) || '-',
        (bl.anchor_text as string) || '-',
        String(bl.domain_authority ?? '-'),
        bl.nofollow ? 'nofollow' : 'dofollow'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Source URL', 'Anchor Text', 'DA', 'Type']],
        body: blBody,
        theme: 'grid',
        headStyles: { fillColor: [63, 81, 181] }, // Indigo
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 40 },
          2: { cellWidth: 15 },
          3: { cellWidth: 20 },
        },
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
        margin: { left: 14, right: 14 },
      });
      yPos = getTableEndY(doc, yPos);
    }

    // New Backlinks Table
    if (newList.length > 0) {
      yPos = checkPageBreak(doc, yPos, 30);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text('New Backlinks', 14, yPos);
      yPos += 5;

      const nlBody = newList.slice(0, 5).map((nl) => [
        (nl.source_url as string) || '-',
        (nl.anchor_text as string) || '-',
        nl.first_seen ? new Date(nl.first_seen as string).toLocaleDateString() : '-'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Source URL', 'Anchor Text', 'First Seen']],
        body: nlBody,
        theme: 'grid',
        headStyles: { fillColor: [76, 175, 80] }, // Green
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 40 },
          2: { cellWidth: 25 },
        },
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
        margin: { left: 14, right: 14 },
      });
      yPos = getTableEndY(doc, yPos);
    }

    // Toxic/Poor Backlinks Table
    if (poorList.length > 0) {
      yPos = checkPageBreak(doc, yPos, 30);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(40, 40, 40);
      doc.text('Toxic / Poor Backlinks', 14, yPos);
      yPos += 5;

      const plBody = poorList.slice(0, 5).map((pl) => [
        (pl.source_url as string) || '-',
        String(pl.spam_score ?? '-'),
        (pl.reason as string) || '-'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Source URL', 'Spam Score', 'Reason']],
        body: plBody,
        theme: 'grid',
        headStyles: { fillColor: [244, 67, 54] }, // Red
        columnStyles: {
          0: { cellWidth: 60 },
          1: { cellWidth: 25 },
          2: { cellWidth: 40 },
        },
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
        margin: { left: 14, right: 14 },
      });
      yPos = getTableEndY(doc, yPos);
    }
  }

  const aiVisData = data.aiVisibility as Record<string, unknown>;
  const aiScore = aiVisData?.score ?? (aiVisData?.ai_score as any)?.total;
  let aiSuggestions = (aiVisData?.suggestions || aiVisData?.issues) as Array<{
    priority?: string;
    severity?: string;
    category?: string;
    id?: string;
    message?: string;
    evidence?: string;
  }>;

  // Fallback to searching the object graph
  if (!aiSuggestions || aiSuggestions.length === 0) {
    if (aiVisData?.data && Array.isArray((aiVisData.data as any).suggestions)) {
      aiSuggestions = (aiVisData.data as any).suggestions;
    }
  }

  if (aiScore !== undefined || (Array.isArray(aiSuggestions) && aiSuggestions.length > 0)) {
    // Always start AI sections on a new page to avoid overlap with large issue tables
    doc.addPage();
    drawLogo(doc, pageWidth);
    yPos = 30;

    yPos = drawSectionHeading(doc, 'AI Search Visibility', yPos);

    if (aiScore !== undefined) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(`AI Visibility Score: ${aiScore}/100`, 14, yPos);
      yPos += 10;
    }

    if (Array.isArray(aiSuggestions) && aiSuggestions.length > 0) {
      const aiBody = aiSuggestions.map((s) => [
        (s.priority || s.severity || 'Medium').toUpperCase(),
        s.category || s.id || 'General',
        s.message || s.evidence || '-',
      ]);
      autoTable(doc, {
        startY: yPos,
        head: [['Priority', 'Category', 'Issue / Suggestion']],
        body: aiBody,
        theme: 'grid',
        headStyles: { fillColor: [155, 89, 182] },
        columnStyles: {
          0: { cellWidth: 22, fontStyle: 'bold' },
          1: { cellWidth: 35 },
          2: { cellWidth: 'auto' },
        },
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
        margin: { left: 14, right: 14 },
        didDrawPage: () => {
          drawLogo(doc, pageWidth);
        },
      });
      yPos = getTableEndY(doc, yPos);
    }
  }

  // ── AI BOT CHECKER ──────────────────────────────────────────
  const aiBotData = data.aiBotChecker as Record<string, unknown>;
  if (aiBotData) {
    const bots = aiBotData.bots as Record<string, { allowed?: boolean; rule?: string }> | undefined;
    const robotsFound = aiBotData.robots_found as boolean | undefined;
    const aiBotsAllowed = aiBotData.ai_bots_allowed as boolean | undefined;

    if (bots || robotsFound !== undefined) {
      yPos = checkPageBreak(doc, yPos, 50);
      yPos = drawSectionHeading(doc, 'AI Bot Access', yPos);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(`robots.txt found: ${robotsFound ? 'Yes' : 'No'}`, 14, yPos);
      yPos += 7;
      doc.text(
        `AI bots allowed: ${aiBotsAllowed ? 'Yes' : aiBotsAllowed === false ? 'No' : 'Unknown'}`,
        14,
        yPos,
      );
      yPos += 10;

      if (bots && Object.keys(bots).length > 0) {
        const botBody = Object.entries(bots).map(([name, info]) => [
          name,
          info.allowed ? 'Allowed' : 'Blocked',
          info.rule || '-',
        ]);
        autoTable(doc, {
          startY: yPos,
          head: [['Bot', 'Status', 'Rule']],
          body: botBody,
          theme: 'grid',
          headStyles: { fillColor: [39, 174, 96] },
          columnStyles: {
            0: { cellWidth: 45 },
            1: { cellWidth: 25 },
            2: { cellWidth: 'auto' },
          },
          styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
          margin: { left: 14, right: 14 },
          didDrawPage: () => {
            drawLogo(doc, pageWidth);
          },
        });
        yPos = getTableEndY(doc, yPos);
      }
    }
  }

  // ── FOOTER on every page ────────────────────────────────────
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
