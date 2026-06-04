-- Seed the platform administrator and keep the credentials correct on reruns.
INSERT INTO users (first_name, last_name, email, password_hash, role)
VALUES
  ('System', 'Admin', 'admin@tzw.local', '$2a$12$53iQgQVaIAoQmHj0RNXVbegdWATTTvJIQLuuAuqRvXQkWpdIfbnKi', 'Admin')
ON CONFLICT (email) DO UPDATE SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  password_hash = EXCLUDED.password_hash,
  role = EXCLUDED.role;
