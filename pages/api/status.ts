// pages/api/status.ts
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }
  
  const { id } = req.query;
  if (!id || typeof id !== "string") {
    return res.status(400).json({ message: "Invalid or missing id" });
  }
  
  try {
    const statusRes = await fetch(
      `https://api.replicate.com/v1/predictions/${id}`,
      {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      }
    );
    const statusData = await statusRes.json();
    res.status(200).json(statusData);
  } catch (error: any) {
    res.status(500).json({ message: error.message || "Something went wrong" });
  }
}
