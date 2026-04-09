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
  rapidApiData?: unknown;
}, hasProAccess: boolean = false) {
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

    // Performance Suggestions
    const suggestions = speedData.improve_page_performance as Array<{grade?: string, suggestion?: string, detail?: string}> | undefined;
    if (suggestions && suggestions.length > 0) {
      yPos = checkPageBreak(doc, yPos, 35);
      doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(40, 40, 40);
      doc.text('Performance Suggestions', 14, yPos); yPos += 5;
      
      const suggBody = suggestions.map(s => [s.grade || '-', s.suggestion || '-', s.detail || '-']);
      autoTable(doc, { startY: yPos, head: [['Grade', 'Suggestion', 'Detail']], body: suggBody, theme: 'grid', headStyles: { fillColor: [46, 204, 113] }, columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: 50 }, 2: { cellWidth: 'auto' } }, styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' }, margin: { left: 14, right: 14 } });
      yPos = getTableEndY(doc, yPos);
    }

    // Connection Timings
    const timings = (speedData.summary as any)?.main?.timings || (speedData.raw as any)?.timings;
    if (timings && timings.total_time) {
      yPos = checkPageBreak(doc, yPos, 40);
      doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(40, 40, 40);
      doc.text('Connection Timings', 14, yPos); yPos += 5;
      
      const tBody = [
        ['DNS Lookup', `${((timings.namelookup_time || 0) * 1000).toFixed(1)} ms`],
        ['Connect', `${((timings.connect_time || 0) * 1000).toFixed(1)} ms`],
        ['TTFB (Start Transfer)', `${((timings.starttransfer_time || 0) * 1000).toFixed(1)} ms`],
        ['Total Time', `${((timings.total_time || 0) * 1000).toFixed(1)} ms`]
      ];
      autoTable(doc, { startY: yPos, head: [['Phase', 'Duration']], body: tBody, theme: 'grid', headStyles: { fillColor: [46, 204, 113] }, styles: { fontSize: 8, cellPadding: 3 }, margin: { left: 14, right: 14 } });
      yPos = getTableEndY(doc, yPos);
    }

    // Weight by domain
    const wDomain = speedData.content_size_by_domain as Array<{domain?: string, size_kb?: number, percent?: number}> | undefined;
    if (wDomain && wDomain.length > 0) {
      yPos = checkPageBreak(doc, yPos, 40);
      doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(40, 40, 40);
      doc.text('Weight by Domain', 14, yPos); yPos += 5;
      const dBody = wDomain.map(d => [d.domain || '-', `${d.size_kb} KB`, `${d.percent}%`]);
      autoTable(doc, { startY: yPos, head: [['Domain', 'Size', '%']], body: dBody, theme: 'grid', headStyles: { fillColor: [46, 204, 113] }, styles: { fontSize: 8, cellPadding: 3 }, margin: { left: 14, right: 14 } });
      yPos = getTableEndY(doc, yPos);
    }

    // Requests by domain
    const rDomain = speedData.requests_by_domain as Array<{domain?: string, requests?: number, percent?: number}> | undefined;
    if (rDomain && rDomain.length > 0) {
      yPos = checkPageBreak(doc, yPos, 40);
      doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(40, 40, 40);
      doc.text('Requests by Domain', 14, yPos); yPos += 5;
      const dBody = rDomain.map(d => [d.domain || '-', String(d.requests || 0), `${d.percent}%`]);
      autoTable(doc, { startY: yPos, head: [['Domain', 'Requests', '%']], body: dBody, theme: 'grid', headStyles: { fillColor: [46, 204, 113] }, styles: { fontSize: 8, cellPadding: 3 }, margin: { left: 14, right: 14 } });
      yPos = getTableEndY(doc, yPos);
    }
  }

  // ── ON-PAGE & SECURITY ──────────────────────────────────────
  const rapidData = data.rapidApiData as Record<string, unknown> | null;
  const seoDataRaw = data.seoAnalysis as Record<string, unknown> | null;
  
  if (rapidData || seoDataRaw) {
    const wordCount = rapidData?.wordCount as number | undefined;
    const language = rapidData?.language as string | undefined;
    const internalLinks = (seoDataRaw?.links as any)?.internal;
    const externalLinks = (seoDataRaw?.links as any)?.external;
    const brokenLinks = (seoDataRaw?.links as any)?.broken;
    const totalImages = (seoDataRaw?.images as any)?.total;
    const imagesNoAlt = (seoDataRaw?.images as any)?.without_alt;

    yPos = checkPageBreak(doc, yPos, 45);
    yPos = drawSectionHeading(doc, 'On-Page Metrics', yPos);

    const onPageBody: string[][] = [];
    if (wordCount !== undefined) onPageBody.push(['Word Count', String(wordCount)]);
    if (language) onPageBody.push(['Language', language.toUpperCase()]);
    if (internalLinks !== undefined) onPageBody.push(['Internal Links', String(internalLinks)]);
    if (externalLinks !== undefined) onPageBody.push(['External Links', String(externalLinks)]);
    if (brokenLinks !== undefined) onPageBody.push(['Broken Links', String(brokenLinks)]);
    if (totalImages !== undefined) onPageBody.push(['Total Images', String(totalImages)]);
    if (imagesNoAlt !== undefined) onPageBody.push(['Images Missing Alt', String(imagesNoAlt)]);

    if (onPageBody.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [['Metric', 'Value']],
        body: onPageBody,
        theme: 'grid',
        headStyles: { fillColor: [52, 152, 219] },
        columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' }, 1: { cellWidth: 'auto' } },
        styles: { fontSize: 9, cellPadding: 4, overflow: 'linebreak' },
        margin: { left: 14, right: 14 },
      });
      yPos = getTableEndY(doc, yPos);
    }

    const checks = (rapidData?.seoScore as any)?.checks as Array<any> | undefined;
    if (checks && checks.length > 0) {
      yPos = checkPageBreak(doc, yPos, 40);
      yPos = drawSectionHeading(doc, 'Security & Quality Checks', yPos);

      const checksBody = checks.map(c => [
         c.name || 'Unknown Check',
         c.pass ? 'PASS' : 'FAIL',
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Action / Check', 'Status']],
        body: checksBody,
        theme: 'grid',
        headStyles: { fillColor: [155, 89, 182] },
        columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 'auto', fontStyle: 'bold' } },
        styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' },
        margin: { left: 14, right: 14 },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 1) {
               if (data.cell.raw === 'PASS') {
                   data.cell.styles.textColor = '#27ae60'; // green
               } else if (data.cell.raw === 'FAIL') {
                   data.cell.styles.textColor = '#e74c3c'; // red
               }
            }
        }
      });
      yPos = getTableEndY(doc, yPos);
    }
    // Page basics
    const basic = seoDataRaw?.basic as Record<string, any> | undefined;
    if (basic) {
      yPos = checkPageBreak(doc, yPos, 40);
      yPos = drawSectionHeading(doc, 'Page Basics', yPos);
      const bBody = [
        ['Requested URL', basic.requested_url || '-'],
        ['Final URL', basic.final_url || '-'],
        ['Title', basic.title || '-'],
        ['HTTP Code', String(basic.http_code || '-')]
      ];
      autoTable(doc, { startY: yPos, head: [['Metric', 'Value']], body: bBody, theme: 'grid', headStyles: { fillColor: [52, 152, 219] }, columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' } }, styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' }, margin: { left: 14, right: 14 } });
      yPos = getTableEndY(doc, yPos);
    }

    // Crawl Signals
    const crawl = seoDataRaw?.crawl_signals as Record<string, any> | undefined;
    if (crawl) {
      yPos = checkPageBreak(doc, yPos, 40);
      yPos = drawSectionHeading(doc, 'Crawl Signals', yPos);
      const cBody = [
        ['Robots.txt', crawl.robots?.found ? 'Found' : 'Missing', `HTTP ${crawl.robots?.http_code || '-'}`],
        ['Sitemap.xml', crawl.sitemap?.found ? 'Found' : 'Missing', `HTTP ${crawl.sitemap?.http_code || '-'}`],
        ['llms.txt', crawl.llms_txt?.found ? 'Found' : 'Missing', `HTTP ${crawl.llms_txt?.http_code || '-'}`],
        ['ai.txt', crawl.ai_txt?.found ? 'Found' : 'Missing', `HTTP ${crawl.ai_txt?.http_code || '-'}`]
      ];
      autoTable(doc, { startY: yPos, head: [['Signal', 'Status', 'Details']], body: cBody, theme: 'grid', headStyles: { fillColor: [52, 152, 219] }, styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' }, margin: { left: 14, right: 14 }, didParseCell: (d) => { if (d.section === 'body' && d.column.index === 1) { d.cell.styles.textColor = d.cell.raw === 'Found' ? '#27ae60' : '#e74c3c'; } } });
      yPos = getTableEndY(doc, yPos);
    }

    // Security Headers & Actions
    const sec = seoDataRaw?.security as Record<string, any> | undefined;
    if (sec) {
      yPos = checkPageBreak(doc, yPos, 60);
      yPos = drawSectionHeading(doc, 'Security Profile', yPos);
      
      const sBody = [
        ['HTTPS Configuration', sec.https ? 'Active' : 'Warning'],
        ['HSTS Header', sec.hsts ? 'Active' : 'Warning'],
        ['X-Frame-Options', sec.x_frame_options ? 'Active' : 'Warning'],
        ['Content Security Policy', sec.content_security_policy ? 'Active' : 'Warning'],
        ['Mixed Content', sec.mixed_content_found ? 'Warning (Found)' : 'Clear']
      ];
      
      autoTable(doc, { startY: yPos, head: [['Check', 'Status']], body: sBody, theme: 'grid', headStyles: { fillColor: [155, 89, 182] }, columnStyles: { 0: { cellWidth: 50, fontStyle: 'bold' } }, styles: { fontSize: 8, cellPadding: 3, overflow: 'linebreak' }, margin: { left: 14, right: 14 }, didParseCell: (d) => { if (d.section === 'body' && d.column.index === 1) { d.cell.styles.textColor = (d.cell.raw as string).includes('Active') || d.cell.raw === 'Clear' ? '#27ae60' : '#e74c3c'; } } });
      yPos = getTableEndY(doc, yPos);

      // Security suggestions
      if (Array.isArray(sec.suggestions) && sec.suggestions.length > 0) {
        yPos = checkPageBreak(doc, yPos, 30);
        doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(40, 40, 40);
        doc.text('Security Actions', 14, yPos); yPos += 5;
        const saBody = sec.suggestions.map(s => [s]);
        autoTable(doc, { startY: yPos, head: [['Required Action']], body: saBody, theme: 'grid', headStyles: { fillColor: [155, 89, 182] }, styles: { fontSize: 8, cellPadding: 3, textColor: '#e74c3c' }, margin: { left: 14, right: 14 } });
        yPos = getTableEndY(doc, yPos);
      }
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

  const isPremiumIssue = (severity: string) => {
    const s = severity?.toLowerCase();
    return s === 'critical' || s === 'error' || s === 'high';
  };
  const isWarningIssue = (severity: string) => {
    const s = severity?.toLowerCase();
    return s === 'warning' || s === 'medium';
  };

  const goodFindings = findings.filter(f => !isPremiumIssue(f.severity || '') && !isWarningIssue(f.severity || ''));
  const warningFindings = findings.filter(f => isWarningIssue(f.severity || ''));
  const criticalFindings = findings.filter(f => isPremiumIssue(f.severity || ''));

  const freeVisibleWarnings = warningFindings.slice(0, 2);
  const hiddenFindings = [...warningFindings.slice(2), ...criticalFindings];

  const visibleFindings = hasProAccess ? findings : [...goodFindings, ...freeVisibleWarnings];

  const issuesBody = visibleFindings.map((f) => [
    f.severity?.toUpperCase() || 'INFO',
    f.category?.replace(/_/g, ' ') || 'General',
    f.issue || '',
    f.fix || '',
  ]);

  if (!hasProAccess && hiddenFindings.length > 0) {
    issuesBody.push([
      'CRITICAL/WARNING',
      'Hidden Issues',
      `${hiddenFindings.length} more critical/warning issues found.`,
      'Upgrade to Pro at seozapp.com/#pricing to view complete details.',
    ]);
  }

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

      const top10 = kwList.filter(k => (k.rank as number || 99) <= 10).length;
      const top3 = kwList.filter(k => (k.rank as number || 99) <= 3).length;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(`Total Keywords: ${kwList.length}`, 14, yPos);
      doc.text(`Top 10 Rankings: ${top10}`, 90, yPos);
      doc.text(`Top 3 Rankings: ${top3}`, 160, yPos);
      yPos += 10;

      const kwBody = kwList.slice(0, 500).map((kw) => {
        const cpc = kw.exactCostPerClick ?? kw.broadCostPerClick;
        return [
          (kw.keyword as string) || '-',
          String(kw.rank ?? '-'),
          String(kw.searchVolume ?? '-'),
          String(kw.seoClicks ?? '-'),
          cpc !== undefined && cpc !== null ? `$${Number(cpc).toFixed(2)}` : '-'
        ];
      });

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

      const blBody = backlinks.slice(0, 500).map((bl) => [
        (bl.url_from as string || bl.source_url as string) || '-',
        (bl.anchor as string || bl.anchor_text as string) || '-',
        String(bl.domain_inlink_rank ?? bl.domain_authority ?? '-'),
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

      const nlBody = newList.slice(0, 500).map((nl) => [
        (nl.url_from as string || nl.source_url as string) || '-',
        (nl.anchor as string || nl.anchor_text as string) || '-',
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

      const plBody = poorList.slice(0, 500).map((pl) => [
        (pl.url_from as string || pl.source_url as string) || '-',
        String(pl.spam_score ?? pl.domain_inlink_rank ?? '-'),
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

    // Links & Trust
    const links = (seoDataRaw as any)?.links;
    if (links) {
      yPos = checkPageBreak(doc, yPos, 40);
      doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(40, 40, 40);
      doc.text('Link Health & AI Trust', 14, yPos); yPos += 5;
      const lBody = [
        ['Total Links', String(links.counts?.total || 0)],
        ['Internal Links', String(links.counts?.internal || 0)],
        ['External Links', String(links.counts?.external || 0)],
        ['Empty Anchors', String(links.counts?.empty_text || 0)],
      ];
      autoTable(doc, { startY: yPos, head: [['Metric', 'Value']], body: lBody, theme: 'grid', headStyles: { fillColor: [155, 89, 182] }, styles: { fontSize: 8, cellPadding: 3 }, margin: { left: 14, right: 14 } });
      yPos = getTableEndY(doc, yPos);
    }
    
    // Structured Data
    const sd = (seoDataRaw as any)?.structured_data;
    if (sd) {
      yPos = checkPageBreak(doc, yPos, 40);
      doc.setFontSize(11); doc.setFont('helvetica', 'bold'); doc.setTextColor(40, 40, 40);
      doc.text('Structured Data (JSON-LD)', 14, yPos); yPos += 5;
      const sdBody = [
        ['Items Found', String(sd.jsonld_count || 0)],
        ['Errors', String(sd.jsonld_errors || 0)],
        ['Detected Types', (sd.detected_types && sd.detected_types.length > 0) ? sd.detected_types.join(', ') : 'None']
      ];
      autoTable(doc, { startY: yPos, head: [['Metric', 'Value']], body: sdBody, theme: 'grid', headStyles: { fillColor: [155, 89, 182] }, styles: { fontSize: 8, cellPadding: 3 }, margin: { left: 14, right: 14 }, didParseCell: (d) => { if (d.section === 'body' && d.column.index === 1 && d.row.index === 1 && d.cell.raw !== '0') { d.cell.styles.textColor = '#e74c3c'; } } });
      yPos = getTableEndY(doc, yPos);
    }

  // ── AI BOT CHECKER ──────────────────────────────────────────
  const aiBotData = data.aiBotChecker as Record<string, unknown>;
  const globalAiBots = (seoDataRaw as any)?.crawl_signals?.robots?.ai_bots;

  if (aiBotData || globalAiBots) {
    const bots = globalAiBots || (aiBotData?.bots as Record<string, { allowed?: boolean; rule?: string }> | undefined);
    const robotsFound = aiBotData?.robots_found ?? (seoDataRaw as any)?.crawl_signals?.robots?.found;
    const aiBotsAllowed = aiBotData?.ai_bots_allowed;

    if (bots || robotsFound !== undefined) {
      yPos = checkPageBreak(doc, yPos, 50);
      yPos = drawSectionHeading(doc, 'AI Bot Access', yPos);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(60, 60, 60);
      doc.text(`robots.txt found: ${robotsFound ? 'Yes' : 'No'}`, 14, yPos);
      yPos += 7;
      
      if (aiBotsAllowed !== undefined) {
          doc.text(
            `AI bots allowed: ${aiBotsAllowed ? 'Yes' : aiBotsAllowed === false ? 'No' : 'Unknown'}`,
            14,
            yPos,
          );
          yPos += 10;
      } else {
          yPos += 3;
      }

      if (bots && Object.keys(bots).length > 0) {
        const botBody = Object.entries(bots).map(([name, info]) => {
          let isAllowed = false;
          let ruleStr = '-';
          if (typeof info === 'string') {
              isAllowed = !info.includes('disallow');
              ruleStr = info;
          } else if (info && typeof info === 'object') {
              isAllowed = (info as any).allowed;
              ruleStr = (info as any).rule || '-';
          }
          return [
            name,
            isAllowed ? 'Allowed' : 'Blocked',
            ruleStr,
          ];
        });
        
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
