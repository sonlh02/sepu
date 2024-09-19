// load config
import { InspectType } from "@/enum/inspect_type";
// load data, content from app
import NewDocForm from "../NewDocForm";

export default function NewDocDay() {
  return <NewDocForm inspectType={InspectType.Day} />;
}
