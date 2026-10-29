const { parseResume } = require('./src/resumeParser');
const { fetchAllPanIndiaJobs } = require('./src/jobScraper');
const { evaluateJobMatch } = require('./src/matcher');
const { generateCoverLetterAndPitch } = require('./src/coverLetterGenerator');
const { mergeNewJobs } = require('./src/tracker');
const { generateDashboardHtml } = require('./src/dashboard');
const config = require('./config.json');

async function main() {
  console.log('====================================================');
  console.log('🚀 DAILY ENTRY-LEVEL JOB SCOUT: PAN-INDIA (DATA ANALYTICS)');
  console.log('🎯 Profile Target: Entry-Level / 1-Year Internship');
  console.log('📍 Location Scope: Pan-India (BLR, HYD, PUN, NCR, Remote)');
  console.log('====================================================\n');

  // 1. Parse Profile & Resume
  console.log('Step 1: Reading candidate profile...');
  const profile = await parseResume();
  console.log(`Candidate: ${profile.name}`);
  console.log(`Experience: 1-Year Internship in Data Analytics`);
  console.log(`Skills: ${profile.skills.slice(0, 8).join(', ')}...\n`);

  // 2. Fetch Fresh Jobs
  console.log('Step 2: Searching live Pan-India job openings...');
  const rawJobs = await fetchAllPanIndiaJobs();

  // 3. Match & Filter
  console.log('\nStep 3: Scoring & filtering for 0-1 year entry-level criteria...');
  const matchedJobs = [];

  for (const job of rawJobs) {
    const match = evaluateJobMatch(job, profile);
    if (match.matched) {
      const coverLetterData = generateCoverLetterAndPitch(job, profile, match);
      matchedJobs.push({
        ...job,
        score: match.score,
        matchedSkills: match.matchedSkills,
        reason: match.reason,
        isEntryLevelVerified: match.isEntryLevelVerified,
        coverLetterData
      });
    }
  }

  // Sort by match score descending
  matchedJobs.sort((a, b) => b.score - a.score);

  console.log(`\nFiltered down to ${matchedJobs.length} verified entry-level job matches.`);

  // 4. Update Tracker
  console.log('\nStep 4: Updating tracking database...');
  const { tracker, newlyAdded } = mergeNewJobs(matchedJobs);

  // 5. Generate Dashboard
  console.log('\nStep 5: Compiling interactive HTML dashboard & cover letters...');
  const dashboardPath = generateDashboardHtml(matchedJobs, profile);

  // 6. Summary Output
  console.log('\n====================================================');
  console.log(`🎉 SCOUT COMPLETE! Found ${matchedJobs.length} Pan-India Entry-Level Jobs`);
  console.log(`✨ Newly discovered jobs today: ${newlyAdded}`);
  console.log(`📁 Interactive Dashboard: ${dashboardPath}`);
  console.log('====================================================\n');

  const topJobs = matchedJobs.slice(0, 8);
  console.log('--- TOP ENTRY-LEVEL MATCHES TODAY ---');
  topJobs.forEach((job, index) => {
    console.log(`[${index + 1}] ${job.title} @ ${job.company}`);
    console.log(`    Location: ${job.location} | Match: ${job.score}%`);
    console.log(`    Link: ${job.link}`);
    console.log(`    Skills: ${job.matchedSkills.join(', ') || 'Analytics basics'}`);
    console.log('');
  });

  return {
    totalMatches: matchedJobs.length,
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
