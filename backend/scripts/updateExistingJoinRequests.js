const mongoose = require('mongoose');
const ProposalJoinRequest = require('../src/models/ProposalJoinRequest');
const User = require('../src/models/User');

// MongoDB connection string - replace with your actual connection string
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/capstone';

async function updateExistingJoinRequests() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all join requests
    const requests = await ProposalJoinRequest.find();
    console.log(`Found ${requests.length} join requests`);

    // Update each request
    for (const request of requests) {
      // Get all students in the request
      const students = await User.find({ _id: { $in: request.students } });
      
      // Update the request with the student data
      request.students = students.map(student => student._id);
      await request.save();
      
      console.log(`Updated request ${request._id} with ${students.length} students`);
    }

    console.log('All join requests updated successfully');
  } catch (error) {
    console.error('Error updating join requests:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the update script
updateExistingJoinRequests(); 