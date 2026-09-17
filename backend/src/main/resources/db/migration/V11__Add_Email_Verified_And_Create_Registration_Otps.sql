-- V11__Add_Email_Verified_And_Create_Registration_Otps.sql

-- 1. Tambahkan kolom email_verified ke tabel users
-- DEFAULT TRUE memastikan seluruh akun seed (Admin & Customer eksisting) tetap aktif tanpa regresi
ALTER TABLE users ADD COLUMN email_verified BOOLEAN NOT NULL DEFAULT TRUE;

-- 2. Buat tabel registration_otps (mengikuti konvensi tabel token eksisting seperti refresh_tokens dan password_reset_tokens)
CREATE TABLE registration_otps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    otp_hash VARCHAR(255) NOT NULL,
    expiry_date TIMESTAMP WITH TIME ZONE NOT NULL,
    attempts INT NOT NULL DEFAULT 0,
    max_attempts INT NOT NULL DEFAULT 5,
    is_used BOOLEAN NOT NULL DEFAULT FALSE,
    last_resend_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_registration_otps_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

CREATE INDEX idx_registration_otps_user_id ON registration_otps(user_id);
CREATE INDEX idx_registration_otps_expiry ON registration_otps(expiry_date);
