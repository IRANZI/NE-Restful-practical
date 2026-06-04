INSERT INTO extinguishers (serial_number, location, type, size, installation_date, expiry_date, status)
VALUES
  ('FE-2026-001', 'Main Building - Ground Floor', 'CO2', '5 lb', '2026-01-15', '2031-01-15', 'Active'),
  ('FE-2026-002', 'Warehouse A - Loading Bay', 'Dry Chemical', '9 lb', '2025-08-10', '2030-08-10', 'Needs Inspection'),
  ('FE-2026-003', 'Server Room', 'CO2', '5 lb', '2024-05-01', '2029-05-01', 'In Maintenance')
ON CONFLICT (serial_number) DO NOTHING;
