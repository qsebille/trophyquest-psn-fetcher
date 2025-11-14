import {authFromNpsso} from "./modules/auth.js";
import {GamePsn, GameTQ, listUserGamesPsn, toTrophyQuestGame} from "./modules/game.js";
import {
    listEarnedGameTrophies,
    listGameTrophies,
    toTrophyTQ,
    TrophyEarnedPsn,
    TrophyPsn,
    TrophyTQ
} from "./modules/trophy.js";
import {getUserInfo, UserTQ} from "./modules/user.js"
import {insertGames, insertTrophies, insertUser} from "./modules/postgres.js";

async function main() {
    console.info("Start PSN Fetcher")

    // Paramètres d'entrée
    const NPSSO: string | undefined = process.env.NPSSO;

    if (!NPSSO) {
        console.error("Undefined NPSSO")
        process.exit(1);
    }

    let auth = await authFromNpsso(NPSSO);
    if (auth.error) {
        console.error("Error in auth");
        console.error(auth.error);
    }

    // Fetch current user infos
    const user: UserTQ = await getUserInfo(auth);
    await insertUser(user);

    // Fetch games
    const gamesPsn: GamePsn[] = await listUserGamesPsn(auth, "me");
    const games: GameTQ[] = gamesPsn.map(g => toTrophyQuestGame(g));
    console.info(`Found ${games.length} games`);
    await insertGames(games, user);

    // Fetch trophies
    const trophies: TrophyTQ[] = [];
    for (const game of games) {
        const gameTrophiesPsn: TrophyPsn[] = await listGameTrophies(auth, game);
        const earnedGameTrophies: Map<number, TrophyEarnedPsn> = await listEarnedGameTrophies(auth, game);
        const gameTrophies: TrophyTQ[] = gameTrophiesPsn.map(t => toTrophyTQ(t, game, earnedGameTrophies));
        console.info(`-- Found ${gameTrophies.length} trophies for game ${game.title} - (${game.platform})`);
        trophies.push(...gameTrophies);
    }
    console.info(`Found ${trophies.length} trophies in total`);
    await insertTrophies(trophies, user);

    console.info("End of PSN Fetcher");
    process.exit(0);
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
