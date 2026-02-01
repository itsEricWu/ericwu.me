import { ref, getDownloadURL, listAll } from "firebase/storage";

import { storage } from "../firebase";

// Cache for URL storage
const urlCache = new Map<string, { url: string; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function getPhotoUrl(filePath: string): Promise<string> {
  // Check cache first
  const cached = urlCache.get(filePath);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return cached.url;
  }

  const storageRef = ref(storage, filePath);

  try {
    const url = await getDownloadURL(storageRef);

    // Store in cache
    urlCache.set(filePath, { url, timestamp: now });

    return url;
  } catch (error) {
    throw error;
  }
}

// Batch fetch URLs
export async function batchGetPhotoUrls(
  filePaths: string[],
): Promise<Record<string, string>> {
  const results: Record<string, string> = {};
  const fetchNeeded: string[] = [];

  // Check cache first
  const now = Date.now();

  filePaths.forEach((path) => {
    const cached = urlCache.get(path);

    if (cached && now - cached.timestamp < CACHE_DURATION) {
      results[path] = cached.url;
    } else {
      fetchNeeded.push(path);
    }
  });

  if (fetchNeeded.length > 0) {
    // Fetch all needed URLs in parallel
    const promises = fetchNeeded.map(async (path) => {
      const url = await getPhotoUrl(path);

      results[path] = url;
    });

    await Promise.all(promises);
  }

  return results;
}

export async function listPhotos(folderPath: string): Promise<string[]> {
  const cacheKey = `folder_${folderPath}`;
  const cached = urlCache.get(cacheKey);
  const now = Date.now();

  if (cached && now - cached.timestamp < CACHE_DURATION) {
    return JSON.parse(cached.url); // In this case, url contains JSON string of URLs array
  }

  const folderRef = ref(storage, folderPath);

  try {
    const res = await listAll(folderRef);
    const urls = await Promise.all(
      res.items.map((itemRef) => getDownloadURL(itemRef)),
    );

    // Cache the results
    urlCache.set(cacheKey, {
      url: JSON.stringify(urls),
      timestamp: now,
    });

    return urls;
  } catch (error) {
    throw error;
  }
}
