import {PoolClient} from "pg";
import {PsnUser} from "../../../psn/models/psnUser.js";
import {buildPostgresInsertPlaceholders} from "../../utils/buildPostgresInsertPlaceholders.js";
import {InsertQueryResult} from "../../models/insertQueryResult.js";


/**
 * Inserts or updates PlayStation Network (PSN) user profiles in the PostgreSQL database.
 * If a profile with the same ID already exists, the avatar URL will be updated.
 *
 * @param {PoolClient} client - The database client used for the operation.
 * @param {PsnUser[]} users - An array of PSN user profiles to insert or update. Each user must include an ID, profile name, and optionally an avatar URL.
 * @return {Promise<InsertQueryResult>} A promise resolving to an object containing the number of rows inserted and ignored.
 */
export async function upsertPsnUserProfiles(
    client: PoolClient,
    users: PsnUser[],
): Promise<InsertQueryResult> {
    if (users.length === 0) {
        console.warn("No data to update in psn.user_profile table.");
        return {
            rowsInserted: 0,
            rowsIgnored: 0,
        };
    }

    const values: string[] = [];
    const placeholders: string = users.map((
        user,
        idx
    ) => {
        const currentValues = [user.id, user.profileName, user.avatarUrl ?? ""];
        values.push(...currentValues);
        return buildPostgresInsertPlaceholders(currentValues, idx);
    }).join(',');

    const insert = await client.query(`
        INSERT INTO psn.user_profile (id, name, avatar_url)
        VALUES
            ${placeholders} ON CONFLICT (id)
        DO
        UPDATE SET avatar_url=EXCLUDED.avatar_url
    `, values);

    return {
        rowsInserted: insert.rowCount ?? 0,
        rowsIgnored: 0
    }
}