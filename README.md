# TradeWork Today - Contractor Onboarding Portal

Matches your existing TradeWorkToday website style exactly (Oswald/Work Sans fonts, yellow/red/black theme, same Supabase instance).

## Features

- **Access Code Login** - Unique 6-character codes for each contractor
- **Step-by-Step Documents** - Guided workflow through all forms
- **E-Signatures** - Type-to-sign with timestamps
- **File Uploads** - Driver's license & insurance to Supabase Storage
- **Progress Saving** - Auto-saves, contractors can return anytime
- **Admin Dashboard** - Send invites, track progress
- **Email Notifications** - Auto-notify on completion

## Onboarding Steps

1. ✅ Welcome & Overview
2. ✅ Independent Contractor Agreement (e-sign)
3. ✅ W-9 Tax Form (e-sign)
4. ✅ Background Check Authorization (e-sign)
5. ✅ Driver's License Upload (front & back)
6. ✅ Auto Insurance Upload
7. ✅ Safety Agreement (e-sign)
8. ✅ Complete!

---

## Quick Setup (10 minutes)

### Step 1: Run SQL in Supabase

1. Go to your existing Supabase project (the one your main site uses)
2. Click **SQL Editor** in the left sidebar
3. Paste the contents of `supabase-setup.sql` and run it

### Step 2: Create Storage Bucket

1. In Supabase, go to **Storage**
2. Click **New Bucket**
3. Name: `onboarding-docs`
4. Check **Public bucket**
5. Click **Create**

### Step 3: Choose Integration Method

#### Option A: Add to Existing Site (Recommended)

Add to your existing TradeWorkToday repo:

```bash
# Copy the component to your src folder
cp ContractorOnboarding.jsx /path/to/TradeWorkToday_website/src/
```

Then in your `App.jsx`, add a route or view:

```jsx
import ContractorOnboarding from './ContractorOnboarding';

// In your component, add a view for onboarding:
if (view === 'onboarding') {
  return <ContractorOnboarding />;
}

// Or add a link in nav to switch views
```

#### Option B: Deploy as Separate Subdomain

Deploy as standalone at `onboarding.tradeworktoday.com`:

```bash
# Clone this folder
cd tradework-onboarding

# Install dependencies
npm install

# Test locally
npm run dev

# Deploy to Vercel
vercel

# Add custom domain in Vercel dashboard
```

Then add DNS record:
```
Type: CNAME
Name: onboarding
Value: cname.vercel-dns.com
```

---

## How to Use

### Admin Flow

1. Go to the portal and click **Admin**
2. Password: `Tradework2026`
3. Fill in contractor's name, email, phone, trade
4. Click **Send Invite**
5. Contractor receives email with access code
6. Track their progress in the dashboard

### Contractor Flow

1. Receive email with access code
2. Go to onboarding portal
3. Enter 6-character code
4. Complete each step (sign, upload, acknowledge)
5. Done! Admin gets notified

---

## Customization

### Change Admin Password

In `ContractorOnboarding.jsx`, line 10:
```js
const ADMIN_PASSWORD = "YourNewPassword";
```

### Change Notification Email

In `ContractorOnboarding.jsx`, line 11:
```js
const COMPANY_EMAIL = "your@email.com";
```

### Add/Remove Steps

Edit the `ONBOARDING_STEPS` array at the top of the component, then add corresponding content in `renderStepContent()`.

---

## File Structure

```
tradework-onboarding/
├── src/
│   ├── App.jsx                    # Entry point
│   ├── ContractorOnboarding.jsx   # Main component (all-in-one)
│   └── main.jsx                   # React mount
├── index.html
├── package.json
├── vite.config.js
├── supabase-setup.sql             # Database setup
└── README.md
```

---

## Same Supabase Instance

This uses your **existing** Supabase project - no new account needed:
- URL: `https://pmbukkiatxyoefpmmypg.supabase.co`
- Creates new `onboarding` table (won't affect `applicants` table)
- Uses new `onboarding-docs` storage bucket

---

## Support

Questions? Email: jobs@tradeworktoday.com
