import { Dispatch, SetStateAction } from "react";
import { LatLngExpression } from "leaflet";
import { toast } from 'react-toastify';
import Moment from 'moment';
import {
  IconAccount,
  IconDate,
  IconFlyDevice,
  IconList,
  IconPath,
  IconStationDevice,
  IconWorkers,
} from "@/component/Icon";
import { fetchLogs } from "./fetch_logs";
import { DocumentData } from "./map_data";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

export default function UavListItem({
  index,
  docId,
  docData,
  resetData,
  focusRoute,
  focusUav,
}: {
  index: number;
  docId: string;
  docData: DocumentData;
  resetData: Function,
  focusRoute: Function,
  focusUav: Function;
}) {
  return (
    <Accordion type="single" collapsible defaultValue={index === 0 ? `item-${index}` : undefined}>
      <AccordionItem value={`item-${index}`} className="mb-4 border rounded bg-muted">
        <AccordionTrigger className="px-3 py-2 hover:no-underline">
          <div className="flex items-center">
            <IconPath className="w-4 h-4 mr-2" />
            <span className="font-bold">{docData.docNo}</span>
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <ScrollArea className="h-[300px] rounded-md border p-4">
            <div className="space-y-4">
              <div className="flex items-center">
                <IconDate className="w-4 h-4 mr-2" />
                <span className="text-muted-foreground">Ngày kiểm tra:</span>
                <span className="ml-2 font-bold">{Moment(docData.date).format("DD-MM-YYYY")}</span>
              </div>
              <div className="flex items-start">
                <IconPath className="w-4 h-4 mr-2 mt-1" />
                <div>
                  <div className="font-bold">{docData.powerline.name}</div>
                  <div className="text-xs text-muted-foreground">({docData.powerPoles.from.code} - {docData.powerPoles.to.code})</div>
                </div>
              </div>
              {docData.workers.length > 0 && (
                <Accordion type="single" collapsible>
                  <AccordionItem value="workers">
                    <AccordionTrigger className="py-2">
                      <div className="flex items-center">
                        <IconWorkers className="w-4 h-4 mr-2" />
                        <span className="text-muted-foreground">Nhân viên kiểm tra:</span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <ul className="space-y-2">
                        {docData.workers.map((worker) => (
                          <li key={worker} className="flex items-center">
                            <IconAccount className="w-4 h-4 mr-2" />
                            <span>{worker}</span>
                          </li>
                        ))}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
              {docData.workstations && (
                <div className="flex items-center">
                  <IconStationDevice className="w-4 h-4 mr-2" />
                  <span className="text-muted-foreground">Máy trạm:</span>
                  <span className="ml-2 font-bold">{docData.workstations}</span>
                </div>
              )}
              {docData.flyDevices.length > 0 && (
                <div>
                  <div className="flex items-center mb-2">
                    <IconList className="w-4 h-4 mr-2" />
                    <span className="text-muted-foreground">Thiết bị bay:</span>
                  </div>
                  <ul className="space-y-2">
                    {docData.flyDevices.map((flycam) => (
                      <li key={flycam}>
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => {
                            fetchLogs(docId, flycam)
                              .then((response) => {
                                resetData();
                                if(response.length > 0) {
                                  const docuav = docId + "/" + flycam;
                                  focusRoute(String(docData.powerline.id), false);
                                  focusUav(docuav, response);
                                } else {
                                  focusRoute(String(docData.powerline.id), true);
                                }
                              })
                              .catch((e: Error) => {
                                if(e.message) toast.error(e.message);
                              });
                          }}
                        >
                          <IconFlyDevice className="w-4 h-4 mr-2 text-primary" />
                          <span className="font-bold underline">{flycam}</span>
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </ScrollArea>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}