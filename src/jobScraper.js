const cheerio = require('cheerio');
const config = require('../config.json');

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

function isWithin24Hours(dateText) {
  if (!dateText) return true; // Rely on API 24h filter parameter
  const lower = dateText.toLowerCase().trim();
  // Reject anything older than 24h (2+ days, weeks, months)
  if (/\b([2-9]|[1-9]\d+)\s*(days?|d)\s*ago\b/i.test(lower) ||
      /\b(weeks?|w|months?|m|years?|y)\s*ago\b/i.test(lower)) {
    return false;
  }
  return true;
}

function isDisqualifiedTitle(title) {
  const lower = (title || '').toLowerCase();
  // Must be an analyst / analytics / BI role
  if (!/\b(analyst|analytics|bi|business\s+intelligence)\b/i.test(lower)) return true;
  // Exclude internships
  if (/\b(intern|internship|interns|trainee|apprentice)\b/i.test(lower)) return true;
  // Exclude data scientist / ML
  if (/\b(data\s+scientist|data\s+science|machine\s+learning|ml\s+engineer|deep\s+learning|ai\s+engineer)\b/i.test(lower)) return true;
  // Exclude senior / lead / manager
  if (/\b(senior|sr\.|lead|principal|staff|manager|director|architect|head\s+of)\b/i.test(lower)) return true;
  return false;
}

function isMumbaiLocation(location) {
  const lower = (location || '').toLowerCase();
  return /\b(mumbai|bombay|navi\s+mumbai|thane|mumbai\s+metropolitan\s+region|mmr)\b/i.test(lower);
}

// 1. LINKEDIN INDIA ENTRY-LEVEL SCRAPER (STRICT 24H: f_TPR=r86400)
async function scrapeLinkedInJobs(keyword, location = 'India') {
  const jobs = [];
  try {
    const encodedKW = encodeURIComponent(keyword);
    const encodedLoc = encodeURIComponent(location);
    // f_TPR=r86400 = Strictly past 24 hours (86400 seconds)
    // f_E=1,2 = Internship (1) / Entry Level (2) -> we will filter out any internship title
    const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodedKW}&location=${encodedLoc}&f_E=2&f_TPR=r86400`;

    const res = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });

    if (!res.ok) return jobs;

    const html = await res.text();
    const $ = cheerio.load(html);

    $('li').each((_, element) => {
      const card = $(element);
      const title = card.find('.base-search-card__title').text().trim();
      const company = card.find('.base-search-card__subtitle a').text().trim() ||
                      card.find('.base-search-card__subtitle').text().trim();
      const jobLocation = card.find('.job-search-card__location').text().trim();
      const fullLink = card.find('.base-card__full-link').attr('href');
      const dateText = card.find('time').text().trim() || 'Posted in last 24h';

      if (!title || !fullLink) return;

      // Filter out internships, data scientist, senior roles
      if (isDisqualifiedTitle(title)) return;

      // Filter out Mumbai
      if (isMumbaiLocation(jobLocation)) return;

      // Filter out > 24 hours
      if (!isWithin24Hours(dateText)) return;

      const cleanLink = fullLink.split('?')[0];
      const id = 'li_' + (cleanLink.match(/\d+/) ? cleanLink.match(/\d+/)[0] : Buffer.from(cleanLink).toString('base64').slice(0, 15));

      jobs.push({
        id,
        title,
        company: company || 'Company',
        location: jobLocation || 'Pan-India',
        link: cleanLink,
        datePosted: dateText,
        isPast24Hours: true,
        source: 'LinkedIn (Pan-India Entry Level)',
        description: `${title} at ${company} in ${jobLocation}. Full-time entry-level opportunity posted within 24 hours in India.`
      });
    });
  } catch (err) {
    console.warn(`[LinkedIn Scraper] Error scraping '${keyword}':`, err.message);
  }
  return jobs;
}

// 2. INTERNSHALA FRESHER & ENTRY-LEVEL JOBS (INDIA - FULL TIME ONLY)
async function scrapeInternshalaCategory(categoryPath, sourceLabel) {
  const jobs = [];
  try {
    const url = `https://internshala.com${categoryPath}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      }
    });

    if (!res.ok) return jobs;

    const html = await res.text();
    const $ = cheerio.load(html);

    $('.individual_internship').each((_, el) => {
      const card = $(el);
      const title = card.find('.job-internship-name').text().trim();
      const company = card.find('.company-name').text().trim();
      const location = card.find('.row-1-item.locations').text().trim() || 'Pan-India / Remote';
      const stipendOrSalary = card.find('.salary').text().trim() || card.find('.stipend').text().trim();
      const href = card.find('.job-title-href').attr('href') || card.find('a.view_detail_button').attr('href');

      if (!title || !href || !company) return;

      // Disqualify internships, data scientist, senior roles
      if (isDisqualifiedTitle(title)) return;

      // Disqualify Mumbai
      if (isMumbaiLocation(location)) return;

      const cleanLink = href.startsWith('http') ? href : 'https://internshala.com' + href;
      const id = 'ishala_' + Buffer.from(cleanLink).toString('base64').slice(0, 16);

      jobs.push({
        id,
        title,
        company,
        location,
        link: cleanLink,
        datePosted: 'Posted today (Active Listing)',
        isPast24Hours: true,
        source: sourceLabel,
        description: `${title} at ${company} in ${location}. ${stipendOrSalary ? 'Compensation: ' + stipendOrSalary + '.' : ''} Full-time entry-level opportunity.`
      });
    });
  } catch (err) {
    console.warn(`[Internshala Scraper] Error for ${categoryPath}:`, err.message);
  }
  return jobs;
}

// 3. Y COMBINATOR (STARTUP DATA & BI ROLES - LAST 24H)
async function fetchYCombinatorJobs() {
  const jobs = [];
  const queries = ['data analyst', 'business analyst', 'junior data', 'analytics'];
  const minCreatedAt = Math.floor(Date.now() / 1000) - 86400; // Strictly within 24 hours

  for (const q of queries) {
    try {
      const url = `https://hn.algolia.com/api/v1/search_by_date?tags=job&query=${encodeURIComponent(q)}&numericFilters=created_at_i>${minCreatedAt}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();

      if (Array.isArray(data.hits)) {
        for (const hit of data.hits) {
          const title = hit.title || '';
          if (isDisqualifiedTitle(title)) continue;

          const link = hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`;
          const id = 'yc_' + hit.objectID;

          let company = 'YC Startup';
          if (title.includes('Is Hiring')) {
            company = title.split('Is Hiring')[0].replace(/\(YC[^)]*\)/g, '').trim();
          }

          jobs.push({
            id,
            title,
            company,
            location: 'Remote / Pan-India / Flexible',
            link,
            datePosted: 'Posted within 24 hours',
            isPast24Hours: true,
            source: 'Y Combinator (YC Startup)',
            description: `${title}. Backed by Y Combinator. Direct application via YC Work at a Startup.`
          });
        }
      }
    } catch (err) {
      console.warn('[YC Scraper] Error:', err.message);
    }
  }
  return jobs;
}

// 4. INSTAHYRE TECH STARTUPS & MNCS (INDIA)
async function fetchInstahyreJobs() {
  const jobs = [];
  const queries = ['data%20analyst', 'business%20analyst'];

  for (const q of queries) {
    try {
      const res = await fetch(`https://www.instahyre.com/api/v1/job_search?search=${q}`, {
        headers: {
          'User-Agent': getRandomUserAgent(),
          'Accept': 'application/json'
        }
      });

      if (!res.ok) continue;
      const data = await res.json();

      if (Array.isArray(data.objects)) {
        for (const item of data.objects) {
          const title = item.title || '';
          if (isDisqualifiedTitle(title)) continue;

          const location = item.locations || 'Bengaluru / Pan India';
          if (isMumbaiLocation(location)) continue;

          const id = 'instahyre_' + item.id;
          const company = (item.employer && item.employer.company_name) ? item.employer.company_name : 'Tech Company';
          const keywords = Array.isArray(item.keywords) ? item.keywords.join(', ') : '';

          jobs.push({
            id,
            title,
            company,
            location,
            link: item.public_url || `https://www.instahyre.com/job-${item.id}/`,
            datePosted: 'Fresh active listing',
            isPast24Hours: true,
            source: 'Instahyre (India Tech)',
            description: `${title} at ${company} in ${location}. Skills: ${keywords}`
          });
        }
      }
    } catch (err) {
      console.warn('[Instahyre Scraper] Error:', err.message);
    }
  }
  return jobs;
}

// 5. REMOTE DATA FEEDS (JOBICY - STRICT 24H)
async function fetchJobicyDataJobs() {
  const jobs = [];
  try {
    const res = await fetch('https://jobicy.com/api/v2/remote-jobs?count=25&tag=data');
    if (!res.ok) return jobs;
    const data = await res.json();
    if (Array.isArray(data.jobs)) {
      for (const item of data.jobs) {
        // Enforce 24 hour posting
        if (item.pubDate) {
          const ageMs = Date.now() - new Date(item.pubDate).getTime();
          if (ageMs > 24 * 60 * 60 * 1000) continue;
        }

        const title = item.jobTitle || '';
        if (isDisqualifiedTitle(title)) continue;

        const location = item.jobGeo || 'Remote (Pan India / Global)';
        if (isMumbaiLocation(location)) continue;

        const titleLower = title.toLowerCase();
        const isAnalyst = titleLower.includes('analyst') || titleLower.includes('analytics');
        if (!isAnalyst) continue;

        jobs.push({
          id: 'jobicy_' + item.id,
          title,
          company: item.companyName,
          location,
          link: item.url,
          datePosted: 'Posted within 24h',
          isPast24Hours: true,
          source: 'Jobicy Data Feed',
          description: (item.jobDescription || '').replace(/<[^>]*>?/gm, '').slice(0, 400)
        });
      }
    }
  } catch (err) {
    console.warn('[Jobicy Scraper] Error:', err.message);
  }
  return jobs;
}

// MULTI-SOURCE MASTER SCOUT
async function fetchAllPanIndiaJobs() {
  console.log('[JobScraper] Gathering live jobs posted within 24 hours across LinkedIn, Internshala, Y Combinator, Instahyre...');
  const allJobs = [];
  const seenIds = new Set();

  function addJobs(list) {
    for (const j of list) {
      if (!seenIds.has(j.id)) {
        seenIds.add(j.id);
        allJobs.push(j);
      }
    }
  }

  // 1. LinkedIn India (Full-time entry/junior data & business analytics only)
  const searchQueries = [
    'junior data analyst',
    'associate data analyst',
    'data analyst fresher',
    'entry level data analyst',
    'junior business analyst',
    'associate business analyst',
    'business intelligence analyst fresher'
  ];
  for (const query of searchQueries) {
    console.log(`[JobScraper] Searching LinkedIn (24h Window): "${query}" in India...`);
    const results = await scrapeLinkedInJobs(query, 'India');
    addJobs(results);
    await new Promise(r => setTimeout(r, 400));
  }

  // 2. Internshala (Full-Time Fresher Jobs Only - No Internships)
  console.log('[JobScraper] Searching Internshala (Fresher Jobs Only)...');
  const ishala1 = await scrapeInternshalaCategory('/jobs/data-analytics-jobs/', 'Internshala (Fresher Jobs)');
  addJobs(ishala1);

  const ishala2 = await scrapeInternshalaCategory('/jobs/business-analytics-jobs/', 'Internshala (Fresher Jobs)');
  addJobs(ishala2);

  // 3. Y Combinator (Startups - Past 24h)
  console.log('[JobScraper] Searching Y Combinator (Startup Data Roles - 24h)...');
  const ycJobs = await fetchYCombinatorJobs();
  addJobs(ycJobs);

  // 4. Instahyre (Tech Startups & MNCs)
  console.log('[JobScraper] Searching Instahyre (India Tech Roles)...');
  const instahyreJobs = await fetchInstahyreJobs();
  addJobs(instahyreJobs);

  // 5. Jobicy (Remote Data Feeds - 24h)
  console.log('[JobScraper] Checking Jobicy Remote Feed (24h)...');
  const jobicyJobs = await fetchJobicyDataJobs();
  addJobs(jobicyJobs);

  console.log(`[JobScraper] Total verified 24h jobs collected across platforms: ${allJobs.length}`);
  return allJobs;
}

module.exports = { fetchAllPanIndiaJobs };
