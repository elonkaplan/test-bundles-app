import { Box } from "@shopify/polaris";
import { authenticate } from "app/shopify.server";
import db from "app/db.server";
import { useLoaderData } from "@remix-run/react";

export const loader = async ({ request }: { request: Request }) => {
  const { session } = await authenticate.public.appProxy(request);

  const url = new URL(request.url);

  const limit = url.searchParams.get("limit");

  const bundles = await db.bundle.findMany({
    where: { shop: session?.shop },
    take: Number(limit),
    orderBy: { createdAt: "desc" },
  });

  return bundles;
};

export default function Bundles() {
  const data = useLoaderData<typeof loader>();

  console.log(data);

  return (
    <Box>
      <h1>Bundles</h1>
      {JSON.stringify(data)}
    </Box>
  );
}
