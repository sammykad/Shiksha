/**
 * Create a PNG from a base64 string
 * @param dataURI - The base64 string to create a PNG from
 * @param sliceSize - The size of the slice to create a PNG from
 * @returns A blob or null if the base64 string is invalid with automatic type detection
 */
export const createBlobFromBase64 = (dataURI: string | null | undefined, sliceSize = 512) => {
  if (!dataURI) {
    return null;
  }

  // Split the metadata and the actual base64 string
  const [meta, base64String] = dataURI.split(",");

  if (!meta || !base64String) {
    return null;
  }

  // Optional: extract content type from meta if needed
  const contentType = meta.match(/data:(.*);base64/)?.[1];

  // Decode Base64
  const byteCharacters = atob(base64String);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = Array.from(slice, (c) => c.charCodeAt(0));
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: contentType });
};


export function createBlobUrl({ blob }: { blob: Blob }): string {
  return URL.createObjectURL(blob);
}

export function downloadFile({ url, fileName }: { url: string; fileName: string }) {
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function revokeBlobUrl({ url }: { url: string }) {
  URL.revokeObjectURL(url);
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = createBlobUrl({ blob });
  downloadFile({ url, fileName });
  revokeBlobUrl({ url });
}

export function downloadBase64(dataURI: string | null | undefined, fileName: string) {
  const blob = createBlobFromBase64(dataURI);
  if (!blob) return false;
  downloadBlob(blob, fileName);
  return true;
}
