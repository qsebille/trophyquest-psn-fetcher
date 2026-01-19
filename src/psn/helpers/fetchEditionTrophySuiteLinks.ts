import {AuthorizationPayload, UserTrophiesBySpecificTitleResponse} from "psn-api";
import {UserPlayedEdition} from "../../models/UserPlayedEdition.js";
import {EditionTrophySuiteLink} from "../../models/EditionTrophySuiteLink.js";
import {Player} from "../../models/Player.js";
import {mapWithConcurrency} from "../../aws/utils/mapWithConcurrency.js";

const TITLES_BATCH_SIZE: number = 5;

export async function fetchEditionTrophySuiteLinks(
    auth: AuthorizationPayload,
    player: Player,
    playedEditions: UserPlayedEdition[],
    concurrency: number = 10,
): Promise<EditionTrophySuiteLink[]> {
    const {getUserTrophiesForSpecificTitle} = await import("psn-api");

    const startTime = Date.now();
    const safeConcurrency = Math.max(1, concurrency);

    const accountId = player.id;
    const npTitleIds = playedEditions.map(p => p.edition.id);
    const batchs: string[] = [];
    for (let i = 0; i < npTitleIds.length; i += TITLES_BATCH_SIZE) {
        batchs.push(npTitleIds.slice(i, i + TITLES_BATCH_SIZE).join(','));
    }
    const perBatchLinks: EditionTrophySuiteLink[][] = await mapWithConcurrency(
        batchs,
        safeConcurrency,
        async (batch) => {
            const response: UserTrophiesBySpecificTitleResponse = await getUserTrophiesForSpecificTitle(
                auth,
                accountId,
                {
                    npTitleIds: batch,
                    includeNotEarnedTrophyIds: true
                }
            )

            const currentLinks: EditionTrophySuiteLink[] = []
            response.titles
                .filter(title => title.trophyTitles.length > 0)
                .map(title => {
                    for (const trophyTitle of title.trophyTitles) {
                        if (trophyTitle.lastUpdatedDateTime === null) return;
                        currentLinks.push({
                            editionId: title.npTitleId,
                            trophySuiteId: trophyTitle.npCommunicationId
                        })
                    }
                })

            return currentLinks
        }
    )

    const links = perBatchLinks.flatMap(r => r);

    const duration = (Date.now() - startTime) / 1000;
    console.info(`Fetched ${links.length} edition-trophy suite links in ${duration.toFixed(2)} s`);

    return links;
}