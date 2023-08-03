import type { NextApiRequest, NextApiResponse } from 'next';
import { openApiDocument } from '~/server/docs';

// Respond with our OpenAPI schema
const handler = (req: NextApiRequest, res: NextApiResponse) => {
  res.status(200).send(openApiDocument);
};

export default handler;