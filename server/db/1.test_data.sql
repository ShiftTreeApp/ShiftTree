CREATE EXTENSION IF NOT EXISTS pgcrypto;

DELETE FROM user_account;

INSERT INTO user_account (id, username, email, passoword_hash) VALUES
  (gen_random_uuid(), 'user1', 'user1@example.com', 'hash1'),
  (gen_random_uuid(), 'user2', 'user2@example.com', 'hash2'),
  (gen_random_uuid(), 'user3', 'user3@example.com', 'hash3'),
  (gen_random_uuid(), 'user4', 'user4@example.com', 'hash4'),
  (gen_random_uuid(), 'user5', 'user5@example.com', 'hash5'),
  (gen_random_uuid(), 'user6', 'user6@example.com', 'hash6'),
  (gen_random_uuid(), 'user7', 'user7@example.com', 'hash7'),
  (gen_random_uuid(), 'user8', 'user8@example.com', 'hash8'),
  (gen_random_uuid(), 'user9', 'user9@example.com', 'hash9'),
  (gen_random_uuid(), 'user10', 'user10@example.com', 'hash10');
