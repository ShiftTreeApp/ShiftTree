--We should remove these eventually, just good for if we create some testing data/are debugging queries and keep restarting container
DROP TABLE IF EXISTS user;
DROP TABLE IF EXISTS schedule;
DROP TABLE IF EXISTS shift;
DROP TABLE IF EXISTS finalShift;
DROP TABLE IF EXISTS signUp;
DROP TABLE IF EXISTS organization;
DROP TABLE IF EXISTS scheduleMembership;

--UserData
--TODO: Decide on what else we want to store related to users, while keeping in mind that schedules/orgs and such are tracked through foreign keys so shouldn't be a part of user.
CREATE TABLE user
( id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid()
, username VARCHAR(64)
, email VARCHAR(64)
, passoword_hash VARCHAR(255)
);

CREATE TABLE schedule
( id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid()
, owner_id UUID REFERENCES user (id)
, schedule_name VARCHAR(64)
);

CREATE TABLE shift
( id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid()
, schedule_id UUID REFERENCES schedule (id)
, TIMESTAMP start_time
, TIMESTAMP end_time
);

CREATE TABLE finalShift
( id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid()
, user_id UUID REFERENCES user (id)
, shift_id UUID REFERENCES shift (id)
)

CREATE TABLE signUp
( id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid()
, user_id UUID REFERENCES user (id)
, shift_id UUID REFERENCES shift (id)
, user_weighting INTEGER
)

CREATE TABLE organization
(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid()
, organization_name varchar(64)
, owner_id REFERENCES user (id)
)

CREATE TABLE scheduleMembership
( id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid()
, org_id REFERENCES organization (id)
, schedule_id REFERENCES schedule (id)
)