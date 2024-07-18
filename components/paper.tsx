import { Link } from "@nextui-org/react";
import { GoArrowUpRight } from "react-icons/go";
import Image from "next/image";
interface PaperProps {
  paperUrl: string;
}

const Paper = ({ paperUrl }: PaperProps) => {
  return (
    <div className="relative bg-cardYellow w-full h-full group dark:bg-darkBg">
      <div className="absolute -top-40 left-40 bg-cardPink w-[135%] h-full rounded-full dark:hidden" />
      <div className="absolute top-16 md:top-1/2 -translate-y-1/2 left-12 md:left-16 rounded-2xl -rotate-[30deg] w-full">
        <Image
          alt="Paper"
          className="h-full w-full rounded-2xl object-contain"
          height={1280}
          src={paperUrl}
          width={1577}
        />
      </div>
      <button className="absolute bg-white dark:bg-darkBg bottom-2 left-2 transition-all w-10 h-10 md:w-[2.75rem] md:h-[2.75rem] duration-500 ease-in-out group-hover:w-40 p-2 rounded-full hover:bg-default-100 dark:border-2 dark:border-knight">
        <div className="flex justify-center items-center">
          <Link
            isExternal
            color="foreground"
            href="https://ojs.aaai.org/index.php/AAAI/article/view/29266"
          >
            <span className="text-sm md:text-medium text-nowrap hidden group-hover:block invisible group-hover:visible mr-1 animate-fade">
              DT-VAEGAN
            </span>
            <GoArrowUpRight />
          </Link>
        </div>
      </button>
    </div>
  );
};

export default Paper;
