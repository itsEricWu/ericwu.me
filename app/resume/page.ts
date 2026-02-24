import { redirect } from "next/navigation";

const Page = async () => {
  redirect("/");

  return null;
};

export default Page;
