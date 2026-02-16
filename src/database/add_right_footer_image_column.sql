-- Add pdf_footer_image_right_url column to company_settings
ALTER TABLE public.company_settings
ADD COLUMN IF NOT EXISTS pdf_footer_image_right_url TEXT;
