import { redirect, type ActionFunctionArgs } from "@remix-run/node";
import { authenticate } from "app/shopify.server";
import db from "app/db.server";

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  await db.bundle.delete({
    where: { id: params.id, shop: session.shop },
  });

  return redirect("/app/bundles");
};
