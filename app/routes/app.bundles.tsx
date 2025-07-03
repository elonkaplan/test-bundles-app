import { Button, Text } from "@shopify/polaris";
import { Form, Outlet, useLoaderData } from "@remix-run/react";

import type { LoaderFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import db from "app/db.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const bundles = await db.bundle.findMany({ where: { shop: session.shop } });

  return { bundles };
};

export default function Bundles() {
  const { bundles } = useLoaderData<typeof loader>();

  return (
    <>
      <Button url="create">Create</Button>
      {bundles.map((bundle) => (
        <div key={bundle.id} style={{ display: "flex" }}>
          <Text as="p">{bundle.title}</Text>
          <Text as="p">{bundle.price}</Text>

          <Button url={bundle.id}>Update</Button>
          <Form method="post" action={`${bundle.id}/delete`}>
            <Button submit>Delete</Button>
          </Form>
        </div>
      ))}
      <Outlet />
    </>
  );
}
