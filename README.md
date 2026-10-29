# Pan-India Entry-Level Job Application Automation

Automated daily scout and application accelerator customized for **Amit Kumar Saini** (1-Year Business & Data Analytics Internship at Ai Variant, Bengaluru).

## What This System Does Every Day at 9:00 AM IST

1. **Scrapes Fresh Postings (Past 24 Hours)**:
   - Scans LinkedIn and remote data feeds for entry-level, fresher, and internship roles.
   - Filters strictly for **Pan-India** (Bengaluru, Hyderabad, Pune, Mumbai, Delhi-NCR, Gurgaon, Noida, Chennai, Kolkata, Remote India).
   - Strictly excludes senior, lead, manager, and 3+ year positions.

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
