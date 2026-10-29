const cheerio = require('cheerio');
const config = require('../config.json');

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
];

function getRandomUserAgent() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

// 1. LINKEDIN INDIA ENTRY-LEVEL / FRESHER SCRAPER
async function scrapeLinkedInJobs(keyword, location = 'India') {
  const jobs = [];
  try {
    const encodedKW = encodeURIComponent(keyword);
    const encodedLoc = encodeURIComponent(location);
    const url = `https://www.linkedin.com/jobs-guest/jobs/api/seeMoreJobPostings/search?keywords=${encodedKW}&location=${encodedLoc}&f_E=1,2&f_TPR=r604800`;

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
      const dateText = card.find('time').text().trim() || 'Recently posted';

      if (title && fullLink) {
        const cleanLink = fullLink.split('?')[0];
        const id = 'li_' + (cleanLink.match(/\d+/) ? cleanLink.match(/\d+/)[0] : Buffer.from(cleanLink).toString('base64').slice(0, 15));

        jobs.push({
          id,
          title,
          company: company || 'Company',
          location: jobLocation || 'Pan-India',
          link: cleanLink,
          datePosted: dateText,
          source: 'LinkedIn (Pan-India Entry Level)',
          description: `${title} at ${company} in ${jobLocation}. Entry-level / Fresher opportunity in India.`
        });
      }
    });
  } catch (err) {
    console.warn(`[LinkedIn Scraper] Error scraping '${keyword}':`, err.message);
  }
  return jobs;
}

// 2. INTERNSHALA FRESHER & ENTRY-LEVEL JOBS (INDIA)
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

      if (title && href && company) {
        const cleanLink = href.startsWith('http') ? href : 'https://internshala.com' + href;
        const id = 'ishala_' + Buffer.from(cleanLink).toString('base64').slice(0, 16);

        jobs.push({
          id,
          title,
          company,
          location,
          link: cleanLink,
          datePosted: 'Active Listing',
          source: sourceLabel,
          description: `${title} at ${company} in ${location}. ${stipendOrSalary ? 'Compensation: ' + stipendOrSalary + '.' : ''} Entry-level opportunity.`
        });
      }
    });
  } catch (err) {
    console.warn(`[Internshala Scraper] Error for ${categoryPath}:`, err.message);
  }
  return jobs;
}

// 3. Y COMBINATOR (STARTUP DATA ROLES)
async function fetchYCombinatorJobs() {
  const jobs = [];
  const queries = ['data analyst', 'business analyst', 'junior data', 'analytics'];
  
  for (const q of queries) {
    try {
      const url = `https://hn.algolia.com/api/v1/search_by_date?tags=job&query=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      
      if (Array.isArray(data.hits)) {
        for (const hit of data.hits) {
          const title = hit.title || '';
          const titleLower = title.toLowerCase();

          // Exclude senior / lead
          if (titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('principal') || titleLower.includes('manager')) {
            continue;
          }

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
            datePosted: hit.created_at ? new Date(hit.created_at).toLocaleDateString() : 'Active',
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

// 4. INSTAHYRE TECH STARTUPS & MNCs (INDIA)
async function fetchInstahyreJobs() {
  const jobs = [];
  try {
    const res = await fetch('https://www.instahyre.com/api/v1/job_search?search=data%20analyst', {
      headers: {
        'User-Agent': getRandomUserAgent(),
        'Accept': 'application/json'
      }
    });

    if (!res.ok) return jobs;
    const data = await res.json();

    if (Array.isArray(data.objects)) {
      for (const item of data.objects) {
        const title = item.title || '';
        const titleLower = title.toLowerCase();

        // Skip senior / lead
        if (titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('principal') || titleLower.includes('architect')) {
          continue;
        }

        const id = 'instahyre_' + item.id;
        const company = (item.employer && item.employer.company_name) ? item.employer.company_name : 'Tech Company';
        const location = item.locations || 'Bengaluru / Pan India';
        const keywords = Array.isArray(item.keywords) ? item.keywords.join(', ') : '';

        jobs.push({
          id,
          title,
          company,
          location,
          link: item.public_url || `https://www.instahyre.com/job-${item.id}/`,
          datePosted: 'Active',
          source: 'Instahyre (India Tech)',
          description: `${title} at ${company} in ${location}. Skills: ${keywords}`
        });
      }
    }
  } catch (err) {
    console.warn('[Instahyre Scraper] Error:', err.message);
  }
  return jobs;
}

// 5. REMOTE DATA FEEDS (JOBICY)
async function fetchJobicyDataJobs() {
  const jobs = [];
  try {
    const res = await fetch('https://jobicy.com/api/v2/remote-jobs?count=15&tag=data');
    if (!res.ok) return jobs;
    const data = await res.json();
    if (Array.isArray(data.jobs)) {
      for (const item of data.jobs) {
        const titleLower = (item.jobTitle || '').toLowerCase();
        const isEntry = titleLower.includes('junior') ||
                        titleLower.includes('intern') ||
                        titleLower.includes('associate') ||
                        titleLower.includes('fresher') ||
                        titleLower.includes('analyst');

        const isSenior = titleLower.includes('senior') || titleLower.includes('lead') || titleLower.includes('principal');

        if (isEntry && !isSenior) {
          jobs.push({
            id: 'jobicy_' + item.id,
            title: item.jobTitle,
            company: item.companyName,
            location: item.jobGeo || 'Remote (Pan India / Global)',
            link: item.url,
            datePosted: item.pubDate ? new Date(item.pubDate).toLocaleDateString() : 'Recent',
            source: 'Jobicy Data Feed',
            description: (item.jobDescription || '').replace(/<[^>]*>?/gm, '').slice(0, 400)
          });
        }
      }
    }
  } catch (err) {
    console.warn('[Jobicy Scraper] Error:', err.message);
  }
  return jobs;
}

// MULTI-SOURCE MASTER SCOUT
async function fetchAllPanIndiaJobs() {
  console.log('[JobScraper] Gathering live jobs across LinkedIn, Internshala, Y Combinator, Instahyre...');
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

  // 1. LinkedIn India
  const searchQueries = [
    'data analyst fresher',
    'junior data analyst',
    'data analyst intern',
    'business intelligence fresher',
    'junior data scientist'
  ];
  for (const query of searchQueries) {
    console.log(`[JobScraper] Searching LinkedIn: "${query}" in India...`);
    const results = await scrapeLinkedInJobs(query, 'India');
    addJobs(results);
    await new Promise(r => setTimeout(r, 400));
  }

  // 2. Internshala
  console.log('[JobScraper] Searching Internshala (Data Analytics Fresher Jobs & Internships)...');
  const ishala1 = await scrapeInternshalaCategory('/jobs/data-analytics-jobs/', 'Internshala (Fresher Jobs)');
  addJobs(ishala1);

  const ishala2 = await scrapeInternshalaCategory('/jobs/business-analytics-jobs/', 'Internshala (Fresher Jobs)');
  addJobs(ishala2);

  const ishala3 = await scrapeInternshalaCategory('/internships/data-analytics-internship/', 'Internshala (Internships)');
  addJobs(ishala3);

  // 3. Y Combinator
  console.log('[JobScraper] Searching Y Combinator (Startup Data Roles)...');
  const ycJobs = await fetchYCombinatorJobs();
  addJobs(ycJobs);

  // 4. Instahyre
  console.log('[JobScraper] Searching Instahyre (India Tech Roles)...');
  const instahyreJobs = await fetchInstahyreJobs();
  addJobs(instahyreJobs);

  // 5. Jobicy Remote
  console.log('[JobScraper] Checking Jobicy Data Feed...');
  const jobicyJobs = await fetchJobicyDataJobs();
  addJobs(jobicyJobs);

  console.log(`[JobScraper] Total verified jobs collected across all platforms: ${allJobs.length}`);
  return allJobs;
}

module.exports = { fetchAllPanIndiaJobs };
