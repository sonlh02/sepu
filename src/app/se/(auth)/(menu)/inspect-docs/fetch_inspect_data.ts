// load lib
import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
// load config
import { InspectStatus } from "@/enum/doc_status";
import { InspectType } from "@/enum/inspect_type";
// load data, content from app
import { InspectData } from "./inspect_data";

type InspectRawData = {
  data: {
    inspect_doc: {
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
      status: 1 | 2 | 3 | 4 | 5 | 6;
      inspectTeams: Array<{
        id: number;
        username: string;
        name: string;
        position: string;
        lvWork: 1 | 2 | 3 | 4 | 5 | 6 | 7;
        lvSafe: 1 | 2 | 3 | 4 | 5;
        signature?: string;
        leader?: boolean;
      }>;
      inspectApprovals: Array<{
        id: number;
        username: string;
        name: string;
        position: string;
        represent: string;
        signature?: string;
        confirm?: boolean;
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
      incidentFlies: Array<{
        id: number;
        power: {
          id: number;
          name: string;
          code: string;
          latitude: number;
          longitude: number;
        };
        pole?: string;
        line?: string;
        latitude: number;
        longitude: number;
        altitude: number;
        incident: string;
        incidentType: string;
        dateWarning: string;
        lvWarning: null;
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
      workstation: string;
      flycam: string;
    };
  };
};

export async function fetchInspectData(id: number): Promise<InspectData> {
  const data = await fetchWithToken(
    `${SE.API_INSPECTDOC}/${id}`
  ).then((response) => response as InspectRawData);
  // if (response instanceof Error) throw response;
  // const data: InspectRawData = await response.json();
  const inspectRawData = data.data.inspect_doc;

  return {
    id: inspectRawData.id,
    type: {
      D: InspectType.Day,
      N: InspectType.Night,
    }[inspectRawData.type],
    powerline: {
      id: inspectRawData.route.id,
      name: inspectRawData.route.name,
      code: inspectRawData.route.code,
    },
    powerPoles: {
      from: {
        id: inspectRawData.powerFi.id,
        name: inspectRawData.powerFi.name,
        code: inspectRawData.powerFi.code,
      },
      to: {
        id: inspectRawData.powerTi.id,
        name: inspectRawData.powerTi.name,
        code: inspectRawData.powerTi.code,
      },
    },
    code: inspectRawData.docNo,
    date: new Date(inspectRawData.dateInspect),
    inspectMethod: inspectRawData.methodInspect,
    approvers: inspectRawData.inspectApprovals.map((approverRaw) => ({
      id: approverRaw.id,
      username: approverRaw.username,
      name: approverRaw.name,
      signature: approverRaw.signature,
      position: approverRaw.position,
      represent: approverRaw.represent,
    })),
    workers: inspectRawData.inspectTeams.map((workerRaw) => ({
      id: workerRaw.id,
      username: workerRaw.username,
      name: workerRaw.name,
      position: workerRaw.position,
      lvWork: workerRaw.lvWork,
      lvSafe: workerRaw.lvSafe,
      signature: workerRaw.signature,
    })),
    workstations: inspectRawData.inspectWorkstations.map((iw) => ({
      id: iw.workstation.id,
      name: iw.workstation.name,
      code: iw.workstation.code,
      activity: iw.workstation.activity,
    })),
    flycams: inspectRawData.inspectFlycams.map((iu) => ({
      id: iu.flycam.id,
      name: iu.flycam.name,
      code: iu.flycam.code,
      activity: iu.flycam.activity,
    })),
    status: {
      1: InspectStatus.Created,
      2: InspectStatus.Confirmed,
      3: InspectStatus.Ready,
      4: InspectStatus.Submited,
      5: InspectStatus.Approved,
      6: InspectStatus.Completed,
    }[inspectRawData.status],
    images: inspectRawData.inspectImages.map(
      (imageRaw) => imageRaw.visualData.path
    ),
    warnings: inspectRawData.incidentFlies.map((warningRaw) => ({
      image: warningRaw.visualData.path,
      powerPole: warningRaw.power.name,
      latitude: warningRaw.latitude,
      longitude: warningRaw.longitude,
      altitude: warningRaw.altitude,
      description: warningRaw.incident,
    })),
    results: inspectRawData.inspectResults.map((resultRaw) => ({
      title: resultRaw.title,
      body: resultRaw.result,
      keyword: resultRaw.keyword,
    })),
  };
}
