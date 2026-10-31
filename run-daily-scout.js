const { parseResume } = require('./src/resumeParser');
const { fetchAllPanIndiaJobs } = require('./src/jobScraper');
const { evaluateJobMatch } = require('./src/matcher');
const { generateCoverLetterAndPitch } = require('./src/coverLetterGenerator');
const { mergeNewJobs } = require('./src/tracker');
const { generateDashboardHtml } = require('./src/dashboard');
const config = require('./config.json');

async function main() {
  console.log('====================================================');
  console.log('🚀 DAILY ENTRY-LEVEL JOB SCOUT: 24H WINDOW (PAN-INDIA)');
  console.log('🎯 Scope: Full-Time Entry-Level Data & Business Analyst Roles');
  console.log('🚫 Exclusions: Internships, Data Science, Mumbai roles');
  console.log('🏢 Targets: Tier 1 to Tier 3 Companies');
  console.log('====================================================\n');

  // 1. Parse Profile & Resume
  console.log('Step 1: Reading candidate profile...');
  const profile = await parseResume();
  console.log(`Candidate: ${profile.name}`);
  console.log(`Experience: 1-Year Internship in Data & Business Analytics`);
  console.log(`Skills: ${profile.skills.slice(0, 8).join(', ')}...\n`);

  // 2. Fetch Fresh Jobs
  console.log('Step 2: Searching live Pan-India job openings (Past 24 Hours)...');
  const rawJobs = await fetchAllPanIndiaJobs();

  // 3. Match & Filter
  console.log('\nStep 3: Scoring & filtering for 24h, full-time entry criteria, Tier 1-3...');
  const matchedJobs = [];

  for (const job of rawJobs) {
    const match = evaluateJobMatch(job, profile);
    if (match.matched) {
      const coverLetterData = generateCoverLetterAndPitch(job, profile, match);
      matchedJobs.push({
        ...job,
        score: match.score,
        companyTier: match.companyTier || 'Tier 3',
        tierBadge: match.tierBadge || '🚀 Tier 3 Company',
        tierLabel: match.tierLabel || 'Tier 3',
        matchedSkills: match.matchedSkills,
        reason: match.reason,
        isEntryLevelVerified: match.isEntryLevelVerified,
        isStartupEntryVerified: match.isStartupEntryVerified,
        coverLetterData
      });
    }
  }

  // Sort by match score descending
  matchedJobs.sort((a, b) => b.score - a.score);

  console.log(`\nFiltered down to ${matchedJobs.length} verified full-time entry-level matches (24h).`);

  // 4. Update Tracker
  console.log('\nStep 4: Updating tracking database...');
  const { tracker, newlyAdded } = mergeNewJobs(matchedJobs);

  // Mark if already applied in tracker
  const enrichedJobs = matchedJobs.map(j => ({
    ...j,
    status: tracker.jobs[j.id]?.status || 'New',
    isApplied: tracker.jobs[j.id]?.status === 'Applied'
  }));

  // 5. Generate Dashboard
  console.log('\nStep 5: Compiling interactive HTML dashboard & cover letters...');
  const dashboardPath = generateDashboardHtml(enrichedJobs, profile);

  // Sync to root index.html and public/index.html
  const fs = require('fs');
  const path = require('path');
  const publicDir = path.resolve(__dirname, './public');
  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir, { recursive: true });
  fs.copyFileSync(dashboardPath, path.join(publicDir, 'index.html'));
  fs.copyFileSync(dashboardPath, path.resolve(__dirname, './index.html'));

  // 6. Summary Output
  console.log('\n====================================================');
  console.log(`🎉 SCOUT COMPLETE! Found ${enrichedJobs.length} Pan-India 24h Full-Time Jobs`);
  console.log(`✨ Newly discovered jobs today: ${newlyAdded}`);
  console.log(`📁 Interactive Dashboard: ${dashboardPath}`);
  console.log('====================================================\n');

  const topJobs = enrichedJobs.slice(0, 8);
  console.log('--- TOP 24H ENTRY-LEVEL MATCHES (TIER 1-3) ---');
  topJobs.forEach((job, index) => {
    console.log(`[${index + 1}] ${job.title} @ ${job.company} [${job.companyTier}]`);
    console.log(`    Location: ${job.location} | Match: ${job.score}% | Posted: ${job.datePosted}`);
    console.log(`    Link: ${job.link}`);
    console.log(`    Skills: ${job.matchedSkills.join(', ') || 'Analytics basics'}`);
    console.log('');
  });

  return {
    totalMatches: enrichedJobs.length,
    newlyAdded,
    dashboardPath,
    topJobs
  };
}

if (require.main === module) {
  main().catch(err => {
    console.error('Fatal Error during daily scout:', err);
    process.exit(1);
  });
}

module.exports = { runDailyScout: main };
