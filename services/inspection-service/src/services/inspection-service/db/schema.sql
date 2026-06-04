CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS inspections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extinguisher_id UUID NOT NULL,
  serial_number VARCHAR(80) NOT NULL,
  location VARCHAR(180) NOT NULL,
  inspector_id UUID,
  inspector_name VARCHAR(180),
  created_by UUID,
  scheduled_for TIMESTAMPTZ NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'Completed', 'Overdue', 'Cancelled')),
  result VARCHAR(80),
  notes TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  extinguisher_id UUID NOT NULL,
  serial_number VARCHAR(80) NOT NULL,
  location VARCHAR(180) NOT NULL,
  inspector_id UUID,
  inspector_name VARCHAR(180),
  action_taken TEXT NOT NULL,
  issues_identified TEXT,
  notes TEXT,
  maintenance_date DATE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_inspections_scheduled_for ON inspections(scheduled_for);
CREATE INDEX IF NOT EXISTS idx_inspections_status ON inspections(status);
CREATE INDEX IF NOT EXISTS idx_inspections_extinguisher_id ON inspections(extinguisher_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_extinguisher_id ON maintenance_logs(extinguisher_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_date ON maintenance_logs(maintenance_date);
