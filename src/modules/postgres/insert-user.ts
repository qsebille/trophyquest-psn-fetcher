import {UserDTO} from "../psn-user.js";
import {postgresUtils} from "./postgres-utils.js";
import {Params} from "../utils/params.js";

export async function insertUserIntoPostgres(user: UserDTO, params: Params): Promise<any> {
    const pool = postgresUtils(params);
    const insert = await pool.query(
        `
            INSERT INTO psn.user_profile (id, name, avatar_url)
            VALUES ($1, $2, $3)
            ON CONFLICT (id) DO NOTHING
        `,
        [user.id, user.profileName, user.avatarUrl]
    );

    if (insert.rowCount === 0) {
        console.info(`User ${user.profileName} already in postgres database`);
    } else {
        console.info(`Inserted user ${user.profileName} into postgres database`);
    }
}