-- Add NFT fields to projects table
ALTER TABLE projects ADD COLUMN project_type text DEFAULT 'Token';
ALTER TABLE projects ADD COLUMN twitter_url text;
ALTER TABLE projects ADD COLUMN mint_price text;
ALTER TABLE projects ADD COLUMN collection_size text;
