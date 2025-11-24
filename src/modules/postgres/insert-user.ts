import {Pool} from "pg";
import {PsnUserDto} from "../../psn/models/psnUserDto.js";

export async function insertUserIntoPostgres(pool: Pool, user: PsnUserDto): Promise<any> {
    const insert = await pool.query(
        `
            INSERT INTO psn.user_profile (id, name, avatar_url)
            VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING
        `,
        [user.id, user.profileName, user.avatarUrl]
    );

    if (insert.rowCount === 0) {
        console.info(`User ${user.profileName} already in postgres database`);
    } else {
        console.info(`Inserted user ${user.profileName} into postgres database`);
    }
}