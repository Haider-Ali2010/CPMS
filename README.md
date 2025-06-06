# Capstone Project Management System (CPMS)

A comprehensive web application for managing capstone projects in educational institutions. The system facilitates coordination between students, supervisors, coordinators, and examiners throughout the capstone project lifecycle.

## Features

- **Role-based Access Control**
  - Coordinator: Manage courses, CRNs, and project proposals
  - Supervisor: Submit proposals and manage project groups
  - Student: Join projects and submit deliverables
  - Examiner: Review projects and provide grades

- **Project Management**
  - Course and CRN management
  - Project proposal submission and approval
  - Group formation and management
  - Deliverable submission and feedback
  - Grading system

## Tech Stack

- **Frontend**
  - React.js
  - Material-UI
  - React Router
  - Axios

- **Backend**
  - Node.js
  - Express.js
  - MongoDB
  - JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/capstone-project-management.git
cd capstone-project-management
```

2. Install dependencies
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables
```bash
# In backend directory
cp .env.example .env
# Edit .env with your configuration
```

4. Start the development servers
```bash
# Start backend server (from backend directory)
npm run dev

# Start frontend server (from frontend directory)
npm start
```

## Project Structure

```
capstone-project-management/
├── backend/               # Backend server code
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── models/      # Database models
│   │   ├── routes/      # API routes
│   │   └── app.js       # Express app setup
│   └── package.json
│
├── frontend/             # React frontend code
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   └── App.js      # Main app component
│   └── package.json
│
└── docs/                # Documentation
    └── IMPLEMENTATION_PLAN.md
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - your.email@example.com
Project Link: https://github.com/yourusername/capstone-project-management 