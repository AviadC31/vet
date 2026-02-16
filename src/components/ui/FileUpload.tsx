
"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isProcessing?: boolean;
}

export function FileUpload({ onFileSelect, isProcessing = false }: FileUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragActive(false);
      const file = e.dataTransfer.files?.[0];
      if (file && file.name.endsWith(".docx")) {
        // 50MB limit
        if (file.size > 50 * 1024 * 1024) {
          alert("הקובץ גדול מדי. הגודל המקסימלי הוא 50MB.");
          return;
        }
        setSelectedFile(file);
        onFileSelect(file);
      } else {
        alert("אנא העלה קובץ .docx תקין.");
      }
    },
    [onFileSelect]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (!file.name.endsWith(".docx")) {
            alert("אנא העלה קובץ .docx תקין.");
            return;
        }
        if (file.size > 50 * 1024 * 1024) {
            alert("הקובץ גדול מדי. הגודל המקסימלי הוא 50MB.");
            return;
        }
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const removeFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  return (
    <div className="w-full max-w-xl mx-auto">
      <div
        className={cn(
          "relative border-2 border-dashed rounded-xl p-8 transition-colors duration-200 ease-in-out cursor-pointer",
          isDragActive
            ? "border-blue-500 bg-blue-50/50"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50",
          isProcessing && "opacity-50 pointer-events-none"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".docx"
          onChange={handleFileChange}
          disabled={isProcessing}
        />

        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          {isProcessing ? (
            <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
          ) : selectedFile ? (
            <div className="flex items-center space-x-3 bg-white p-4 rounded-lg shadow-sm border border-gray-100 z-10 w-full max-w-sm">
              <FileText className="w-8 h-8 text-blue-500 flex-shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  removeFile();
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          ) : (
            <>
              <div className="p-4 bg-blue-50 rounded-full">
                <Upload className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-900">
                  גרור לכאן קובץ Word
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  או לחץ לבחירה מהמחשב
                </p>
              </div>
              <p className="text-xs text-gray-400">
                תומך בקבצי .docx עד 50MB
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
