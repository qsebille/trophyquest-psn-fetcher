import {PsnDataWrapper} from "../psn/models/wrappers/psnDataWrapper.js";
import {AppDataWrapper} from "./models/wrappers/appDataWrapper.js";
import {AppPlayer, buildAppPlayer} from "./models/appPlayer.js";
import {AppGame, buildAppGames} from "./models/appGame.js";
import {AppPlayedGame, buildAppPlayedGames} from "./models/appPlayedGame.js";
import {AppTrophyCollection, buildAppTrophyCollections} from "./models/appTrophyCollection.js";
import {AppPlayedTrophyCollection, buildAppPlayedTrophyCollections} from "./models/appPlayedTrophyCollection.js";
import {AppTrophy, buildAppTrophies} from "./models/appTrophy.js";
import {AppEarnedTrophy, buildAppEarnedTrophies} from "./models/appEarnedTrophy.js";
import {buildSchemaIdMap, SchemaIdMap} from "./models/staging/schemaIdMap.js";


export function computeAppData(wrapper: PsnDataWrapper): AppDataWrapper {
    console.info(`Computing app data...`);
    const schemaIdMap: SchemaIdMap = buildSchemaIdMap(wrapper);

    const appPlayers: AppPlayer[] = buildAppPlayer(wrapper.users);
    const appGames: AppGame[] = buildAppGames(wrapper.titles);
    const appPlayedGames: AppPlayedGame[] = buildAppPlayedGames(wrapper.playedTitles, schemaIdMap);
    const appTrophyCollections: AppTrophyCollection[] = buildAppTrophyCollections(wrapper.trophySets, wrapper.titleTrophySets, schemaIdMap);
    const appPlayedTrophyCollections: AppPlayedTrophyCollection[] = buildAppPlayedTrophyCollections(wrapper.playedTrophySets, schemaIdMap);
    const appTrophies: AppTrophy[] = buildAppTrophies(wrapper.trophies, schemaIdMap);
    const appEarnedTrophies: AppEarnedTrophy[] = buildAppEarnedTrophies(wrapper.earnedTrophies, schemaIdMap);

    console.info("Computed app data: Success.")
    console.info(`Computed ${appPlayers.length} players.`);
    console.info(`Computed ${appGames.length} games.`);
    console.info(`Computed ${appTrophyCollections.length} trophy collections.`);
    console.info(`Computed ${appTrophies.length} trophies.`);
    console.info(`Computed ${appPlayedGames.length} played games.`);
    console.info(`Computed ${appPlayedTrophyCollections.length} played trophy collections.`);
    console.info(`Computed ${appEarnedTrophies.length} earned trophies.`);

    return {
        players: appPlayers,
        games: appGames,
        playedGames: appPlayedGames,
        trophyCollections: appTrophyCollections,
        playedTrophyCollections: appPlayedTrophyCollections,
        trophies: appTrophies,
        earnedTrophies: appEarnedTrophies,
    };
}