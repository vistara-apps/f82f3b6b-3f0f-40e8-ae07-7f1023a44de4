-- Right Guard Database Schema for Supabase
-- Run this in your Supabase SQL editor to create the required tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" VARCHAR(255) UNIQUE NOT NULL,
    "farcasterProfile" VARCHAR(255),
    "selectedState" VARCHAR(100) NOT NULL DEFAULT 'California',
    "premiumFeatures" TEXT[] DEFAULT '{}',
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Legal guides table
CREATE TABLE IF NOT EXISTS legal_guides (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "guideId" VARCHAR(255) UNIQUE NOT NULL,
    state VARCHAR(100) NOT NULL,
    language VARCHAR(2) NOT NULL CHECK (language IN ('en', 'es')),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    script TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(state, language)
);

-- Incident records table
CREATE TABLE IF NOT EXISTS incident_records (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "recordId" VARCHAR(255) UNIQUE NOT NULL,
    "userId" VARCHAR(255) NOT NULL REFERENCES users("userId") ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    location JSONB NOT NULL,
    "mediaUrl" TEXT,
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Alert logs table
CREATE TABLE IF NOT EXISTS alert_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "alertId" VARCHAR(255) UNIQUE NOT NULL,
    "userId" VARCHAR(255) NOT NULL REFERENCES users("userId") ON DELETE CASCADE,
    "incidentRecordId" VARCHAR(255) REFERENCES incident_records("recordId") ON DELETE SET NULL,
    recipient VARCHAR(255) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('sent', 'delivered', 'failed')),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Purchase logs table (for analytics and audit)
CREATE TABLE IF NOT EXISTS purchase_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    "userId" VARCHAR(255) NOT NULL REFERENCES users("userId") ON DELETE CASCADE,
    "featureKey" VARCHAR(100) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    "txHash" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_farcaster ON users("farcasterProfile");
CREATE INDEX IF NOT EXISTS idx_legal_guides_state_lang ON legal_guides(state, language);
CREATE INDEX IF NOT EXISTS idx_incident_records_user ON incident_records("userId");
CREATE INDEX IF NOT EXISTS idx_incident_records_created ON incident_records("createdAt");
CREATE INDEX IF NOT EXISTS idx_alert_logs_user ON alert_logs("userId");
CREATE INDEX IF NOT EXISTS idx_alert_logs_incident ON alert_logs("incidentRecordId");
CREATE INDEX IF NOT EXISTS idx_purchase_logs_user ON purchase_logs("userId");

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_logs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = "userId" OR auth.role() = 'service_role');

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = "userId" OR auth.role() = 'service_role');

CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (auth.uid()::text = "userId" OR auth.role() = 'service_role');

-- Incident records policies
CREATE POLICY "Users can view own incident records" ON incident_records
    FOR SELECT USING (auth.uid()::text = "userId" OR auth.role() = 'service_role');

CREATE POLICY "Users can insert own incident records" ON incident_records
    FOR INSERT WITH CHECK (auth.uid()::text = "userId" OR auth.role() = 'service_role');

CREATE POLICY "Users can delete own incident records" ON incident_records
    FOR DELETE USING (auth.uid()::text = "userId" OR auth.role() = 'service_role');

-- Alert logs policies
CREATE POLICY "Users can view own alert logs" ON alert_logs
    FOR SELECT USING (auth.uid()::text = "userId" OR auth.role() = 'service_role');

CREATE POLICY "Users can insert own alert logs" ON alert_logs
    FOR INSERT WITH CHECK (auth.uid()::text = "userId" OR auth.role() = 'service_role');

-- Purchase logs policies
CREATE POLICY "Users can view own purchase logs" ON purchase_logs
    FOR SELECT USING (auth.uid()::text = "userId" OR auth.role() = 'service_role');

CREATE POLICY "Users can insert own purchase logs" ON purchase_logs
    FOR INSERT WITH CHECK (auth.uid()::text = "userId" OR auth.role() = 'service_role');

-- Legal guides are public (read-only for users)
CREATE POLICY "Legal guides are publicly readable" ON legal_guides
    FOR SELECT USING (true);

CREATE POLICY "Only service role can modify legal guides" ON legal_guides
    FOR ALL USING (auth.role() = 'service_role');

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW."updatedAt" = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_legal_guides_updated_at BEFORE UPDATE ON legal_guides
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample legal guides (basic ones)
INSERT INTO legal_guides ("guideId", state, language, title, content, script) VALUES
(
    'ca-en-basic',
    'California',
    'en',
    'California Legal Rights Guide',
    '# California Legal Rights\n\n## Your Rights During Police Encounters\n\n1. **Right to Remain Silent**: You have the constitutional right to remain silent under the Fifth Amendment.\n2. **Right to Refuse Searches**: You can refuse consent to search your person, vehicle, or home without a warrant.\n3. **Right to Leave**: If you are not being detained, you have the right to leave.\n4. **Right to Record**: California is a two-party consent state, but you can record police in public spaces.\n\n## Important California-Specific Laws\n\n- **Penal Code 148**: It is illegal to resist, delay, or obstruct a peace officer.\n- **Vehicle Code 2800**: You must comply with lawful orders from police during traffic stops.\n- **Civil Code 52.1**: Protection against interference with civil rights.\n\n## What to Do\n\n1. Stay calm and keep your hands visible\n2. Clearly state you are exercising your rights\n3. Do not physically resist\n4. Ask if you are free to leave\n5. Request an attorney if arrested',
    'I am exercising my right to remain silent. I do not consent to any searches. Am I free to leave? I want to speak to an attorney.'
),
(
    'ca-es-basic',
    'California',
    'es',
    'Guía de Derechos Legales de California',
    '# Derechos Legales de California\n\n## Sus Derechos Durante Encuentros Policiales\n\n1. **Derecho a Permanecer en Silencio**: Tiene el derecho constitucional a permanecer en silencio bajo la Quinta Enmienda.\n2. **Derecho a Rechazar Registros**: Puede rechazar el consentimiento para registrar su persona, vehículo o hogar sin una orden judicial.\n3. **Derecho a Irse**: Si no está siendo detenido, tiene derecho a irse.\n4. **Derecho a Grabar**: California requiere consentimiento de ambas partes, pero puede grabar a la policía en espacios públicos.\n\n## Leyes Importantes Específicas de California\n\n- **Código Penal 148**: Es ilegal resistir, retrasar u obstruir a un oficial de paz.\n- **Código de Vehículos 2800**: Debe cumplir con las órdenes legales de la policía durante paradas de tráfico.\n- **Código Civil 52.1**: Protección contra interferencia con derechos civiles.\n\n## Qué Hacer\n\n1. Manténgase calmado y mantenga sus manos visibles\n2. Declare claramente que está ejerciendo sus derechos\n3. No resista físicamente\n4. Pregunte si es libre de irse\n5. Solicite un abogado si es arrestado',
    'Estoy ejerciendo mi derecho a permanecer en silencio. No consiento ningún registro. ¿Soy libre de irme? Quiero hablar con un abogado.'
);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
