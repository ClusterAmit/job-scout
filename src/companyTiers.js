// Tier Classification for Pan-India Data & Business Analytics Employers
// Tier 1: Global Tech Giants, Tier-1 Investment Banks/GCCs, MBB/Big-4 Analytics, Top Unicorns
// Tier 2: Established Tech Enterprises, Tier-1 IT Services & Analytics Consultancies, Well-Funded Tech
// Tier 3: Legitimate registered tech companies, verified SMBs, and authentic growth startups
// Disqualified: Unverified agencies, certificate mills, spam internship outfits

const TIER_1_COMPANIES = [
  // Big Tech / Global Product
  'google', 'alphabet', 'microsoft', 'amazon', 'meta', 'apple', 'netflix', 'adobe', 'salesforce',
  'oracle', 'cisco', 'sap', 'intel', 'nvidia', 'intuit', 'uber', 'atlassian', 'servicenow',
  'vmware', 'paypal', 'stripe', 'airbnb', 'linkedin', 'snowflake', 'databricks', 'splunk',
  // Top BFSI / GCCs / Investment Banks
  'citi', 'citigroup', 'jpmorgan', 'jp morgan', 'jpmorganchase', 'chase', 'goldman sachs', 'morgan stanley', 'hsbc',
  'barclays', 'wells fargo', 'american express', 'amex', 'bank of america', 'bofa', 'fidelity',
  'ubs', 'deutsche bank', 'bnp paribas', 'mastercard', 'visa', 'blackrock', 'natwest',
  'synchrony', 'standard chartered', 'societe generale', 'dbs', 'bny mellon', 'state street',
  's&p global', 'sp global',
  // Top Management Consulting & Pure-play Analytics
  'mckinsey', 'bcg', 'bcg x', 'boston consulting', 'bain', 'deloitte', 'pwc', 'pricewaterhousecoopers',
  'pwc acceleration center', 'ey', 'ernst & young', 'kpmg', 'zs associates', 'fractal', 'fractal analytics', 'mu sigma',
  'tiger analytics', 'latentview', 'latentview analytics', 'exl', 'exl service', 'genpact',
  'oliver wyman', 'gartner',
  // Top Indian Tech Unicorns
  'flipkart', 'swiggy', 'zomato', 'phonepe', 'razorpay', 'cred', 'meesho', 'zepto',
  'inmobi', 'paytm', 'one97', 'nykaa', 'makemytrip', 'dream11', 'groww', 'zerodha',
  'urban company', 'jio', 'reliance jio'
];

const TIER_2_COMPANIES = [
  // Major IT Services & Consultancies
  'accenture', 'cognizant', 'tcs', 'tata consultancy services', 'infosys', 'wipro',
  'capgemini', 'lti mindtree', 'ltimindtree', 'tech mahindra', 'hcl', 'hcltech', 'hexaware',
  'mphasis', 'birlasoft', 'persistent systems', 'coforge', 'cyient', 'sonata software',
  'brillio', 'happiest minds', 'virtusa', 'ust', 'ust global', 'cgi', 'epam',
  'thoughtworks', 'publicis sapient', 'nagarro',
  // Enterprise GCCs & Tech Brands
  'optum', 'unitedhealth', 'unitedhealth group', 'tricog health', 'highradius', 'trimont',
  'axtria', 'bureau', 'jodo', 'netcracker', 'amdocs', 'nielsen', 'kantar', 'target',
  'target india', 'walmart', 'walmart global tech', 'lowes', "lowe's", 'tesco', 'shell',
  'boeing', 'airbus', 'mercedes-benz', 'bosch', 'siemens', 'philips', 'ge', 'general electric',
  'schneider electric', 'abbott', 'novartis', 'pfizer', 'astrazeneca', 'johnson & johnson',
  'rakuten', 'sony', 'hitachi', 'honeywell', 'dell', 'hp', 'lenovo', 'qualcomm'
];

// Unverified / Fake Internship Mills / Certificate Sellers / Generic Spam Agencies to Disqualify
const DISQUALIFIED_COMPANIES_OR_KEYWORDS = [
  'webs it solution',
  'devryxa',
  'vortenza systems',
  'medi nex',
  'medinex',
  'crossing infotech',
  'data eminence',
  'dexterz technology',
  'thinknovaa',
  'diyo.in',
  'academian',
  'pivotroots'
];

function classifyCompanyTier(companyName, source = '') {
  if (!companyName) {
    return { tier: 'Tier 3', label: 'Tier 3 (Verified SMB)', isDisqualified: false, scoreBonus: 0 };
  }

  const cleanName = companyName.toLowerCase().trim();

  // 1. Check for disqualified scam / fake mills
  for (const spam of DISQUALIFIED_COMPANIES_OR_KEYWORDS) {
    if (cleanName.includes(spam)) {
      return {
        tier: 'Disqualified',
        label: 'Unverified Agency / Spam Mill',
        isDisqualified: true,
        reason: `Disqualified: Company (${companyName}) matches unverified agency/spam mill list.`,
        scoreBonus: 0
      };
    }
  }

  // 2. Check Tier 1
  for (const t1 of TIER_1_COMPANIES) {
    const pattern = new RegExp(`\\b${t1.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(cleanName) || cleanName === t1) {
      return {
        tier: 'Tier 1',
        label: 'Tier 1 (Global Product / Top GCC)',
        badge: '⭐ Tier 1 Company',
        badgeClass: 'tier-1',
        isDisqualified: false,
        scoreBonus: 20
      };
    }
  }

  // 3. Check Tier 2
  for (const t2 of TIER_2_COMPANIES) {
    const pattern = new RegExp(`\\b${t2.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(cleanName) || cleanName === t2) {
      return {
        tier: 'Tier 2',
        label: 'Tier 2 (Enterprise Tech / Top IT)',
        badge: '🏢 Tier 2 Company',
        badgeClass: 'tier-2',
        isDisqualified: false,
        scoreBonus: 10
      };
    }
  }

  // 4. If sourced from Y Combinator or Instahyre, it's a verified tech startup / firm (Tier 2 or Tier 3)
  if (source.includes('Y Combinator')) {
    return {
      tier: 'Tier 2',
      label: 'Tier 2 (YC Backed Startup)',
      badge: '🚀 Tier 2 (YC Startup)',
      badgeClass: 'tier-2',
      isDisqualified: false,
      scoreBonus: 10
    };
  }

  if (source.includes('Instahyre')) {
    return {
      tier: 'Tier 3',
      label: 'Tier 3 (Verified Tech Employer)',
      badge: '🚀 Tier 3 Company',
      badgeClass: 'tier-3',
      isDisqualified: false,
      scoreBonus: 5
    };
  }

  // Default to Tier 3 verified SMB
  return {
    tier: 'Tier 3',
    label: 'Tier 3 (Verified Corporate)',
    badge: '🚀 Tier 3 Company',
    badgeClass: 'tier-3',
    isDisqualified: false,
    scoreBonus: 5
  };
}

module.exports = {
  classifyCompanyTier,
  TIER_1_COMPANIES,
  TIER_2_COMPANIES,
  DISQUALIFIED_COMPANIES_OR_KEYWORDS
};
