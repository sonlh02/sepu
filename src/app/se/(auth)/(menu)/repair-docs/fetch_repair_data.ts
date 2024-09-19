// load lib
import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";
// load config
import { RepairStatus } from "@/enum/doc_status";
// load data, content from app
import { RepairData } from "./repair_data";

type RepairRawData = {
  data: {
    repair_doc: {
      id: number;
      docNo: string;
      dateRepair: string;
      route: {
        id: number;
        name: string;
        code: string;
      };
      routeCode: string;
      safeMeasure?: string;
      tasks: string;
      result: string;
      unresolved: string;
      status: 1 | 2 | 3 | 4 | 5;
      powers?: string;
      listPowers?: string;
      repairTeams: Array<{
        id: number;
        username: string;
        name: string;
        position: string;
        lvWork: 1 | 2 | 3 | 4 | 5 | 6 | 7;
        lvSafe: 1 | 2 | 3 | 4 | 5;
        signature?: string;
        leader?: boolean;
      }>;
      repairApprovals: Array<{
        id: number;
        username: string;
        name: string;
        position: string;
        signature?: string;
        represent: string;
        confirm?: boolean;
      }>;
      repairImages: Array<{
        id: number;
        visualData: {
          id: number;
          path: string;
          image: string;
        };
      }>;
    };
  };
};

export async function fetchRepairData(id: number): Promise<RepairData> {
  const data = await fetchWithToken(
    `${SE.API_REPAIRDOC}/${id}`
  ).then((response) => response as RepairRawData);
  // if (response instanceof Error) throw response;
  // const data: RepairRawData = await response.json();
  const repairRawData = data.data.repair_doc;

  return {
    id: repairRawData.id,
    powerline: {
      id: repairRawData.route.id,
      name: repairRawData.route.name,
      code: repairRawData.route.code,
    },
    code: repairRawData.docNo,
    date: new Date(repairRawData.dateRepair),
    prepare: repairRawData.safeMeasure,
    tasks: repairRawData.tasks,
    result: repairRawData.result,
    unresolved: repairRawData.unresolved,
    approvers: repairRawData.repairApprovals.map((approverRaw) => ({
      id: approverRaw.id,
      username: approverRaw.username,
      name: approverRaw.name,
      position: approverRaw.position,
      signature: approverRaw.signature,
      represent: approverRaw.represent,
      confirm: approverRaw.confirm,
    })),
    workers: repairRawData.repairTeams.map((workerRaw) => ({
      id: workerRaw.id,
      username: workerRaw.username,
      name: workerRaw.name,
      position: workerRaw.position,
      workLevel: workerRaw.lvWork,
      safeLevel: workerRaw.lvSafe,
      signature: workerRaw.signature,
    })),
    powers: repairRawData.powers ? repairRawData.powers.split(",") : [],
    status: {
      1: RepairStatus.Created,
      2: RepairStatus.Confirmed,
      3: RepairStatus.Submited,
      4: RepairStatus.Approved,
      5: RepairStatus.Completed,
    }[repairRawData.status],
    images: repairRawData.repairImages.map(
      (imageRaw) => imageRaw.visualData.path
    ),
  };
}
