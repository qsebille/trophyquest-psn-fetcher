import {mapWithConcurrency} from "./utils/mapWithConcurrency.js";
import {uploadImageFromUrl} from "./utils/uploadImageFromUrl.js";
import {TrophyImageData} from "../postgres/queries/images/trophyMissingImages.js";

export async function uploadTrophyImages(
    missingTrophyImages: TrophyImageData[],
    concurrency: number
): Promise<TrophyImageData[]> {
    const staging = await mapWithConcurrency(missingTrophyImages, concurrency, async (data) => {
            if (!data.icon_url) {
                return data;
            }

            const awsUrl = await uploadImageFromUrl(data.icon_url, "trophies", data.id);
            return {...data, aws_icon_url: awsUrl};
        }
    );

    return staging.filter(data => data.aws_icon_url !== null);
}