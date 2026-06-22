-- Migration: Create claim_schedules table for vesting

CREATE TABLE IF NOT EXISTS public.claim_schedules (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id text NOT NULL,
    project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,
    claim_date timestamptz NOT NULL,
    amount numeric,
    notes text,
    status text NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Claimed', 'Missed')),
    created_at timestamptz DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE public.claim_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own claim schedules"
    ON public.claim_schedules FOR SELECT
    USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own claim schedules"
    ON public.claim_schedules FOR INSERT
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own claim schedules"
    ON public.claim_schedules FOR UPDATE
    USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can delete their own claim schedules"
    ON public.claim_schedules FOR DELETE
    USING (auth.uid()::text = user_id);

-- Create index for quick lookups by project and user
CREATE INDEX idx_claim_schedules_user_project ON public.claim_schedules(user_id, project_id);
CREATE INDEX idx_claim_schedules_date ON public.claim_schedules(claim_date);
