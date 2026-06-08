import { escapeXml, formatCertificateDate, resolveOrganizationName } from "@/lib/certificate-svg";

export type TranscriptProgram = {
  programTitle: string;
  entries: {
    subjectTitle: string;
    score: number;
    correctCount: number;
    totalQuestions: number;
    passed: boolean;
    submittedAt: Date;
  }[];
};

/** Layout aligned inside certificate-style inner border (x=155, w=1290). */
const LAYOUT = {
  cardX: 175,
  cardWidth: 1250,
  programTitleHeight: 52,
  tableHeaderHeight: 44,
  rowHeight: 48,
  programGap: 28,
  cols: {
    subject: { x: 200, anchor: "start" as const },
    score: { x: 720, anchor: "middle" as const },
    result: { x: 880, anchor: "middle" as const },
    correct: { x: 1040, anchor: "middle" as const },
    date: { x: 1380, anchor: "end" as const },
  },
};

function textAnchorAttr(anchor: "start" | "middle" | "end") {
  return anchor === "start" ? "" : ` text-anchor="${anchor}"`;
}

function headerCell(label: string, x: number, anchor: "start" | "middle" | "end", y: number) {
  return `<text x="${x}" y="${y}"${textAnchorAttr(anchor)} font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="700" fill="#334155">${escapeXml(label)}</text>`;
}

function dataCell(
  value: string,
  x: number,
  anchor: "start" | "middle" | "end",
  y: number,
  options?: { bold?: boolean; fill?: string; size?: number }
) {
  const weight = options?.bold ? ' font-weight="700"' : "";
  const fill = options?.fill ?? "#0f172a";
  const size = options?.size ?? 17;
  return `<text x="${x}" y="${y}"${textAnchorAttr(anchor)} font-family="Arial, Helvetica, sans-serif" font-size="${size}" fill="${fill}"${weight}>${value}</text>`;
}

export function buildTranscriptSvg({
  studentName,
  siteName,
  logoUrl,
  programs,
  transcriptId,
}: {
  studentName: string;
  siteName: string;
  logoUrl: string;
  programs: TranscriptProgram[];
  transcriptId: string;
}) {
  const organizationName = resolveOrganizationName(siteName);
  const safeStudent = escapeXml(studentName);
  const safeSite = escapeXml(organizationName);
  const safeLogo = escapeXml(logoUrl);
  const safeId = escapeXml(transcriptId);
  const generatedAt = escapeXml(formatCertificateDate(new Date()));
  const initials = escapeXml(
    organizationName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "EL"
  );

  /** Space for logo, org name, title, student — tables start below this. */
  const programsStartY = 440;
  const summaryHeight = 88;
  let programsHeight = 0;
  for (const program of programs) {
    programsHeight +=
      LAYOUT.programTitleHeight +
      LAYOUT.tableHeaderHeight +
      program.entries.length * LAYOUT.rowHeight +
      LAYOUT.programGap;
  }

  const allEntries = programs.flatMap((p) => p.entries);
  const totalSubjects = allEntries.length;
  const averageScore = totalSubjects
    ? Math.round(allEntries.reduce((sum, e) => sum + e.score, 0) / totalSubjects)
    : 0;
  const passedCount = allEntries.filter((e) => e.passed).length;
  const totalCorrect = allEntries.reduce((sum, e) => sum + e.correctCount, 0);
  const totalQuestions = allEntries.reduce((sum, e) => sum + e.totalQuestions, 0);

  let y = programsStartY;
  const contentEndY = programsStartY + programsHeight;
  const summaryY = contentEndY + 16;
  const footerStartY = summaryY + summaryHeight + 32;
  const totalHeight = Math.max(1120, footerStartY + 100);

  const { cardX, cardWidth, cols } = LAYOUT;

  const programBlocks = programs
    .map((program) => {
      const blockStart = y;
      const titleY = blockStart + 36;
      const tableTop = blockStart + LAYOUT.programTitleHeight;
      const headerLabelY = tableTop + 28;
      const blockHeight =
        LAYOUT.programTitleHeight +
        LAYOUT.tableHeaderHeight +
        program.entries.length * LAYOUT.rowHeight +
        LAYOUT.programGap;

      const rows = program.entries
        .map((entry, index) => {
          const rowTop = tableTop + LAYOUT.tableHeaderHeight + index * LAYOUT.rowHeight;
          const textY = rowTop + 30;
          const bg = index % 2 === 0 ? "#ffffff" : "#f8fafc";
          const resultLabel = entry.passed ? "Passed" : "Failed";
          const resultColor = entry.passed ? "#047857" : "#b91c1c";
          const dateStr = escapeXml(formatCertificateDate(entry.submittedAt));

          return `
        <rect x="${cardX}" y="${rowTop}" width="${cardWidth}" height="${LAYOUT.rowHeight}" fill="${bg}"/>
        ${dataCell(escapeXml(entry.subjectTitle), cols.subject.x, cols.subject.anchor, textY, { bold: true })}
        ${dataCell(`${entry.score}%`, cols.score.x, cols.score.anchor, textY, { bold: true })}
        ${dataCell(resultLabel, cols.result.x, cols.result.anchor, textY, { bold: true, fill: resultColor })}
        ${dataCell(`${entry.correctCount}/${entry.totalQuestions}`, cols.correct.x, cols.correct.anchor, textY, { fill: "#475569" })}
        ${dataCell(dateStr, cols.date.x, cols.date.anchor, textY, { fill: "#64748b", size: 16 })}`;
        })
        .join("");

      y += blockHeight;

      return `
      <rect x="${cardX}" y="${blockStart}" width="${cardWidth}" height="${blockHeight - 8}" rx="14" fill="#ffffff" stroke="#e2e8f0" stroke-width="1.5"/>
      <text x="${cardX + 24}" y="${titleY}" font-family="Georgia, 'Times New Roman', serif" font-size="26" font-weight="700" fill="#0f766e">${escapeXml(program.programTitle)}</text>
      <rect x="${cardX}" y="${tableTop}" width="${cardWidth}" height="${LAYOUT.tableHeaderHeight}" fill="#ecfdf5"/>
      <line x1="${cardX}" y1="${tableTop + LAYOUT.tableHeaderHeight}" x2="${cardX + cardWidth}" y2="${tableTop + LAYOUT.tableHeaderHeight}" stroke="#d1d5db" stroke-width="1"/>
      ${headerCell("Subject", cols.subject.x, cols.subject.anchor, headerLabelY)}
      ${headerCell("Score", cols.score.x, cols.score.anchor, headerLabelY)}
      ${headerCell("Result", cols.result.x, cols.result.anchor, headerLabelY)}
      ${headerCell("Correct", cols.correct.x, cols.correct.anchor, headerLabelY)}
      ${headerCell("Date", cols.date.x, cols.date.anchor, headerLabelY)}
      ${rows}`;
    })
    .join("");

  const summaryTop = summaryY;
  const summaryLabelY = summaryTop + 34;
  const summaryValueY = summaryTop + 58;
  const summaryBlock = `
  <rect x="${cardX}" y="${summaryTop}" width="${cardWidth}" height="${summaryHeight}" rx="14" fill="#f0fdfa" stroke="#0f766e" stroke-width="2"/>
  <text x="${cardX + 24}" y="${summaryLabelY}" font-family="Georgia, 'Times New Roman', serif" font-size="22" font-weight="700" fill="#0f766e">Total</text>
  ${dataCell(`Subjects: ${totalSubjects}`, cardX + 200, "start", summaryValueY, { fill: "#334155" })}
  ${dataCell(`Average score: ${averageScore}%`, cols.score.x, cols.score.anchor, summaryValueY, { bold: true, fill: "#0f766e" })}
  ${dataCell(`Passed: ${passedCount}/${totalSubjects}`, cols.result.x, cols.result.anchor, summaryValueY, { bold: true, fill: passedCount === totalSubjects ? "#047857" : "#b45309" })}
  ${dataCell(`Correct: ${totalCorrect}/${totalQuestions}`, cols.correct.x, cols.correct.anchor, summaryValueY, { fill: "#475569" })}
  `;

  const logoMarkup = safeLogo
    ? `<clipPath id="logoClip"><circle cx="800" cy="168" r="44"/></clipPath>
       <circle cx="800" cy="168" r="48" fill="#0f766e"/>
       <image href="${safeLogo}" x="756" y="124" width="88" height="88" preserveAspectRatio="xMidYMid meet" clip-path="url(#logoClip)"/>`
    : `<circle cx="800" cy="168" r="48" fill="#0f766e"/>
       <text x="800" y="178" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" fill="#ffffff">${initials}</text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1600" height="${totalHeight}" viewBox="0 0 1600 ${totalHeight}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#f8fafc"/>
      <stop offset="48%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#ecfdf5"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="18" flood-color="#0f172a" flood-opacity="0.1"/>
    </filter>
  </defs>
  <rect width="1600" height="${totalHeight}" fill="#e2e8f0"/>
  <rect x="80" y="60" width="1440" height="${totalHeight - 120}" rx="24" fill="url(#bg)" filter="url(#shadow)"/>
  <rect x="128" y="108" width="1344" height="${totalHeight - 216}" rx="18" fill="none" stroke="#0f766e" stroke-width="4"/>
  <rect x="155" y="135" width="1290" height="${totalHeight - 270}" rx="14" fill="none" stroke="#f59e0b" stroke-width="2" stroke-dasharray="10 12"/>

  ${logoMarkup}
  <text x="800" y="248" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="28" font-weight="700" fill="#0f766e">${safeSite}</text>
  <text x="800" y="292" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="48" font-weight="700" fill="#0f172a">Academic Transcript</text>
  <text x="800" y="328" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="20" fill="#64748b">Diploma examination record for</text>
  <text x="800" y="362" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="32" font-weight="700" fill="#0f766e">${safeStudent}</text>
  <line x1="200" y1="400" x2="1400" y2="400" stroke="#e2e8f0" stroke-width="1"/>

  ${programBlocks}

  ${summaryBlock}

  <text x="800" y="${footerStartY}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="14" fill="#94a3b8">Generated ${generatedAt} · Transcript ID: ${safeId}</text>
  <text x="800" y="${footerStartY + 24}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="13" fill="#94a3b8">${safeSite}</text>
</svg>`;
}
