# CPMS Implementation Plan

## Feature-Based Development Plan

### Feature 0: MVP Core
- Backend:
  - [x] Set up project structure (Node.js backend, React.js frontend)
  - [x] Configure MongoDB database and connection
  - [x] Implement User model and authentication (email/password, roles)
  - [x] Minimal API endpoints for user registration/login
- Frontend:
  - [x] Basic UI setup and theme configuration
  - [x] Login/Registration pages
  - [x] Minimal dashboard for each role (Coordinator, Supervisor, Student, Examiner)
  - [x] Navigation and protected routes
  - [x] Course/CRN management UI (create, edit, delete, list)
  - Coordinator dashboard for course/CRN management

### Feature 1: Advanced Authentication & User Management
- Backend:
  - [x] Password reset functionality
  - [x] Email verification system
  - [x] Session management and token refresh
  - [x] Advanced role permissions and access control
  - [x] User profile management APIs
- Frontend:
  - [x] Password reset flow UI
  - [x] Email verification UI
  - [x] User profile management interface
  - [x] Advanced role-based UI components
  - [x] Session timeout handling

### Feature X: User Account Activation via Email
- Backend:
  - [x] Update User model to include activationToken, activationTokenExpires, and isVerified fields
  - [x] Generate activation token and expiry when creating a user (student, supervisor, examiner) via coordinator
  - [x] Store activation token and expiry in the user document
  - [x] Send activation email to user with a secure activation link
  - [x] Create activation endpoint to verify token, set password, and activate account
- Frontend:
  - [x] Build activation page where users can set their password using the token
  - [x] Show success/error messages for activation
- Testing:
  - [x] Test the full activation flow for all user types (student, supervisor, examiner)

### Feature 2: Course & CRN Management
- Backend:
  - [x] Course model (title, description, semester, coordinator)
  - [x] CRN model (code, course, students, supervisors)
  - [x] CRUD APIs for courses and CRNs
- Frontend:
  - [x] Course/CRN management UI (create, edit, delete, list)
  - [x] Coordinator dashboard for course/CRN management
  - [x] Integration with backend APIs

### Feature 3: Project Proposal Management
- Backend:
  - [x] ProjectProposal model (title, tech stack, summary, supervisor, crn, status)
  - [x] APIs for proposal submission, approval/rejection
- Frontend:
  - [x] Supervisor dashboard for proposal submission
  - [x] Coordinator dashboard for proposal approval/rejection
  - [x] Proposal status views

### Feature 4: Project Group & Invitation Management
- Backend:
  - [] ProjectGroup model (proposal, crn, students, invitations, status)
  - [] Group formation and invitation APIs
- Frontend:
  - [] Student dashboard for group formation and invitations
  - [] Invitation management UI

### Feature 5: Project Stages & Deliverables
- Backend:
  - ProjectStage model (group, name, description, dueDate, deliverables)
  - Deliverable model (stage, group, file, submittedBy, feedback, status)
  - APIs for stage management, deliverable upload, feedback
- Frontend:
  - Project dashboard with stages and deliverables
  - File upload UI for deliverables
  - Feedback views

### Feature 6: Announcements & Feedback
- Backend:
  - Announcement model
  - Feedback model
  - APIs for announcements and feedback
- Frontend:
  - Announcement views for all roles
  - Feedback system UI

### Feature 7: Examiner Project Review & Grading
- Backend:
  - APIs for project review, grading, and feedback submission
- Frontend:
  - Examiner dashboard for project review and grading
  - Feedback submission UI

### Feature 8: AI Integration (Phase 2+)
- Backend:
  - Integrate OpenAI API, LangChain, Pinecone
  - Implement idea suggestion, similarity detection, grading, and feedback generation APIs
- Frontend:
  - UI for AI-powered features (idea suggestions, chat assistant, grading feedback)

### Feature 9: Testing, Deployment, and Maintenance
- Backend & Frontend:
  - Unit and integration testing for each feature
  - End-to-end testing for critical user flows
  - Documentation for APIs and UI components
  - Deployment scripts and cloud setup
  - Ongoing monitoring and maintenance






  

## Phase 1: MVP Development (Weeks 1-4)

### Week 1: Basic Setup
- [] Initialize project structure
  - [] Create frontend project (React.js)
  - [] Set up backend project (Node.js)
  - [] Configure MongoDB database
    - [] Set up MongoDB Atlas or local MongoDB instance
    - [] Configure MongoDB connection and schemas
    - [] Set up Mongoose ODM

### Week 2: Core Authentication and Basic Infrastructure
- [] Role-based access (Coordinator/Supervisor/Student/Examiner)
- [] Basic user authentication (email/password)
- [] Basic user management
- [] Role-based routing and dashboard redirects
  - [] After login, redirect user to the correct dashboard based on role
  - [] Protect routes so only the correct role can access them

### Week 3: Core Data Models & APIs
- [] Implement core database models using Mongoose
  - [] User model (roles: coordinator, supervisor, student, examiner)
  - [] Course model (title, description, semester, coordinator)
  - [] CRN model (code, course, students, supervisors)
  - [] ProjectProposal model (title, tech stack, summary, supervisor, crn, status)
  - [] ProjectGroup model (proposal, crn, students, invitations, status)
  - [] ProjectStage model (group, name, description, dueDate, deliverables)
  - [] Deliverable model (stage, group, file, submittedBy, feedback, status)
  - [] Announcement model
  - [] Feedback model
- [] Develop essential APIs
  - [] User registration/login
  - [] Course and CRN creation/management (by coordinator)
  - [] Project proposal submission (by supervisor)
  - [] Proposal approval/rejection (by coordinator)
  - [] Group formation and invitations (by students)
  - [] Project stage and deliverable management
  - [] Feedback and announcement endpoints

### Week 4: MVP Frontend Features
- [ ] Create basic UI components
  - [] Shared components (Button, Card, Input, Table)
  - [] Theme configuration
  - [] Login/Registration pages
  - [ ] Role-based dashboards
    - [] Coordinator dashboard
      - [] Course management
      - [] CRN management
      - [ ] Project proposal approval
      - [ ] Announcements
    - [ ] Supervisor dashboard
      - [ ] Project proposal submission
      - [ ] Student group management
      - [ ] Deliverable review
      - [ ] Feedback system
    - [ ] Student dashboard
      - [ ] CRN enrollment
      - [ ] Project proposal selection
      - [ ] Group formation
      - [ ] Deliverable submission
    - [ ] Examiner dashboard
      - [ ] Project review
      - [ ] Grading system
      - [ ] Feedback submission
  - [ ] Course and CRN management (coordinator)
    - [] Create and manage courses
    - [] Create and manage CRNs
    - [ ] Edit and delete courses/CRNs
  - [ ] Project proposal submission/approval (supervisor/coordinator)
  - [ ] Project proposal selection and group formation (student)
  - [ ] Invitation management (student)
  - [ ] Project dashboard with stages and deliverables
  - [ ] File upload for deliverables
  - [ ] Feedback and announcement views
- [ ] Implement core user flows
  - [] Coordinator: create course/CRN, approve proposals, send announcements
  - [ ] Supervisor: submit proposals, review deliverables, give feedback
  - [ ] Student: join CRN, select proposal, form group, upload deliverables, manage invitations
  - [ ] Examiner: view assigned projects, grade

## Phase 2: Core Backend Development (Weeks 5-6)

### Week 5-6: Advanced Features Implementation
- [ ] Implement advanced project management features
  - [ ] Multi-stage project workflow (define stages, due dates, required deliverables)
  - [ ] Deliverable upload and feedback system
  - [ ] Group invitation/acceptance/rejection logic
  - [ ] Automated notifications/announcements at each stage

## Phase 3: Frontend Development (Weeks 7-10)

### Week 7-8: Core UI Components
- [ ] Develop shared components
  - [ ] Navigation
  - [ ] Layouts
  - [ ] Forms
  - [ ] Tables
- [ ] Implement responsive design
  - [ ] Mobile-first approach
  - [ ] Cross-browser testing
  - [ ] Accessibility compliance

### Week 9-10: Module-Specific UI
- [ ] Coordinator module interface
  - [ ] Course/CRN management
  - [ ] Proposal approval
  - [ ] Announcements
- [ ] Supervisor module interface
  - [ ] Proposal submission
  - [ ] Deliverable review/feedback
- [ ] Student module interface
  - [ ] Proposal selection
  - [ ] Group management/invitations
  - [ ] Deliverable upload
  - [ ] Progress dashboard
- [ ] Examiner module interface
  - [ ] Project review and grading (final stage)

## Phase 4: AI Integration (Weeks 11-14)

### Week 11-12: AI Core Features
- [ ] Set up AI infrastructure
  - [ ] Configure OpenAI API integration
  - [ ] Set up LangChain
  - [ ] Implement vector search with Pinecone
- [ ] Implement basic AI features
  - [ ] Idea suggestion system
  - [ ] Similarity detection
  - [ ] Basic chat assistant

### Week 13-14: Advanced AI Features
- [ ] Develop AI grading system
  - [ ] Rubric analysis
  - [ ] Score suggestion
  - [ ] Feedback generation
- [ ] Implement advanced AI features
  - [ ] Project summary generator
  - [ ] Advanced chat assistant
  - [ ] Plagiarism detection

## Phase 5: Testing and Quality Assurance (Weeks 15-16)

### Week 15: Testing
- [ ] Unit testing
  - [ ] Backend API tests
  - [ ] Frontend component tests
  - [ ] AI feature tests
- [ ] Integration testing
  - [ ] End-to-end testing
  - [ ] Performance testing
  - [ ] Security testing

### Week 16: Quality Assurance
- [ ] Bug fixing and optimization
  - [ ] Performance optimization
  - [ ] Security hardening
  - [ ] Code refactoring
- [ ] Documentation
  - [ ] API documentation
  - [ ] User guides
  - [ ] System documentation

## Phase 6: Deployment and Launch (Weeks 17-18)

### Week 17: Deployment
- [ ] Set up minimal cloud infrastructure
  - [ ] Basic AWS/Azure setup
  - [ ] Simple file storage
  - [ ] Essential security configurations
- [ ] Production deployment
  - [ ] MongoDB Atlas configuration
  - [ ] Application deployment
  - [ ] Load balancer setup
- [ ] Monitoring setup
  - [ ] MongoDB monitoring
  - [ ] Application logging system
  - [ ] Performance monitoring
  - [ ] Error tracking

### Week 18: Launch
- [ ] Final testing
  - [ ] User acceptance testing
  - [ ] Load testing
  - [ ] Security audit
- [ ] System launch
  - [ ] Gradual rollout
  - [ ] User training
  - [ ] Support system setup

## Phase 7: Post-Launch (Week 19+)
### Ongoing Maintenance
- [ ] Monitor system performance
- [ ] Gather user feedback
- [ ] Implement improvements
- [ ] Regular security updates

## Development Guidelines

### Code Standards
- Follow ESLint/Prettier configuration
- Maintain consistent code style
- Write comprehensive documentation
- Use MongoDB best practices and indexing strategies

### Testing Requirements
- Minimum 80% code coverage
- All features must have unit tests
- End-to-end tests for critical paths
- Regular security testing
- MongoDB query performance testing

### Documentation Requirements
- API documentation using Swagger/OpenAPI
- Component documentation
- Setup and deployment guides
- User manuals

## Risk Management

### Technical Risks
- AI service availability
- MongoDB performance and scaling
- Security vulnerabilities
- Data consistency and backup

### Mitigation Strategies
- Implement fallback mechanisms
- Regular MongoDB performance monitoring and optimization
- Security best practices
- Regular MongoDB backups and data validation

## Success Criteria
- All core features implemented
- Performance metrics met
- Security requirements satisfied
- User acceptance criteria met

---
*Last Updated: [Current Date]*
*Version: 1.3 (Direct dashboard approach for all roles, now feature-based development)* 