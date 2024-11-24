CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Delete data from tables in the correct order
DELETE FROM profile_image_data;
DELETE FROM schedule_org_membership;
DELETE FROM organization;
DELETE FROM user_shift_signup;
DELETE FROM user_shift_assignment;
DELETE FROM shift;
DELETE FROM user_schedule_membership;
DELETE FROM schedule;
DELETE FROM user_account;

-- Insert test data for user_account
INSERT INTO user_account (id, username, email, password_hash) VALUES
  (gen_random_uuid(), 'user1', 'user1@example.com', encode(digest('password1', 'sha256'), 'hex')),
  (gen_random_uuid(), 'user2', 'user2@example.com', encode(digest('password2', 'sha256'), 'hex')),
  (gen_random_uuid(), 'user3', 'user3@example.com', encode(digest('password3', 'sha256'), 'hex')),
  (gen_random_uuid(), 'user4', 'user4@example.com', encode(digest('password4', 'sha256'), 'hex')),
  (gen_random_uuid(), 'user5', 'user5@example.com', encode(digest('password5', 'sha256'), 'hex')),
  (gen_random_uuid(), 'user6', 'user6@example.com', encode(digest('password6', 'sha256'), 'hex')),
  (gen_random_uuid(), 'user7', 'user7@example.com', encode(digest('password7', 'sha256'), 'hex')),
  (gen_random_uuid(), 'user8', 'user8@example.com', encode(digest('password8', 'sha256'), 'hex')),
  (gen_random_uuid(), 'user9', 'user9@example.com', encode(digest('password9', 'sha256'), 'hex')),
  (gen_random_uuid(), 'user10', 'user10@example.com', encode(digest('password10', 'sha256'), 'hex'));

-- Insert test data for schedule
INSERT INTO schedule (id, removed, owner_id, schedule_name, schedule_description, code) VALUES
  (gen_random_uuid(), NULL, (SELECT id FROM user_account WHERE username = 'user1'), 'Schedule 1', 'Description for Schedule 1', gen_random_uuid()),
  (gen_random_uuid(), NULL, (SELECT id FROM user_account WHERE username = 'user2'), 'Schedule 2', 'Description for Schedule 2', gen_random_uuid()),
  (gen_random_uuid(), NULL, (SELECT id FROM user_account WHERE username = 'user3'), 'Schedule 3', 'Description for Schedule 3', gen_random_uuid());

-- Insert test data for user_schedule_membership
INSERT INTO user_schedule_membership (id, user_id, schedule_id) VALUES
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user4'), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 1')),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user5'), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 1')),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user4'), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 2')),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user5'), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 2'));

-- Insert test data for shift
INSERT INTO shift (id, schedule_id, start_time, end_time, shift_name, shift_description) VALUES
  (gen_random_uuid(), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 1'), '2024-11-13 08:00:00', '2024-11-13 12:00:00', 'Shift 1', 'Description for Shift 1'),
  (gen_random_uuid(), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 1'), '2024-11-13 08:00:00', '2024-11-13 12:00:00', 'Shift 1 (2)', 'Description for Shift 1'),
  (gen_random_uuid(), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 1'), '2024-11-14 13:00:00', '2024-11-14 17:00:00', 'Shift 2', 'Description for Shift 2'),
  (gen_random_uuid(), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 1'), '2024-11-14 13:00:00', '2024-11-14 17:00:00', 'Shift 2 (2)', 'Description for Shift 2'),
  (gen_random_uuid(), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 2'), '2024-11-14 08:00:00', '2024-11-14 12:00:00', 'Shift 3', 'Description for Shift 3'),
  (gen_random_uuid(), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 2'), '2024-11-13 13:00:00', '2024-11-13 17:00:00', 'Shift 4', 'Description for Shift 4');

-- Insert test data for user_shift_assignment
INSERT INTO user_shift_assignment (id, user_id, shift_id) VALUES
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user4'), (SELECT id FROM shift WHERE shift_name = 'Shift 1')),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user4'), (SELECT id FROM shift WHERE shift_name = 'Shift 2')),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user5'), (SELECT id FROM shift WHERE shift_name = 'Shift 1 (2)')),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user5'), (SELECT id FROM shift WHERE shift_name = 'Shift 2 (2)')),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user4'), (SELECT id FROM shift WHERE shift_name = 'Shift 3')),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user5'), (SELECT id FROM shift WHERE shift_name = 'Shift 4'));

-- Insert test data for user_shift_signup
INSERT INTO user_shift_signup (id, user_id, shift_id, user_weighting) VALUES
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user5'), (SELECT id FROM shift WHERE shift_name = 'Shift 1'), 1),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user4'), (SELECT id FROM shift WHERE shift_name = 'Shift 1 (2)'), 1),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user5'), (SELECT id FROM shift WHERE shift_name = 'Shift 2'), 1),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user4'), (SELECT id FROM shift WHERE shift_name = 'Shift 2 (2)'), 1),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user4'), (SELECT id FROM shift WHERE shift_name = 'Shift 3'), 1),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user5'), (SELECT id FROM shift WHERE shift_name = 'Shift 4'), 1);

-- Insert test data for organization
INSERT INTO organization (id, removed, organization_name, organization_description, owner_id, code) VALUES
  (gen_random_uuid(), NULL, 'Organization 1', 'Description for Organization 1', (SELECT id FROM user_account WHERE username = 'user1'), gen_random_uuid()),
  (gen_random_uuid(), NULL, 'Organization 2', 'Description for Organization 2', (SELECT id FROM user_account WHERE username = 'user2'), gen_random_uuid()),
  (gen_random_uuid(), NULL, 'Organization 3', 'Description for Organization 3', (SELECT id FROM user_account WHERE username = 'user3'), gen_random_uuid());

-- Insert test data for schedule_org_membership
INSERT INTO schedule_org_membership (id, org_id, schedule_id) VALUES
  (gen_random_uuid(), (SELECT id FROM organization WHERE organization_name = 'Organization 1'), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 1')),
  (gen_random_uuid(), (SELECT id FROM organization WHERE organization_name = 'Organization 2'), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 2')),
  (gen_random_uuid(), (SELECT id FROM organization WHERE organization_name = 'Organization 3'), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 3'));

-- Insert test data for profile_image_data
INSERT INTO profile_image_data (user_id, image_data) VALUES
  ((SELECT id FROM user_account WHERE username = 'user1'), decode('iVBORw0KGgoAAAANSUhEUgAAAAUA', 'base64')),
  ((SELECT id FROM user_account WHERE username = 'user2'), decode('iVBORw0KGgoAAAANSUhEUgAAAAUA', 'base64')),
  ((SELECT id FROM user_account WHERE username = 'user3'), decode('iVBORw0KGgoAAAANSUhEUgAAAAUA', 'base64'));