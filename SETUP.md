# NDC - Nagpur Developer Club Setup Guide

## Prerequisites
- Node.js 18+ installed
- Supabase account and project created

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select existing one
3. Go to Settings > API
4. Copy the Project URL and anon/public key

## Database Setup

### 1. Create the clients table

In your Supabase SQL editor, run:

```sql
-- Create developers table
CREATE TABLE developers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE developers ENABLE ROW LEVEL SECURITY;

-- Create policy for developers to view their own data
CREATE POLICY "Developers can view own data" ON developers
  FOR SELECT USING (auth.uid()::text = id::text);
```

### 2. Set up Authentication

1. Go to Authentication > Settings in Supabase
2. Enable Email authentication
3. Configure your email templates if needed

### 3. Create a test user

You can create a test user through the Supabase dashboard or use the SQL:

```sql
-- Insert a test developer (replace with actual email/password)
INSERT INTO developers (email, password_hash) 
VALUES ('test@example.com', 'hashed_password_here');
```

## Running the Application

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Features

- **Landing Page** (`/`): Welcome page for Nagpur Developer Club
- **Login Page** (`/login`): Developer authentication
- **Dashboard** (`/dashboard`): Developer profile and community features
- **Authentication**: Secure developer authentication system
- **Community Features**: Connect with local Nagpur developers
- **Job Board**: Find developer jobs and internships in Nagpur
- **Q&A Platform**: Get help from the developer community
- **Middleware**: Route protection and session management

## File Structure

```
app/
├── page.tsx              # Landing page
├── login/
│   └── page.tsx         # Login form
├── dashboard/
│   └── page.tsx         # Protected dashboard
└── layout.tsx            # Root layout
utils/
└── supabase/
    └── client.ts        # Supabase client configuration
middleware.ts             # Authentication middleware
```

## Security Features

- Route protection with middleware
- Automatic session management
- Secure authentication flow
- Row Level Security (RLS) in database

## Troubleshooting

### Common Issues

1. **Environment variables not loading**: Ensure `.env.local` is in project root
2. **Authentication errors**: Check Supabase credentials and table setup
3. **Middleware not working**: Verify Next.js version compatibility

### Support

For Supabase-specific issues, check the [Supabase Documentation](https://supabase.com/docs).

