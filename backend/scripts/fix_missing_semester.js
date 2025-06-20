// This script updates all ProjectProposal documents missing the 'semester' field
// Run with: node backend/scripts/fix_missing_semester.js

const mongoose = require('mongoose');
const ProjectProposal = require('../src/models/ProjectProposal');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/your-db-name';

async function fixMissingSemester() {
  await mongoose.connect(MONGODB_URI);
  const result = await ProjectProposal.updateMany(
    { $or: [ { semester: { $exists: false } }, { semester: null }, { semester: '' } ] },
    { $set: { semester: 'First Semester 2024-2025' } }
  );
  console.log(`Updated ${result.modifiedCount} proposals.`);
  await mongoose.disconnect();
}

fixMissingSemester().catch(err => {
  console.error(err);
  process.exit(1);
}); 