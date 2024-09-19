// load package
import {
  Polyline,
  TileLayer,
  Popup,
  useMap,
} from "react-leaflet";
import L, { LatLngExpression } from "leaflet";
// load data, content from app
import { RouteRaw } from "./map_data";

export default function Map({
  lines,
	focus,
	zoom
}: {
  lines: Array<RouteRaw>;
	focus?: any;
	zoom: number;
}) {
	// focus point
	function SetViewFocus({ focus, zoom }: { focus: any; zoom: number }) {
    const map = useMap();
    if(focus[0] && focus[1] && zoom)
      map.setView(focus, zoom, { animate: true });
    return null;
  }

	return (
		<>
			<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

    	{/* Draw power line */}
    	{Object.values(lines).map((data, index) => (
    		<Polyline 
    			key={index} 
    			pathOptions={{ color: "#447597" }} 
    			positions={data.line} 
        >
    			<Popup>{`${data.name} (${data.code} - ${data.num_power} cột)`}</Popup>
    		</Polyline>
    	))}

			{focus &&
				<SetViewFocus 
					focus={focus} 
					zoom={zoom} 
				/>}
		</>
	);
}

	