import Link from "next/link";
import { Card, CardBody, Image, CardFooter, Button } from "@nextui-org/react";
import { RxCross2 } from "react-icons/rx";

import { customMapImageUrl, getPageContent } from "@/lib/notion";
import { notionBlogConfig } from "@/config/site";

export const revalidate = 0;

const Page = async () => {
  const { blocks } = await getPageContent(notionBlogConfig.blogParentId);

  return (
    <div className="px-4">
      <div className="flex flex-col items-center mb-4 gap-2">
        <Link href="/">
          <Button
            isIconOnly
            className="dark:border-knight dark:bg-transparent dark:border-2 bg-[#ece7e7] border-0"
            radius="full"
            variant="bordered"
          >
            <RxCross2 />
          </Button>
        </Link>
        <h1 className="text-2xl font-[500]">My Blog</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(blocks).map(([key, value]) => {
          if (key !== notionBlogConfig.blogParentId) {
            return (
              <Link key={key} href={`/blog/${key}`}>
                <Card className="dark:bg-darkBg dark:border-2 dark:border-knight rounded-[2rem]">
                  <CardBody className="p-0">
                    <Image
                      alt="cover"
                      className="rounded-b-none object-cover h-[200px]"
                      src={customMapImageUrl(
                        value.value.format?.page_cover,
                        value.value
                      )}
                      width="100%"
                    />
                  </CardBody>
                  <CardFooter className="flex justify-between">
                    <h3 className="font-[500] text-lg">
                      {value.value.properties?.title[0][0]}
                    </h3>
                    <h3 className="text-sm">
                      {new Date(value.value.created_time).toDateString()}
                    </h3>
                  </CardFooter>
                </Card>
              </Link>
            );
          }
        })}
      </div>
    </div>
  );
};

export default Page;
