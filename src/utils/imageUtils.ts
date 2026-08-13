/**
 * Helper to convert Google Drive share links into direct image CDN URLs.
 * Handles:
 * - https://drive.google.com/file/d/FILE_ID/view?usp=sharing
 * - https://drive.google.com/open?id=FILE_ID
 * - https://drive.google.com/uc?id=FILE_ID
 */
export function getDirectImageUrl(url?: string | null): string {
  if (!url || typeof url !== 'string') return '';
  const cleanUrl = url.trim();

  if (cleanUrl.includes('drive.google.com')) {
    const fileIdMatch =
      cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
      cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);

    if (fileIdMatch && fileIdMatch[1]) {
      const fileId = fileIdMatch[1];
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  return cleanUrl;
}

/**
 * Extracts Google Drive file ID if present.
 */
export function getGoogleDriveFileId(url?: string | null): string | null {
  if (!url || typeof url !== 'string') return null;
  const cleanUrl = url.trim();
  const fileIdMatch =
    cleanUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) ||
    cleanUrl.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/) ||
    cleanUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  return fileIdMatch?.[1] || null;
}
