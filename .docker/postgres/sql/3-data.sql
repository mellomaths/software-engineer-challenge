COPY Users(id, fullname, username)
FROM '/input/users.csv'
DELIMITER ',' CSV;

COPY Tmp_Users_Priority_One(user_id)
FROM '/input/lista_relevancia_1.txt';

COPY Tmp_Users_Priority_Two(user_id)
FROM '/input/lista_relevancia_2.txt';

SELECT load_user_priority();

COMMIT;