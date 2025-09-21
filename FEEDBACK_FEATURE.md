# Feedback & Issue Tracking Feature

## Overview
The feedback system allows clients to report issues with their accounts and track the status of their reports in real-time.

## Features

### 1. Report Issues
- **Location**: Dashboard → Actions column → 🚨 Report Issue button
- **What you can report**:
  - Account-specific issues
  - Technical problems
  - Access issues
  - Any other account-related concerns

### 2. Issue Submission Form
- **Prefilled Information**: Username and URL of the account being reported
- **Required Fields**: Issue description (detailed explanation of the problem)
- **Optional Fields**: Screenshot upload (JPG/PNG format, max 5MB)
- **Automatic Tracking**: Each report is linked to your account and the specific account being reported

### 3. Issue Status Tracking
- **Open** 🟠: Issue reported, awaiting review
- **In Progress** 🔵: Issue being investigated/fixed
- **Resolved** 🟢: Issue has been fixed

### 4. My Feedback Page
- **Access**: Dashboard → "My Feedback" button or direct URL: `/feedback`
- **Features**:
  - View all your reported issues
  - Track status changes
  - Access screenshots
  - See issue descriptions
  - View reporting dates

## How to Use

### Reporting an Issue
1. Go to your Dashboard
2. Find the account with the issue
3. Click the 🚨 "Report Issue" button in the Actions column
4. Fill in the issue description
5. Optionally upload a screenshot
6. Click "Submit Report"
7. Choose whether to view all your issues

### Viewing Your Issues
1. Click "My Feedback" button on the Dashboard
2. Or navigate directly to `/feedback`
3. View all your reported issues with current status
4. Click "View Full Message" for long descriptions
5. Click "View Screenshot" to see uploaded images

## Navigation
- **Dashboard** (`/dashboard`): Manage accounts and report issues
- **My Feedback** (`/feedback`): Track all your reported issues
- **Back to Dashboard**: Return to account management

## Benefits
- **Transparency**: Know exactly what's happening with your issues
- **Self-Service**: No need to ask for updates - check status anytime
- **Documentation**: Keep track of all reported problems
- **Efficiency**: Quick access to issue history and screenshots

## Technical Details
- **Database**: Uses `feedback` table with RLS policies
- **Storage**: Screenshots stored in Supabase `feedback` bucket
- **Security**: Only authenticated users can access their own feedback
- **Real-time**: Status updates reflect immediately in the database

## Support
If you encounter any issues with the feedback system itself, please contact your system administrator.

