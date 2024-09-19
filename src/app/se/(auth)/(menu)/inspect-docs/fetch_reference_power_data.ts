import { SE } from "@/lib/api";
import { fetchWithToken } from "@/lib/fetch_data";

type ReferenceRawPowerData = {
    data: {
        items: {
            powers: {
                [key: string]: string;
            }
        }
    }
}

export type ReferencePowerData = {
    powers: {
        [key: string]: string;
    }
}

export async function fetchReferencePowerData(route_id: string): Promise<ReferencePowerData> {
    const data = await fetchWithToken(
        `${SE.API_INSPECTDOCITEMPOWER}?route_id=${route_id}`
    ).then((response) => response as ReferenceRawPowerData);
    const referenceRawPowerData = data.data.items;

    return {
        powers: referenceRawPowerData.powers,
    }
}