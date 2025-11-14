import {Pool} from "pg";
import {UserTQ} from "./user.js";
import {GameTQ} from "./game.js";
import {TrophyTQ} from "./trophy.js";

const pool = new Pool({
    host: process.env.PGHOST,
    port: Number(process.env.PGPORT ?? 5432),
    user: process.env.PGUSER,
    password: process.env.PGPASSWORD,
    database: process.env.PGDATABASE,
    ssl: process.env.PGSSL === "true" ? {rejectUnauthorized: false} : undefined, // RDS/Render/etc.
});

export async function insertUser(user: UserTQ): Promise<any> {
    const insert = await pool.query(
        `
            INSERT INTO public.psn_user (id, name, avatar_url)
            VALUES ($1, $2, $3) ON CONFLICT (id) DO NOTHING
        `,
        [user.id, user.profileName, user.avatarUrl]
    );

    if (insert.rowCount === 0) {
        console.info(`User ${user.profileName} already in database`);
    } else {
        console.info(`Inserted user ${user.profileName} in database`);
    }
}

async function insertGamesInDatabase(games: GameTQ[]): Promise<any> {
    const values: string[] = [];
    const placeholders: string = games.map((game, idx) => {
        values.push(game.id, game.title, game.platform, game.iconUrl ?? null);
        const base = idx * 4;
        return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4})`;
    }).join(',');

    const insert = await pool.query(`
        INSERT INTO public.game (id, title, platform, image_url)
        VALUES ${placeholders} ON CONFLICT (id) DO NOTHING
    `, values);

    const nbInserted = insert.rowCount;
    const nbIgnored = games.length - (insert.rowCount ?? 0);
    console.info(`Inserted ${nbInserted} games in database ${nbIgnored > 0 ? `(${nbIgnored} ignored)` : ''}`);
}

async function insertUserGamesInDatabase(games: GameTQ[], user: UserTQ): Promise<any> {
    const values: string[] = [];
    const placeholders: string = games.map((game, idx) => {
        values.push(user.id, game.id, game.lastUpdatedDateTime);
        const base = idx * 3;
        return `($${base + 1}, $${base + 2}, $${base + 3})`;
    }).join(',');


    const insert = await pool.query(`
        INSERT INTO public.user_game (user_id, game_id, last_played_at)
        VALUES ${placeholders} ON CONFLICT (user_id,game_id) DO
        UPDATE
            SET
                last_played_at=EXCLUDED.last_played_at
    `, values);

    console.info(`Inserted ${insert.rowCount} user/games links in database`);
}

async function insertTrophiesInDatabase(trophies: TrophyTQ[]): Promise<any> {
    let nbInserted: number = 0;
    let nbIgnored: number = 0;
    const batchSize: number = 200;

    for (let i = 0; i < trophies.length; i += batchSize) {
        const batch = trophies.slice(i, i + batchSize);
        const values: string[] = [];
        const placeholders = batch.map((trophy, idx) => {
            values.push(
                trophy.id,
                trophy.gameId,
                trophy.orderInGame.toString(),
                trophy.title,
                trophy.detail,
                trophy.trophyType,
                trophy.isHidden.toString(),
                trophy.groupId,
                trophy.iconUrl
            )
            const base = idx * 9;
            return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}, $${base + 5}, $${base + 6}, $${base + 7}, $${base + 8}, $${base + 9})`;
        }).join(',');

        const insert = await pool.query(`
            INSERT INTO public.trophy (id, game_id, order_in_game, title, detail, trophy_type, is_hidden, game_group,
                                       icon_url)
            VALUES ${placeholders} ON CONFLICT (id) DO NOTHING
        `, values);

        nbInserted += insert.rowCount ?? 0;
        nbIgnored += (batch.length - (insert.rowCount ?? 0))
    }

    console.info(`Inserted ${nbInserted} trophies in database ${nbIgnored > 0 ? `(${nbIgnored} ignored)` : ''}`);
}

async function insertUserTrophiesInDatabase(trophies: TrophyTQ[], user: UserTQ): Promise<any> {
    const values: string[] = [];
    const placeholders: string = trophies
        .filter(t => t.earnedDateTime !== null)
        .map((t, idx) => {
            values.push(user.id, t.id, t.earnedDateTime ?? '');
            const base = idx * 3;
            return `($${base + 1}, $${base + 2}, $${base + 3})`;
        }).join(',');


    const insert = await pool.query(`
        INSERT INTO public.user_trophy (user_id, trophy_id, earned_at)
        VALUES ${placeholders} ON CONFLICT (user_id,trophy_id) DO NOTHING
    `, values);

    console.info(`Inserted ${insert.rowCount} user/trophies links in database`);
}

export async function insertGames(games: GameTQ[], user: UserTQ): Promise<any> {
    await insertGamesInDatabase(games);
    await insertUserGamesInDatabase(games, user);
}

export async function insertTrophies(trophies: TrophyTQ[], user: UserTQ): Promise<any> {
    await insertTrophiesInDatabase(trophies);
    await insertUserTrophiesInDatabase(trophies, user);
}