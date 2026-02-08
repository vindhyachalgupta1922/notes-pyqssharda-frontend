/**
 * File utility functions for detecting and handling various file types
 */

export type FileType = "pdf" | "image" | "doc" | "ppt" | "unknown";

/**
 * Detects the file type based on the URL or file extension
 * @param url - The file URL (typically from Cloudinary)
 * @returns The detected file type
 */
export function detectFileType(url: string): FileType {
  if (!url) return "unknown";

  const urlLower = url.toLowerCase();

  // Check for common image formats
  if (/\.(jpg|jpeg|png|webp|gif|bmp|svg)(\?|$)/i.test(urlLower)) {
    return "image";
  }

  // Check for PDF
  if (/\.pdf(\?|$)/i.test(urlLower)) {
    return "pdf";
  }

  // Check for DOC/DOCX
  if (/\.(doc|docx)(\?|$)/i.test(urlLower)) {
    return "doc";
  }

  // Check for PPT/PPTX
  if (/\.(ppt|pptx)(\?|$)/i.test(urlLower)) {
    return "ppt";
  }

  return "unknown";
}

/**
 * Gets a human-readable file type label
 * @param fileType - The file type
 * @returns A readable label
 */
export function getFileTypeLabel(fileType: FileType): string {
  const labels: Record<FileType, string> = {
    pdf: "PDF Document",
    image: "Image",
    doc: "Word Document",
    ppt: "PowerPoint Presentation",
    unknown: "File",
  };

  return labels[fileType];
}

/**
 * Checks if a file can be viewed in-app
 * @param url - The file URL
 * @returns true if the file can be viewed in-app
 */
export function canViewInApp(url: string): boolean {
  const fileType = detectFileType(url);
  return fileType !== "unknown";
}

/**
 * Returns the file URL for viewing
 * Fixes incorrectly stored PDFs: converts /image/upload/ back to /raw/upload/
 * PDFs MUST be accessed from /raw/upload/ endpoint to avoid 401 Unauthorized
 * @param url - The Cloudinary file URL
 * @returns URL for viewing (corrected if needed)
 */
export function getViewableUrl(url: string): string {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }

  // Fix: If a PDF is incorrectly stored at /image/upload/, convert it to /raw/upload/
  // This handles legacy PDFs that were uploaded to the wrong endpoint
  if (url.toLowerCase().includes(".pdf") && url.includes("/image/upload/")) {
    return url.replace("/image/upload/", "/raw/upload/");
  }

  // Return URL as-is for everything else
  // Raw files stored at /raw/upload/ work fine
  // Images stored at /image/upload/ work fine
  return url;
}

/**
 * Gets a properly formatted download URL for Cloudinary files
 * Adds fl_attachment flag to force download with proper filename
 * @param url - The Cloudinary file URL
 * @param filename - Optional filename for download
 * @returns Download URL
 */
export function getDownloadUrl(url: string, filename?: string): string {
  if (!url || !url.includes("cloudinary.com")) {
    return url;
  }

  let downloadUrl = url;

  // Convert to raw type and add attachment flag with filename if provided
  if (url.includes("/raw/upload/")) {
    downloadUrl = url.replace("/raw/upload/", "/raw/upload/fl_attachment/");
  } else if (url.includes("/image/upload/")) {
    downloadUrl = url.replace("/image/upload/", "/raw/upload/fl_attachment/");
  } else if (url.includes("/upload/") && !url.includes("fl_attachment")) {
    downloadUrl = url.replace("/upload/", "/upload/fl_attachment/");
  }

  // Add filename if provided
  if (filename) {
    const filenameParam = filename.replace(/\s+/g, "_");
    if (downloadUrl.includes("?")) {
      downloadUrl += `&filename=${encodeURIComponent(filenameParam)}`;
    } else {
      downloadUrl += `?filename=${encodeURIComponent(filenameParam)}`;
    }
  }

  return downloadUrl;
}
