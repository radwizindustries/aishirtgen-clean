
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { prompt } = req.body;

  if (!prompt || prompt.length < 5) {
    return res.status(400).json({ message: 'Prompt too short or missing' });
  }

  try {
    const replicateRes = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: "a9758cbefb05b50143703ec9d0110d5f6c4e08e577b6806dbf1b57f65c311dd4",
        input: {
          prompt: prompt,
          width: 512,
          height: 512,
          num_outputs: 1,
        },
      }),
    });

    const prediction = await replicateRes.json();

    if (prediction.error) {
      throw new Error(prediction.error);
    }

    let output = null;
    while (!output) {
      const statusRes = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
        headers: {
          "Authorization": `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      });
      const status = await statusRes.json();

      if (status.status === "succeeded") {
        output = status.output[0];
      } else if (status.status === "failed") {
        throw new Error("Prediction failed.");
      } else {
        await new Promise((r) => setTimeout(r, 1000));
      }
    }

    res.status(200).json({ imageUrl: output });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Something went wrong" });
  }
}
