--We should remove these eventually, just good for if we create some testing data/are debugging queries and keep restarting container
DROP TABLE IF EXISTS user_account;
DROP TABLE IF EXISTS schedule;
DROP TABLE IF EXISTS shift;
DROP TABLE IF EXISTS final_shift;
DROP TABLE IF EXISTS sign_up;
DROP TABLE IF EXISTS organization;
DROP TABLE IF EXISTS schedule_membership;

--UserData
--TODO: Decide on what else we want to store related to users, while keeping in mind that schedules/orgs and such are tracked through foreign keys so shouldn't be a part of user.
CREATE TABLE user_account
( id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid()
, username VARCHAR(64) NOT NULL
, email VARCHAR(64) NOT NULL
, password_hash VARCHAR(255) NOT NULL
);

CREATE TABLE schedule
( id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid()
, removed TIMESTAMP DEFAULT NULL
, owner_id UUID NOT NULL REFERENCES user_account (id)
, schedule_name VARCHAR(64) NOT NULL
);

CREATE TABLE user_schedule_membership
( id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid()
, user_id UUID NOT NULL REFERENCES user_account (id)
, schedule_id UUID NOT NULL REFERENCES schedule (id)
);

CREATE TABLE shift
( id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid()
, schedule_id UUID NOT NULL REFERENCES schedule (id)
, start_time TIMESTAMP NOT NULL
, end_time TIMESTAMP NOT NULL
);

CREATE TABLE user_shift_assignment
( id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid()
, user_id UUID NOT NULL REFERENCES user_account (id)
, shift_id UUID NOT NULL REFERENCES shift (id)
);

CREATE TABLE user_shift_signup
( id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid()
, user_id UUID NOT NULL REFERENCES user_account (id)
, shift_id UUID NOT NULL REFERENCES shift (id)
, user_weighting INTEGER NOT NULL DEFAULT 1
);

CREATE TABLE organization
( id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid()
, organization_name VARCHAR(64) NOT NULL
, owner_id UUID NOT NULL REFERENCES user_account (id)
);

CREATE TABLE schedule_org_membership
( id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid()
, org_id UUID NOT NULL REFERENCES organization (id)
, schedule_id UUID NOT NULL REFERENCES schedule (id)
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
        JOIN schedule ON shift.schedule_id = schedule.id
        ORDER BY shift.start_time ASC
        LIMIT 1
    ) AS start_time,
    (
        SELECT shift.end_time
        FROM shift
        JOIN schedule ON shift.schedule_id = schedule.id
        ORDER BY shift.end_time DESC
        LIMIT 1
    ) AS end_time
FROM schedule;