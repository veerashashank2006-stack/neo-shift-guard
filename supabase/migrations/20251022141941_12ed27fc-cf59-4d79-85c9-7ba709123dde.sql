-- Enable pgcrypto extension for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Add access_pin column to qr_attendance_config table
ALTER TABLE public.qr_attendance_config 
ADD COLUMN access_pin TEXT DEFAULT crypt('admin1234', gen_salt('bf'));

-- Create function to verify QR access PIN
CREATE OR REPLACE FUNCTION public.verify_qr_access_pin(input_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    stored_pin TEXT;
BEGIN
    -- Get the stored hashed PIN
    SELECT access_pin INTO stored_pin 
    FROM public.qr_attendance_config 
    LIMIT 1;
    
    -- If no config exists, return false
    IF stored_pin IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Compare the input PIN with stored hashed PIN
    RETURN (stored_pin = crypt(input_pin, stored_pin));
END;
$$;

-- Create function to update QR access PIN (only for admins/managers)
CREATE OR REPLACE FUNCTION public.update_qr_access_pin(new_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Check if user is admin/manager
    IF NOT is_manager_from_auth() THEN
        RAISE EXCEPTION 'Only admins can update the QR access PIN';
    END IF;
    
    -- Update the PIN (will be hashed)
    UPDATE public.qr_attendance_config 
    SET access_pin = crypt(new_pin, gen_salt('bf')),
        updated_at = CURRENT_TIMESTAMP;
    
    RETURN TRUE;
END;
$$;