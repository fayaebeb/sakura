import { Card } from "../ui/card";
import { HoverEffect } from "../ui/card-hover-effect";

export function MainGrid() {
  return (

    <HoverEffect items={projects} />

  );
}
export const projects = [
  {
    hoverClassname: "bg-gradient-to-br from-pink-500 to-pink-50",
    divClassname: "col-span-1 row-span-1 lg:col-span-4 lg:row-span-1 ",
    card: <Card className=" shadow-2xl shadow-rose-200  rounded-2xl h-full w-full  overflow-hidden bg-pink-100 border border-transparent group-hover:border-pink-400 relative z-10 hover:cursor-pointer">
      <img className="h-full w-full" src="/images/sakura-bot-hero.png" alt="" />
    </Card>
  },
  {
    hoverClassname: "bg-gradient-to-bl from-pink-500 to-pink-50",
    divClassname: "col-span-1 row-span-1  lg:col-span-2 lg:row-span-1",
    card: <Card className=" shadow-2xl shadow-rose-200 rounded-2xl h-full w-full overflow-hidden bg-pink-100 border border-transparent  group-hover:border-rose-700 relative z-20 hover:cursor-pointer">
      <img className="" src="/images/sakura-grid-2.png" alt="" />

    </Card>
  },
  {
    divClassname: " col-span-1 row-span-1  lg:col-span-2 lg:row-span-1",
    hoverClassname: "bg-gradient-to-tr from-pink-500 to-pink-50",
    card: <Card className=" shadow-2xl shadow-rose-200   rounded-2xl h-full w-full overflow-hidden bg-pink-100 border border-transparent  group-hover:border-rose-700 relative z-20 hover:cursor-pointer">
      <img className="h-full w-full" src="/images/sakura-grid-6.png" alt="" />

    </Card>
  },
  {
    divClassname: "col-span-1 row-span-1 lg:col-span-4 lg:row-span-1",
    hoverClassname: "bg-gradient-to-tl from-pink-500 to-pink-50",

    card: <Card className=" shadow-2xl shadow-rose-200 rounded-2xl h-full w-full  overflow-hidden bg-pink-100 border border-transparent  group-hover:border-rose-700 relative z-20 hover:cursor-pointer">
      <img className="h-full w-full" src="/images/sakura-grid-3.png" alt="" />

    </Card>
  },


];
