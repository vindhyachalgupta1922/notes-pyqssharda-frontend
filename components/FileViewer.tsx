"use client";

import { useState, useEffect } from "react";
import {
  detectFileType,
  getFileTypeLabel,
  getViewableUrl,
  getDownloadUrl,
  type FileType,
} from "@/lib/utils/fileUtils";
import PDFViewer from "./PDFViewer";

interface FileViewerProps {
  fileUrl: string;
  fileName?: string;
  className?: string;
  onClose?: () => void;
}

/**
 * Professional in-app file viewer component supporting multiple file types
 * - PDF: iframe-based viewer
 * - Images: responsive in-app display
 * - DOC/DOCX: Google Docs Viewer iframe
 * - PPT/PPTX: Google Docs Viewer iframe
 */
export default function FileViewer({
  fileUrl,
  fileName = "File",
  className = "",
  onClose,
}: FileViewerProps) {
  const [fileType, setFileType] = useState<FileType>("unknown");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileUrl) {
      setError("No file URL provided");
      setLoading(false);
      return;
    }

    const detectedType = detectFileType(fileUrl);
    setFileType(detectedType);

    if (detectedType === "unknown") {
      setError("Unsupported file type");
    }

    setLoading(false);
  }, [fileUrl]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setError("Failed to load file. Please try opening it in a new tab.");
    setLoading(false);
  };

  const renderViewer = () => {
    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-gray-50 rounded-lg">
          <div className="text-center p-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Unable to Display File
            </h3>
            <p className="text-sm text-gray-600 mb-4">{error}</p>
            <div className="flex gap-3">
              <a
                href={getDownloadUrl(fileUrl, fileName)}
                download
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Download File
              </a>
              <a
                href={getViewableUrl(fileUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Open in New Tab
              </a>
            </div>
          </div>
        </div>
      );
    }

    switch (fileType) {
      case "pdf":
        // Fix legacy PDFs stored at /image/upload/ by converting to /raw/upload/
        const pdfUrl = getViewableUrl(fileUrl);

        return (
          <div className="relative w-full h-full min-h-[600px]">
            <PDFViewer fileUrl={pdfUrl} fileName={fileName} />
          </div>
        );

      case "image":
        return (
          <div className="relative w-full bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center p-4">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-sm text-gray-600">Loading image...</p>
                </div>
              </div>
            )}
            <img
              src={fileUrl}
              alt={fileName}
              className="max-w-full max-h-[800px] object-contain rounded shadow-lg"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          </div>
        );

      case "doc":
      case "ppt":
        const googleViewerUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(
          fileUrl,
        )}&embedded=true`;
        return (
          <div className="relative w-full h-full min-h-[600px] bg-gray-100 rounded-lg overflow-hidden">
            {loading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-sm text-gray-600">
                    Loading {getFileTypeLabel(fileType)}...
                  </p>
                </div>
              </div>
            )}
            <iframe
              src={googleViewerUrl}
              title={fileName}
              className="w-full h-full min-h-[600px] border-0"
              onLoad={handleIframeLoad}
              onError={handleIframeError}
              sandbox="allow-scripts allow-same-origin"
            />
          </div>
        );

      default:
        return (
          <div className="flex flex-col items-center justify-center h-full min-h-[400px] bg-gray-50 rounded-lg">
            <div className="text-center p-8">
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unsupported File Type
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                This file type cannot be previewed in the browser.
              </p>
              <a
                href={getDownloadUrl(fileUrl, fileName)}
                download
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Download File
              </a>
            </div>
          </div>
        );
    }
  };

  return (
    <div className={`file-viewer w-full ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-900 truncate">
            {fileName}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {getFileTypeLabel(fileType)}
          </p>
        </div>
        <div className="flex items-center gap-2 ml-4">
          <a
            href={getDownloadUrl(fileUrl, fileName)}
            download
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            title="Download file"
          >
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            Download
          </a>
          <a
            href={getViewableUrl(fileUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            title="Open in new tab"
          >
            <svg
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            Open
          </a>
          {onClose && (
            <button
              onClick={onClose}
              className="inline-flex items-center p-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              title="Close viewer"
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Viewer Content */}
      <div className="viewer-content">{renderViewer()}</div>
    </div>
  );
}
