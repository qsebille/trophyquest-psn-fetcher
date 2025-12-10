import {mapWithConcurrency} from "./utils/mapWithConcurrency.js";
import {uploadImageFromUrl} from "./utils/uploadImageFromUrl.js";
import {PlayerImageData} from "../postgres/queries/images/playerMissingImages.js";

export async function uploadPlayerImages(
    missingPlayerImages: PlayerImageData[],
    concurrency: number
): Promise<PlayerImageData[]> {
    return await mapWithConcurrency(missingPlayerImages, concurrency, async (data) => {
            if (!data.avatar_url) {
                return data;
            }

            const awsUrl = await uploadImageFromUrl(data.avatar_url, "players", data.id);
            return {...data, aws_avatar_url: awsUrl};
        }
    );
}