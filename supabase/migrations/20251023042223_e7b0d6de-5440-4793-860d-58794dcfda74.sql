-- Fix the update_qr_access_pin function to include WHERE clause
DROP FUNCTION IF EXISTS public.update_qr_access_pin(text);

CREATE OR REPLACE FUNCTION public.update_qr_access_pin(new_pin text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'extensions'
AS $$
BEGIN
    -- Check if user is admin/manager
    IF NOT is_manager_from_auth() THEN
        RAISE EXCEPTION 'Only admins can update the QR access PIN';
    END IF;
    
    -- Update the PIN (will be hashed) - add WHERE clause to satisfy database requirements
    UPDATE public.qr_attendance_config 
    SET access_pin = crypt(new_pin, gen_salt('bf')),
        updated_at = CURRENT_TIMESTAMP
    WHERE id IS NOT NULL;
    
    RETURN TRUE;
END;
$$;