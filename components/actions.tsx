import { Link } from "@heroui/react";
import { GoArrowUpRight } from "react-icons/go";
import Image from "next/image";

interface ActionsProps {
  photoUrl: string;
}

const Actions = ({ photoUrl }: ActionsProps) => {
  return (
    <div className="relative bg-cardBlue w-full h-full group dark:bg-darkBg">
      <div className="absolute -bottom-32 md:-bottom-52 left-1/2 -translate-x-1/2 bg-cardPink w-64 h-56 md:w-96 md:h-96 rounded-full dark:hidden" />
      <div className="absolute top-16 md:top-36 -translate-y-1/2 left-20 md:left-44 transform -rotate-[30deg] rounded-2xl w-[80%]">
        <Image
          alt="SecondSelf - AI Agent Social Network"
          className="w-full h-full rounded-2xl object-contain"
          height={1280}
          quality={60}
          sizes="(max-width: 768px) 300px, 500px"
          src={photoUrl}
          width={2259}
        />
      </div>
      <Link
        isExternal
        color="foreground"
        href="https://secondself.us/"
        className="no-drag absolute bg-white dark:bg-darkBg bottom-2 left-2 transition-all w-10 h-10 md:w-[2.75rem] md:h-[2.75rem] duration-500 ease-in-out group-hover:w-40 p-2 rounded-full hover:bg-default-100 border-2 border-transparent dark:border-knight flex justify-center items-center"
      >
        <span className="text-sm md:text-medium text-nowrap hidden group-hover:block invisible group-hover:visible mr-1 animate-fade">
          SecondSelf
        </span>
        <GoArrowUpRight />
      </Link>
    </div>
  );
};

export default Actions;
