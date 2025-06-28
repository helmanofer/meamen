# Fitness Trainer Web App Design Document - Live Training Focus

## 1. Overview

A cloud-based web application designed for fitness trainers to manage live training sessions with multiple clients simultaneously, track their progress in real-time, and build comprehensive training programs. The app focuses on efficient data recording during active training sessions.

## 2. Core Design Principles

### Trainer-Centric Workflow
- Optimized for trainers conducting live sessions
- Fast data entry during active training
- Seamless multi-trainee management
- Minimal interaction required for common tasks

### Session-First Architecture
- Dashboard centered on starting/resuming sessions
- All features accessible from live training mode
- Persistent session state across devices
- Automatic recovery from interruptions

## 3. User Roles & Permissions

### Trainer
- Start and manage live training sessions
- Record exercise data for multiple trainees simultaneously
- Create and manage session templates
- View all trainee data and progress
- Manage programs and assignments

### Trainee
- View assigned workouts and programs
- Access personal progress data
- View session history
- Limited to own data only

## 4. Data Models (Based on DB_SCHEMA.md)

### Core Entities

#### TRAINER
- Manages trainees and sessions
- Creates templates and programs
- Conducts live training sessions

#### TRAINEE
- Linked to single trainer
- Contains health metrics and goals
- Tracks measurement history

#### SESSION_TEMPLATE
- Reusable workout blueprints
- Contains ordered exercise templates
- Categorized by type and difficulty

#### EXERCISE_TEMPLATE
- Part of session templates
- Defines target sets, reps, weight
- Includes instructions and tips

#### PROGRAM
- Collection of training sessions
- Multi-week structured plans
- Assigned to trainees

#### TRAINING_SESSION
- Instance of a session within a program
- Can be based on templates
- Scheduled for specific weeks

#### TRAINING_SESSION_RECORD
- Actual executed session
- Tracks live session state
- Records start/end times
- Links to multiple trainees

#### EXERCISE_RECORD
- Actual performed exercises
- Records sets as JSON array
- Tracks completion status
- Includes form ratings and RPE

## 5. Core Features

### Live Training Sessions
- **Multi-trainee Selection**: Train 1-4 clients simultaneously
- **Quick Trainee Switching**: Seamless navigation between clients
- **Real-time Recording**: Fast weight/rep/set entry
- **Session State Management**: Pause, resume, complete
- **Auto-save**: Continuous background saving
- **Offline Capability**: Record without internet

### Session Management
- **Active Session Dashboard**: See all ongoing sessions
- **Quick Resume**: One-click session continuation
- **Session Recovery**: Restore interrupted sessions
- **Session History**: View past training records

### Template System
- **Session Templates**: Pre-built workout structures
- **Exercise Templates**: Reusable exercise configurations
- **Quick Start**: Launch sessions from templates
- **Template Customization**: Modify during sessions

### Data Recording
- **Quick Entry**: Preset buttons for common values
- **Previous Performance**: Display last session data
- **Form Rating**: Quick 1-5 star rating
- **RPE Tracking**: Rate of perceived exertion
- **Rest Timer**: Automatic and manual timers

### Progress Tracking
- **Performance Trends**: Basic visualization
- **Session Summaries**: Post-workout statistics
- **Comparison Views**: Template vs actual
- **Export Options**: Download session data

## 6. User Interface Design

### Dashboard (Landing Page)
```
Primary Actions:
- Start New Session (prominent)
- Resume Active Sessions
- Quick Start Templates

Information Display:
- Active/Paused Sessions
- Today's Statistics
- Recent Completions
```

### Live Training Interface
```
Layout:
- Trainee tabs/switcher at top
- Current exercise display
- Set recording panel
- Progress indicator
- Timer and controls

Key Elements:
- Large touch targets
- Minimal scrolling
- Clear visual feedback
- Persistent navigation
```

### Mobile-First Design
- Optimized for tablet landscape
- Touch-friendly controls
- Gesture support
- Reduced visual clutter
- High contrast options

## 7. Technical Architecture

### Frontend
- **Vue.js 3**: Component-based architecture
- **Pinia**: State management for sessions
- **Tailwind CSS**: Utility-first styling
- **PWA**: Offline capability
- **WebSocket**: Real-time updates

### Backend
- **FastAPI**: High-performance API
- **SQLModel**: Type-safe ORM
- **PostgreSQL**: Primary database
- **Redis**: Session state cache
- **WebSocket**: Live updates

### Key Technical Features
- **Optimistic UI**: Immediate visual feedback
- **Offline Sync**: Queue changes when offline
- **Auto-save**: Every 30 seconds
- **State Recovery**: Restore from crashes
- **Concurrent Updates**: Handle multiple devices

## 8. Implementation Priorities

### Phase 1: MVP - Live Training
1. Basic session start/stop
2. Single trainee recording
3. Exercise progression
4. Simple templates
5. Basic offline support

### Phase 2: Multi-Trainee
1. Trainee switching
2. Concurrent recording
3. Group sessions
4. Enhanced UI

### Phase 3: Advanced Features
1. Programs and scheduling
2. Progress analytics
3. Export capabilities
4. Performance optimization

### Phase 4: Polish
1. Mobile optimization
2. Advanced offline
3. Real-time sync
4. UI enhancements

## 9. Performance Requirements

### Response Times
- Session start: < 2 seconds
- Trainee switch: < 100ms
- Set save: < 500ms
- Page load: < 3 seconds

### Reliability
- 99.9% uptime
- Zero data loss
- Automatic recovery
- Offline operation

### Scalability
- 100+ concurrent trainers
- 1000+ active sessions
- 10,000+ trainees
- Real-time sync

## 10. Security Considerations

### Data Protection
- Encrypted connections (HTTPS)
- Secure authentication (JWT)
- Role-based access control
- Data encryption at rest

### Privacy
- Trainer data isolation
- Trainee data protection
- GDPR compliance
- Audit logging

## 11. Future Enhancements

### Near-term
- Voice input for data
- Wearable integration
- Video recording
- Advanced analytics

### Long-term
- AI coaching assistance
- Nutrition integration
- Social features
- Marketplace

## 12. Success Metrics

### User Engagement
- Sessions per day
- Recording time
- Template usage
- User retention

### Performance
- Recording speed
- Error rates
- Sync success
- Uptime

### Business
- Trainer adoption
- Trainee satisfaction
- Feature usage
- Revenue per user
