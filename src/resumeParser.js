const fs = require('fs');
const path = require('path');

async function parseResume() {
  const resumeDir = path.resolve(__dirname, '../resume');
  const files = fs.existsSync(resumeDir) ? fs.readdirSync(resumeDir) : [];

  let extractedText = '';
  let resumeFile = null;

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (ext === '.pdf') {
      try {
        const { PDFParse } = require('pdf-parse');
        const buffer = fs.readFileSync(path.join(resumeDir, file));
        const uint8 = new Uint8Array(buffer);
        const parser = new PDFParse(uint8);
        const res = await parser.getText();
        extractedText = typeof res === 'string' ? res : (res.text || '');
        resumeFile = file;
        console.log(`[ResumeParser] Successfully parsed PDF resume: ${file}`);
        break;
      } catch (err) {
        console.warn(`[ResumeParser] Could not parse PDF ${file}:`, err.message);
      }
    } else if (ext === '.txt' || ext === '.md') {
      extractedText = fs.readFileSync(path.join(resumeDir, file), 'utf-8');
      resumeFile = file;
      console.log(`[ResumeParser] Loaded text resume: ${file}`);
      break;
    }
  }

  // Parse key fields from text if present
  let name = 'Amit Kumar Saini';
  let email = 'clusterdistracted@gmail.com';
  let phone = '+91 7903838926';
  let linkedin = 'https://linkedin.com/in/amitsaini-business-analyst/';
  let github = 'https://github.com/ClusterAmit';
  let currentLocation = 'Bengaluru, Karnataka, India (Open to Pan India / Hybrid / Remote)';

  if (extractedText) {
    const emailMatch = extractedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    if (emailMatch) email = emailMatch[0];

    const phoneMatch = extractedText.match(/(\+91[\s-]?)?[6-9]\d{9}/);
    if (phoneMatch) phone = phoneMatch[0];

    const linkedinMatch = extractedText.match(/linkedin\.com\/in\/[a-zA-Z0-9_-]+/);
    if (linkedinMatch) linkedin = 'https://' + linkedinMatch[0];

    const githubMatch = extractedText.match(/github\.com\/[a-zA-Z0-9_-]+/);
    if (githubMatch) github = 'https://' + githubMatch[0];

    const lines = extractedText.split('\n').map(l => l.trim()).filter(Boolean);
    if (lines.length > 0 && lines[0].length < 40 && !lines[0].toLowerCase().includes('resume')) {
      name = lines[0];
    }
  }

  const knownSkills = [
    'SQL', 'MySQL', 'PostgreSQL', 'Python', 'Excel', 'Advanced Excel', 'Power BI', 'Tableau',
    'Pandas', 'NumPy', 'EDA', 'Data Cleaning', 'Data Visualization', 'DAX', 'CTEs', 'Window Functions',
    'Business Analysis', 'BRD', 'FRD', 'UAT', 'Agile', 'Scrum', 'Stakeholder Management',
    'KPI Development', 'Requirements Gathering', 'Process Modeling', 'ETL'
  ];

  const foundSkills = new Set();
  const textUpper = extractedText.toUpperCase();
  for (const skill of knownSkills) {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(textUpper)) {
      foundSkills.add(skill);
    }
  }

  // Ensure core skills are present
  ['SQL', 'Power BI', 'Excel', 'Python', 'Tableau', 'Business Analysis'].forEach(s => foundSkills.add(s));

  return {
    hasCustomResumeFile: Boolean(resumeFile),
    resumeFileName: resumeFile,
    name,
    email,
    phone,
    linkedin,
    github,
    currentLocation,
    experienceYears: 1, // 1 year internship at Ai Variant
    experienceSummary: 'Business & Data Analyst with 1 year of hands-on internship experience in SQL (joins, CTEs, window functions), Power BI (DAX, data modeling), Tableau, Advanced Excel, and Python (Pandas/NumPy for EDA). Proven experience authoring BRDs/FRDs and delivering executive dashboards.',
    experienceDetails: [
      {
        company: 'Ai Variant',
        role: 'Business Analyst Intern',
        duration: 'June 2025 - June 2026 (1 Year)',
        location: 'Bengaluru, Karnataka',
        highlights: [
          'Developed and deployed 12+ interactive Power BI and Tableau dashboards, automating legacy reporting and cutting manual tracking by 40%.',
          'Wrote optimized MySQL queries (CTEs, joins, window functions) to analyze over 50,000 transaction records, boosting accuracy by 25%.',
          'Facilitated requirements workshops, authored BRD/FRD documentation, and led UAT testing cycles.'
        ]
      }
    ],
    projects: [
      'Financial Risk & Bank Loan Portfolio Analysis (Power BI, Tableau, MySQL)',
      'Healthcare Operational Analysis & BI Reporting (Tableau, SQL)',
      'Retail & Food-Tech Market Intelligence Analysis (Power BI, SQL, Excel)'
    ],
    skills: Array.from(foundSkills),
    rawText: extractedText || ''
  };
}

module.exports = { parseResume };
