CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    firebase_uid TEXT UNIQUE NOT NULL,

    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,

    onboarding_completed BOOLEAN DEFAULT false,

    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE user_body_metrics (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,

    gender TEXT CHECK (gender IN ('male', 'female', 'other')) NOT NULL,
    height_cm NUMERIC(5,2) NOT NULL,
    weight_kg NUMERIC(5,2) NOT NULL,
    target_weight_kg NUMERIC(5,2) NOT NULL,

    bmi NUMERIC(4,2),
    target_bmi NUMERIC(4,2),

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
            'athlete'
        )
    ) NOT NULL,

    workouts_per_week INT,

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
        goal_type IN ('fat_loss', 'muscle_gain', 'maintenance')
    ) NOT NULL,

    created_at TIMESTAMPTZ DEFAULT now()
);
