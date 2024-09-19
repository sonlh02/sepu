// load lib
import { fetchWithToken } from "@/lib/fetch_data";
import { SE } from "@/lib/api";

type ReferenceRawData = {
  data: {
    items: {
      routes: {
        [key: string]: string;
      };
      doc_types: {
        [key: string]: string;
      };
      users: {
        [key: string]: {
          phone: string;
          name: string;
          lv_work?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
          position?: string;
          usercode: string;
          department?: string;
          lv_safe?: 1 | 2 | 3 | 4 | 5 ;
        };
      };
    };
  };
};

export type ReferenceData = {
  powerlines: {
    [key: string]: string;
  };
  documentTypes: {
    [key: string]: string;
  };
  users: {
    [key: string]: {
      phone: string;
      name: string;
      lv_work?: 1 | 2 | 3 | 4 | 5 | 6 | 7;
      position?: string;
      usercode: string;
      department?: string;
      lv_safe?: 1 | 2 | 3 | 4 | 5 ;
    };
  };
};

export async function fetchReferenceData(): Promise<ReferenceData> {
  const data = await fetchWithToken(SE.API_REPAIRDOCITEM)
    .then((response) => response as ReferenceRawData);
  // if (response instanceof Error) throw response;
  // const data: ReferenceRawData = await response.json();

  return {
    powerlines: data.data.items.routes,
    documentTypes: data.data.items.doc_types,
    users: data.data.items.users,
  };
}
