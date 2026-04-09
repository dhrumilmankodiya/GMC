# GMC Platform - Product Requirements Document

## Original Problem Statement
Build a GMC (Group Medical Coverage) Platform with modern minimalist UI/UX. The platform is a White-Label Enterprise SaaS solution for processing Group Medical Coverage data in the Indian insurance market.

## User Personas

### 1. Agent
- Insurance agent or broker responsible for client data submission
- Goals: Upload data quickly, minimize formatting time, get quotes same-day, track cases
- Technical Comfort: Low to Medium

### 2. Underwriter
- Insurance underwriter responsible for risk assessment and pricing
- Goals: Receive clean standardized data, identify high-risk cases, process more cases
- Technical Comfort: Medium to High

### 3. Admin/Ops
- Operations manager or system administrator
- Goals: Monitor system health, manage users/permissions, configure mapping rules
- Technical Comfort: High

## Core Requirements (Static)

### Authentication
- JWT-based email/password authentication
- Role-based access control (Agent, Underwriter, Admin)
- Session management with httpOnly cookies
- Password reset functionality

### Case Management
- Create new GMC cases with client details
- Upload Excel/CSV files for processing
- Track case status through lifecycle

### AI-Powered Column Mapping
- Gemini 3 Flash integration for intelligent mapping
- Confidence scoring (High/Medium/Low/Uncertain)
- Manual override capabilities

### Data Correction
- Inline editing of mapped data
- Error highlighting and validation
- Undo/redo functionality

### Underwriter Review
- Review queue for submitted cases
- Approve/Reject/Request Fixes decisions
- Risk flagging and notes

### Admin Console
- System metrics dashboard
- User management
- Template management
- Audit trail logging

## What's Been Implemented (April 2026)

### Backend (FastAPI)
- [x] JWT Authentication with bcrypt password hashing
- [x] User registration and login
- [x] Role-based access control
- [x] Case CRUD operations
- [x] File upload and Excel/CSV parsing
- [x] AI mapping with Gemini 3 Flash
- [x] Data correction endpoints
- [x] Underwriter review endpoints
- [x] Admin statistics and user management
- [x] Template management
- [x] Audit trail logging
- [x] Notifications system

### Frontend (React)
- [x] Modern minimalist Swiss design
- [x] Login/Register/Forgot Password pages
- [x] Dashboard with summary cards
- [x] Case list with search and filters
- [x] New case wizard (2-step)
- [x] AI Mapping Review screen
- [x] Data Correction screen with editable table
- [x] Structured Output Review
- [x] Underwriter Queue and Review
- [x] Admin Dashboard with metrics
- [x] User Management page
- [x] Template Manager
- [x] Audit Trail viewer
- [x] Notifications center

### Design System
- Chivo font for headings
- IBM Plex Sans for body text
- Swiss high-contrast light theme
- Flat surfaces with 1px borders
- No shadows, minimal decoration
- Color used only for action guidance

## Prioritized Backlog

### P0 (Critical)
- All core features implemented ✓

### P1 (High Priority - Next Phase)
- [ ] Email notifications for case status changes
- [ ] Bulk case operations
- [ ] Export functionality (CSV/PDF)
- [ ] Advanced filtering and sorting

### P2 (Medium Priority)
- [ ] SSO integration (SAML 2.0, OAuth 2.0)
- [ ] Multi-language support (Hindi, regional)
- [ ] Mobile responsive improvements
- [ ] Dashboard widgets customization

### P3 (Future)
- [ ] API rate limiting
- [ ] Webhook integrations
- [ ] Advanced analytics
- [ ] AI model fine-tuning

## Technical Stack
- Backend: FastAPI, MongoDB, Python 3.11
- Frontend: React 19, Tailwind CSS, Shadcn/UI
- AI: Gemini 3 Flash via Emergent LLM Key
- Auth: JWT with httpOnly cookies

## Next Tasks
1. Add email notification integration
2. Implement export functionality
3. Enhanced mobile responsiveness
4. Performance optimization for large files
