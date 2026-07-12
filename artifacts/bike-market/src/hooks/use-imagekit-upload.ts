import { useState } from "react";

interface ImageKitAuthResponse {
  token: string;
  expire: number;
  signature: string;
  publicKey: string;
  urlEndpoint: string;
}

interface UploadResult {
  url: string;
  fileId: string;
  name: string;
}

export function useImageKitUpload() {
  const [isUploading, setIsUploading] = useState(false);

  async function getAuth(): Promise<ImageKitAuthResponse> {
    const res = await fetch("/api/imagekit/auth");
    if (!res.ok) throw new Error("Failed to get ImageKit auth token");
    return res.json();
  }

  async function uploadFile(file: File, folder = "/motorsby"): Promise<UploadResult> {
    const auth = await getAuth();

    const formData = new FormData();
    formData.append("file", file);
    formData.append("fileName", `${Date.now()}-${file.name}`);
    formData.append("publicKey", auth.publicKey);
    formData.append("signature", auth.signature);
    formData.append("expire", String(auth.expire));
    formData.append("token", auth.token);
    formData.append("folder", folder);
    formData.append("useUniqueFileName", "true");

    const res = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`ImageKit upload failed: ${err}`);
    }

    const data = await res.json();
    return {
      url: data.url,
      fileId: data.fileId,
      name: data.name,
    };
  }

  async function uploadFiles(files: File[], folder?: string): Promise<string[]> {
    setIsUploading(true);
    const urls: string[] = [];
    try {
      for (const file of files) {
        const result = await uploadFile(file, folder);
        urls.push(result.url);
      }
    } finally {
      setIsUploading(false);
    }
    return urls;
  }

  async function uploadSingle(file: File, folder?: string): Promise<string> {
    setIsUploading(true);
    try {
      const result = await uploadFile(file, folder);
      return result.url;
    } finally {
      setIsUploading(false);
    }
  }

  return { uploadFiles, uploadSingle, isUploading };
}
