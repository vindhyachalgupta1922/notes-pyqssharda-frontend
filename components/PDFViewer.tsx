"use client";

import { useState, useEffect, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { getViewableUrl, getDownloadUrl } from "@/lib/utils/fileUtils";

// Set up PDF.js worker using local file from public directory
if (typeof window !== "undefined") {
  pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

interface PDFViewerProps {
  fileUrl: string;
  fileName?: string;
}

export default function PDFViewer({
  fileUrl,
  fileName = "Document",
}: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [scale, setScale] = useState(1.5);

  useEffect(() => {
    loadPDF();
  }, [fileUrl]);

  useEffect(() => {
    if (pdfDoc && pageNum) {
      renderPage(pageNum);
    }
  }, [pdfDoc, pageNum, scale]);

  const loadPDF = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fix legacy PDFs: getViewableUrl() converts /image/upload/ PDFs to /raw/upload/
      const pdfUrl = getViewableUrl(fileUrl);

      const loadingTask = pdfjsLib.getDocument({
        url: pdfUrl,
        withCredentials: false,
        isEvalSupported: false,
        httpHeaders: {
          Accept: "application/pdf",
        },
      });

      const pdf = await loadingTask.promise;

      setPdfDoc(pdf);
      setNumPages(pdf.numPages);
      setLoading(false);
    } catch (err) {
      console.error("Error loading PDF:", err);
      setError(
        "Failed to load PDF. The file may be corrupted or inaccessible.",
      );
      setLoading(false);
    }
  };

  const renderPage = async (num: number) => {
    if (!pdfDoc || !canvasRef.current) return;

    try {
      const page = await pdfDoc.getPage(num);
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      if (!context) return;

      const viewport = page.getViewport({ scale });
      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };

      await page.render(renderContext).promise;
    } catch (err) {
      console.error("Error rendering page:", err);
    }
  };

  const goToPrevPage = () => {
    if (pageNum > 1) {
      setPageNum(pageNum - 1);
    }
  };

  const goToNextPage = () => {
    if (pageNum < numPages) {
      setPageNum(pageNum + 1);
    }
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[600px] bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-sm text-gray-600">Loading PDF...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[600px] bg-gray-50">
        <svg
          className="h-16 w-16 text-gray-400 mb-4"
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
          Failed to Load PDF
        </h3>
        <p className="text-sm text-gray-600 mb-4">{error}</p>
        <div className="flex gap-3">
          <a
            href={getDownloadUrl(fileUrl, fileName)}
            download
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Download PDF
          </a>
          <a
            href={getViewableUrl(fileUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Open in New Tab
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-800 text-white">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevPage}
            disabled={pageNum <= 1}
            className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ←
          </button>
          <span className="text-sm">
            Page {pageNum} of {numPages}
          </span>
          <button
            onClick={goToNextPage}
            disabled={pageNum >= numPages}
            className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            →
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={zoomOut}
            className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
            title="Zoom Out"
          >
            −
          </button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <button
            onClick={zoomIn}
            className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600"
            title="Zoom In"
          >
            +
          </button>
        </div>

        <a
          href={getDownloadUrl(fileUrl, fileName)}
          download
          className="px-3 py-1 bg-blue-600 rounded hover:bg-blue-700 text-sm"
        >
          Download
        </a>
      </div>

      {/* PDF Canvas */}
      <div className="flex-1 overflow-auto bg-gray-200 p-4">
        <div className="flex justify-center">
          <canvas ref={canvasRef} className="shadow-lg bg-white" />
        </div>
      </div>
    </div>
  );
}
