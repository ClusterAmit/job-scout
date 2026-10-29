const fs = require('fs');
const path = require('path');

const TRACKER_PATH = path.resolve(__dirname, '../applications.json');

function loadTracker() {
  if (fs.existsSync(TRACKER_PATH)) {
    try {
      const data = JSON.parse(fs.readFileSync(TRACKER_PATH, 'utf-8'));
      return data;
    } catch (e) {
      console.warn('[Tracker] Error parsing applications.json, creating new database.');
    }
  }
  return {
    lastUpdated: null,
    totalTracked: 0,
    appliedCount: 0,
    jobs: {}
  };
}

function saveTracker(tracker) {
  tracker.lastUpdated = new Date().toISOString();
  tracker.totalTracked = Object.keys(tracker.jobs).length;
  tracker.appliedCount = Object.values(tracker.jobs).filter(j => j.status === 'Applied').length;
  fs.writeFileSync(TRACKER_PATH, JSON.stringify(tracker, null, 2), 'utf-8');
}

function mergeNewJobs(newMatchedJobs) {
  const tracker = loadTracker();
  let newlyAdded = 0;

  for (const job of newMatchedJobs) {
    if (!tracker.jobs[job.id]) {
      tracker.jobs[job.id] = {
        ...job,
        status: 'New',
        dateDiscovered: new Date().toISOString().split('T')[0],
        notes: ''
      };
      newlyAdded++;
    } else {
      // update score or details if needed
      tracker.jobs[job.id].lastSeen = new Date().toISOString().split('T')[0];
    }
  }

  saveTracker(tracker);
  console.log(`[Tracker] Added ${newlyAdded} new job(s) to tracker. Total tracked: ${tracker.totalTracked}`);
  return { tracker, newlyAdded };
}

function updateJobStatus(jobId, status, notes = '') {
  const tracker = loadTracker();
  if (tracker.jobs[jobId]) {
    tracker.jobs[jobId].status = status;
    if (notes) tracker.jobs[jobId].notes = notes;
    saveTracker(tracker);
    return true;
  }
  return false;
}

module.exports = {
  loadTracker,
  saveTracker,
  mergeNewJobs,
  updateJobStatus
};
