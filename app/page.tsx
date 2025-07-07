"use client";

import { useState, useEffect } from "react";
import { Loader2Icon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [transcribedCount, setTranscribedCount] = useState<number>(0);
  const [showLimitModal, setShowLimitModal] = useState(false);
  const [history, setHistory] = useState<{ id: string; text: string; createdAt: string }[]>([]);

  const searchParams = useSearchParams();

  useEffect(() => {
    const canceled = searchParams.get("canceled") === "true";
    if (canceled) {
      console.log(
        "Order canceled — continue to shop around and checkout when you’re ready."
      );
    }
  }, [searchParams]);


   useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await fetch("/api/transcriptions");
        if (res.ok) {
          const data = await res.json();
          setHistory(data.transcriptions);
          setTranscribedCount(data.transcriptionsCount);
        }
      } catch (e) {
        console.error("Failed to fetch transcriptions", e);
      }
    }
    fetchHistory();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setSelectedFile(file);
      setTranscription("");
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedFile) {
      setError("Please select an audio file for transcription.");
      return;
    }

    if (transcribedCount >= 2) {
      setShowLimitModal(true);
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("audio", selectedFile);

    try {
      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error during transcription.");
      }

      const data = await response.json();
      setTranscription(data.text);
      setTranscribedCount((prev) => prev + 1);
       setHistory((prevHistory) => [
      {
        id: data.id, 
        text: data.text,
        createdAt: data.createdAt, 
      },
      ...prevHistory,
    ]);
    } catch (err) {
      console.error("Transcription error:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
      <main className="flex min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-200">
    <SignedOut>
      <Card className="w-full mt-60 h-48 max-w-md p-6 sm:p-8 shadow-xl rounded-lg border border-gray-200 bg-white text-center mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold mb-2">
            Welcome to Audio File Transcriber
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sign in or sign up to transcribe audio files.
          </CardDescription>
        </CardHeader>
      </Card>
    </SignedOut>

    <SignedIn>
      <div className="flex min-h-screen w-full">       
        <aside className="w-80 bg-white p-4 overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4 text-gray-900">Your Past Transcriptions</h2>
          {history.length === 0 ? (
            <p className="text-gray-500">No transcriptions yet.</p>
          ) : (
            <ul>
              {history.map(({ id, text, createdAt }) => (
                <li
                 key={id}
                  className="mb-3 cursor-pointer hover:bg-gray-100 p-2 rounded"
                  onClick={() => setTranscription(text)}
                >
                  <p className="truncate text-gray-800">{text}</p>
                  <p className="text-xs text-gray-500">{new Date(createdAt).toLocaleString()}</p>
                </li>
              ))}
            </ul>
          )}
        </aside>      
        <main className="flex-grow flex items-center justify-center px-6">
          <Card className="w-full max-w-md p-6 sm:p-8 shadow-xl rounded-lg border border-gray-200 bg-white">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-extrabold text-gray-900 mb-2">
                Audio File Transcriber
              </CardTitle>
              <CardDescription className="text-md text-gray-600">
                Upload an audio file to get its text transcription
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6">          
              <form onSubmit={handleSubmit} className="flex flex-col items-center gap-4 w-full">
                <label className="relative w-full cursor-pointer inline-flex items-center border border-gray-300 rounded-md px-8 py-2 bg-white overflow-hidden">
                  <Input
                    id="audio-file"
                    type="file"
                    accept="audio/*"
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <span className="flex-1 text-sm font-semibold text-gray-700 text-left">
                    Select a file
                  </span>
                  <span className="absolute left-40 w-px h-10 bg-gray-300 mx-4"></span>
                  <span className="text-sm text-gray-700 font-semibold overflow-hidden whitespace-nowrap w-24 [direction:rtl]">
                    {fileName || "Download"}
                  </span>
                </label>
                <Button
                  variant="default"
                  type="submit"
                  className="w-full text-lg py-3 px-6 cursor-pointer"
                  disabled={!selectedFile || loading}
                >
                  {loading ? (
                    <Loader2Icon className="animate-spin text-white-700" />
                  ) : (
                    "Transcribe an audio file"
                  )}
                </Button>
              </form>

              {error && (
                <Alert>
                  <AlertTitle>Error!</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {transcription && (
                <div className="w-full mt-4">
                  <h2 className="text-xl font-semibold mb-3 text-gray-800">Transcription:</h2>
                  <div className="p-4 bg-gray-50 border border-gray-200 rounded-md shadow-inner max-h-60 overflow-y-auto">
                    <p className="text-gray-800 whitespace-pre-wrap">{transcription}</p>
                  </div>
                </div>
              )}

              {!selectedFile && !loading && !transcription && !error && (
                <p className="mt-4 text-gray-500 text-center text-sm">
                  Select an audio file (MP3, MP4, WAV, WebM, etc.) up to 25 MB in size.
                </p>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </SignedIn>

    {showLimitModal && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
          <h2 className="text-xl font-bold mb-4">Limit Reached</h2>
          <p className="mb-6 text-gray-700">
            You’ve used your 2 free transcriptions. To continue, please purchase more transcriptions.
          </p>
          <div className="flex justify-end space-x-4">
            <Button variant="outline" onClick={() => setShowLimitModal(false)}>
              Cancel
            </Button>
            <form action="/api/checkout_sessions" method="POST">
              <Button type="submit" role="link">
                Pay to Continue
              </Button>
            </form>
          </div>
        </div>
      </div>
    )}
  </main>
  );
}
