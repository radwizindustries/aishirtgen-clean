import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { id, output, status } = req.body;

  // ✅ At this point, output[0] should be the image URL
  if (status === "succeeded" && output?.length > 0) {
    console.log(`Prediction complete: ${id}`);
    console.log(`Image URL: ${output[0]}`);

    // You can now:
    // - Store the URL in a DB (Firebase, Supabase, etc)
    // - Send a notification or email
    // - Save to a temporary in-memory store (like Redis)
  }

  res.status(200).end();
}
