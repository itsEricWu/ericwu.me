import Fuse from "fuse.js";

import { Emoji } from "../types/emoji";

import { emojis } from "./emojis";

const options = {
  includeScore: true,
  keys: ["name"],
};

const fuse = new Fuse(emojis, options);

export const fuzzySearch = (query: string): Emoji | null => {
  const result = fuse.search(query);

  if (result.length === 0) {
    return null;
  }

  return result[0].item;
};
