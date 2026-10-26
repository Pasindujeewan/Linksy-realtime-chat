const MAX_AVATAR_DATA_URL_LENGTH = 64 * 1024;

/** Shrink a chosen photo so the current URL-based registration API can store it as an avatar. */
export async function imageFileToDataUrl(file: File): Promise<string> {
  const sourceUrl = URL.createObjectURL(file);

  try {
    const image = new Image();
    image.src = sourceUrl;
    await image.decode();

    const canvas = document.createElement("canvas");
    const scale = Math.min(1, 256 / Math.max(image.naturalWidth, image.naturalHeight));
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Your browser could not process this image.");

    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    let quality = 0.82;
    let dataUrl = canvas.toDataURL("image/webp", quality);

    while (dataUrl.length > MAX_AVATAR_DATA_URL_LENGTH && quality > 0.3) {
      quality -= 0.1;
      dataUrl = canvas.toDataURL("image/webp", quality);
    }

    if (dataUrl.length > MAX_AVATAR_DATA_URL_LENGTH) {
      throw new Error("This image could not be compressed enough. Choose a smaller image.");
    }
    return dataUrl;
  } finally {
    URL.revokeObjectURL(sourceUrl);
  }
}
