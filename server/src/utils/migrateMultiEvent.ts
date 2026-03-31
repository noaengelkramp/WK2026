import sequelize from '../config/database';

const INTERNAL_EVENT_ID = '00000000-0000-4000-8000-000000000001';

const statements: string[] = [
  `CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    subdomain VARCHAR(60) NOT NULL UNIQUE,
    customer_prefix VARCHAR(5) NOT NULL DEFAULT 'C1234',
    legal_privacy_url VARCHAR(500),
    legal_terms_url VARCHAR(500),
    legal_cookie_url VARCHAR(500),
    default_locale VARCHAR(20) NOT NULL DEFAULT 'en',
    allowed_locales JSONB NOT NULL DEFAULT '["en"]'::jsonb,
    timezone VARCHAR(100) NOT NULL DEFAULT 'Europe/Amsterdam',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );`,

  `INSERT INTO events (
      id, code, name, subdomain, customer_prefix, default_locale, allowed_locales, timezone, is_active
    ) VALUES (
      '${INTERNAL_EVENT_ID}', 'internal', 'Internal Colleagues', 'internal', 'C1234', 'en', '["en","nl"]'::jsonb, 'Europe/Amsterdam', TRUE
    )
    ON CONFLICT (code) DO NOTHING;`,

  `DO $$
  BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_users_role') THEN
      CREATE TYPE enum_users_role AS ENUM ('user', 'event_admin', 'platform_admin');
    END IF;
  END$$;`,

  `ALTER TABLE users ADD COLUMN IF NOT EXISTS event_id UUID;`,
  `ALTER TABLE users ADD COLUMN IF NOT EXISTS role enum_users_role;`,
  `UPDATE users SET event_id='${INTERNAL_EVENT_ID}' WHERE event_id IS NULL;`,
  `UPDATE users SET role = CASE WHEN COALESCE(is_admin, false)=true THEN 'event_admin'::enum_users_role ELSE 'user'::enum_users_role END WHERE role IS NULL;`,
  `ALTER TABLE users ALTER COLUMN event_id SET NOT NULL;`,
  `ALTER TABLE users ALTER COLUMN role SET NOT NULL;`,

  `DO $$
  DECLARE r RECORD;
  BEGIN
    FOR r IN
      SELECT c.conname
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      WHERE t.relname = 'users'
        AND c.contype = 'u'
        AND (
          pg_get_constraintdef(c.oid) ILIKE '%(email)%' OR
          pg_get_constraintdef(c.oid) ILIKE '%(username)%' OR
          pg_get_constraintdef(c.oid) ILIKE '%(customer_number)%'
        )
    LOOP
      EXECUTE format('ALTER TABLE users DROP CONSTRAINT %I', r.conname);
    END LOOP;
  END$$;`,

  `ALTER TABLE users DROP CONSTRAINT IF EXISTS users_event_id_fkey;`,
  `ALTER TABLE users ADD CONSTRAINT users_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT;`,

  `CREATE UNIQUE INDEX IF NOT EXISTS users_event_email_unique ON users(event_id, email);`,
  `CREATE UNIQUE INDEX IF NOT EXISTS users_event_username_unique ON users(event_id, username);`,
  `CREATE INDEX IF NOT EXISTS users_event_customer_idx ON users(event_id, customer_number);`,
  `CREATE INDEX IF NOT EXISTS users_event_idx ON users(event_id);`,

  `ALTER TABLE predictions ADD COLUMN IF NOT EXISTS event_id UUID;`,
  `UPDATE predictions SET event_id='${INTERNAL_EVENT_ID}' WHERE event_id IS NULL;`,
  `ALTER TABLE predictions ALTER COLUMN event_id SET NOT NULL;`,
  `ALTER TABLE predictions DROP CONSTRAINT IF EXISTS predictions_event_id_fkey;`,
  `ALTER TABLE predictions ADD CONSTRAINT predictions_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT;`,
  `DROP INDEX IF EXISTS predictions_user_id_match_id;`,
  `CREATE UNIQUE INDEX IF NOT EXISTS predictions_event_user_match_unique ON predictions(event_id, user_id, match_id);`,
  `CREATE INDEX IF NOT EXISTS predictions_event_idx ON predictions(event_id);`,

  `ALTER TABLE bonus_questions ADD COLUMN IF NOT EXISTS event_id UUID;`,
  `UPDATE bonus_questions SET event_id='${INTERNAL_EVENT_ID}' WHERE event_id IS NULL;`,
  `ALTER TABLE bonus_questions ALTER COLUMN event_id SET NOT NULL;`,
  `ALTER TABLE bonus_questions DROP CONSTRAINT IF EXISTS bonus_questions_event_id_fkey;`,
  `ALTER TABLE bonus_questions ADD CONSTRAINT bonus_questions_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT;`,
  `CREATE INDEX IF NOT EXISTS bonus_questions_event_idx ON bonus_questions(event_id);`,

  `ALTER TABLE bonus_answers ADD COLUMN IF NOT EXISTS event_id UUID;`,
  `UPDATE bonus_answers SET event_id='${INTERNAL_EVENT_ID}' WHERE event_id IS NULL;`,
  `ALTER TABLE bonus_answers ALTER COLUMN event_id SET NOT NULL;`,
  `ALTER TABLE bonus_answers DROP CONSTRAINT IF EXISTS bonus_answers_event_id_fkey;`,
  `ALTER TABLE bonus_answers ADD CONSTRAINT bonus_answers_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT;`,
  `DROP INDEX IF EXISTS bonus_answers_user_id_bonus_question_id;`,
  `CREATE UNIQUE INDEX IF NOT EXISTS bonus_answers_event_user_question_unique ON bonus_answers(event_id, user_id, bonus_question_id);`,
  `CREATE INDEX IF NOT EXISTS bonus_answers_event_idx ON bonus_answers(event_id);`,

  `ALTER TABLE prizes ADD COLUMN IF NOT EXISTS event_id UUID;`,
  `UPDATE prizes SET event_id='${INTERNAL_EVENT_ID}' WHERE event_id IS NULL;`,
  `ALTER TABLE prizes ALTER COLUMN event_id SET NOT NULL;`,
  `ALTER TABLE prizes DROP CONSTRAINT IF EXISTS prizes_event_id_fkey;`,
  `ALTER TABLE prizes ADD CONSTRAINT prizes_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT;`,
  `DROP INDEX IF EXISTS prizes_rank;`,
  `CREATE UNIQUE INDEX IF NOT EXISTS prizes_event_rank_unique ON prizes(event_id, rank);`,
  `CREATE INDEX IF NOT EXISTS prizes_event_idx ON prizes(event_id);`,

  `ALTER TABLE scoring_rules ADD COLUMN IF NOT EXISTS event_id UUID;`,
  `UPDATE scoring_rules SET event_id='${INTERNAL_EVENT_ID}' WHERE event_id IS NULL;`,
  `ALTER TABLE scoring_rules ALTER COLUMN event_id SET NOT NULL;`,
  `ALTER TABLE scoring_rules DROP CONSTRAINT IF EXISTS scoring_rules_event_id_fkey;`,
  `ALTER TABLE scoring_rules ADD CONSTRAINT scoring_rules_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT;`,
  `DROP INDEX IF EXISTS scoring_rules_stage;`,
  `CREATE UNIQUE INDEX IF NOT EXISTS scoring_rules_event_stage_unique ON scoring_rules(event_id, stage);`,
  `CREATE INDEX IF NOT EXISTS scoring_rules_event_idx ON scoring_rules(event_id);`,

  `ALTER TABLE user_statistics ADD COLUMN IF NOT EXISTS event_id UUID;`,
  `UPDATE user_statistics SET event_id='${INTERNAL_EVENT_ID}' WHERE event_id IS NULL;`,
  `ALTER TABLE user_statistics ALTER COLUMN event_id SET NOT NULL;`,
  `ALTER TABLE user_statistics DROP CONSTRAINT IF EXISTS user_statistics_event_id_fkey;`,
  `ALTER TABLE user_statistics ADD CONSTRAINT user_statistics_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT;`,
  `DROP INDEX IF EXISTS user_statistics_user_id;`,
  `CREATE UNIQUE INDEX IF NOT EXISTS user_statistics_event_user_unique ON user_statistics(event_id, user_id);`,
  `CREATE INDEX IF NOT EXISTS user_statistics_event_idx ON user_statistics(event_id);`,

  `ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS event_id UUID;`,
  `UPDATE app_settings SET event_id='${INTERNAL_EVENT_ID}' WHERE event_id IS NULL;`,
  `ALTER TABLE app_settings ALTER COLUMN event_id SET NOT NULL;`,
  `ALTER TABLE app_settings DROP CONSTRAINT IF EXISTS app_settings_event_id_fkey;`,
  `ALTER TABLE app_settings ADD CONSTRAINT app_settings_event_id_fkey FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE RESTRICT;`,
  `DROP INDEX IF EXISTS app_settings_key;`,
  `CREATE UNIQUE INDEX IF NOT EXISTS app_settings_event_key_unique ON app_settings(event_id, key);`,
  `CREATE INDEX IF NOT EXISTS app_settings_event_idx ON app_settings(event_id);`,
];

async function migrateMultiEvent(): Promise<void> {
  const transaction = await sequelize.transaction();

  try {
    console.log('🔄 Running multi-event schema migration...');

    for (const sql of statements) {
      await sequelize.query(sql, { transaction });
    }

    await transaction.commit();
    console.log('✅ Multi-event schema migration completed successfully.');
    process.exit(0);
  } catch (error) {
    await transaction.rollback();
    console.error('❌ Multi-event schema migration failed:', error);
    process.exit(1);
  }
}

migrateMultiEvent();
