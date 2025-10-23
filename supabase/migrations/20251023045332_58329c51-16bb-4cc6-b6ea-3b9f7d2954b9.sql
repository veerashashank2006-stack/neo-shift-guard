-- Fix is_manager_from_auth to check user_profiles table instead of auth metadata
CREATE OR REPLACE FUNCTION public.is_manager_from_auth()
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.user_profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'manager')
  )
$$;