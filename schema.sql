-- WhatsApp Login Schema for SokoHub
-- Run this SQL to set up the required tables

-- whatsapp_codes table: stores verification codes
CREATE TABLE IF NOT EXISTS whatsapp_codes (
    id SERIAL PRIMARY KEY,
    whatsapp VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_whatsapp_codes_whatsapp ON whatsapp_codes(whatsapp);
CREATE INDEX IF NOT EXISTS idx_whatsapp_codes_code ON whatsapp_codes(code);
