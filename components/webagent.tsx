import { Link } from "@nextui-org/react";
import { GoArrowUpRight } from "react-icons/go";
import Image from "next/image";
interface WebAgentProps {
  webAgentUrl: string;
}

const WebAgent = ({ webAgentUrl }: WebAgentProps) => {
  return (
    <div className="relative bg-cardGreen w-full h-full group dark:bg-darkBg">
      <div className="absolute -bottom-96 left-16 bg-cardPink w-[145%] h-full rounded-full dark:hidden" />

      <div className="absolute top-1/2 -translate-y-1/2 left-24 md:left-32 transform -rotate-[30deg] rounded-2xl w-[80%]">
        <Image
          alt="Web Agent"
          className="w-full h-full object-contain rounded-2xl"
          height={2380}
          src={webAgentUrl}
          width={1164}
        />
      </div>
      <button className="absolute bg-white dark:bg-darkBg bottom-2 left-2 transition-all w-10 h-10 md:w-[2.75rem] md:h-[2.75rem] duration-500 ease-in-out group-hover:w-40 p-2 rounded-full hover:bg-default-100 dark:border-2 dark:border-knight">
        <div className="flex justify-center items-center">
          <Link isExternal color="foreground" href="https://www.simplegen.ai/">
            <span className="text-sm md:text-medium text-nowrap hidden group-hover:block invisible group-hover:visible mr-1 animate-fade">
              Web Agent
            </span>
          </Link>

          <GoArrowUpRight />
        </div>
      </button>
    </div>
  );
};

export default WebAgent;
