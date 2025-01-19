// load lib
import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
// load data, content from app
import { DocumentData } from "./map_data";

type InspectsRawData = {
  data: {
    inspect_docs: Array<{
      id: number;
      docNo: string;
      type: "D" | "N";
      dateInspect: string;
      route: {
        id: number;
        name: string;
        code: string;
      };
      powerFi: {
        id: number;
        name: string;
        code: string;
        latitude: number;
        longitude: number;
      };
      powerTi: {
        id: number;
        name: string;
        code: string;
        latitude: number;
        longitude: number;
      };
      routeCode: string;
      powerFrom: string;
      powerTo: string;
      methodInspect: string;
      status: 1 | 2 | 3;
      inspectTeams: Array<{
        id: number;
        username: string;
        name: string;
        position: string;
        lvWork: string;
        lvSafe: string;
        leader: boolean;
      }>;
      inspectApprovals: Array<{
        id: number;
        username: string;
        name: string;
        position: string;
        confirm: boolean;
      }>;
      inspectWorkstations: Array<{
        id: number;
        workstation: {
          id: number;
          name: string;
          code: string;
          activity: boolean;
        };
      }>;
      inspectFlycams: Array<{
        id: number;
        flycam: {
          id: number;
          name: string;
          code: string;
          activity: boolean;
        };
      }>;
      inspectImages: Array<{
        id: number;
        visualData: {
          id: number;
          path: string;
          image: string;
        };
      }>;
      inspectResults: Array<{
        id: number;
        keyword: string;
        title: string;
        result: string;
        pos: number;
      }>;
    }>;
  };
};

export async function fetchDocuments(seek: any): Promise<{
  [key: string]: DocumentData;
}> {
  const data = await fetchWithToken(
    `${SE.API_MAPDOC}?${new URLSearchParams(seek)}`
  ).then((response) => response as InspectsRawData);

  let documentData: { [key: string]: DocumentData } = {};

  data.data.inspect_docs.forEach(
    (docRawData) =>
      (documentData[docRawData.id] = {
        docId: docRawData.id,
        docNo: docRawData.docNo,
        type: docRawData.type,
        powerline: {
          id: docRawData.route.id,
          name: docRawData.route.name,
          code: docRawData.route.code,
        },
        powerPoles: {
          from: {
            id: docRawData.powerFi.id,
            name: docRawData.powerFi.name,
            code: docRawData.powerFi.code,
          },
          to: {
            id: docRawData.powerTi.id,
            name: docRawData.powerTi.name,
            code: docRawData.powerTi.code,
          }
        },
        date: new Date(docRawData.dateInspect),
        workers: docRawData.inspectTeams.map((workerRaw) => workerRaw.name),
        workstations: docRawData.inspectWorkstations.map((ws) => ws.workstation.code).join(","),
        flyDevices: docRawData.inspectFlycams.map((uav) => uav.flycam.code),
      })
  );

  return documentData;
}