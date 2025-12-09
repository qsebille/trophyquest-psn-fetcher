import {mapWithConcurrency} from "./utils/mapWithConcurrency.js";
import {uploadImageFromUrl} from "./utils/uploadImageFromUrl.js";
import {GameImageData} from "../postgres/queries/images/gameMissingImages.js";
import {CollectionImageData} from "../postgres/queries/images/collectionMissingImages.js";

export async function uploadCollectionImages(
    missingCollectionImages: CollectionImageData[],
    concurrency: number
): Promise<GameImageData[]> {
    return await mapWithConcurrency(missingCollectionImages, concurrency, async (data) => {
            if (!data.image_url) {
                return data;
            }

            const awsUrl = await uploadImageFromUrl(data.image_url, "collections", data.id);
            return {...data, aws_image_url: awsUrl};
        }
    );
}