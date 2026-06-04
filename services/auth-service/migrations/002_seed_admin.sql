INSERT INTO users (first_name, last_name, email, password_hash, role)
VALUES
  ('System', 'Admin', 'admin@tzw.local', '$2a$12$7klnDgEYeHDC7aHqHzVwjO30ZVx5JbkJyJa9KONxdn4Qz7dfJLFvq', 'Admin')
ON CONFLICT (email) DO NOTHING;
