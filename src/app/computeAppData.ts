import {PsnDataWrapper} from "../psn/models/wrappers/psnDataWrapper.js";
import {AppDataWrapper} from "./models/wrappers/appDataWrapper.js";
import {AppPlayer, buildAppPlayers} from "./models/appPlayer.js";
import {AppGame, buildAppGames} from "./models/appGame.js";
import {AppPlayedGame, buildAppPlayedGames} from "./models/appPlayedGame.js";
import {AppTrophy, buildAppTrophies} from "./models/appTrophy.js";
import {AppEarnedTrophy, buildAppEarnedTrophies} from "./models/appEarnedTrophy.js";


export function computeAppData(wrapper: PsnDataWrapper): AppDataWrapper {
    console.info(`Computing app data...`);
    const appPlayers: AppPlayer[] = buildAppPlayers(wrapper.users);
    const appGames: AppGame[] = buildAppGames(wrapper.titles);
    const appPlayedGames: AppPlayedGame[] = buildAppPlayedGames(wrapper.playedTitles);
    const appTrophies: AppTrophy[] = buildAppTrophies(wrapper.trophies);
    const appEarnedTrophies: AppEarnedTrophy[] = buildAppEarnedTrophies(wrapper.earnedTrophies);

    console.info("Computed app data: Success")
    console.info(`Computed ${appPlayers.length} players`);
    console.info(`Computed ${appGames.length} games`);
    console.info(`Computed ${appTrophies.length} trophies`);
    console.info(`Computed ${appPlayedGames.length} played games`);
    console.info(`Computed ${appEarnedTrophies.length} earned trophies`);

    return {
        players: appPlayers,
        games: appGames,
        playedGames: appPlayedGames,
        trophies: appTrophies,
        earnedTrophies: appEarnedTrophies,
    };
}