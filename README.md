# Pan-India Entry-Level Job Application Automation

Automated daily scout and application accelerator customized for **Amit Kumar Saini** (1-Year Business & Data Analytics Internship at Ai Variant, Bengaluru).

## Automated Schedule (Every 6 Hours Aligned to IST)

Runs autonomously 4 times a day via GitHub Actions:
- **09:00 AM IST** (Morning corporate wave)
- **03:00 PM IST** (Midday recruiter postings)
- **09:00 PM IST** (Evening post-work startup wave)
- **03:00 AM IST** (Overnight global & remote postings)

1. **Scrapes Fresh Postings (Strict 24-Hour Window)**:
   - Scans LinkedIn, Instahyre, Y Combinator, and remote data feeds.
   - Filters strictly for **Pan-India (Bengaluru, Hyderabad, Pune, Delhi-NCR, Gurgaon, Noida, Chennai, Kolkata, Remote India - Excluded Mumbai)**.
   - Targets **Startups and Tier 1 to Tier 3 Companies**; eliminates scam/unverified mills.
   - Strictly excludes internships, trainees, data scientist roles, and senior/lead positions.
   - **Hides Applied Jobs**: Once marked "Applied", jobs are automatically removed from the active feed.

2. **Scores & Matches Against Your Profile**:
   - Parses [Amit_BA_Resume_Updated.pdf](file:///c:/Users/User/Desktop/ANTIGRAVITY%20PROJECTS/Job/resume/Amit_BA_Resume_Updated.pdf).
   - Evaluates technical stack: SQL (MySQL, CTEs, Window Functions), Power BI (DAX), Tableau, Advanced Excel, Python (Pandas/NumPy), BRD/FRD, and UAT.
   - Assigns a match score percentage to each job.

3. **Pre-Generates Tailored Application Materials**:
   - Custom **Cover Letter** emphasizing your 1-year internship achievements at Ai Variant.
   - 2-sentence **Recruiter / InMail Pitch** ready to paste into LinkedIn.
   - Pre-filled answers for screening questions (0 days notice period, location flexibility, why hire me).

4. **Interactive Dashboard**:
   - Generates [dashboard.html](file:///c:/Users/User/Desktop/ANTIGRAVITY%20PROJECTS/Job/output/dashboard.html).
   - 1-click **Apply Now** button directly to the verified listing.
   - 1-click **Copy Recruiter Pitch** button.
   - Status tracking to prevent duplicate applications.

## How to Run

- **Daily Automation**: Runs autonomously every day at 9:00 AM IST via the Antigravity background schedule.
- **Manual Run (anytime)**:
  ```powershell
  npm start
  ```
- **Open Dashboard**:
  ```powershell
  npm run dashboard
  ```
