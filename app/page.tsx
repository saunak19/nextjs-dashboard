"use client";
import { useState } from "react";
import Image from "next/image";

export default function Home() {
  const [progress, setProgress] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const handleVideoSuccess = (res: any) => {
    console.log("Video upload successful!", res);
    setVideoUrl(res.url);
    setProgress(0);
  };
  const handleVideoProgress = (percent: number) => {
    setProgress(percent);
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      {/* <div className="p-8 max-w-lg mx-auto">
        <h2 className="text-2xl font-semibold mb-4">Upload New Video</h2>
        <label className="block mb-2 text-sm font-medium text-gray-300">
          Select Video File
        </label>
        <FileUpload
          onSuccess={handleVideoSuccess}
          onProgress={handleVideoProgress}
          fileType="video"
        />

        {progress > 0 && progress < 100 && (
          <div className="w-full bg-gray-700 rounded-full h-2.5 mt-4">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${progress}%` }}
            ></div>
            <span className="text-sm text-gray-300">{progress}%</span>
          </div>
        )}


        {videoUrl && (
          <div className="mt-6">
            <p className="font-semibold text-gray-100">Upload Complete!</p>
            <video width="100%" height="auto" controls className="mt-2 rounded-md">
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        )}
      </div> */}
    </div>
  );
}
