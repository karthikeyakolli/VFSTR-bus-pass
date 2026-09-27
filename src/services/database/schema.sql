-- ==============================================================================
-- VFSTR UNIVERSITY TRANSPORTATION SYSTEM — RELATIONAL DATABASE SCHEMA (SQL DDL)
-- Target DBMS: PostgreSQL 14+ / Supabase (with PostGIS extensions)
-- Academic Year: 2026-2027
-- Description: Real-time GPS telemetry logging, route management, vehicle tracking,
--              geofence surveillance, and student transit attendance loop.
-- ==============================================================================

-- 1. Enable Spatial Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- 2. Enumerated Domain Types
CREATE TYPE bus_operational_status AS ENUM (
    'ACTIVE_ON_TRIP',
    'STANDBY_AT_CAMPUS',
    'IN_MAINTENANCE',
    'OFF_DUTY',
    'EMERGENCY_HALT'
);

CREATE TYPE telemetry_source_type AS ENUM (
    'HARDWARE_AIS140_GPS',
    'DRIVER_DEVICE_GEOLOCATION',
    'HIGHWAY_SIMULATOR'
);

CREATE TYPE geofence_event_type AS ENUM (
    'GEOFENCE_ENTER',
    'GEOFENCE_EXIT',
    'SPEED_LIMIT_EXCEEDED',
    'UNAUTHORIZED_STOP'
);

CREATE TYPE transit_fleet_mode AS ENUM (
    'REGULAR_ROUTE_BUS',
    'EXPRESS_CAMPUS_BUS',
    'FACULTY_SPECIAL_BUS'
);

-- ------------------------------------------------------------------------------
-- Table 1: Transport Corridors (Master Divisions)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transport_corridors (
    id VARCHAR(32) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 2: Master Transit Routes
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS transit_routes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_number INT UNIQUE NOT NULL,
    route_code VARCHAR(32) UNIQUE NOT NULL,
    corridor_id VARCHAR(32) REFERENCES transport_corridors(id) ON DELETE SET NULL,
    final_terminal VARCHAR(128) NOT NULL,
    direction VARCHAR(64) NOT NULL DEFAULT 'Towards Vadlamudi Campus',
    total_distance_km NUMERIC(6, 2) NOT NULL,
    estimated_travel_time_mins INT NOT NULL,
    annual_fee_inr NUMERIC(10, 2) NOT NULL,
    transit_path_raw TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 3: Canonical Route Stops (Spatial GIS Points)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS route_stops (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id UUID NOT NULL REFERENCES transit_routes(id) ON DELETE CASCADE,
    sequence_no INT NOT NULL,
    stop_name VARCHAR(128) NOT NULL,
    landmark VARCHAR(128),
    district VARCHAR(64) NOT NULL,
    morning_pickup_time TIME,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    geom GEOMETRY(Point, 4326),
    is_campus BOOLEAN DEFAULT FALSE,
    is_terminal BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT uq_route_sequence UNIQUE (route_id, sequence_no)
);

CREATE INDEX IF NOT EXISTS idx_route_stops_geom ON route_stops USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_route_stops_route_id ON route_stops(route_id);

-- ------------------------------------------------------------------------------
-- Table 4: Bus Fleet Registry
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bus_fleet (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    registration_no VARCHAR(32) UNIQUE NOT NULL,  -- e.g. 'AP 07 TJ 4521'
    fleet_code VARCHAR(32) UNIQUE NOT NULL,        -- e.g. 'VFSTR-B14'
    seating_capacity INT NOT NULL DEFAULT 55,
    assigned_route_id UUID REFERENCES transit_routes(id) ON DELETE SET NULL,
    fleet_mode transit_fleet_mode NOT NULL DEFAULT 'REGULAR_ROUTE_BUS',
    driver_name VARCHAR(128) NOT NULL,
    driver_phone VARCHAR(32) NOT NULL,
    driver_experience_years INT DEFAULT 5,
    operational_status bus_operational_status DEFAULT 'STANDBY_AT_CAMPUS',
    speed_governor_limit_kmh INT DEFAULT 50,
    has_emergency_exit BOOLEAN DEFAULT TRUE,
    has_first_aid_kit BOOLEAN DEFAULT TRUE,
    has_cctv_surveillance BOOLEAN DEFAULT TRUE,
    has_hardware_gps BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 5: Real-Time Dynamic GPS Telemetry Logs (High-Frequency Stream)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS gps_telemetry_logs (
    id BIGSERIAL PRIMARY KEY,
    bus_id UUID NOT NULL REFERENCES bus_fleet(id) ON DELETE CASCADE,
    bus_reg_no VARCHAR(32) NOT NULL,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Raw GPS Coordinates from Device / Hardware
    raw_latitude NUMERIC(10, 7) NOT NULL,
    raw_longitude NUMERIC(10, 7) NOT NULL,
    raw_geom GEOMETRY(Point, 4326),
    
    -- Snapped / Map-Matched Coordinates
    snapped_latitude NUMERIC(10, 7) NOT NULL,
    snapped_longitude NUMERIC(10, 7) NOT NULL,
    snapped_geom GEOMETRY(Point, 4326),
    
    -- Kinematics & Health
    speed_kmh NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    heading_deg NUMERIC(5, 2) NOT NULL DEFAULT 0.0,
    altitude_meters NUMERIC(6, 2) DEFAULT 18.0,
    accuracy_meters NUMERIC(6, 2) DEFAULT 5.0,
    cross_track_deviation_meters NUMERIC(6, 2) DEFAULT 0.0,
    is_off_route BOOLEAN DEFAULT FALSE,
    
    -- Waypoint Context
    current_stop_name VARCHAR(128),
    next_stop_name VARCHAR(128),
    progress_percentage NUMERIC(5, 2) DEFAULT 0.0,
    source telemetry_source_type NOT NULL DEFAULT 'DRIVER_DEVICE_GEOLOCATION'
);

-- Optimization Indexes for Telemetry Partitioning & Quick Retrieval
CREATE INDEX IF NOT EXISTS idx_telemetry_bus_time ON gps_telemetry_logs(bus_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_reg_time ON gps_telemetry_logs(bus_reg_no, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_snapped_geom ON gps_telemetry_logs USING GIST(snapped_geom);

-- ------------------------------------------------------------------------------
-- Table 6: Active Vehicle State (Latest Real-Time Cache)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS active_vehicle_states (
    bus_id UUID PRIMARY KEY REFERENCES bus_fleet(id) ON DELETE CASCADE,
    bus_reg_no VARCHAR(32) UNIQUE NOT NULL,
    last_telemetry_id BIGINT REFERENCES gps_telemetry_logs(id),
    current_latitude NUMERIC(10, 7) NOT NULL,
    current_longitude NUMERIC(10, 7) NOT NULL,
    speed_kmh NUMERIC(5, 2) NOT NULL,
    heading_deg NUMERIC(5, 2) NOT NULL,
    current_stop_name VARCHAR(128),
    next_stop_name VARCHAR(128),
    eta_mins INT DEFAULT 15,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 7: Geofence Zones & Safety Boundary Alerts
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS geofence_zones (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(128) NOT NULL,
    zone_type VARCHAR(64) NOT NULL, -- e.g. 'CAMPUS_GATE', 'SPEED_CALMED'
    center_latitude NUMERIC(10, 7) NOT NULL,
    center_longitude NUMERIC(10, 7) NOT NULL,
    radius_meters INT NOT NULL,
    speed_limit_kmh INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS geofence_events (
    id BIGSERIAL PRIMARY KEY,
    bus_id UUID NOT NULL REFERENCES bus_fleet(id) ON DELETE CASCADE,
    geofence_id VARCHAR(64) REFERENCES geofence_zones(id) ON DELETE SET NULL,
    geofence_name VARCHAR(128) NOT NULL,
    event_type geofence_event_type NOT NULL,
    speed_kmh NUMERIC(5, 2) NOT NULL,
    speed_limit_kmh INT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_geofence_events_bus ON geofence_events(bus_id, timestamp DESC);

-- ------------------------------------------------------------------------------
-- Table 8: Student Boarding Attendance Check-Ins
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS student_boarding_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_reg_no VARCHAR(32) NOT NULL,
    student_name VARCHAR(128) NOT NULL,
    bus_reg_no VARCHAR(32) NOT NULL,
    route_number INT NOT NULL,
    stop_sequence INT NOT NULL,
    stop_name VARCHAR(128) NOT NULL,
    boarded_at TIMESTAMPTZ DEFAULT NOW(),
    latitude NUMERIC(10, 7),
    longitude NUMERIC(10, 7),
    verified_by_driver VARCHAR(128) NOT NULL,
    verification_hash VARCHAR(128) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_boarding_student_time ON student_boarding_checkins(student_reg_no, boarded_at DESC);
CREATE INDEX IF NOT EXISTS idx_boarding_bus_time ON student_boarding_checkins(bus_reg_no, boarded_at DESC);

-- ------------------------------------------------------------------------------
-- Trigger Function: Auto-populate PostGIS Geometry from Lat/Lng
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_telemetry_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.raw_geom = ST_SetSRID(ST_MakePoint(NEW.raw_longitude, NEW.raw_latitude), 4326);
    NEW.snapped_geom = ST_SetSRID(ST_MakePoint(NEW.snapped_longitude, NEW.snapped_latitude), 4326);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_set_telemetry_geom
BEFORE INSERT OR UPDATE ON gps_telemetry_logs
FOR EACH ROW EXECUTE FUNCTION set_telemetry_geom();

-- ------------------------------------------------------------------------------
-- Table 9: Emergency SOS Dispatches & Telemetry Alerts
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS emergency_sos_dispatches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bus_reg_no VARCHAR(32) NOT NULL,
    route_number INT,
    triggered_by_role VARCHAR(32) NOT NULL DEFAULT 'DRIVER', -- 'DRIVER' or 'STUDENT'
    user_id VARCHAR(64) NOT NULL,
    user_name VARCHAR(128) NOT NULL,
    phone_number VARCHAR(32) NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    speed_kmh NUMERIC(5, 2) DEFAULT 0.0,
    nearest_landmark VARCHAR(128),
    emergency_type VARCHAR(64) NOT NULL DEFAULT 'GENERAL_EMERGENCY', -- 'MEDICAL', 'ACCIDENT', 'BREAKDOWN', 'SECURITY'
    status VARCHAR(32) NOT NULL DEFAULT 'TRIGGERED', -- 'TRIGGERED', 'DISPATCHED', 'RESOLVED'
    dispatched_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT
);

CREATE INDEX IF NOT EXISTS idx_sos_status ON emergency_sos_dispatches(status, dispatched_at DESC);

-- ------------------------------------------------------------------------------
-- Table 10: Real-Time Seat Occupancy & Headcount Telemetry
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS bus_occupancy_telemetry (
    bus_reg_no VARCHAR(32) PRIMARY KEY,
    route_number INT NOT NULL,
    current_occupancy INT NOT NULL DEFAULT 0,
    total_capacity INT NOT NULL DEFAULT 55,
    available_seats INT GENERATED ALWAYS AS (total_capacity - current_occupancy) STORED,
    last_scanned_stop VARCHAR(128),
    last_scan_timestamp TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- Table 11: Student Proximity Alert Subscriptions
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS proximity_alert_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_reg_no VARCHAR(32) NOT NULL,
    bus_reg_no VARCHAR(32) NOT NULL,
    boarding_stop_name VARCHAR(128) NOT NULL,
    boarding_latitude NUMERIC(10, 7) NOT NULL,
    boarding_longitude NUMERIC(10, 7) NOT NULL,
    proximity_threshold_meters INT DEFAULT 1500,
    is_triggered BOOLEAN DEFAULT FALSE,
    last_alert_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proximity_student ON proximity_alert_subscriptions(student_reg_no);

-- ------------------------------------------------------------------------------
-- Table 12: Offline Digital Bus Pass Wallet Storage
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS offline_pass_wallets (
    student_reg_no VARCHAR(32) PRIMARY KEY,
    student_name VARCHAR(128) NOT NULL,
    route_number INT NOT NULL,
    route_name VARCHAR(128) NOT NULL,
    boarding_stop VARCHAR(128) NOT NULL,
    seat_assigned VARCHAR(32) NOT NULL,
    academic_year VARCHAR(32) NOT NULL DEFAULT '2026-27',
    valid_until DATE NOT NULL,
    cryptographic_signature TEXT NOT NULL,
    cached_offline_at TIMESTAMPTZ DEFAULT NOW()
);

