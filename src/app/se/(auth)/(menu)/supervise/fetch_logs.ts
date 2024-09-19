// load package
import { LatLngExpression } from "leaflet";
// load lib
import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
// load data, content from app
import { UavData } from "./map_data";

type FlyLogsRawData = {
  data: {
    logs: Array<{
      id: number;
      locationName: string;
      latitude: number;
      longitude: number;
      altitude: number;
      warning?: string;
    }>;
  };
  message: string;
};

export async function fetchLogs(
  docId: string,
  flycam: string
): Promise<Array<UavData>> {
  const data = await fetchWithToken(
    `${SE.API_FLYLOG}?${new URLSearchParams({
      doc_id: docId,
      flycam: flycam,
    })}`
  ).then((response) => response as FlyLogsRawData);

  return data.data.logs.map((FlyLogRawData) => {
    return {
      locationName: FlyLogRawData.locationName,
      coordinates: [
        FlyLogRawData.latitude,
        FlyLogRawData.longitude,
        FlyLogRawData.altitude,
      ],
      warning: FlyLogRawData.warning,
    } as UavData;
  });
}
