CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid TEXT UNIQUE NOT NULL,

    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,

    onboarding_completed BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    is_paid BOOLEAN DEFAULT false,
);

CREATE TABLE user_body_metrics (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    gender TEXT CHECK (gender IN ('male', 'female')) NOT NULL,
    age INT NOT NULL,
    height_cm NUMERIC(5,2) NOT NULL,
    weight_kg NUMERIC(5,2) NOT NULL,
    target_weight_kg NUMERIC(5,2) NOT NULL,

    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_activity_level (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    activity_level TEXT CHECK (
        activity_level IN (
            'sedentary',
            'light',
            'moderate',
            'active',
            'very-active',
            'athlete'
        )
    ) NOT NULL,


    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_nutrition_targets (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    calories INT NOT NULL,
    protein_g INT NOT NULL,
    carbs_g INT NOT NULL,
    fat_g INT NOT NULL,
    fiber_g INT,

    calculated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_goals (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    goal_type TEXT CHECK (
        goal_type IN ('lose-weight', 'gain-muscle', 'maintain')
    ) NOT NULL,

    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE exercises (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    force TEXT,
    level TEXT,
    mechanic TEXT,
    equipment TEXT,
    category TEXT,
    primary_muscles TEXT[],
    secondary_muscles TEXT[],
    instructions TEXT[],
    image_urls TEXT[]
);

CREATE TABLE app_metadata (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE genai_usage (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    request_date DATE NOT NULL DEFAULT CURRENT_DATE,
    request_count INT DEFAULT 0,
    last_request_at TIMESTAMPTZ DEFAULT now(),
    
    UNIQUE(user_id, request_date)
);

CREATE INDEX idx_genai_usage_user_date ON genai_usage(user_id, request_date);

-- ALTER TABLE users ADD COLUMN is_paid BOOLEAN DEFAULT false;


