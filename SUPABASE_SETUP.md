# Supabase Setup Guide for Broadcast

This guide will help you set up Supabase authentication and database for Broadcast.

## Step 1: Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or sign in
3. Click "New Project"
4. Enter project details:
   - **Name**: Broadcast
   - **Database Password**: (generate a strong password and save it)
   - **Region**: Choose closest to your users
5. Click "Create new project"

## Step 2: Get Your Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (starts with https://xxx.supabase.co)
   - **anon public** key

3. Create a `.env` file in your Broadcast project root:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

## Step 3: Enable Authentication Providers

### Email/Password (Already Enabled by Default)

### Google OAuth (Recommended)
1. Go to **Authentication** → **Providers**
2. Enable **Google**
3. Follow the instructions to set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URIs:
     - `https://your-project.supabase.co/auth/v1/callback`
   - Copy Client ID and Client Secret
4. Paste them into Supabase Google provider settings
5. Save

## Step 4: Create Database Tables

Go to **SQL Editor** in Supabase and run this SQL:

```sql
-- ============================================
-- USERS EXTENSION (Profiles)
-- ============================================
-- Stores additional user information beyond Supabase auth

create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  full_name text,
  avatar_url text,
  stripe_customer_id text unique, -- Stripe customer ID
  subscription_tier text default 'starter' check (subscription_tier in ('starter', 'creator', 'professional', 'enterprise')),
  subscription_status text default 'active' check (subscription_status in ('active', 'cancelled', 'past_due', 'trialing')),
  subscription_id text, -- Stripe subscription ID
  posts_this_month integer default 0,
  post_limit integer default 25,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

-- Policies: Users can only see and update their own profile
create policy "Users can view own profile" 
  on public.profiles for select 
  using ( auth.uid() = id );

create policy "Users can update own profile" 
  on public.profiles for update 
  using ( auth.uid() = id );

-- Function to create profile on signup
create or replace function public.handle_new_user() 
returns trigger 
language plpgsql 
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id, 
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Trigger to automatically create profile on signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================
-- PLATFORM CONNECTIONS
-- ============================================
-- Stores OAuth tokens for connected social platforms

create table public.platform_connections (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  platform text not null check (platform in ('twitter', 'bluesky', 'mastodon', 'linkedin', 'threads', 'facebook')),
  platform_user_id text,
  platform_username text,
  access_token text not null,
  refresh_token text,
  token_expires_at timestamp with time zone,
  instance_url text, -- For Mastodon
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, platform)
);

alter table public.platform_connections enable row level security;

create policy "Users can view own connections" 
  on public.platform_connections for select 
  using ( auth.uid() = user_id );

create policy "Users can insert own connections" 
  on public.platform_connections for insert 
  with check ( auth.uid() = user_id );

create policy "Users can update own connections" 
  on public.platform_connections for update 
  using ( auth.uid() = user_id );

create policy "Users can delete own connections" 
  on public.platform_connections for delete 
  using ( auth.uid() = user_id );

-- ============================================
-- OAUTH STATE (For OAuth flows)
-- ============================================
-- Temporary storage for OAuth state and code verifiers

create table public.oauth_state (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  platform text not null,
  state text not null,
  code_verifier text,
  expires_at timestamp with time zone not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.oauth_state enable row level security;

create policy "Users can view own oauth state" 
  on public.oauth_state for select 
  using ( auth.uid() = user_id );

create policy "Users can insert own oauth state" 
  on public.oauth_state for insert 
  with check ( auth.uid() = user_id );

-- Auto-delete expired OAuth states
create index oauth_state_expires_at_idx on public.oauth_state(expires_at);

-- ============================================
-- POSTS
-- ============================================
-- Stores all posts (published and drafts)

create table public.posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  content text not null,
  tags text[], -- Array of tags
  platforms text[] not null, -- Array of platform IDs
  images jsonb default '[]'::jsonb, -- Array of {url: string, alt_text: string, file_name: string}
  status text default 'draft' check (status in ('draft', 'scheduled', 'publishing', 'published', 'failed')),
  scheduled_for timestamp with time zone,
  published_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.posts enable row level security;

create policy "Users can view own posts" 
  on public.posts for select 
  using ( auth.uid() = user_id );

create policy "Users can insert own posts" 
  on public.posts for insert 
  with check ( auth.uid() = user_id );

create policy "Users can update own posts" 
  on public.posts for update 
  using ( auth.uid() = user_id );

create policy "Users can delete own posts" 
  on public.posts for delete 
  using ( auth.uid() = user_id );

-- ============================================
-- POST RESULTS
-- ============================================
-- Stores results for each platform a post was sent to

create table public.post_results (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts on delete cascade not null,
  platform text not null,
  status text default 'pending' check (status in ('pending', 'success', 'failed')),
  platform_post_id text, -- ID from the platform (e.g., tweet ID)
  platform_post_url text, -- Link to the post on the platform
  error_message text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.post_results enable row level security;

create policy "Users can view results for own posts" 
  on public.post_results for select 
  using ( 
    exists (
      select 1 from public.posts 
      where posts.id = post_results.post_id 
      and posts.user_id = auth.uid()
    )
  );

-- ============================================
-- USAGE TRACKING
-- ============================================
-- Track monthly usage for post limits

create table public.usage_tracking (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users on delete cascade not null,
  month date not null, -- First day of the month
  posts_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, month)
);

alter table public.usage_tracking enable row level security;

create policy "Users can view own usage" 
  on public.usage_tracking for select 
  using ( auth.uid() = user_id );

-- ============================================
-- ANALYTICS
-- ============================================
-- Track post performance and engagement

create table public.post_analytics (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references public.posts on delete cascade not null,
  platform text not null,
  views integer default 0,
  likes integer default 0,
  comments integer default 0,
  shares integer default 0,
  clicks integer default 0,
  engagement_rate decimal(5,2) default 0.00, -- Percentage
  last_synced_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(post_id, platform)
);

alter table public.post_analytics enable row level security;

create policy "Users can view analytics for own posts" 
  on public.post_analytics for select 
  using ( 
    exists (
      select 1 from public.posts 
      where posts.id = post_analytics.post_id 
      and posts.user_id = auth.uid()
    )
  );

-- Index for faster queries
create index post_analytics_post_id_idx on public.post_analytics(post_id);
create index post_analytics_platform_idx on public.post_analytics(platform);

-- ============================================
-- TEAMS (Professional+ plans only)
-- ============================================

create table public.teams (
  id uuid default gen_random_uuid() primary key,
  owner_id uuid references auth.users on delete cascade not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.teams enable row level security;

create policy "Team owners can view their teams" 
  on public.teams for select 
  using ( auth.uid() = owner_id );

create policy "Team owners can create teams" 
  on public.teams for insert 
  with check ( auth.uid() = owner_id );

create policy "Team owners can update their teams" 
  on public.teams for update 
  using ( auth.uid() = owner_id );

create policy "Team owners can delete their teams" 
  on public.teams for delete 
  using ( auth.uid() = owner_id );

-- ============================================
-- TEAM MEMBERS
-- ============================================

create table public.team_members (
  id uuid default gen_random_uuid() primary key,
  team_id uuid references public.teams on delete cascade not null,
  user_id uuid references auth.users on delete cascade not null,
  role text not null check (role in ('admin', 'editor', 'viewer')),
  invited_by uuid references auth.users,
  invited_at timestamp with time zone default timezone('utc'::text, now()) not null,
  joined_at timestamp with time zone,
  status text default 'pending' check (status in ('pending', 'active', 'declined')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(team_id, user_id)
);

alter table public.team_members enable row level security;

create policy "Team members can view team membership" 
  on public.team_members for select 
  using ( 
    auth.uid() = user_id OR
    exists (
      select 1 from public.teams 
      where teams.id = team_members.team_id 
      and teams.owner_id = auth.uid()
    )
  );

create policy "Team owners can invite members" 
  on public.team_members for insert 
  with check ( 
    exists (
      select 1 from public.teams 
      where teams.id = team_id 
      and teams.owner_id = auth.uid()
    )
  );

create policy "Team owners can update members" 
  on public.team_members for update 
  using ( 
    exists (
      select 1 from public.teams 
      where teams.id = team_id 
      and teams.owner_id = auth.uid()
    )
  );

create policy "Team owners can remove members" 
  on public.team_members for delete 
  using ( 
    exists (
      select 1 from public.teams 
      where teams.id = team_id 
      and teams.owner_id = auth.uid()
    )
  );

-- Index for faster queries
create index team_members_team_id_idx on public.team_members(team_id);
create index team_members_user_id_idx on public.team_members(user_id);

-- Function to increment post count
create or replace function public.increment_post_count()
returns trigger
language plpgsql
security definer
as $$
declare
  current_month date;
begin
  current_month := date_trunc('month', now())::date;
  
  -- Insert or update usage tracking
  insert into public.usage_tracking (user_id, month, posts_count)
  values (new.user_id, current_month, 1)
  on conflict (user_id, month)
  do update set 
    posts_count = usage_tracking.posts_count + 1,
    updated_at = now();
    
  -- Update profile posts_this_month
  update public.profiles
  set posts_this_month = (
    select posts_count 
    from public.usage_tracking 
    where user_id = new.user_id 
    and month = current_month
  )
  where id = new.user_id;
  
  return new;
end;
$$;

-- Trigger to track post count when post is published
create trigger on_post_published
  after insert or update of status on public.posts
  for each row 
  when (new.status = 'published')
  execute procedure public.increment_post_count();

-- ============================================
-- INDEXES
-- ============================================
-- Improve query performance

create index posts_user_id_idx on public.posts(user_id);
create index posts_status_idx on public.posts(status);
create index posts_scheduled_for_idx on public.posts(scheduled_for) where scheduled_for is not null;
create index platform_connections_user_id_idx on public.platform_connections(user_id);
create index post_results_post_id_idx on public.post_results(post_id);
create index usage_tracking_user_id_month_idx on public.usage_tracking(user_id, month);
```

## Step 5: Set Up Email Templates (Optional)

1. Go to **Authentication** → **Email Templates**
2. Customize the templates for:
   - Confirm signup
   - Magic Link
   - Change email address
   - Reset password

## Step 6: Configure URL Redirects

1. Go to **Authentication** → **URL Configuration**
2. Set **Site URL**: `http://localhost:3000` (for development)
3. Add **Redirect URLs**:
   - `http://localhost:3000/confirm`
   - `http://localhost:3000/dashboard`
   - For production, add your production URLs

## Step 7: Test Authentication

1. Start your Broadcast app:
```bash
npm install
npm run dev
```

2. Go to `http://localhost:3000/signup`
3. Create a test account
4. Check your email for confirmation (if email confirmation is enabled)
5. Try logging in

## Step 8: Set Up Storage for Images

1. Go to **Storage** in Supabase dashboard
2. Click "Create a new bucket"
3. Fill in:
   - **Name**: `post-images`
   - **Public bucket**: ✅ Yes (images need to be publicly accessible)
4. Click "Create bucket"

5. Set up Storage Policies:
```sql
-- Allow authenticated users to upload
create policy "Users can upload own images"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'post-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access
create policy "Public read access"
on storage.objects for select
to public
using ( bucket_id = 'post-images' );

-- Allow users to delete their own images
create policy "Users can delete own images"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'post-images' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

## Step 9: Production Setup

When deploying to production:

1. Update Supabase **URL Configuration**:
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: `https://yourdomain.com/confirm`, etc.

2. Update your production `.env`:
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

3. In Supabase, go to **Settings** → **API** and note:
   - Use `anon public` key for client-side
   - Use `service_role secret` key ONLY for server-side operations (never expose this!)

## Database Schema Overview

### Tables Created:

1. **profiles** - Extended user information and subscription details
2. **platform_connections** - OAuth tokens for connected social platforms
3. **posts** - All posts (drafts, scheduled, published)
4. **post_results** - Results for each platform a post was sent to
5. **usage_tracking** - Monthly post count tracking for limits

### Security:

- All tables have Row Level Security (RLS) enabled
- Users can only access their own data
- Automatic profile creation on signup
- Automatic usage tracking on post publish

## Troubleshooting

### "Invalid API key" error
- Check that your `.env` file has correct SUPABASE_URL and SUPABASE_KEY
- Make sure `.env` is in project root
- Restart dev server after changing `.env`

### OAuth not working
- Verify redirect URLs in both Supabase and OAuth provider
- For Google: Check authorized redirect URIs in Google Cloud Console
- Make sure provider is enabled in Supabase

### Email not sending
- Check Supabase email settings
- For development, check Supabase dashboard for email logs
- For production, set up custom SMTP (Settings → Auth → SMTP Settings)

### Database queries failing
- Verify RLS policies are set up correctly
- Check that user is authenticated
- Use Supabase dashboard SQL editor to test queries

## Next Steps

Once authentication is working:
1. ✅ Users can sign up and log in
2. ✅ User profiles are automatically created
3. ✅ Dashboard shows user-specific data
4. 🚀 Ready to integrate social platform APIs
5. 🚀 Ready to add payment processing (Stripe)

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Nuxt Supabase Module](https://supabase.nuxtjs.org/)
