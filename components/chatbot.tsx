import { Image, Link } from "@nextui-org/react";
import { GoArrowUpRight } from "react-icons/go";

interface ChatbotProps {
  chatbotUrl: string;
}

const Chatbot = ({ chatbotUrl }: ChatbotProps) => {
  return (
    <div className="relative bg-cardYellow w-full h-full group dark:bg-darkBg">
      <div className="absolute -top-40 left-40 bg-cardPink w-[135%] h-full rounded-full dark:hidden" />

      <div className="absolute top-1/2 -translate-y-1/2 left-20 md:left-44 rounded-2xl transform -rotate-[30deg] md:w-[800px] w-[400px]">
        <Image
          alt="Chatbot"
          className="h-48 md:h-96 object-cover rounded-2xl"
          src={chatbotUrl}
        />
      </div>
      <button className="absolute bg-white dark:bg-darkBg bottom-2 left-2 transition-all w-10 h-10 md:w-[2.75rem] md:h-[2.75rem] duration-500 ease-in-out group-hover:w-40 p-2 rounded-full hover:bg-default-100 dark:border-2 dark:border-knight">
        <div className="flex justify-center items-center">
          <Link isExternal color="foreground" href="https://beta.simplegen.ai/">
            <span className="text-sm md:text-medium text-nowrap hidden group-hover:block invisible group-hover:visible mr-1 animate-fade">
              AI Chatbot
            </span>
            <GoArrowUpRight />
          </Link>
        </div>
      </button>
    </div>
  );
};

export default Chatbot;
