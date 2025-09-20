import axios from "axios";

import { toast } from "sonner";

export const downloadBlob = async (blob: Blob | string, fileName: string) => {
  let file: Blob;

  if (typeof blob === "string") {
    const response = await axios.get<Blob>(blob, { responseType: "blob" });

    file = response.data;
  } else {
    file = blob;
  }

  const url = URL.createObjectURL(file);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  toast.success("Download got started!");

  URL.revokeObjectURL(url);
};
