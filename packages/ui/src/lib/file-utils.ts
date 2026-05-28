export function dataURLtoFile(dataurl: string, filename: string) {
  const arr = dataurl.split(",");
  const mimeMatch = arr[0]?.match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : "";
  const bstr = atob(arr[1] || "");
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime || "image/png" });
}

export function readImageAsBase64(file: File): Promise<{ src: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ src: reader.result as string });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export interface ValidateFilesOptions {
  acceptMimes?: string[];
  maxSize?: number; // in bytes
  t?: (key: string) => string;
  toast?: any;
  onError?: (error: any) => void;
}

export function validateFiles(
  files: FileList | File[],
  options: ValidateFilesOptions
): File[] {
  const { acceptMimes, maxSize, toast, t, onError } = options;
  const validFiles: File[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (!file) continue;
    
    // Check mime type
    if (acceptMimes && acceptMimes.length > 0) {
      const isValidMime = acceptMimes.some(mime => {
        if (!file.type) return false;
        if (mime.endsWith('/*')) {
          const type = mime.split('/')[0];
          return file.type.startsWith(`${type}/`);
        }
        return file.type === mime;
      });
      
      if (!isValidMime) {
        const errorMsg = t ? t("editor.upload.invalidMime") : "Invalid file type";
        if (onError) onError(errorMsg);
        else if (toast) toast(errorMsg);
        continue;
      }
    }

    // Check file size
    if (maxSize && file.size > maxSize) {
      const errorMsg = t ? t("editor.upload.tooLarge") : "File is too large";
      if (onError) onError(errorMsg);
      else if (toast) toast(errorMsg);
      continue;
    }

    validFiles.push(file as File);
  }

  return validFiles;
}
