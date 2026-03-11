-- Add payment_type and pro_audit_count columns to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS payment_type TEXT DEFAULT 'one_time';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS pro_audit_count INTEGER DEFAULT 0;
