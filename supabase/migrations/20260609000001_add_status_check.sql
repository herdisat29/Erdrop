-- Add CHECK constraints for status columns to ensure data integrity
ALTER TABLE projects 
ADD CONSTRAINT check_project_status 
CHECK (status IN ('Not Started', 'In Progress', 'Eligible', 'Claimed', 'Missed', 'Vesting'));

ALTER TABLE logs 
ADD CONSTRAINT check_log_status 
CHECK (status IN ('Pending', 'Completed', 'Claimed', 'Failed'));
