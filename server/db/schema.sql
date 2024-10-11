CREATE TABLE user(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(),varchar 64 )

CREATE TABLE schedule(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), varchar 64 schedule_name)

CREATE TABLE shift(id UUID UNIQUE PRIMARY KEY DEFAULT gen_random_uuid(), schedule UUID REFERENCES schedule(id), timestamp start_time, timestamp end_time)