# ClientPro Backend API

Backend API for ClientPro - automated SMS follow-up for real estate agents.

## Tech Stack

- Node.js 18+ / Express 5
- PostgreSQL 15+
- Twilio (SMS)
- Stripe (payments)
- Resend (transactional email)
- node-cron (background jobs)

## Quick Start

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. Set up PostgreSQL

Create a database and run the schema:

```bash
createdb clientpro
npm run db:setup
```

Or manually:

```bash
psql $DATABASE_URL -f schema.sql
```

### 4. Set up Stripe products (when ready)

```bash
npm run stripe:setup
```

This creates all 5 tier products and monthly/annual prices in Stripe. Idempotent - safe to run multiple times.

### 5. Start the server

```bash
# Development (auto-reload)
npm run dev

# Production
npm start
```

Server runs on `http://localhost:3000` by default.

## API Endpoints

### Authentication
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new agent |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user + usage stats |
| PUT | `/api/auth/profile` | Update profile |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password with token |

### Clients
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/clients` | Add a client |
| GET | `/api/clients` | List clients (paginated, searchable) |
| GET | `/api/clients/:id` | Get client + messages + referrals |
| PUT | `/api/clients/:id` | Update client |
| DELETE | `/api/clients/:id` | Soft-delete client |
| POST | `/api/clients/import` | CSV import (multipart form) |

### Messages
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/messages` | List messages (filterable by status) |
| GET | `/api/messages/upcoming` | Next 30 days, grouped by week |
| GET | `/api/messages/replies` | Unread replies |
| PUT | `/api/messages/:id` | Edit scheduled message text |
| PUT | `/api/messages/:id/read` | Mark reply as read |
| DELETE | `/api/messages/:id` | Cancel scheduled message |

### Referrals
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/referrals` | Create referral |
| GET | `/api/referrals` | List referrals (filterable) |
| PUT | `/api/referrals/:id` | Update referral status |

### Billing (Stripe)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/billing/create-checkout-session` | Start checkout |
| GET | `/api/billing/portal` | Customer billing portal |
| POST | `/api/billing/change-plan` | Change subscription tier |
| POST | `/api/billing/webhook` | Stripe webhook (public) |

### Team Management (Team/Brokerage tiers)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/team/invite` | Invite team member |
| POST | `/api/team/remove` | Remove team member |
| GET | `/api/team/members` | List team members + stats |

### Analytics (Elite+ tiers)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/analytics/dashboard` | Dashboard stats |

### Twilio Webhook
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/twilio/incoming` | Incoming SMS handler (public) |

### Health Check
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Server health check |

## Background Jobs

- **Send Scheduled Messages**: Every 15 minutes, sends due messages via Twilio
- **Update Engagement Scores**: Daily at 2am, recalculates client engagement scores

## Tier Limits

| Tier | Clients | Agents | Extras |
|------|---------|--------|--------|
| Starter | 20 | 1 | - |
| Professional | 100 | 1 | - |
| Elite | 500 | 1 | Engagement insights |
| Team | 1,000 | 10 | Team dashboard |
| Brokerage | Unlimited | Unlimited | Dedicated account manager |

## Environment Variables

See `.env.example` for all required variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT token signing
- `TWILIO_ACCOUNT_SID` / `TWILIO_AUTH_TOKEN` - Twilio credentials
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET` - Stripe credentials
- `RESEND_API_KEY` - Resend email API key
- `FRONTEND_URL` - Frontend URL for CORS and email links

## Deployment

Deploy to Render or Railway:

1. Push to GitHub
2. Connect repo to Render/Railway
3. Set environment variables
4. Deploy

The server auto-detects production mode via `NODE_ENV=production`.

## Example API Calls

```bash
# Register
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"agent@example.com","password":"password123","first_name":"John","last_name":"Doe","phone_number":"+15551234567"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agent@example.com","password":"password123"}'

# Add client (use token from login)
curl -X POST http://localhost:3000/api/clients \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"first_name":"Sarah","last_name":"Johnson","phone_number":"+15559876543","closing_date":"2025-01-15","city":"Austin","state":"TX","property_type":"single_family"}'

# List clients
curl http://localhost:3000/api/clients \
  -H "Authorization: Bearer YOUR_TOKEN"

# View upcoming messages
curl http://localhost:3000/api/messages/upcoming \
  -H "Authorization: Bearer YOUR_TOKEN"
```
