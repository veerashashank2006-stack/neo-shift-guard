-- Add policy for managers to view all user profiles
CREATE POLICY "managers_view_all_user_profiles" 
ON public.user_profiles 
FOR SELECT 
USING (is_manager_from_auth());