import { ref, getDownloadURL, listAll } from "firebase/storage";

import { storage } from "../firebase";

export async function getPhotoUrl(filePath: string): Promise<string> {
  const storageRef = ref(storage, filePath);

  try {
    const url = await getDownloadURL(storageRef);
    return url;
  } catch (error) {
    console.error("Error fetching photo URL:", error);
    throw error;
  }
}

export async function listPhotos(folderPath: string): Promise<string[]> {
  const folderRef = ref(storage, folderPath);

  try {
    const res = await listAll(folderRef);
    const urlPromises = res.items.map((itemRef) => getDownloadURL(itemRef));
    const urls = await Promise.all(urlPromises);

    return urls;
  } catch (error) {
    console.error("Error listing photos:", error);
    throw error;
  }
}
