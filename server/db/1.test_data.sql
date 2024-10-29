CREATE EXTENSION IF NOT EXISTS pgcrypto;

DELETE FROM user_account;

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

-- Insert schedules
INSERT INTO schedule (id, owner_id, schedule_name) VALUES
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user1'), 'Schedule 1'),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user2'), 'Schedule 2'),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user3'), 'Schedule 3');

-- Insert user schedule memberships
INSERT INTO user_schedule_membership (id, user_id, schedule_id) VALUES
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user4'), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 1')),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user5'), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 1')),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user6'), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 2')),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user7'), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 2')),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user8'), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 3')),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user9'), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 3'));

-- Insert shifts
INSERT INTO shift (id, schedule_id, start_time, end_time) VALUES
  (gen_random_uuid(), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 1'), '2023-10-01 08:00:00', '2023-10-01 12:00:00'),
  (gen_random_uuid(), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 1'), '2023-10-01 13:00:00', '2023-10-01 17:00:00'),
  (gen_random_uuid(), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 2'), '2023-10-02 08:00:00', '2023-10-02 12:00:00'),
  (gen_random_uuid(), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 2'), '2023-10-02 13:00:00', '2023-10-02 17:00:00'),
  (gen_random_uuid(), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 3'), '2023-10-03 08:00:00', '2023-10-03 12:00:00'),
  (gen_random_uuid(), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 3'), '2023-10-03 13:00:00', '2023-10-03 17:00:00');

-- Insert user shift assignments
INSERT INTO user_shift_assignment (id, user_id, shift_id) VALUES
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user4'), (SELECT id FROM shift WHERE start_time = '2023-10-01 08:00:00')),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user5'), (SELECT id FROM shift WHERE start_time = '2023-10-01 13:00:00')),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user6'), (SELECT id FROM shift WHERE start_time = '2023-10-02 08:00:00')),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user7'), (SELECT id FROM shift WHERE start_time = '2023-10-02 13:00:00')),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user8'), (SELECT id FROM shift WHERE start_time = '2023-10-03 08:00:00')),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user9'), (SELECT id FROM shift WHERE start_time = '2023-10-03 13:00:00'));

-- Insert user shift signups
INSERT INTO user_shift_signup (id, user_id, shift_id, user_weighting) VALUES
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user4'), (SELECT id FROM shift WHERE start_time = '2023-10-01 08:00:00'), 1),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user5'), (SELECT id FROM shift WHERE start_time = '2023-10-01 13:00:00'), 1),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user6'), (SELECT id FROM shift WHERE start_time = '2023-10-02 08:00:00'), 1),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user7'), (SELECT id FROM shift WHERE start_time = '2023-10-02 13:00:00'), 1),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user8'), (SELECT id FROM shift WHERE start_time = '2023-10-03 08:00:00'), 1),
  (gen_random_uuid(), (SELECT id FROM user_account WHERE username = 'user9'), (SELECT id FROM shift WHERE start_time = '2023-10-03 13:00:00'), 1);

-- Insert organizations
INSERT INTO organization (id, organization_name, owner_id) VALUES
  (gen_random_uuid(), 'Organization 1', (SELECT id FROM user_account WHERE username = 'user1')),
  (gen_random_uuid(), 'Organization 2', (SELECT id FROM user_account WHERE username = 'user2')),
  (gen_random_uuid(), 'Organization 3', (SELECT id FROM user_account WHERE username = 'user3'));

-- Insert schedule organization memberships
INSERT INTO schedule_org_membership (id, org_id, schedule_id) VALUES
  (gen_random_uuid(), (SELECT id FROM organization WHERE organization_name = 'Organization 1'), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 1')),
  (gen_random_uuid(), (SELECT id FROM organization WHERE organization_name = 'Organization 2'), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 2')),
  (gen_random_uuid(), (SELECT id FROM organization WHERE organization_name = 'Organization 3'), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 3'));


INSERT INTO join_code (code, schedule_id, expiration) VALUES
  (gen_random_uuid(), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 1'), '2023-12-31 23:59:59'),
  (gen_random_uuid(), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 2'), '2023-12-31 23:59:59'),
  (gen_random_uuid(), (SELECT id FROM schedule WHERE schedule_name = 'Schedule 3'), '2023-12-31 23:59:59');