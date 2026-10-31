const config = require('../config.json');
const { classifyCompanyTier } = require('./companyTiers');

function evaluateJobMatch(job, profile) {
  const title = (job.title || '').toLowerCase();
  const desc = (job.description || '').toLowerCase();
  const loc = (job.location || '').toLowerCase();
  const fullText = `${title} ${desc}`;

  // 0. Must be an Analyst / Analytics / BI role
  const isAnalyticsRole = /\b(analyst|analytics|bi|business\s+intelligence)\b/i.test(title);
  if (!isAnalyticsRole) {
    return {
      matched: false,
      score: 0,
      reason: 'Disqualified: Role title is not an analytics or business analysis position'
    };
  }

  // 1. Strict Exclude: Internships (User requirement: Do not post internship jobs)
  const internshipRegex = /\b(intern|internship|interns|trainee|apprentice)\b/i;
  if (internshipRegex.test(title)) {
    return {
      matched: false,
      score: 0,
      reason: 'Disqualified: Internship/Trainee role (Targeting full-time entry-level / junior / associate roles only)'
    };
  }

  // 2. Strict Exclude: Data Scientist jobs (User requirement: Exclude Data scientist jobs)
  const dataScientistRegex = /\b(data\s+scientist|data\s+science|machine\s+learning|ml\s+engineer|deep\s+learning|ai\s+engineer|computer\s+vision|nlp\s+engineer)\b/i;
  if (dataScientistRegex.test(title)) {
    return {
      matched: false,
      score: 0,
      reason: 'Disqualified: Data Scientist / ML role (Focusing on Data Analytics & Business Analytics)'
    };
  }

  // 3. Strict Exclude: Mumbai (User requirement: Exclude jobs from Mumbai)
  const mumbaiRegex = /\b(mumbai|bombay|navi\s+mumbai|thane|mumbai\s+metropolitan\s+region|mmr)\b/i;
  if (mumbaiRegex.test(loc)) {
    return {
      matched: false,
      score: 0,
      reason: 'Disqualified: Location is Mumbai / MMR'
    };
  }

  // 4. Strict Exclude: 24h Timeframe check
  if (job.isPast24Hours === false) {
    return {
      matched: false,
      score: 0,
      reason: `Disqualified: Posted outside 24h window (${job.datePosted || 'Older'})`
    };
  }

  // 5. Strict Exclusions (Senior / Lead / 3+ Years)
  for (const neg of (config.filters.excludeKeywords || [])) {
    const negPattern = new RegExp(`\\b${neg.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i');
    if (negPattern.test(title)) {
      return {
        matched: false,
        score: 0,
        reason: `Disqualified: Title contains excluded keyword ('${neg}')`
      };
    }
  }

  // Check for multi-year requirements in text (3+ years)
  const highExpRegex = /\b([3-9]|1[0-9])\+?\s*(years?|yrs?)\s*(of)?\s*(experience|exp)\b/i;
  if (highExpRegex.test(desc)) {
    return {
      matched: false,
      score: 0,
      reason: 'Disqualified: Requires 3+ years experience'
    };
  }

  // 6. Company Tier Classification & Spam/Scam Mill Disqualification (Tier 1 to Tier 3 target)
  const tierInfo = classifyCompanyTier(job.company, job.source || '');
  if (tierInfo.isDisqualified) {
    return {
      matched: false,
      score: 0,
      reason: tierInfo.reason || 'Disqualified: Unverified company / recruitment spam mill'
    };
  }

  // 7. Base score for Title match (Data Analyst / Business Analyst roles)
  let score = 25;
  const titleMatches = config.profile.targetRoles.some(role =>
    title.includes(role.toLowerCase())
  );
  if (titleMatches) {
    score += 25;
  }

  // 8. Entry level / Fresher / Junior / Associate bonus
  const entryKeywords = config.filters.includeKeywords || [];
  let hasEntryMarker = false;
  for (const kw of entryKeywords) {
    if (fullText.includes(kw.toLowerCase())) {
      hasEntryMarker = true;
      score += 15;
      break;
    }
  }

  // 9. Skills matching with Amit's Profile
  const matchedSkills = [];
  const candidateSkills = profile.skills || config.profile.skills || [];

  for (const skill of candidateSkills) {
    const skillRegex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i');
    if (skillRegex.test(fullText)) {
      matchedSkills.push(skill);
      score += 5;
    }
  }

  // 10. Tier Bonus (Tier 1: +20, Tier 2: +10, Tier 3: +5)
  score += (tierInfo.scoreBonus || 0);

  // Cap score at 100
  score = Math.min(score, 100);

  // Location check for remaining Pan-India hubs
  const isIndiaLoc = config.profile.locations.some(l => loc.includes(l.toLowerCase())) ||
                     loc.includes('india') ||
                     loc.includes('remote');

  if (!isIndiaLoc && loc.length > 0) {
    score = Math.max(0, score - 30);
  }

  const isMatched = score >= (config.settings.minMatchScore || 40);

  // Generate tailored highlight reason
  let reason = '';
  if (tierInfo.tier === 'Tier 1' || tierInfo.tier === 'Tier 2') {
    reason = `[${tierInfo.tier}] Verified opportunity at ${job.company}. Matches your 1-year internship in ${matchedSkills.slice(0, 3).join(', ') || 'Analytics'}.`;
  } else if (hasEntryMarker) {
    reason = `[${tierInfo.tier}] Targeted entry-level role matching your 1-year internship profile. Matched skills: ${matchedSkills.slice(0, 4).join(', ') || 'Analytics basics'}.`;
  } else {
    reason = `[${tierInfo.tier}] Matches data & business analytics stack (${matchedSkills.slice(0, 4).join(', ')}). Full-time role suitable for 0-1 year experience.`;
  }

  return {
    matched: isMatched,
    score,
    matchedSkills,
    reason,
    isEntryLevelVerified: hasEntryMarker,
    companyTier: tierInfo.tier,
    tierBadge: tierInfo.badge,
    tierLabel: tierInfo.label
  };
}

module.exports = { evaluateJobMatch };
