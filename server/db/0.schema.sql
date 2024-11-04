-- Drop tables if they exist
DROP TABLE IF EXISTS user_account;
DROP TABLE IF EXISTS schedule;
DROP TABLE IF EXISTS shift;
DROP TABLE IF EXISTS final_shift;
DROP TABLE IF EXISTS sign_up;
DROP TABLE IF EXISTS organization;
DROP TABLE IF EXISTS schedule_membership;
DROP TABLE IF EXISTS join_code;
DROP TABLE IF EXISTS user_schedule_membership;
DROP TABLE IF EXISTS user_shift_assignment;
DROP TABLE IF EXISTS user_shift_signup;
DROP TABLE IF EXISTS schedule_org_membership;
DROP TABLE IF EXISTS profile_image_data;

-- Create tables
CREATE TABLE user_account
( id UUID PRIMARY KEY DEFAULT gen_random_uuid()
, removed TIMESTAMP DEFAULT NULL
, username VARCHAR(64) NOT NULL
, email VARCHAR(64) NOT NULL UNIQUE
, password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE schedule
( id UUID PRIMARY KEY DEFAULT gen_random_uuid()
, removed TIMESTAMP DEFAULT NULL
, owner_id UUID NOT NULL REFERENCES user_account (id) ON DELETE CASCADE
, schedule_name VARCHAR(64) NOT NULL DEFAULT ''
, schedule_description VARCHAR(255) NOT NULL DEFAULT ''
, code UUID DEFAULT gen_random_uuid()
);

CREATE TABLE user_schedule_membership
( id UUID PRIMARY KEY DEFAULT gen_random_uuid()
, user_id UUID NOT NULL REFERENCES user_account (id) ON DELETE CASCADE
, schedule_id UUID NOT NULL REFERENCES schedule (id) ON DELETE CASCADE
, UNIQUE (user_id, schedule_id)
);

CREATE TABLE shift
( id UUID PRIMARY KEY DEFAULT gen_random_uuid()
, schedule_id UUID NOT NULL REFERENCES schedule (id) ON DELETE CASCADE
, start_time TIMESTAMP NOT NULL
, end_time TIMESTAMP NOT NULL
, shift_name VARCHAR(64) NOT NULL DEFAULT ''
, shift_description VARCHAR(255) NOT NULL DEFAULT ''
);

CREATE TABLE user_shift_assignment
( id UUID PRIMARY KEY DEFAULT gen_random_uuid()
, user_id UUID NOT NULL REFERENCES user_account (id) ON DELETE CASCADE
, shift_id UUID NOT NULL REFERENCES shift (id) ON DELETE CASCADE
);

CREATE TABLE user_shift_signup
( id UUID PRIMARY KEY DEFAULT gen_random_uuid()
, user_id UUID NOT NULL REFERENCES user_account (id) ON DELETE CASCADE
, shift_id UUID NOT NULL REFERENCES shift (id) ON DELETE CASCADE
, user_weighting INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE organization
( id UUID PRIMARY KEY DEFAULT gen_random_uuid()
, removed TIMESTAMP DEFAULT NULL
, organization_name VARCHAR(64) NOT NULL
, organization_description VARCHAR(255) NOT NULL DEFAULT ''
, owner_id UUID NOT NULL REFERENCES user_account (id) ON DELETE CASCADE
, code UUID DEFAULT gen_random_uuid()
);

CREATE TABLE schedule_org_membership
( id UUID PRIMARY KEY DEFAULT gen_random_uuid()
, org_id UUID NOT NULL REFERENCES organization (id) ON DELETE CASCADE
, schedule_id UUID NOT NULL REFERENCES schedule (id) ON DELETE CASCADE
);

CREATE TABLE profile_image_data
( user_id UUID PRIMARY KEY REFERENCES user_account (id) ON DELETE CASCADE
, image_data BYTEA NOT NULL
);

CREATE VIEW schedule_info AS
WITH
    member_info AS (
        SELECT
            schedule.id AS schedule_id,
            schedule.owner_id,
            schedule.schedule_name,
            usm.user_id,
            'member' AS user_role
        FROM schedule
        JOIN user_schedule_membership AS usm ON schedule.id = usm.schedule_id
        WHERE schedule.removed IS NULL
    ),
    owner_info AS (
        SELECT
            schedule.id AS schedule_id,
            schedule.owner_id,
            schedule.schedule_name,
            schedule.owner_id AS user_id,
            'owner' AS user_role
        FROM schedule
        WHERE schedule.removed IS NULL
    ) 
SELECT *
FROM member_info
UNION ALL
SELECT *
FROM owner_info;

CREATE VIEW schedule_start_end AS
SELECT
    schedule.id as schedule_id,
    (
        SELECT shift.start_time
        FROM shift
        WHERE shift.schedule_id = schedule.id
        ORDER BY shift.start_time ASC
        LIMIT 1
    ) AS start_time,
    (
        SELECT shift.end_time
        FROM shift
        WHERE shift.schedule_id = schedule.id
        ORDER BY shift.end_time DESC
        LIMIT 1
    ) AS end_time
FROM schedule;