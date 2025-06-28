# Fitness Trainer Web App - UI Design Document

## Core Design Philosophy

The UI is optimized for trainers conducting live training sessions with multiple clients. Every design decision prioritizes speed and efficiency during active workouts.

## 1. Dashboard - Session-Centric Design

### Primary Dashboard View
```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🏋️ FitTrainer Pro                               [🔔] [Settings] [John D.]│
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────────────────────────────┐ ┌─────────────────────────────────┐ │
│ │      START NEW SESSION          │ │      ACTIVE SESSIONS            │ │
│ │                                 │ │                                 │ │
│ │    [+ Begin Training]           │ │ 🔴 Live (2)                     │ │
│ │                                 │ │ • Alice & Bob - Upper Body      │ │
│ │    Quick Start:                 │ │   25 min ago                    │ │
│ │    ⚡ Upper Body Strength       │ │   [Resume →]                    │ │
│ │    ⚡ HIIT Circuit              │ │                                 │ │
│ │    ⚡ Leg Day                   │ │ ⏸️ Paused (1)                   │ │
│ │                                 │ │ • Charlie - Full Body           │ │
│ └─────────────────────────────────┘ │   2 hours ago                   │ │
│                                     │   [Resume →] [Complete ✓]       │ │
│ ┌─────────────────────────────────┐ └─────────────────────────────────┘ │
│ │      TODAY'S STATS              │                                     │
│ │                                 │ ┌─────────────────────────────────┐ │
│ │ 📊 Sessions: 5                  │ │      QUICK ACTIONS              │ │
│ │ 👥 Trainees: 8                  │ │                                 │ │
│ │ 💪 Sets Recorded: 127           │ │ [👥 Manage Trainees]            │ │
│ │ ⏱️ Training Time: 4.5 hrs       │ │ [📚 Session Templates]          │ │
│ │                                 │ │ [📋 Programs]                   │ │
│ │ Next: Group Class @ 3:00 PM     │ │ [📊 Analytics]                  │ │
│ └─────────────────────────────────┘ └─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────┘
```

## 2. Session Start Flow

### Trainee Selection Modal
```
┌─────────────────────────────────────────────────────────────────────────┐
│ Start New Training Session                                      [✕]     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ STEP 1: Select Trainees (1-4)                                          │
│                                                                         │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐          │
│ │ ☑️ Alice Johnson │ │ ☑️ Bob Smith    │ │ ☐ Charlie Brown │          │
│ │ Last: Yesterday  │ │ Last: 2 days    │ │ Last: Today     │          │
│ │ Next: Upper Body │ │ Next: Leg Day   │ │ Completed       │          │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘          │
│                                                                         │
│ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐          │
│ │ ☐ Dana White    │ │ ☐ Eve Adams     │ │ ☐ Frank Miller  │          │
│ │ Last: 3 days    │ │ Last: Week ago  │ │ Last: Today     │          │
│ │ Next: HIIT      │ │ Next: Full Body │ │ Rest Day        │          │
│ └─────────────────┘ └─────────────────┘ └─────────────────┘          │
│                                                                         │
│ [Select All] [Clear Selection]                   Selected: 2 trainees   │
│                                                                         │
│ STEP 2: Choose Session Type                                            │
│                                                                         │
│ ○ Follow Assigned Program                                              │
│ ○ Use Session Template     [Select Template ▼]                         │
│ ● Freestyle Session (No template)                                       │
│                                                                         │
│ Location: [Main Gym ▼]                                                  │
│                                                                         │
│                            [Cancel]            [Start Session →]        │
└─────────────────────────────────────────────────────────────────────────┘
```

## 3. Live Training Interface

### Main Training View - Multi-Trainee
```
┌─────────────────────────────────────────────────────────────────────────┐
│ 🔴 LIVE SESSION • 32:45 • Main Gym              [⏸️ Pause] [✅ Complete] │
├─────────────────────────────────────────────────────────────────────────┤
│ [Alice Johnson ●] [Bob Smith]                    Switch: ← → or tap     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ALICE JOHNSON - Upper Body Strength              Progress: ████░░ 60%  │
│                                                                         │
│ ┌─────────────────────────────────────────────────────────────────────┐ │
│ │ 🏋️ BENCH PRESS                                    Exercise 3 of 8   │ │
│ ├─────────────────────────────────────────────────────────────────────┤ │
│ │                                                                     │ │
│ │ ┌─────────────────────────┐ ┌────────────────────────────────────┐ │ │
│ │ │ TARGET                  │ │ ALICE'S PERFORMANCE               │ │ │
│ │ │                         │ │                                    │ │ │
│ │ │ Sets: 4 × 8 reps       │ │ ✅ Set 1: 45 kg × 8 reps          │ │ │
│ │ │ Weight: 45 kg          │ │ ✅ Set 2: 45 kg × 8 reps          │ │ │
│ │ │ Rest: 90 sec           │ │                                    │ │ │
│ │ │                         │ │ 🔄 Set 3:                         │ │ │
│ │ │ Last Session:          │ │ Weight: [45] kg  Reps: [8]        │ │ │
│ │ │ 42.5 kg × 8            │ │                                    │ │ │
│ │ │                         │ │ [40] [42.5] [45] [47.5] [50]      │ │ │
│ │ │ 💡 Keep elbows at 45°  │ │ [6] [7] [8] [9] [10]              │ │ │
│ │ └─────────────────────────┘ │                                    │ │ │
│ │                             │ Form: ⭐⭐⭐⭐☆  RPE: [7]/10        │ │ │
│ │ ⏱️ Rest Timer: --:--       │                                    │ │ │
│ │ [Start Timer]              │ [💾 Save Set]  [⏭️ Skip Exercise]  │ │ │
│ │                             └────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────────────────────┘ │
│                                                                         │
│ [← Previous]                [👥 All Trainees]              [Next →]     │
└─────────────────────────────────────────────────────────────────────────┘
```

### Quick Trainee Switch View
```
┌─────────────────────────────────────────────────────────────────────────┐
│ 👥 Session Participants                                       [✕ Close] │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│ ┌─────────────────────────────┐ ┌─────────────────────────────┐       │
│ │ ALICE JOHNSON            ● │ │ BOB SMITH                   │       │
│ │                             │ │                             │       │
│ │ Current: Bench Press        │ │ Current: Squats             │       │
│ │ Set 3 of 4                  │ │ Set 2 of 5                  │       │
│ │                             │ │                             │       │
│ │ Progress: ████████░░ 75%    │ │ Progress: ████░░░░░░ 40%    │       │
│ │                             │ │                             │       │
│ │ Completed:                  │ │ Completed:                  │       │
│ │ • Warmup ✓                  │ │ • Warmup ✓                  │       │
│ │ • Push-ups ✓                │ │ • Leg Press ✓               │       │
│ │                             │ │                             │       │
│ │         [Active]            │ │      [Switch to Bob]        │       │
│ └─────────────────────────────┘ └─────────────────────────────┘       │
│                                                                         │
│ Keyboard shortcuts: ← Previous trainee  → Next trainee                 │
└─────────────────────────────────────────────────────────────────────────┘
```

### Rest Timer Overlay
```
┌─────────────────────────────────────────────────────────────────────────┐
│                           REST TIMER                                    │
│                                                                         │
│                             01:27                                       │
│                         ████████░░░░                                    │
│                                                                         │
│                    Target rest: 90 seconds                              │
│                                                                         │
│                   [⏸️ Pause]    [⏭️ Skip]                              │
└─────────────────────────────────────────────────────────────────────────┘
```

## 4. Mobile/Tablet Optimizations

### Tablet Landscape - Training Mode
```
┌─────────────────────────────────────────────────────────────┐
│ 🔴 LIVE • Alice J. • Bench Press           [👥] [⏸️] [✅]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Target: 4×8 @ 45kg          Set 3                         │
│  Last: 42.5kg×8                                            │
│                                 as expected                            │
│  ┌─────────────────┐  ┌─────────────────┐                  │
│  │   WEIGHT (kg)   │  │      REPS       │                  │
│  │                 │  │                 │                  │
│  │  [40] [42.5]    │  │    [6]  [7]     │                  │
│  │                 │  │                 │                  │
│  │   [ 45 ]        │  │     [ 8 ]       │                  │
│  │                 │  │                 │                  │
│  │ [47.5] [50]     │  │   [9]  [10]     │                  │
│  └─────────────────┘  └─────────────────┘                  │
│                                                             │
│  Form: ⭐⭐⭐⭐☆     RPE: ●●●●●●●○○○ 7/10                   │
│                                                             │
│         [💾 SAVE SET]        [⏭️ SKIP]                     │
│                                                             │
│  ← Swipe for Bob Smith →                                   │
└─────────────────────────────────────────────────────────────┘
```

### Phone Portrait - Essential Recording
```
┌─────────────────────────┐
│ 🔴 Alice • Bench Press  │
├─────────────────────────┤
│ Set 3 of 4              │
│                         │
│ Weight: [ 45 ] kg       │
│ [−2.5] [+2.5]          │
│                         │
│ Reps: [ 8 ]             │
│ [−1] [+1]              │
│                         │
│ ⭐⭐⭐⭐☆                │
│                         │
│ [💾 SAVE]               │
│                         │
│ ↓ Bob (Squats)          │
└─────────────────────────┘
```

## 5. Component Design System

### Colors
- **Primary**: Blue (#3B82F6) - Actions, links
- **Success**: Green (#10B981) - Completed, saved
- **Warning**: Yellow (#F59E0B) - Paused, attention
- **Danger**: Red (#EF4444) - Live indicator, stop
- **Neutral**: Gray scale - UI elements

### Typography
- **Headings**: Bold, larger for hierarchy
- **Body**: Regular weight, readable size
- **Numbers**: Monospace for data entry
- **Labels**: Small, muted color

### Spacing
- **Touch targets**: Minimum 44px
- **Padding**: Consistent 16px units
- **Margins**: Clear visual separation
- **Gutters**: 24px between sections

### Interactive Elements
- **Buttons**: Large, clear labels
- **Inputs**: Number inputs with steppers
- **Toggles**: Visual state indicators
- **Feedback**: Immediate visual response

## 6. Key Interaction Patterns

### Data Entry
1. Tap to select preset values
2. Manual input always available
3. Previous values shown
4. Auto-advance after save

### Navigation
1. Swipe between trainees
2. Tab navigation on desktop
3. Keyboard shortcuts
4. Persistent back navigation

### Feedback
1. Visual confirmation on save
2. Loading states during sync
3. Error messages inline
4. Success animations

### Offline Handling
1. Offline indicator
2. Local save confirmation
3. Sync status when online
4. Conflict resolution UI

## 7. Responsive Breakpoints

- **Mobile**: < 640px (essential features)
- **Tablet**: 640px - 1024px (optimized)
- **Desktop**: > 1024px (full features)

## 8. Accessibility

- **Contrast**: WCAG AA compliant
- **Font sizes**: Minimum 16px
- **Touch targets**: Minimum 44px
- **Focus indicators**: Visible
- **Screen readers**: Semantic HTML
- **Keyboard**: Full navigation

## 9. Performance Considerations

- **Lazy loading**: Load as needed
- **Optimistic UI**: Instant feedback
- **Caching**: Reduce API calls
- **Animations**: GPU accelerated
- **Images**: Compressed, WebP format
