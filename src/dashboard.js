const fs = require('fs');
const path = require('path');

function generateDashboardHtml(allJobsList, profile) {
  const outputDir = path.resolve(__dirname, '../output');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Also create cover_letters dir
  const lettersDir = path.join(outputDir, 'cover_letters');
  if (!fs.existsSync(lettersDir)) {
    fs.mkdirSync(lettersDir, { recursive: true });
  }

  // Save individual text cover letters
  for (const job of allJobsList) {
    if (job.coverLetterData) {
      const filename = `${(job.company || 'Company').replace(/[^a-zA-Z0-9]/g, '_')}_${(job.title || 'Role').replace(/[^a-zA-Z0-9]/g, '_')}.txt`.slice(0, 80) + '.txt';
      const fileContent = `JOB: ${job.title} at ${job.company} (${job.location})\nLINK: ${job.link}\nMATCH SCORE: ${job.score}%\nSOURCE: ${job.source}\n\n--- COVER LETTER ---\n${job.coverLetterData.coverLetter}\n\n--- RECRUITER PITCH ---\n${job.coverLetterData.shortPitch}\n\n--- SCREENING ANSWERS ---\n${JSON.stringify(job.coverLetterData.screeningAnswers, null, 2)}`;
      fs.writeFileSync(path.join(lettersDir, filename), fileContent, 'utf-8');
    }
  }

  const jobsJson = JSON.stringify(allJobsList).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

  const now = new Date();
  const dateFormatted = now.toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short', year: 'numeric' });
  const timeFormatted = now.toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
  const lastUpdatedStr = `${dateFormatted} at ${timeFormatted} IST`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pan-India Entry Level Job Scout | Amit Kumar Saini</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #0f172a;
      --card-bg: #1e293b;
      --card-hover: #283548;
      --text: #f8fafc;
      --text-muted: #94a3b8;
      --primary: #38bdf8;
      --primary-hover: #0ea5e9;
      --success: #34d399;
      --warning: #fbbf24;
      --border: #334155;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
    body { background-color: var(--bg); color: var(--text); padding: 24px; }
    .container { max-width: 1200px; margin: 0 auto; }
    
    header {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid var(--border);
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
    }
    .badge-pill {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-fresher { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); }
    .badge-location { background: rgba(52, 211, 153, 0.15); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.3); margin-left: 8px; }
    .badge-user { background: rgba(168, 85, 247, 0.15); color: #c084fc; border: 1px solid rgba(168, 85, 247, 0.3); margin-left: 8px; }
    .badge-date { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); margin-left: 8px; }

    h1 { font-size: 1.8rem; font-weight: 700; margin: 12px 0 6px 0; color: #fff; }
    p.subtitle { color: var(--text-muted); font-size: 0.95rem; }

    .launchers-card {
      background: rgba(30, 41, 59, 0.7);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 18px 20px;
      margin-bottom: 20px;
    }
    .launchers-title {
      font-size: 0.85rem;
      font-weight: 700;
      color: #38bdf8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 12px;
    }
    .launchers-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .launcher-btn {
      padding: 8px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;
    }
    .cafe-btn { background: #b45309; color: #fff; }
    .wttj-btn { background: #059669; color: #fff; }
    .yc-btn { background: #ea580c; color: #fff; }
    .naukri-btn { background: #004c8f; color: #fff; }
    .indeed-btn { background: #2164f3; color: #fff; }
    .internshala-btn { background: #1295c9; color: #fff; }
    .launcher-btn:hover { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.3); }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 16px;
      margin: 20px 0 8px 0;
    }
    .stat-card {
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 14px 18px;
    }
    .stat-card .label { font-size: 0.8rem; color: var(--text-muted); }
    .stat-card .val { font-size: 1.5rem; font-weight: 700; color: #fff; margin-top: 4px; }

    .controls-bar {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 20px;
    }
    .search-row {
      display: flex;
      gap: 12px;
    }
    .search-input {
      flex: 1;
      background: var(--card-bg);
      border: 1px solid var(--border);
      padding: 10px 16px;
      border-radius: 10px;
      color: #fff;
      font-size: 0.95rem;
    }
    .search-input:focus { outline: none; border-color: var(--primary); }

    .filters-row {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      align-items: center;
    }
    .filter-label { font-size: 0.8rem; color: var(--text-muted); margin-right: 4px; }
    .filter-btn {
      background: var(--card-bg);
      border: 1px solid var(--border);
      color: var(--text-muted);
      padding: 6px 14px;
      border-radius: 8px;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-btn.active, .filter-btn:hover {
      background: var(--primary);
      color: #0f172a;
      font-weight: 600;
      border-color: var(--primary);
    }

    .jobs-grid {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .job-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 20px;
      transition: all 0.2s;
      position: relative;
    }
    .job-card:hover {
      border-color: #475569;
      background: var(--card-hover);
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
    }

    .job-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 16px;
    }
    .job-title { font-size: 1.2rem; font-weight: 600; color: #fff; }
    .job-company { color: var(--primary); font-weight: 500; font-size: 0.95rem; margin-top: 2px; }
    .job-location { color: var(--text-muted); font-size: 0.85rem; margin-top: 4px; display: flex; align-items: center; gap: 6px; }
    
    .source-badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 4px;
      font-size: 0.72rem;
      background: rgba(51, 65, 85, 0.7);
      color: #cbd5e1;
      border: 1px solid #475569;
      margin-left: 6px;
      font-weight: 500;
    }

    .score-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      min-width: 68px;
      height: 68px;
      border-radius: 12px;
      font-weight: 700;
      border: 1px solid transparent;
    }
    .score-high { background: rgba(52, 211, 153, 0.15); color: #34d399; border-color: rgba(52, 211, 153, 0.4); }
    .score-med { background: rgba(56, 189, 248, 0.15); color: #38bdf8; border-color: rgba(56, 189, 248, 0.4); }
    .score-fair { background: rgba(251, 191, 36, 0.15); color: #fbbf24; border-color: rgba(251, 191, 36, 0.4); }
    .score-badge .num { font-size: 1.3rem; line-height: 1; }
    .score-badge .lbl { font-size: 0.65rem; text-transform: uppercase; margin-top: 2px; }

    .match-reason {
      margin: 12px 0;
      padding: 10px 14px;
      border-radius: 8px;
      background: rgba(15, 23, 42, 0.7);
      border-left: 3px solid var(--primary);
      font-size: 0.88rem;
      color: #cbd5e1;
    }

    .skills-row {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin: 12px 0 16px 0;
    }
    .skill-tag {
      background: rgba(51, 65, 85, 0.8);
      color: #e2e8f0;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .card-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      align-items: center;
      padding-top: 14px;
      border-top: 1px solid rgba(51, 65, 85, 0.5);
    }
    .btn {
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      transition: all 0.15s ease-in-out;
      border: none;
    }
    .btn-primary { background: var(--primary); color: #0f172a; }
    .btn-primary:hover { background: var(--primary-hover); }
    
    .btn-secondary { background: #334155; color: #f1f5f9; }
    .btn-secondary:hover { background: #475569; }

    .btn-outline { background: transparent; border: 1px solid var(--border); color: #cbd5e1; }
    .btn-outline:hover { background: #1e293b; border-color: #64748b; }

    .toast {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #10b981;
      color: #fff;
      padding: 12px 20px;
      border-radius: 8px;
      font-weight: 600;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      display: none;
      z-index: 1000;
    }

    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.75);
      backdrop-filter: blur(4px);
      display: none;
      justify-content: center;
      align-items: center;
      z-index: 999;
      padding: 20px;
    }
    .modal-content {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 16px;
      width: 100%;
      max-width: 700px;
      max-height: 85vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    }
    .modal-header {
      padding: 18px 24px;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .modal-body {
      padding: 20px 24px;
      overflow-y: auto;
      font-size: 0.9rem;
      line-height: 1.6;
      white-space: pre-wrap;
      color: #e2e8f0;
      background: #111827;
      margin: 16px 24px;
      border-radius: 8px;
      border: 1px solid #374151;
    }
    .modal-footer {
      padding: 16px 24px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: flex-end;
      gap: 12px;
    }
    .close-btn {
      background: transparent;
      border: none;
      color: var(--text-muted);
      font-size: 1.5rem;
      cursor: pointer;
    }
  </style>
</head>
<body>

<div class="container">
  <header>
    <div>
      <span class="badge-pill badge-fresher">🎯 Entry Level Only (1-Year Internship Profile)</span>
      <span class="badge-pill badge-location">📍 Pan-India Search Active</span>
      <span class="badge-pill badge-user">👤 Amit Kumar Saini (Ai Variant)</span>
      <span class="badge-pill badge-date">🕒 Updated: ${lastUpdatedStr}</span>
    </div>
    <h1>Pan-India Entry Level Data Analytics Job Scout</h1>
    <p class="subtitle">Multi-platform automated engine scouting entry-level data & BI roles across LinkedIn, Internshala, Y Combinator, Instahyre, HiringCafe, Welcome to the Jungle, and Naukri. <span style="color: #38bdf8; font-weight: 500;">Last scouted: ${lastUpdatedStr}</span></p>
    
    <div class="stats-grid">
      <div class="stat-card">
        <div class="label">Total Pan-India Matches</div>
        <div class="val" id="totalJobsVal">0</div>
      </div>
      <div class="stat-card">
        <div class="label">High Match (70%+)</div>
        <div class="val" id="highScoreVal">0</div>
      </div>
      <div class="stat-card">
        <div class="label">Top Locations</div>
        <div class="val" style="font-size: 1.1rem; font-weight: 500; color: #38bdf8;">BLR, HYD, PUN, NCR, Remote</div>
      </div>
      <div class="stat-card">
        <div class="label">Candidate Background</div>
        <div class="val" style="font-size: 1.1rem; font-weight: 500; color: #34d399;">1-Year Internship (Ai Variant)</div>
      </div>
    </div>
  </header>

  <!-- 1-Click Platform Launchers -->
  <div class="launchers-card">
    <div class="launchers-title">⚡ 1-Click Quick Portals Pre-Filtered for Entry Level / Freshers</div>
    <div class="launchers-grid">
      <a href="https://hiring.cafe/?searchState=%7B%22searchQuery%22%3A%22Data+Analyst%22%7D" target="_blank" rel="noopener" class="launcher-btn cafe-btn">
        ☕ HiringCafe (Data Analyst)
      </a>
      <a href="https://www.welcometothejungle.com/en/jobs?query=data%20analyst" target="_blank" rel="noopener" class="launcher-btn wttj-btn">
        🌴 Welcome to the Jungle
      </a>
      <a href="https://www.workatastartup.com/jobs?roles=data_analyst" target="_blank" rel="noopener" class="launcher-btn yc-btn">
        🚀 Y Combinator (Startups)
      </a>
      <a href="https://www.naukri.com/data-analyst-jobs-in-india?experience=0" target="_blank" rel="noopener" class="launcher-btn naukri-btn">
        🔍 Naukri (0 Exp Pan-India)
      </a>
      <a href="https://in.indeed.com/jobs?q=data+analyst&l=India&explvl=entry_level" target="_blank" rel="noopener" class="launcher-btn indeed-btn">
        🔍 Indeed India (Entry Level)
      </a>
      <a href="https://internshala.com/jobs/data-analytics-jobs/" target="_blank" rel="noopener" class="launcher-btn internshala-btn">
        🔍 Internshala (Fresher Analytics)
      </a>
    </div>
  </div>

  <div class="controls-bar">
    <div class="search-row">
      <input type="text" id="searchInput" class="search-input" placeholder="Search by company, role title, or skills..." oninput="filterJobs()">
    </div>
    
    <div class="filters-row">
      <span class="filter-label">City:</span>
      <button class="filter-btn active city-btn" onclick="setCityFilter('all')">All Pan India</button>
      <button class="filter-btn city-btn" onclick="setCityFilter('Bengaluru')">Bengaluru</button>
      <button class="filter-btn city-btn" onclick="setCityFilter('Hyderabad')">Hyderabad</button>
      <button class="filter-btn city-btn" onclick="setCityFilter('Pune')">Pune</button>
      <button class="filter-btn city-btn" onclick="setCityFilter('Mumbai')">Mumbai</button>
      <button class="filter-btn city-btn" onclick="setCityFilter('Delhi')">Delhi / NCR</button>
      <button class="filter-btn city-btn" onclick="setCityFilter('Remote')">Remote</button>
    </div>

    <div class="filters-row">
      <span class="filter-label">Platform:</span>
      <button class="filter-btn active source-btn" onclick="setSourceFilter('all')">All Platforms</button>
      <button class="filter-btn source-btn" onclick="setSourceFilter('LinkedIn')">LinkedIn</button>
      <button class="filter-btn source-btn" onclick="setSourceFilter('Internshala')">Internshala</button>
      <button class="filter-btn source-btn" onclick="setSourceFilter('Y Combinator')">Y Combinator</button>
      <button class="filter-btn source-btn" onclick="setSourceFilter('Instahyre')">Instahyre</button>
    </div>
  </div>

  <div class="jobs-grid" id="jobsContainer">
    <!-- Populated by JS -->
  </div>
</div>

<!-- Modal -->
<div class="modal-overlay" id="coverModal">
  <div class="modal-content">
    <div class="modal-header">
      <h3 id="modalTitle">Tailored Application Material</h3>
      <button class="close-btn" onclick="closeModal()">&times;</button>
    </div>
    <div class="modal-body" id="modalText"></div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="closeModal()">Close</button>
      <button class="btn btn-primary" onclick="copyModalContent()">📋 Copy to Clipboard</button>
    </div>
  </div>
</div>

<div class="toast" id="toastMsg">Copied to clipboard!</div>

<script>
  const rawJobs = ${jobsJson};
  let currentCity = 'all';
  let currentSource = 'all';

  function init() {
    document.getElementById('totalJobsVal').innerText = rawJobs.length;
    document.getElementById('highScoreVal').innerText = rawJobs.filter(j => j.score >= 70).length;
    renderJobs(rawJobs);
  }

  function setCityFilter(city) {
    currentCity = city;
    document.querySelectorAll('.city-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    filterJobs();
  }

  function setSourceFilter(source) {
    currentSource = source;
    document.querySelectorAll('.source-btn').forEach(b => b.classList.remove('active'));
    event.target.classList.add('active');
    filterJobs();
  }

  function filterJobs() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const filtered = rawJobs.filter(job => {
      const matchCity = (currentCity === 'all') ||
        (job.location.toLowerCase().includes(currentCity.toLowerCase())) ||
        (currentCity === 'Delhi' && (job.location.toLowerCase().includes('noida') || job.location.toLowerCase().includes('gurugram') || job.location.toLowerCase().includes('gurgaon')));
      
      const matchSource = (currentSource === 'all') ||
        ((job.source || '').toLowerCase().includes(currentSource.toLowerCase()));

      const matchSearch = job.title.toLowerCase().includes(q) ||
        job.company.toLowerCase().includes(q) ||
        (job.matchedSkills && job.matchedSkills.some(s => s.toLowerCase().includes(q))) ||
        job.location.toLowerCase().includes(q);

      return matchCity && matchSource && matchSearch;
    });

    renderJobs(filtered);
  }

  function renderJobs(jobs) {
    const container = document.getElementById('jobsContainer');
    if (!jobs || jobs.length === 0) {
      container.innerHTML = '<div style="text-align:center; padding: 40px; color: #94a3b8;">No matching entry-level jobs found for this filter.</div>';
      return;
    }

    container.innerHTML = jobs.map((job, idx) => {
      const scoreClass = job.score >= 75 ? 'score-high' : (job.score >= 55 ? 'score-med' : 'score-fair');
      const skillsHtml = (job.matchedSkills || []).map(s => '<span class="skill-tag">' + s + '</span>').join('');
      const applied = localStorage.getItem('applied_' + job.id) === 'true';

      return \`
        <div class="job-card" id="card_\${job.id}">
          <div class="job-header">
            <div>
              <div class="job-title">\${job.title}</div>
              <div class="job-company">\${job.company}</div>
              <div class="job-location">
                📍 \${job.location} • 📅 \${job.datePosted || 'Recently posted'}
                <span class="source-badge">\${job.source}</span>
              </div>
            </div>
            <div class="score-badge \${scoreClass}">
              <span class="num">\${job.score}%</span>
              <span class="lbl">Match</span>
            </div>
          </div>

          <div class="match-reason">\${job.reason || 'Entry-level analytics role matching your 1-year internship profile.'}</div>

          <div class="skills-row">
            \${skillsHtml || '<span class="skill-tag">SQL</span><span class="skill-tag">Python</span><span class="skill-tag">Excel</span><span class="skill-tag">Power BI</span>'}
          </div>

          <div class="card-actions">
            <a href="\${job.link}" target="_blank" rel="noopener" class="btn btn-primary">
              ⚡ Apply Now
            </a>
            <button class="btn btn-secondary" onclick="copyShortPitch(\${idx})">
              💬 Copy Recruiter Pitch
            </button>
            <button class="btn btn-outline" onclick="openCoverModal(\${idx})">
              📄 View Tailored Cover Letter
            </button>
            <button class="btn btn-outline" onclick="openScreeningModal(\${idx})">
              💡 Screening Q&A
            </button>
            <button class="btn btn-outline" style="\${applied ? 'background: #065f46; color: #34d399; border-color: #059669;' : ''}" onclick="toggleApplied('\${job.id}', this)">
              \${applied ? '✅ Applied' : 'Mark Applied'}
            </button>
          </div>
        </div>
      \`;
    }).join('');
  }

  function toggleApplied(jobId, btn) {
    const isApplied = localStorage.getItem('applied_' + jobId) === 'true';
    if (isApplied) {
      localStorage.removeItem('applied_' + jobId);
      btn.innerText = 'Mark Applied';
      btn.style.background = 'transparent';
      btn.style.color = '#cbd5e1';
      btn.style.borderColor = 'var(--border)';
    } else {
      localStorage.setItem('applied_' + jobId, 'true');
      btn.innerText = '✅ Applied';
      btn.style.background = '#065f46';
      btn.style.color = '#34d399';
      btn.style.borderColor = '#059669';
      showToast('Marked as applied! Good luck!');
    }
  }

  function copyShortPitch(idx) {
    const job = rawJobs[idx];
    if (job && job.coverLetterData) {
      navigator.clipboard.writeText(job.coverLetterData.shortPitch);
      showToast('Copied Recruiter Pitch to clipboard!');
    }
  }

  function openCoverModal(idx) {
    const job = rawJobs[idx];
    if (!job || !job.coverLetterData) return;
    document.getElementById('modalTitle').innerText = 'Cover Letter for ' + job.company + ' - ' + job.title;
    document.getElementById('modalText').innerText = job.coverLetterData.coverLetter;
    document.getElementById('coverModal').style.display = 'flex';
  }

  function openScreeningModal(idx) {
    const job = rawJobs[idx];
    if (!job || !job.coverLetterData) return;
    document.getElementById('modalTitle').innerText = 'Instant Screening Answers (' + job.company + ')';
    const answers = job.coverLetterData.screeningAnswers;
    let txt = '';
    for (const [q, a] of Object.entries(answers)) {
      txt += 'Q: ' + q + '\\nA: ' + a + '\\n\\n';
    }
    document.getElementById('modalText').innerText = txt.trim();
    document.getElementById('coverModal').style.display = 'flex';
  }

  function closeModal() {
    document.getElementById('coverModal').style.display = 'none';
  }

  function copyModalContent() {
    const text = document.getElementById('modalText').innerText;
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
    closeModal();
  }

  function showToast(msg) {
    const toast = document.getElementById('toastMsg');
    toast.innerText = msg;
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 2500);
  }

  window.onload = init;
</script>
</body>
</html>`;

  const dashboardPath = path.join(outputDir, 'dashboard.html');
  fs.writeFileSync(dashboardPath, html, 'utf-8');
  console.log(`[Dashboard] Generated interactive dashboard at: ${dashboardPath}`);
  return dashboardPath;
}

module.exports = { generateDashboardHtml };
