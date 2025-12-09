import {PsnDataWrapper} from "../psn/models/wrappers/psnDataWrapper.js";
import {AppDataWrapper} from "./models/wrappers/appDataWrapper.js";
import {buildUserProfileStaging, UserStaging} from "./models/staging/userStaging.js";
import {buildGameCollectionStaging, GameCollectionStaging} from "./models/staging/gameCollectionStaging.js";
import {buildTrophyStaging, TrophyStaging} from "./models/staging/trophyStaging.js";
import {AppPlayer, buildAppPlayer} from "./models/appPlayer.js";
import {AppGame, buildAppGames} from "./models/appGame.js";
import {AppPlayedGame, buildAppPlayedGames} from "./models/appPlayedGame.js";
import {AppTrophyCollection, buildAppTrophyCollections} from "./models/appTrophyCollection.js";
import {AppPlayedTrophyCollection, buildAppPlayedTrophyCollections} from "./models/appPlayedTrophyCollection.js";
import {AppTrophy, buildAppTrophies} from "./models/appTrophy.js";
import {AppEarnedTrophy, buildAppEarnedTrophies} from "./models/appEarnedTrophy.js";


function computeAppData(psnData: PsnDataWrapper): AppDataWrapper {
    const userProfileStaging: UserStaging[] = buildUserProfileStaging(psnData.users);
    const trophyCollectionStaging: GameCollectionStaging[] = buildGameCollectionStaging(psnData.titles, psnData.trophySets, psnData.titleTrophySets);
    const trophyStaging: TrophyStaging[] = buildTrophyStaging(trophyCollectionStaging, psnData.trophies);

    const appPlayers: AppPlayer[] = buildAppPlayer(userProfileStaging);
    const appGames: AppGame[] = buildAppGames(trophyCollectionStaging);
    const appPlayedGames: AppPlayedGame[] = buildAppPlayedGames(psnData.playedTitles, userProfileStaging, trophyCollectionStaging);
    const appTrophyCollections: AppTrophyCollection[] = buildAppTrophyCollections(trophyCollectionStaging);
    const appPlayedTrophyCollections: AppPlayedTrophyCollection[] = buildAppPlayedTrophyCollections(psnData.playedTrophySets, userProfileStaging, trophyCollectionStaging);
    const appTrophies: AppTrophy[] = buildAppTrophies(trophyStaging);
    const appEarnedTrophies: AppEarnedTrophy[] = buildAppEarnedTrophies(psnData.earnedTrophies, userProfileStaging, trophyStaging);

    console.info(`[APP-DATA-BUILDER] Computed ${appPlayers.length} app players.`);
    console.info(`[APP-DATA-BUILDER] Computed ${appGames.length} app games.`);
    console.info(`[APP-DATA-BUILDER] Computed ${appPlayedGames.length} app played games.`);
    console.info(`[APP-DATA-BUILDER] Computed ${appTrophyCollections.length} app trophy collections.`);
    console.info(`[APP-DATA-BUILDER] Computed ${appPlayedTrophyCollections.length} app played trophy collections.`);
    console.info(`[APP-DATA-BUILDER] Computed ${appTrophies.length} app trophies.`);
    console.info(`[APP-DATA-BUILDER] Computed ${appEarnedTrophies.length} app earned trophies.`);
    console.info(`[APP-DATA-BUILDER] App data computed successfully.`);

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

export default computeAppData