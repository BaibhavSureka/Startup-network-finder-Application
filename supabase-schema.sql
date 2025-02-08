-- Create investors_mentors table
CREATE TABLE investors_mentors (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT NOT NULL
);

-- Insert sample data
INSERT INTO investors_mentors (name, category, type) VALUES
  ('Ria', 'AI', 'Investor'),
  ('Martin', 'Blockchain', 'Mentor'),
  ('Leo', 'EV', 'Mentor'),
  ('Zack', 'Ecommerce', 'Mentor'),
  ('Honia', 'Video', 'Investor');

-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  credits INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

