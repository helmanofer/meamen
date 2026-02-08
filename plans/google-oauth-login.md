# Google/Gmail Login - Implications Analysis

## Database Changes

- `User.passwordHash` is currently required. For Google OAuth users there's no password, so either make `passwordHash` optional or add a separate auth provider table.
- New fields needed: `googleId` (unique), `authProvider` (enum: `LOCAL` | `GOOGLE`), optionally `avatarUrl`.

## Server-Side Changes

- New dependency for Google OAuth 2.0 flow (redirect to Google, receive authorization code, exchange for tokens, fetch user profile).
- New routes: `GET /api/auth/google` (redirect) and `GET /api/auth/google/callback` (handle response).
- Google Cloud Console setup: create project, configure OAuth consent screen, get Client ID + Client Secret.
- Existing JWT + cookie flow stays the same -- after Google verifies the user, issue our own JWT like we do now.

## Key Design Decisions

### 1. Who can sign up via Google?
Currently only trainers create trainees. If anyone can sign up via Google, need to decide default role and how they get linked to a trainer. This could break the current invitation-based model.

### 2. Account linking
What if `ofer@meamen.com` already exists with a password, and someone logs in via Google with the same email? Strategy needed: auto-link, reject, or ask the user.

### 3. Password-optional flows
Users who signed up via Google won't have a password. Need to handle or hide the password field accordingly (no "change password" for Google users).

## Frontend Changes

- Add a "Sign in with Google" button on Login page.
- Flow redirects browser to Google then back to the app -- handle a callback route or use popup-based flow.

## Deployment / Infrastructure

- Need a public callback URL (e.g., `https://meamen.fly.dev/api/auth/google/callback`).
- Google allows `http://localhost` for dev.
- Manage `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` environment variables.

## Effort Estimate

| Area | Effort |
|---|---|
| Google Cloud Console setup | Low |
| Prisma schema changes | Low |
| OAuth server routes | Medium |
| Account linking logic | Medium |
| Rethinking signup/invitation flow | **High** |
| Frontend login button | Low |

## Biggest Implication

The app uses an invitation model where trainers create trainees. Google login implies self-registration, which conflicts with that model. Need to decide:
- **Option A**: Google login only for existing users (trainer pre-creates account, trainee links Google later)
- **Option B**: Open self-registration via Google, then trainee requests to join a trainer
- **Option C**: Trainer sends invite link, trainee signs up via Google through that link
