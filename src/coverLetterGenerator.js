function generateCoverLetterAndPitch(job, profile, matchResult) {
  const candidateName = profile.name || 'Amit Kumar Saini';
  const roleTitle = job.title;
  const companyName = job.company;
  const matchedSkillsList = (matchResult.matchedSkills && matchResult.matchedSkills.length > 0)
    ? matchResult.matchedSkills.join(', ')
    : 'SQL (CTEs, Window functions), Power BI (DAX), Tableau, and Advanced Excel';

  // 1. Full Tailored Cover Letter
  const coverLetter = `Dear Hiring Team at ${companyName},

I am writing to express my strong enthusiasm for the ${roleTitle} opportunity at ${companyName}. As a data-driven professional with 1 year of hands-on internship experience at Ai Variant (Bengaluru), I specialize in translating complex business processes into actionable dashboards and analytical solutions.

During my 1-year internship, I delivered measurable results across business intelligence and data operations:
• Built and deployed 12+ interactive Power BI and Tableau dashboards, reducing manual reporting cycles by 40%.
• Wrote optimized MySQL queries (leveraging CTEs, joins, and window functions) across 50,000+ transactional records, boosting data validation accuracy by 25%.
• Spearheaded requirement gathering sessions, authored comprehensive BRDs/FRDs, and guided User Acceptance Testing (UAT) cycles in Agile sprints.
• Conducted exploratory data analysis (EDA) using Python (Pandas, NumPy) and Advanced Excel (Pivot Tables, XLOOKUP).

Your ${roleTitle} opening aligns perfectly with my background in ${matchedSkillsList}. Having completed end-to-end projects in financial risk monitoring, healthcare analytics, and retail intelligence, I can ramp up quickly and contribute from day one. I am currently based in Bengaluru, fully open to Pan-India opportunities (On-site, Hybrid, or Remote), and available to join immediately.

Thank you for your time and consideration. I would love the opportunity to discuss how my analytical skills and dedication can support ${companyName}'s growth.

Warm regards,

${candidateName}
Phone: ${profile.phone || '+91 7903838926'}
Email: ${profile.email || 'clusterdistracted@gmail.com'}
LinkedIn: ${profile.linkedin || 'https://linkedin.com/in/amitsaini-business-analyst/'}
GitHub: ${profile.github || 'https://github.com/ClusterAmit'}
`;

  // 2. Short 2-3 sentence Recruiter / LinkedIn Pitch
  const shortPitch = `Hi Hiring Team, I came across your opening for ${roleTitle} at ${companyName}. I have 1 year of hands-on internship experience in data & business analytics (Ai Variant), where I built 12+ Power BI/Tableau dashboards and wrote optimized MySQL/Python queries. I am based in India, open to Pan-India/Hybrid/Remote setups, and available to join immediately. Would love to connect!`;

  // 3. Common Screening Questions Answers
  const screeningAnswers = {
    "Total Experience": "1 Year (Hands-on Business & Data Analytics Internship at Ai Variant)",
    "Notice Period": "Immediate / 0 Days (Ready to join immediately)",
    "Current Location & Mobility": "Bengaluru, Karnataka (Flexible for Pan-India relocation / Hybrid / Remote)",
    "Primary Technical Skills": "SQL (MySQL, CTEs, Window Functions), Power BI (DAX), Tableau, Advanced Excel (XLOOKUP, Pivot Tables), Python (Pandas, NumPy)",
    "Why should we hire you?": "During my 1-year internship, I didn't just study data—I automated reports, authored BRD/FRD documents, and improved reporting accuracy by 25%. I bring practical, production-level SQL and dashboarding skills with a relentless desire to learn and deliver."
  };

  return {
    coverLetter,
    shortPitch,
    screeningAnswers
  };
}

module.exports = { generateCoverLetterAndPitch };
