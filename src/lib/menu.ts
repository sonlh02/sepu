// load package
import { getCookie } from "cookies-next";

export default function menubar(key: string): boolean | null {
  const menu: Array<string> = getCookie("menu")?.split(",") || [];
  return (menu.length == 1 && menu[0] == "FULL") || menu.includes(`powl-${key}`) || false;
}
