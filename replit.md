# CyberGuard Anti-fraud Monitor

## Overview

This is a full-stack cybersecurity application designed as a white-hat hacking tool and scam intelligence platform. The application allows users to analyze suspicious data (URLs, phone numbers, emails, social media profiles, etc.) and provides comprehensive fraud detection capabilities with real-time threat intelligence and automated reporting to authorities.

## Recent Changes (January 22, 2025)

✓ Consolidated Reports and Evidence tabs into single "Reports & Evidence" tab in header
✓ Created functional Settings component with user info, display preferences, notifications, and security settings
✓ Fixed "View all results" button to open comprehensive Reports & Evidence modal
✓ Updated CSS to ensure text appears green on white backgrounds for better visibility
✓ Fixed evidence download to create proper JSON files instead of corrupted files
✓ Enhanced report generation with comprehensive PDF-style reports in new windows
✓ All four main action buttons now fully functional (Bulk Analysis, Generate Report, Export Evidence, Report to Authorities)

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for development and production builds
- **Styling**: Tailwind CSS with a custom cybersecurity dark theme
- **UI Components**: Radix UI components with shadcn/ui design system
- **State Management**: TanStack React Query for server state management
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ESM modules
- **Development**: tsx for TypeScript execution in development
- **Database**: PostgreSQL with Drizzle ORM
- **Database Driver**: Neon serverless PostgreSQL driver
- **Session Management**: connect-pg-simple for PostgreSQL session storage

### Database Schema
The application uses a comprehensive database schema with the following core entities:
- **Users**: Basic user authentication and management
- **Analysis Results**: Stores fraud analysis results with input data, fraud scores, risk levels, and evidence packages
- **Threat Intelligence**: Real-time threat data and security alerts
- **Scam Reports**: Community-reported scam data with verification status
- **Analysis Queue**: Background job processing system for analysis tasks

## Key Components

### Analysis Engine
- **Multi-source Analysis**: Integrates WHOIS, SSL, OSINT, and malware scanning
- **Fraud Scoring**: AI-powered fraud probability scoring (0-100)
- **Risk Assessment**: Categorizes threats as low, medium, high, or critical
- **Digital Footprint**: Maps connected online properties and relationships

### Real-time Processing
- **Queue System**: Background processing for analysis tasks
- **Progress Tracking**: Real-time updates on analysis progress
- **Concurrent Processing**: Multiple analysis engines running simultaneously

### Threat Intelligence
- **Live Updates**: Real-time threat intelligence feeds
- **Campaign Tracking**: Active scam campaign monitoring
- **Community Reports**: User-submitted scam reports with verification

### Evidence Management
- **Evidence Packaging**: Automated collection and packaging of analysis results
- **Authority Reporting**: One-click reporting to law enforcement agencies
- **Export Capabilities**: Multiple export formats for evidence sharing

## Data Flow

1. **Input Processing**: Users submit suspicious data through multiple input types (URLs, phone numbers, emails, social profiles)
2. **Analysis Initialization**: System creates analysis record and queues background tasks
3. **Multi-engine Processing**: Parallel execution of WHOIS, SSL, OSINT, and malware analysis
4. **Result Aggregation**: Analysis results are combined and scored
5. **Threat Assessment**: Risk level determination and red flag identification
6. **Real-time Updates**: Frontend receives live updates via polling
7. **Evidence Generation**: Comprehensive evidence packages created for reporting
8. **Authority Integration**: Direct reporting capabilities to law enforcement

## External Dependencies

### Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **Session Storage**: PostgreSQL-based session management
- **File Storage**: Local filesystem (can be extended to cloud storage)

### Analysis Services
The application simulates integration with multiple external services:
- **WHOIS/DNS Services**: Domain registration and DNS analysis
- **SSL Certificate Analysis**: Certificate validation and security checks
- **OSINT Platforms**: Open source intelligence gathering
- **Malware Scanning**: Multi-engine malware detection
- **Threat Intelligence Feeds**: Real-time security threat data

### UI/UX Dependencies
- **Design System**: shadcn/ui component library
- **Icons**: Lucide React icon library
- **Styling**: Tailwind CSS with custom cybersecurity theme
- **Date Handling**: date-fns for date manipulation

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with HMR
- **TypeScript**: Full TypeScript support with strict configuration
- **Database**: Local PostgreSQL or Neon cloud database
- **Environment Variables**: DATABASE_URL required for database connection

### Production Build
- **Frontend**: Vite builds optimized React application
- **Backend**: esbuild bundles Node.js server for production
- **Database**: Drizzle migrations for schema management
- **Process Management**: Single Node.js process serving both API and static files

### Scalability Considerations
- **Database**: PostgreSQL with connection pooling via Neon
- **Caching**: React Query provides client-side caching
- **Background Jobs**: In-memory queue system (can be extended to Redis/Bull)
- **Static Assets**: Served directly by Express in production

### Security Features
- **Input Validation**: Zod schema validation on both client and server
- **Session Management**: Secure session handling with PostgreSQL storage
- **CORS**: Proper CORS configuration for API endpoints
- **Environment Isolation**: Separate development and production configurations

The application is designed as a comprehensive fraud detection platform with real-time analysis capabilities, community intelligence, and direct integration with law enforcement reporting systems.