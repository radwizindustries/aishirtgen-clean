// pages/index.tsx
import { useState } from "react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (prompt.trim().length < 5) {
      alert("Please enter a more detailed prompt.");
      return;
    }

    setLoading(true);
    setImageUrl("");

    try {
      // Step 1: Create the prediction
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to initiate prediction.");
      }
      const predictionId = data.id;

      // Step 2: Poll for status using our secure API route
      let image: string | null = null;
      let tries = 0;

      while (tries < 20 && !image) {
        const statusRes = await fetch(`/api/status?id=${predictionId}`);
        const statusData = await statusRes.json();

        if (statusData.status === "succeeded") {
          image = statusData.output[0];
          break;
        } else if (statusData.status === "failed") {
          throw new Error("Prediction failed.");
        }

        await new Promise((r) => setTimeout(r, 1000));
        tries++;
      }

      if (image) {
        setImageUrl(image);
      } else {
        alert("Timed out waiting for the image.");
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Error generating image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-100">
      <h1 className="text-3xl font-bold mb-4">AI Shirt Designer</h1>

      <input
        className="w-full p-2 border rounded mb-4"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Describe your shirt design..."
      />

      <button
        className="bg-blue-500 text-white px-4 py-2 rounded"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Image"}
      </button>

      {imageUrl && (
        <div className="mt-8">
          <h2 className="text-xl mb-2">Preview</h2>
          <div className="bg-white p-4 rounded shadow w-64 h-64 flex items-center justify-center">
            <img src={imageUrl} alt="Shirt preview" className="max-h-full" />
          </div>
        </div>
      )}
    </div>
  );
}
