-- Fix RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for profiles table
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- Add missing admin CRUD policies for notifications
CREATE POLICY "admins_manage_notifications" ON public.notifications
FOR ALL USING (is_manager_from_auth())
WITH CHECK (is_manager_from_auth());

-- Add policy to allow users to update their own notifications (mark as read)
CREATE POLICY "users_update_own_notifications" ON public.notifications
FOR UPDATE USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());