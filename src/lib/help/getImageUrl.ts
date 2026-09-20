interface FlashImageData {
  image_url?: string | null;
}

export function getImageUrl(flash: FlashImageData): string {
  return flash.image_url ?? "";
}
