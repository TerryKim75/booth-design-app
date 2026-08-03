/**
 * 관리자 업로드 시 원본 이미지를 브라우저에서 먼저 축소·압축한다.
 * Vercel 서버리스 함수는 next.config.ts의 bodySizeLimit과 별개로 요청 본문 크기에
 * 자체적인 플랫폼 한도(약 4.5MB)를 두기 때문에, 고해상도 원본(특히 PNG)을 그대로 서버
 * 액션으로 보내면 그 한도에 걸려 실패한다. 서버로 보내기 전에 클라이언트에서 미리
 * 웹에 적합한 크기로 줄여 전송량 자체를 안전한 범위로 낮춘다.
 */
export async function compressImageForUpload(
  file: File,
  { maxDimension = 1920, quality = 0.85 }: { maxDimension?: number; quality?: number } = {}
): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/svg+xml") return file;

  const bitmap = await createImageBitmap(file).catch(() => null);
  if (!bitmap) return file;

  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
  if (!blob) return file;

  // 압축 결과가 원본보다 더 크면(이미 작은 이미지였던 경우) 원본을 그대로 사용한다.
  if (blob.size >= file.size) return file;

  const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}
