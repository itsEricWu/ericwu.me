import Link from "next/link";
import { Button, Card, CardBody, CardFooter } from "@nextui-org/react";
import { RxCross2 } from "react-icons/rx";
import Image from "next/image";

import { customMapImageUrl, getAllBlogPosts } from "@/lib/notion";
import { notionBlogConfig } from "@/config/site";

export const revalidate = 0;

const Page = async () => {
  const blogPosts = await getAllBlogPosts(notionBlogConfig.blogParentId);

  return (
    <div className="px-4 pb-10">
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
        {blogPosts.map(({ id, title, block, pageCover, createdAt }) => (
          <Link key={id} href={`/blog/${id}`}>
            <Card className="dark:bg-darkBg dark:border-2 dark:border-knight rounded-[2rem]">
              <CardBody className="p-0">
                <Image
                  alt="cover"
                  className="rounded-b-none object-cover h-[200px]"
                  height={500}
                  src={customMapImageUrl(pageCover, block)}
                  width={500}
                />
              </CardBody>
              <CardFooter className="flex justify-between">
                <h3 className="font-[500] text-lg">{title}</h3>
                <h3 className="text-sm">{createdAt}</h3>
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Page;
