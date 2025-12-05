import {PsnDataWrapper} from "../psn/models/wrappers/psnDataWrapper.js";
import {AppDataWrapper} from "./models/wrappers/appDataWrapper.js";
import {buildUserProfileStaging, UserStaging} from "./models/staging/userStaging.js";
import {buildTrophyCollectionStaging, TrophyCollectionStaging} from "./models/staging/trophyCollectionStaging.js";
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
    const trophyCollectionStaging: TrophyCollectionStaging[] = buildTrophyCollectionStaging(psnData.titles, psnData.trophySets, psnData.titleTrophySets);
    const trophyStaging: TrophyStaging[] = buildTrophyStaging(trophyCollectionStaging, psnData.trophies);

    const appPlayers: AppPlayer[] = buildAppPlayer(userProfileStaging);
    const appGames: AppGame[] = buildAppGames(trophyCollectionStaging);
    const appPlayedGames: AppPlayedGame[] = buildAppPlayedGames(psnData.playedTitles, userProfileStaging, trophyCollectionStaging);
    const appTrophyCollections: AppTrophyCollection[] = buildAppTrophyCollections(trophyCollectionStaging);
    const appPlayedTrophyCollections: AppPlayedTrophyCollection[] = buildAppPlayedTrophyCollections(psnData.playedTrophySets, userProfileStaging, trophyCollectionStaging);
    const appTrophies: AppTrophy[] = buildAppTrophies(trophyStaging);
    const appEarnedTrophies: AppEarnedTrophy[] = buildAppEarnedTrophies(psnData.earnedTrophies, userProfileStaging, trophyStaging);

    console.info(`Computed ${appPlayers.length} app players.`);
    console.info(`Computed ${appGames.length} app games.`);
    console.info(`Computed ${appPlayedGames.length} app played games.`);
    console.info(`Computed ${appTrophyCollections.length} app trophy collections.`);
    console.info(`Computed ${appPlayedTrophyCollections.length} app played trophy collections.`);
    console.info(`Computed ${appTrophies.length} app trophies.`);
    console.info(`Computed ${appEarnedTrophies.length} app earned trophies.`);

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