-- USING USERS_MS;

CREATE TABLE Users (
    id VARCHAR(36),
    fullname VARCHAR(50),
    username VARCHAR(50),
    PRIMARY KEY (id)
);

CREATE TABLE Tmp_Users_Priority_One (
    user_id VARCHAR(36)
);

CREATE TABLE Tmp_Users_Priority_Two (
    user_id VARCHAR(36)
);

CREATE TABLE Users_Priority (
    user_id VARCHAR(36),
    priority_num INT,
    PRIMARY KEY (user_id, priority_num),
    CONSTRAINT fk_user_id
      FOREIGN KEY (user_id) 
	  REFERENCES Users(id)
);

COMMIT;
