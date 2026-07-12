import {AuthorizationPayload} from "psn-api";
import {PlayedTrophySuite} from "./played-trophy-suite.model";
import {PlayedGame} from "../game/played-game.model";
import {mapWithConcurrency} from "../../utils/map-with-concurrency";

// Limit of 5 titles per batch: PSN API Limit
const BATCH_SIZE = 5

async function getLinksForBatchOfTitles(
    auth: AuthorizationPayload,
    accountId: string,
    titleIds: string
) {
    const {getUserTrophiesForSpecificTitle} = await import("psn-api");

    const options = {npTitleIds: titleIds, includeNotEarnedTrophyIds: true}
    const response = await getUserTrophiesForSpecificTitle(auth, accountId, options);

    // @ts-ignore
    if (response.error) {
        if (titleIds.split(',').length > 1) {
            const links: { titleId: string, npCommunicationId: string }[] = []
            for (const titleId of titleIds.split(',')) {
                const link = await getLinksForBatchOfTitles(auth, accountId, titleId)
                if (link)
                    links.push(...link)
            }
            return links;
        }
        return;
    }

    const links: { titleId: string, npCommunicationId: string }[] = []
    response.titles
        .filter(title => title.trophyTitles.length > 0)
        .map(title => {
            for (const trophyTitle of title.trophyTitles) {
                if (trophyTitle.lastUpdatedDateTime === null) return;
                links.push({
                    titleId: title.npTitleId,
                    npCommunicationId: trophyTitle.npCommunicationId
                })
            }
        });

    return links;
}


export async function enrichPlayedTrophySuiteWithGameId(
    auth: AuthorizationPayload,
    accountId: string,
    playedGames: PlayedGame[],
    playedSuites: PlayedTrophySuite[],
    concurrency: number = 10
) {
    // Using batch of titleIds to get trophy suite links
    const allTitleIds = playedGames.flatMap(game => game.titleIds)
    let batchs: string[] = [];
    for (let i = 0; i < allTitleIds.length; i += BATCH_SIZE) {
        batchs.push(allTitleIds.slice(i, i + BATCH_SIZE).join(','));
    }

    const safeConcurrency = Math.min(Math.max(1, concurrency), 10);
    console.info(`Fetching links between games and trophy suites with ${safeConcurrency} concurrent requests (${concurrency} provided)`)
    const linksPerBatch = await mapWithConcurrency(batchs, safeConcurrency, async (batch) => getLinksForBatchOfTitles(auth, accountId, batch))
    const links: { titleId: string, npCommunicationId: string }[] = linksPerBatch
        .flatMap(r => r)
        .filter(r => r !== undefined);

    // Adding gameId to played trophy suites
    for (const suite of playedSuites) {
        const link = links.find(l => l.npCommunicationId === suite.id)
        if (!link) continue;

        const titleId = link.titleId;
        const game = playedGames.find(game => game.titleIds.includes(titleId))
        if (!game) continue;

        suite.gameId = game.conceptId;
    }

    return playedSuites;
}
