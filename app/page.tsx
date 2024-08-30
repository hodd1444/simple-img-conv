"use client";

import { useState, useRef, useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  Camera,
  Download,
  Image as ImageIcon,
  Github,
  Twitter,
  Linkedin,
} from "lucide-react";

export default function Page() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null);
  const [convertedImage, setConvertedImage] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<string>("png");
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [lastConvertedFile, setLastConvertedFile] = useState<string | null>(
    null
  );
  const [lastConvertedFormat, setLastConvertedFormat] = useState<string | null>(
    null
  );
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      setConvertedImage(null);
      setLastConvertedFile(null);

      // Create thumbnail
      const reader = new FileReader();
      reader.onload = (e) => setThumbnailUrl(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFormatChange = (value: string) => {
    setOutputFormat(value);
    if (lastConvertedFormat !== value) {
      setConvertedImage(null);
      setLastConvertedFile(null);
      setLastConvertedFormat(null);
    }
  };

  const convertImage = () => {
    if (!selectedFile) return;

    setIsConverting(true);
    setProgress(0);

    const img = new Image();
    img.onload = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);

          // Simulate conversion progress
          let currentProgress = 0;
          const progressInterval = setInterval(() => {
            currentProgress += 10;
            setProgress(currentProgress);
            if (currentProgress >= 100) {
              clearInterval(progressInterval);
              const dataUrl = canvas.toDataURL(`image/${outputFormat}`);
              setConvertedImage(dataUrl);
              setIsConverting(false);
              setLastConvertedFile(selectedFile.name);
              setLastConvertedFormat(outputFormat);
            }
          }, 200);
        }
      }
    };
    img.src = URL.createObjectURL(selectedFile);
  };

  useEffect(() => {
    return () => {
      if (thumbnailUrl) {
        URL.revokeObjectURL(thumbnailUrl);
      }
    };
  }, [thumbnailUrl]);

  const showConvertButton =
    selectedFile &&
    (!convertedImage ||
      selectedFile.name !== lastConvertedFile ||
      outputFormat !== lastConvertedFormat);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 flex flex-col">
      <main className="flex-grow flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6">
            <h1 className="text-3xl font-bold text-white flex items-center justify-center">
              <Camera className="mr-3 h-8 w-8" /> Simple Image Converter
            </h1>
          </div>
          <div className="p-6 space-y-6">
            <div className="space-y-2">
              <Label htmlFor="image-upload" className="text-gray-300">
                Select an image
              </Label>
              <div className="flex items-center space-x-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="w-full bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600 transition-colors duration-200"
                >
                  <ImageIcon className="mr-2 h-4 w-4" /> Choose File
                </Button>
                <Input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                  ref={fileInputRef}
                />
              </div>
              {selectedFile && (
                <div className="flex items-center space-x-2 mt-2">
                  {thumbnailUrl && (
                    <img
                      src={thumbnailUrl}
                      alt="Thumbnail"
                      className="w-12 h-12 object-cover rounded"
                    />
                  )}
                  <p className="text-sm text-gray-400 truncate flex-1">
                    {selectedFile.name}
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="format-select" className="text-gray-300">
                Select output format
              </Label>
              <Select onValueChange={handleFormatChange}>
                <SelectTrigger
                  id="format-select"
                  className="bg-gray-700 border-gray-600 text-gray-100"
                >
                  <SelectValue placeholder="Select format" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600 text-gray-100">
                  <SelectItem value="png">PNG</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="webp">WebP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isConverting ? (
              <div className="space-y-2">
                <Progress value={progress} className="w-full" />
                <p className="text-center text-sm text-gray-400">
                  Converting... {progress}%
                </p>
              </div>
            ) : showConvertButton ? (
              <Button
                onClick={convertImage}
                disabled={!selectedFile}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition-colors duration-200"
              >
                Convert Image
              </Button>
            ) : convertedImage ? (
              <a
                href={convertedImage}
                download={`${selectedFile?.name.split(".")[0]}.${outputFormat}`}
                className="inline-block w-full"
              >
                <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white transition-colors duration-200">
                  <Download className="mr-2 h-4 w-4" /> Download Converted Image
                </Button>
              </a>
            ) : null}

            <canvas ref={canvasRef} style={{ display: "none" }} />
          </div>
        </div>
      </main>
      <footer className="bg-gray-800 text-gray-300 py-4">
        <div className="container mx-auto px-4 flex justify-center items-center space-x-4">
          <a
            href="https://github.com/hodd1444/simple-img-conv"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-amber-500 transition-colors duration-200"
          >
            <Github className="h-6 w-6" />
            <span className="sr-only">GitHub</span>
          </a>
        </div>
      </footer>
    </div>
  );
}
