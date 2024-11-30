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
, reset_code VARCHAR(255) NOT NULL
);

CREATE TABLE schedule
( id UUID PRIMARY KEY DEFAULT gen_random_uuid()
, removed TIMESTAMP DEFAULT NULL
, owner_id UUID NOT NULL REFERENCES user_account (id) ON DELETE CASCADE
, schedule_name VARCHAR(64) NOT NULL DEFAULT ''
, schedule_description VARCHAR(255) NOT NULL DEFAULT ''
, code UUID DEFAULT gen_random_uuid()
, data jsonb DEFAULT NULL
);

CREATE TABLE user_schedule_membership
( id UUID PRIMARY KEY DEFAULT gen_random_uuid()
, user_id UUID NOT NULL REFERENCES user_account (id) ON DELETE CASCADE
, schedule_id UUID NOT NULL REFERENCES schedule (id) ON DELETE CASCADE
, shift_count_offset INTEGER NOT NULL DEFAULT 0
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
, requested_weight INTEGER
, UNIQUE (user_id, shift_id)
);

CREATE TABLE user_shift_signup
( id UUID PRIMARY KEY DEFAULT gen_random_uuid()
, user_id UUID NOT NULL REFERENCES user_account (id) ON DELETE CASCADE
, shift_id UUID NOT NULL REFERENCES shift (id) ON DELETE CASCADE
, user_weighting INTEGER NOT NULL DEFAULT 1
, UNIQUE (user_id, shift_id)
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
            schedule.schedule_description,
            usm.user_id,
            'member' AS user_role
        FROM schedule
        JOIN user_schedule_membership AS usm ON schedule.id = usm.schedule_id
        WHERE TRUE
            AND schedule.removed IS NULL
            AND NOT (schedule.owner_id = usm.user_id)
    ),
    owner_info AS (
        SELECT
            schedule.id AS schedule_id,
            schedule.owner_id,
            schedule.schedule_name,
            schedule.schedule_description,
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

CREATE VIEW schedule_state AS
WITH
    asgn_count AS (
        SELECT
            info.schedule_id,
            COALESCE(COUNT(asgn.id), 0) AS asgn_count
        FROM schedule_info AS info
        LEFT JOIN shift ON info.schedule_id = shift.schedule_id
        LEFT JOIN user_shift_assignment AS asgn ON shift.id = asgn.shift_id
        GROUP BY info.schedule_id
    )
SELECT
    CASE
        WHEN asgn_count.asgn_count = 0 THEN 'open'
        ELSE 'closed'
    END AS schedule_state,
    asgn_count.schedule_id
FROM asgn_count;

CREATE VIEW schedule_counts AS
WITH
    member_count AS (
        SELECT
            s.id AS schedule_id,
            COUNT(usm.id) AS total_members
        FROM schedule AS s
        LEFT JOIN user_schedule_membership AS usm ON s.id = usm.schedule_id
        WHERE s.removed IS NULL
        GROUP BY s.id
    ),
    shift_count AS (
        SELECT
            s.id AS schedule_id,
            COUNT(shift.id) AS total_shifts
        FROM schedule AS s
        LEFT JOIN shift ON s.id = shift.schedule_id
        WHERE s.removed IS NULL
        GROUP BY s.id
    )
SELECT
    s.id AS schedule_id,
    COALESCE(member_count.total_members, 0) AS total_members,
    COALESCE(shift_count.total_shifts, 0) AS total_shifts,
    CASE
        WHEN COALESCE(member_count.total_members, 0) = 0 THEN 0
        ELSE FLOOR(COALESCE(shift_count.total_shifts, 0) * 1.0 / COALESCE(member_count.total_members, 1))
    END AS base_min_per_employee,
    CASE
        WHEN COALESCE(member_count.total_members, 0) = 0 THEN 0
        WHEN COALESCE(shift_count.total_shifts, 0) % COALESCE(member_count.total_members, 1) = 0 THEN
            FLOOR(COALESCE(shift_count.total_shifts, 0) * 1.0 / COALESCE(member_count.total_members, 1))
        ELSE
            FLOOR(COALESCE(shift_count.total_shifts, 0) * 1.0 / COALESCE(member_count.total_members, 1)) + 1
    END AS base_max_per_employee
FROM schedule AS s
LEFT JOIN member_count ON s.id = member_count.schedule_id
LEFT JOIN shift_count ON s.id = shift_count.schedule_id;