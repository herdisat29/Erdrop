-- Enable RLS on projects and logs
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent conflicts
DROP POLICY IF EXISTS "Users can view own projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
DROP POLICY IF EXISTS "Users can update own projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own projects" ON projects;

DROP POLICY IF EXISTS "Users can view own logs" ON logs;
DROP POLICY IF EXISTS "Users can insert own logs" ON logs;
DROP POLICY IF EXISTS "Users can update own logs" ON logs;
DROP POLICY IF EXISTS "Users can delete own logs" ON logs;

-- Projects Policies
CREATE POLICY "Users can view own projects"
    ON projects FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own projects"
    ON projects FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own projects"
    ON projects FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own projects"
    ON projects FOR DELETE
    USING (auth.uid() = user_id);

-- Logs Policies (using join to verify project ownership)
CREATE POLICY "Users can view own logs"
    ON logs FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = logs.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can insert own logs"
    ON logs FOR INSERT
    WITH CHECK (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = logs.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can update own logs"
    ON logs FOR UPDATE
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = logs.project_id
        AND projects.user_id = auth.uid()
    ))
    WITH CHECK (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = logs.project_id
        AND projects.user_id = auth.uid()
    ));

CREATE POLICY "Users can delete own logs"
    ON logs FOR DELETE
    USING (EXISTS (
        SELECT 1 FROM projects
        WHERE projects.id = logs.project_id
        AND projects.user_id = auth.uid()
    ));
