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