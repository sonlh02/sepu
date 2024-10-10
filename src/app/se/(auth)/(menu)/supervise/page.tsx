"use client";
// load package
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { StompSessionProvider, useSubscription } from "react-stomp-hooks";
import { LatLngExpression } from "leaflet";
import { toast } from 'react-toastify';
// load lib
import menubar from "@/lib/menu";
// load config
import { UserWright } from "@/enum/user_wright";
// load icon
import { IconFullScreen, IconFlyDevice } from "@/component/Icon";
// load data, content from app
import { fetchRoutes } from "./fetch_routes";
import { fetchLines } from "./fetch_lines";
import { timeDisplay, RouteRaw, UavData } from "./map_data";

import UserDontAccessPage from "@/component/NotAllow";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
const ModeSupervise = dynamic(() => import("./ModeSupervise"), { ssr: false });
const ModeUav = dynamic(() => import("./ModeUav"), { ssr: false });

enum MapMode {
  Supervise = "supervise",
  Uav = "uav",
}

const mapModes = [
  {
    id: MapMode.Supervise,
    name: "Giám sát",
    icon: <IconFullScreen className="size-5" />,
  },
  {
    id: MapMode.Uav,
    name: "Đường bay",
    icon: <IconFlyDevice className="size-5" />,
  },
];

const stompSessionProviderUrl = `${process.env.NEXT_PUBLIC_API_URL}:8005/api/a/powerline/ws`;

type SuperviseRawData = {
  messageType: string;
  docId: number;
  uav: string;
  locationName: string;
  latitude: number;
  longitude: number;
  altitude: number;
  warning: string;
};

export default function Supervise() {
  const [currentMode, setCurrentMode] = useState(MapMode.Supervise);
  const [userWright, setUserWright] = useState<UserWright | null>(null);

  useEffect(() => {
    setUserWright(
      menubar("map") ? UserWright.Write : UserWright.None
    );
  }, []);

  if (!userWright) return null;

  if (userWright === UserWright.None) return <UserDontAccessPage />;

  return (
    <StompSessionProvider url={stompSessionProviderUrl}>
      <SuperviseSubscribing mode={currentMode} />

      <div className="absolute bottom-4 z-10 p-3">
      <Tabs
        value={currentMode}
        onValueChange={(value) => setCurrentMode(value as typeof currentMode)}
      >
        <TabsList>
          <TabsTrigger 
            value={MapMode.Supervise} 
            className={`tab data-[state=active]:bg-black data-[state=active]:text-white gap-2 text-xs w-32 h-12 ${currentMode === MapMode.Supervise ? "tab-active" : ""}`}
          >
            Giám sát
          </TabsTrigger>
          <TabsTrigger 
            value={MapMode.Uav} 
            className={`tab data-[state=active]:bg-black data-[state=active]:text-white gap-2 text-xs w-32 h-12 ${currentMode === MapMode.Uav ? "tab-active" : ""}`}
          >
            Đường bay
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
    </StompSessionProvider>
  );
}

function SuperviseSubscribing({mode}: {mode:MapMode}) {
  const [routes, setRoutes] = useState<{[key: string]: string;}>({});
  const [lines, setLines] = useState<Array<RouteRaw>>([]);
  const [uavs, setUavs] = useState<{ [key: string]: UavData }>({});
  const [uavLines, setUavLines] = useState<{ [key: string]: Array<UavData> }>({});

  useSubscription("/topic/public", (message) => {
    const messageData: SuperviseRawData = JSON.parse(message.body);

    const docuav = messageData.docId+"/"+messageData.uav;
    const currentData: UavData = {
      time: new Date().getTime() + timeDisplay,
      locationName: messageData.locationName,
      coordinates: [
        messageData.latitude,
        messageData.longitude,
        messageData.altitude,
      ],
      warning: messageData.warning,
    };

    // list UAV
    setUavs({
      ...uavs,
      [docuav]: currentData,
    });
  });

  // ========================
  // set routes
  useEffect(() => {
    fetchRoutes()
      .then((response) => setRoutes(response))
      .catch((e: Error) => {
        if(e.message) toast.error(e.message);
      });
  }, []);

  // set lines
  useEffect(() => {
    Object.keys(routes).map((routeId) => {
      fetchLines(routeId)
        .then((response) => setLines((lines) => [...lines, ...response]))
        .catch((e: Error) => {
          if(e.message) toast.error(e.message);
        });
    })
  }, [routes]);

  useEffect(() => {
    if(mode === MapMode.Supervise && Object.keys(uavs).length > 0) {
      const interval = setInterval(() => {
        let arrUav: any = {};
        Object.keys(uavs).map((key) => {
          if(new Date().getTime() <= (uavs[key]?.time || 0))
            arrUav[key] = uavs[key];
        });
          
        setUavs(arrUav);
      }, timeDisplay);
      return () => clearInterval(interval);
    }
  }, [uavs, mode])

  return (
    <div className="relative flex size-full">
      {mode === MapMode.Supervise && (
        <ModeSupervise 
          routes={routes}
          lines={lines}
          uavs={uavs}
        />
      )}

      {mode === MapMode.Uav && (
        <ModeUav
          routes={routes}
          lines={lines}
          uavs={uavs}
          setUavs={setUavs}
        />
      )}
    </div>
  );
}