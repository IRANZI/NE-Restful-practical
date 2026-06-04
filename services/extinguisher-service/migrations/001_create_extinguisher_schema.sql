CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS extinguishers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  serial_number VARCHAR(80) NOT NULL UNIQUE,
  location VARCHAR(180) NOT NULL,
  type VARCHAR(40) NOT NULL CHECK (type IN ('Water', 'CO2', 'Foam', 'Dry Chemical')),
  size VARCHAR(20) NOT NULL CHECK (size IN ('1.5 lb', '5 lb', '9 lb', '12 lb')),
  installation_date DATE NOT NULL,
  expiry_date DATE NOT NULL,
  status VARCHAR(30) NOT NULL CHECK (status IN ('Active', 'Needs Inspection', 'Expired', 'In Maintenance', 'Retired')),
  assigned_to UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT extinguisher_expiry_after_installation CHECK (expiry_date > installation_date)
);

CREATE INDEX IF NOT EXISTS idx_extinguishers_status ON extinguishers(status);
CREATE INDEX IF NOT EXISTS idx_extinguishers_expiry_date ON extinguishers(expiry_date);
CREATE INDEX IF NOT EXISTS idx_extinguishers_assigned_to ON extinguishers(assigned_to);
