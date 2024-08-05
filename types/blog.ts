import { Block } from "notion-types";

export type Blog = {
  id: string;
  title: string;
  block: Block;
  pageCover: string;
  createdAt: Date;
};
