CREATE OR REPLACE function load_user_priority() RETURNS TEXT AS
$$
    DECLARE 
        user_id_value VARCHAR;
        priority_one_cursor CURSOR FOR SELECT user_id FROM Tmp_Users_Priority_One;
        priority_two_cursor CURSOR FOR SELECT user_id FROM Tmp_Users_Priority_One;
        
    BEGIN
        OPEN priority_one_cursor;
        OPEN priority_two_cursor;

        LOOP
            FETCH FROM priority_one_cursor INTO user_id_value;
            EXIT WHEN NOT FOUND;

            INSERT INTO Users_Priority(user_id, priority_num) 
            VALUES (user_id_value, 1);
        END LOOP;

        LOOP
            FETCH FROM priority_two_cursor INTO user_id_value;
            EXIT WHEN NOT FOUND;

            INSERT INTO Users_Priority(user_id, priority_num) 
            VALUES (user_id_value, 2);
        END LOOP;

        CLOSE priority_one_cursor;
        CLOSE priority_two_cursor;

        return 'Loaded table Users_Priority successfully';

    END;

$$ LANGUAGE plpgsql;