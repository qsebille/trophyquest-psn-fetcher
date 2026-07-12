import {AuthorizationPayload} from "psn-api";
import {PlayedGame} from "./played-game.model";


const BATCH_SIZE = 100;
const CATEGORIES = 'ps4_game,ps5_native_game,pspc_game';


/*
 * Fetches the list of played games for a given account.
 */
export async function fetchPlayedGames(
    auth: AuthorizationPayload,
    accountId: string,
) {
    const {getUserPlayedGames} = await import("psn-api");

    const result: PlayedGame[] = [];

    let gameIds: number[] = [];
    let offset = 0;
    while (true) {
        const options = {limit: BATCH_SIZE, offset, categories: CATEGORIES};
        const response = await getUserPlayedGames(auth, accountId, options);

        for (const title of response.titles) {
            if (gameIds.includes(title.concept.id)) {
                result.find(g => g.conceptId === title.concept.id)!.titleIds.push(title.titleId);
                continue;
            }

            gameIds.push(title.concept.id);

            // Taking default language to be more robust.
            // @ts-ignore
            const defaultLanguage = title.concept.localizedName.defaultLanguage;
            // @ts-ignore
            const gameName = title.concept.localizedName.metadata[defaultLanguage];

            result.push({
                conceptId: title.concept.id,
                titleIds: [title.titleId, ...title.concept.titleIds],
                name: gameName,
                imageUrl: title.imageUrl,
                lastPlayedAt: title.lastPlayedDateTime,
                images: title.concept.media.images,
            } as PlayedGame)
        }

        // End of loop
        const noTitle = !response.titles || response.titles.length === 0
        const endOfPagination = response.nextOffset === null || response.nextOffset === offset
        if (noTitle || endOfPagination)
            break;

        offset = response.nextOffset;
    }

    return result;
}
