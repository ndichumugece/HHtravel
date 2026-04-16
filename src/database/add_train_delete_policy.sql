-- Add DELETE policies for train_receipts table
DROP POLICY IF EXISTS "Consultants can delete own train receipts" ON public.train_receipts;
DROP POLICY IF EXISTS "Admins can delete all train receipts" ON public.train_receipts;

CREATE POLICY "Consultants can delete own train receipts" 
ON public.train_receipts FOR DELETE USING (auth.uid() = consultant_id);

CREATE POLICY "Admins can delete all train receipts" 
ON public.train_receipts FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
);
