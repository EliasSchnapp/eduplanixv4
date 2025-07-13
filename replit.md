# Grade Management System

## Overview

This is a full-stack Grade Management System built with React on the frontend and Express.js on the backend. It allows users to manage academic grades with features for adding, editing, deleting, and viewing grade statistics. The application uses PostgreSQL for persistent data storage with Drizzle ORM for database operations.

## User Preferences

Preferred communication style: Simple, everyday language.
User requested improved design with modern colors and gradients.
User requested user management functionality for admin users "Admin" and "EliasSchnapp".
User requested comprehensive role-based access control with admin/user distinction.
User requested modern glass morphism design with enhanced visual appeal.
User requested German language interface throughout the application.
User requested additional "cool features" to enhance functionality.
User requested improved tab organization with dedicated "Übersicht" (Overview) tab as the primary dashboard.
User requested enhanced motivational quotes system with expanded quote collection.
User requested improved AI assistant functionality with better insights and recommendations.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with shadcn/ui component library
- **State Management**: React Query (TanStack Query) for server state
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with custom shadcn/ui components

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Express sessions with in-memory storage
- **Validation**: Zod schemas for request validation
- **Storage**: PostgreSQL database with Drizzle ORM for persistent data storage

## Key Components

### Database Schema
The application uses four main tables:
- **users**: Stores user credentials (id, username, password, role)
- **grades**: Stores grade information (id, userId, subject, description, grade, weight, createdAt)
- **homework**: Stores homework assignments (id, userId, subject, title, description, dueDate, priority, isCompleted, createdAt)
- **events**: Stores calendar events (id, userId, title, description, startDate, endDate, type, color, createdAt)

### Authentication System
- Session-based authentication using express-session
- Two admin users: "Admin" (password: "Admin") and "EliasSchnapp" (password: "eliasadmin")
- Protected routes requiring authentication
- Session middleware for request validation
- User management system for admin users only
- Role-based access control with proper API role transmission in login and authentication endpoints
- Password reset functionality for admin users

### Grade Management Features
- **CRUD Operations**: Create, read, update, delete grades
- **Grade Statistics**: Weighted average calculation, subject count, best grade tracking
- **Sorting and Filtering**: Sort grades by subject, grade value, or date
- **Form Validation**: Client and server-side validation using Zod schemas
- **User Management**: Admin users can create and delete regular users
- **Enhanced Design**: Modern glass morphism design with purple/pink gradient color scheme
- **Role-Based Access Control**: Admin and user roles with proper permission system

### Homework Management Features
- **CRUD Operations**: Create, read, update, delete homework assignments
- **Completion Tracking**: Mark homework as completed or pending
- **Priority System**: Set homework priority (low, medium, high)
- **Due Date Management**: Track homework due dates with overdue indicators
- **Filtering**: Filter homework by status (all, pending, completed)
- **Tabbed Interface**: Clean organization with separate tabs for grades, homework, calendar, and user management

### Calendar Features
- **Monthly View**: Visual calendar display with navigation between months
- **Homework Integration**: Display homework assignments on their due dates
- **Priority Indicators**: Color-coded homework entries based on priority level
- **Completion Status**: Visual distinction between completed and pending homework
- **Overdue Highlighting**: Special styling for overdue assignments
- **Upcoming Tasks**: Sidebar showing next 7 days of homework assignments
- **Interactive Navigation**: Navigate between months with arrow buttons
- **Event Management**: Full event creation and management system with different event types
- **Color Coding**: Events can be color-coded for better visual organization

### Enhanced Features (Added 2025-01-12)
- **Smart Notifications**: Real-time alerts for overdue homework, today's deadlines, and completion tracking
- **Advanced Dashboard Stats**: Comprehensive metrics with grade averages, completion rates, and priority indicators
- **Intelligent Search**: Real-time search functionality across grades and homework with instant filtering
- **Data Export System**: CSV export capabilities for grades, homework, and events with German localization
- **Event Scheduling**: Full event creation form with date/time selection, categorization, and color coding
- **Export Tab**: Dedicated interface for data export with usage statistics and format information
- **Overview Tab**: New centralized dashboard tab containing quick actions, task status, motivation, completion rates, weekly stats, performance level, and streak tracking
- **User Role Management**: Complete admin functionality including user creation, role assignment, and password reset capabilities with proper API role transmission
- **Progressive Web App (PWA)**: Complete PWA implementation with custom EduPlanix icons, manifest.json, service worker, and "Add to Home Screen" functionality for mobile devices
- **Offline Synchronization**: Full offline functionality with IndexedDB storage, automatic sync when online, offline indicators, and seamless data persistence for homework, grades, and events

### Revolutionary Features (Added 2025-01-12 Evening)
- **QuickActions Panel**: Direct access buttons for common tasks with motivational quotes and task overview
- **Productivity Tracker**: Comprehensive tracking with completion rates, weekly progress, and performance levels
- **Achievement System**: Gamification with 8 unique achievements, rarity levels, and celebration animations
- **Animated Background**: Particle system with floating elements and connection lines for visual appeal
- **Theme Customizer**: 6 color palettes, visual effects toggles, and display settings (brightness, contrast, blur)
- **Advanced Search Bar**: Quick search terms, advanced filters, and sort functionality with collapsible interface
- **Smart Notification System**: Context-aware alerts with dismissible notifications and priority indicators
- **Grade Analytics Dashboard**: Interactive charts using Recharts with subject performance, grade distribution, and trend analysis
- **Intelligent Study Planner**: Complete study session management with plan creation, progress tracking, and recommendations
- **AI-Powered Assistant**: Smart insights, study pattern analysis, performance predictions, and contextual recommendations

### UI Components
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Component Library**: shadcn/ui components for consistent UI
- **Interactive Elements**: Modals, toasts, form controls
- **Data Visualization**: Statistics overview cards
- **Tab Navigation**: 11-12 specialized tabs including Overview, Noten, Hausaufgaben, Kalender, Analytik, KI-Assistent, Ziele, Erfolge, Lernplaner, Erweitert, Export, and Benutzer (admin only)
- **Icon System**: Lucide React icons with specific icons for each tab (ClipboardList for Hausaufgaben, Brain for KI-Assistent)
- **Dark Theme**: Consistent black/slate-900 backgrounds with cyan accents throughout all components

## Data Flow

1. **Authentication Flow**:
   - User submits login credentials
   - Server validates against user database
   - Session created and stored on successful login
   - Protected routes check session validity

2. **Grade Management Flow**:
   - Client requests are validated with Zod schemas
   - Express routes handle CRUD operations
   - Drizzle ORM manages database interactions
   - React Query handles client-side caching and updates

3. **Real-time Updates**:
   - React Query automatically refetches data after mutations
   - Optimistic updates for better user experience
   - Toast notifications for user feedback

## External Dependencies

### Frontend Dependencies
- **React Ecosystem**: React, React DOM, React Query
- **UI/UX**: Radix UI, Tailwind CSS, Lucide React (icons)
- **Form Handling**: React Hook Form, Hookform Resolvers
- **Utilities**: Class Variance Authority, clsx, date-fns

### Backend Dependencies
- **Express Framework**: Express.js with session middleware
- **Database**: Drizzle ORM, Neon Database serverless driver
- **Validation**: Zod for schema validation
- **Development**: TSX for TypeScript execution

### Build Tools
- **Vite**: Frontend build tool with React plugin
- **TypeScript**: Type checking and compilation
- **ESBuild**: Backend bundling for production
- **Drizzle Kit**: Database migration and schema management

## Deployment Strategy

### Development Environment
- Frontend served by Vite dev server on client directory
- Backend runs with TSX for hot reloading
- Database connections use environment variables
- Replit-specific plugins for development tooling

### Production Build
- Frontend built to `dist/public` directory
- Backend bundled with ESBuild to `dist/index.js`
- Static files served by Express in production
- Database migrations handled by Drizzle Kit

### Database Configuration
- PostgreSQL database with Drizzle ORM
- Connection string from `DATABASE_URL` environment variable
- Schema defined in `shared/schema.ts`
- Migrations stored in `./migrations` directory

### Session Management
- Express sessions with configurable secret
- Session storage (in-memory for development)
- Cookie configuration for security
- 24-hour session expiration

The application follows a monorepo structure with shared TypeScript types and schemas, enabling type safety across the full stack while maintaining clear separation of concerns between frontend and backend code.