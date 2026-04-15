"use client";

import Link from "next/link";
import { Button, Card, CardBody, CardFooter } from "@heroui/react";
import { RxCross2 } from "react-icons/rx";
import Image from "next/image";

import { Blog } from "@/types/blog";

interface BlogListProps {
  blogPosts: (Blog & { imageUrl: string | undefined })[];
}

export function BlogList({ blogPosts }: BlogListProps) {
  return (
    <div className="px-4 pb-10">
      <div className="flex flex-col items-center mb-4 gap-2">
        <Link href="/" prefetch={true}>
          <Button
            isIconOnly
            aria-label="Back to home"
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
        {blogPosts.map(({ id, title, imageUrl, createdAt }) => (
          <Link key={id} href={`/blog/${id}`}>
            <Card className="dark:bg-darkBg dark:border-2 dark:border-knight rounded-[2rem]">
              {imageUrl && (
                <CardBody className="p-0">
                  <Image
                    alt={title}
                    className="w-full rounded-b-none object-cover h-[200px]"
                    height={200}
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    src={imageUrl}
                    width={400}
                  />
                </CardBody>
              )}
              <CardFooter className="flex justify-between">
                <h2 className="font-[500] text-lg">{title}</h2>
                {createdAt && (
                  <time className="text-sm" dateTime={createdAt.toISOString()}>
                    {createdAt.toDateString()}
                  </time>
                )}
              </CardFooter>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
