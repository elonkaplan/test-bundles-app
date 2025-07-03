import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import {
  Box,
  Button,
  Checkbox,
  Layout,
  Page,
  Pagination,
  Text,
  TextField,
} from "@shopify/polaris";
import {
  Form,
  redirect,
  useLoaderData,
  useNavigate,
  useSearchParams,
} from "@remix-run/react";

import { authenticate } from "app/shopify.server";
import db from "app/db.server";
import { useState } from "react";

const PAGINATION_LIMIT = 20;

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { admin, session } = await authenticate.admin(request);

  const url = new URL(request.url);
  const search = url.searchParams.get("query");
  const after = url.searchParams.get("after");
  const before = url.searchParams.get("before");

  const pagination = before
    ? { before, last: PAGINATION_LIMIT }
    : { after, first: PAGINATION_LIMIT };

  const response = await admin.graphql(
    `#graphql
      query getProducts($first: Int, $last: Int, $after: String, $before: String, $search: String) {
        products(first: $first, last: $last, after: $after, before: $before, query: $search) {
          edges {
            node {
              id
              title
            }
          }
          pageInfo {
            endCursor
            hasNextPage
            hasPreviousPage
            startCursor
          }
        }
      }
    `,
    { variables: { ...pagination, search } },
  );

  const { data } = await response.json();

  if (!data) throw new Error("Data is not defined");

  const currentBundle =
    params.id === "create"
      ? null
      : await db.bundle.findFirst({
          where: { id: params.id, shop: session.shop },
        });

  return {
    products: data.products.edges.map((item) => item.node),
    pageInfo: data.products.pageInfo,
    currentBundle,
  };
};

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const { session } = await authenticate.admin(request);

  const form = await request.formData();

  const title = form.get("title") as string;
  const price = parseFloat(form.get("price") as string);
  const productAmount = parseInt(form.get("productAmount") as string);
  const selectedProducts = JSON.parse(
    (form.get("selectedProducts") as string) || "[]",
  ) as string[];

  if (params.id === "create") {
    await db.bundle.create({
      data: {
        title,
        price,
        productAmount,
        selectedProducts,
        shop: session.shop,
      },
    });
  } else {
    await db.bundle.update({
      where: { id: params.id, shop: session.shop },
      data: {
        title,
        price,
        productAmount,
        selectedProducts,
      },
    });
  }

  return redirect("/app/bundles");
};

export default function BundlePage() {
  const navigate = useNavigate();
  const { products, pageInfo, currentBundle } = useLoaderData<typeof loader>();
  const [searchParams] = useSearchParams();

  const query = searchParams.get("query") || "";

  const [search, setSearch] = useState<string>(query);
  const [selectedProducts, setSelectedProducts] = useState<string[]>(
    (currentBundle?.selectedProducts as string[]) || [],
  );
  const [name, setName] = useState<string>(currentBundle?.title || "");
  const [price, setPrice] = useState<string>(
    currentBundle?.price ? String(currentBundle.price) : "",
  );
  const [productAmount, setProductAmount] = useState<string>(
    currentBundle?.productAmount ? String(currentBundle.productAmount) : "",
  );

  return (
    <Page fullWidth>
      <Button url="/app/bundles">Close</Button>
      <Layout>
        <Layout.Section>
          <Form method="post">
            <Text as="h2" variant="headingMd">
              Create a Product Bundle
            </Text>
            <input
              type="hidden"
              name="selectedProducts"
              value={JSON.stringify(selectedProducts)}
            />
            <TextField
              autoComplete="off"
              label="Bundle name"
              name="title"
              value={name}
              placeholder="Bundle name"
              onChange={setName}
              requiredIndicator
            />
            <TextField
              autoComplete="off"
              label="Bundle price"
              name="price"
              placeholder="Price"
              type="number"
              onChange={setPrice}
              value={price}
              requiredIndicator
              inputMode="decimal"
            />
            <TextField
              autoComplete="off"
              label="Product amount"
              name="productAmount"
              placeholder="Product amount"
              type="number"
              onChange={setProductAmount}
              value={productAmount}
              requiredIndicator
              inputMode="numeric"
            />

            <Button submit>Create bundle</Button>
          </Form>

          <Form method="get">
            <TextField
              label="Search"
              autoComplete="off"
              type="text"
              name="query"
              value={search}
              placeholder="Search..."
              onChange={setSearch}
            />
            <Button submit>Search</Button>
          </Form>

          <Text as="p" variant="headingSm">
            Select products:
          </Text>
          {products.map((product) => (
            <Box key={product.id}>
              <Checkbox
                label={product.title}
                name="products"
                value={product.id}
                checked={selectedProducts.includes(product.id)}
                onChange={(checked) => {
                  setSelectedProducts((prev) =>
                    checked
                      ? [...prev, product.id]
                      : prev.filter((item) => item !== product.id),
                  );
                }}
              />
            </Box>
          ))}

          <Pagination
            hasPrevious={pageInfo.hasPreviousPage}
            onPrevious={() => {
              navigate(`?query=${query}&before=${pageInfo.startCursor}`);
            }}
            hasNext={pageInfo.hasNextPage}
            onNext={() => {
              navigate(`?query=${query}&after=${pageInfo.endCursor}`);
            }}
          />
        </Layout.Section>
      </Layout>
    </Page>
  );
}
