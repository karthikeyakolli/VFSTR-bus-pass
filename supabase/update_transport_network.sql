-- VFSTR Transport Network & GPS Infrastructure Schema Extension

-- 1. ROUTE STATUS ENUM
DO $$ BEGIN
    CREATE TYPE route_status AS ENUM ('active', 'inactive', 'maintenance', 'suspended');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- 2. EXTEND ROUTES TABLE WITH NETWORK & DISTANCE METRICS
ALTER TABLE public.routes
ADD COLUMN IF NOT EXISTS starting_point VARCHAR(150) DEFAULT 'District Headquarters',
ADD COLUMN IF NOT EXISTS ending_point VARCHAR(150) DEFAULT 'VFSTR Vadlamudi Campus',
ADD COLUMN IF NOT EXISTS distance_km NUMERIC(6, 2) DEFAULT 0.0,
ADD COLUMN IF NOT EXISTS fee_category VARCHAR(50) DEFAULT 'Standard Tier',
ADD COLUMN IF NOT EXISTS route_status route_status DEFAULT 'active';

-- 3. EXTEND ROUTE STOPS TABLE WITH GPS LATITUDE / LONGITUDE & TIME PLACEHOLDERS
ALTER TABLE public.route_stops
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS morning_pickup_time TIME DEFAULT '07:15:00',
ADD COLUMN IF NOT EXISTS evening_drop_time TIME DEFAULT '05:30:00';

-- 4. PREPARE BUS VEHICLE GPS LIVE TRACKING PLACEHOLDER TABLE (Future Integration Ready)
CREATE TABLE IF NOT EXISTS public.bus_gps_telemetry (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bus_id UUID NOT NULL REFERENCES public.buses(id) ON DELETE CASCADE,
    route_id UUID REFERENCES public.routes(id) ON DELETE SET NULL,
    current_latitude NUMERIC(10, 7) NOT NULL,
    current_longitude NUMERIC(10, 7) NOT NULL,
    speed_kmh NUMERIC(5, 2) DEFAULT 0.0,
    heading_degrees NUMERIC(5, 2) DEFAULT 0.0,
    recorded_at TIMESTAMPTZ DEFAULT now()
);

-- INDEXES FOR GPS & ROUTE LOOKUPS
CREATE INDEX IF NOT EXISTS idx_bus_gps_latest ON public.bus_gps_telemetry(bus_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_route_stops_geo ON public.route_stops(latitude, longitude);
