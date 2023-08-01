import type { NextApiRequest, NextApiResponse } from 'next/types';
import { createOpenApiNextHandler } from 'trpc-openapi';
import { appRouter } from "~/server/api/root";
import { createTRPCContext } from "~/server/api/trpc";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    // Handle incoming OpenAPI requests
    return createOpenApiNextHandler({
      router: appRouter,
      createContext: createTRPCContext,
    })(req, res);
  };
  

export default handler;