const config = require('../config.json');

function evaluateJobMatch(job, profile) {
  const title = (job.title || '').toLowerCase();
  const desc = (job.description || '').toLowerCase();
  const fullText = `${title} ${desc}`;

  // 1. Strict Exclusions (Senior / Lead / 3+ Years)
  for (const neg of config.filters.excludeKeywords) {
    const negPattern = new RegExp(`\\b${neg.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i');
    if (negPattern.test(title)) {
      return {
        matched: false,
        score: 0,
        reason: `Disqualified: Title contains senior/lead keyword ('${neg}')`
      };
    }
  }

  // Check for multi-year requirements in text
  const highExpRegex = /\b([3-9]|1[0-9])\+?\s*(years?|yrs?)\s*(of)?\s*(experience|exp)\b/i;
  if (highExpRegex.test(desc)) {
    return {
      matched: false,
      score: 0,
      reason: 'Disqualified: Requires 3+ years experience'
    };
  }

  // 2. Base score for Title match
  let score = 25; // Base entry
  const titleMatches = config.profile.targetRoles.some(role =>
    title.includes(role.toLowerCase())
  );
  if (titleMatches) {
    score += 25;
  }

  // 3. Entry level / Fresher / Internship bonus
  const entryKeywords = config.filters.includeKeywords;
  let hasEntryMarker = false;
  for (const kw of entryKeywords) {
    if (fullText.includes(kw.toLowerCase())) {
      hasEntryMarker = true;
      score += 15;
      break;
    }
  }

  // 4. Skills matching
  const matchedSkills = [];
  const missingSkills = [];
  const candidateSkills = profile.skills || config.profile.skills;

  for (const skill of candidateSkills) {
    const skillRegex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i');
    if (skillRegex.test(fullText)) {
      matchedSkills.push(skill);
      score += 5;
    }
  }

  // Cap score at 100
  score = Math.min(score, 100);

  // Determine if location fits Pan-India
  const loc = (job.location || '').toLowerCase();
  const isIndiaLoc = config.profile.locations.some(l => loc.includes(l.toLowerCase())) ||
                     loc.includes('india') ||
                     loc.includes('remote');

  if (!isIndiaLoc && loc.length > 0) {
    score = Math.max(0, score - 30);
  }

  const isMatched = score >= (config.settings.minMatchScore || 40);

  // Generate tailored highlight reason
  let reason = '';
  if (hasEntryMarker) {
    reason = `Targeted entry-level/fresher role in India matching your 1-year internship. Matched key skills: ${matchedSkills.slice(0, 4).join(', ') || 'Analytics basics'}.`;
  } else {
    reason = `Matches data analytics skill stack (${matchedSkills.slice(0, 4).join(', ')}). Suitable for entry-level with 1 year internship background.`;
  }

  return {
    matched: isMatched,
    score,
    matchedSkills,
    reason,
    isEntryLevelVerified: hasEntryMarker
  };
}

module.exports = { evaluateJobMatch };
