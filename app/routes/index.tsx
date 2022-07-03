import type { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getDatabase } from "~/utils/notion.server";
import { getPageTitle } from "~/utils/notion";
import type { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import Text from "~/components/Text";

export const loader = async () => {
  return getDatabase((process.env as any).NOTION_PAGE_ID);
};

export const meta: MetaFunction = () => ({
  title: "Remix: So great, it's funny!",
  description: "Remix jokes app. Learn Remix and laugh at the same time!",
});

export default function Index() {
  const products = useLoaderData<QueryDatabaseResponse["results"]>();
  return (
    <div>
      <h1>Welcome to Krivaten</h1>

      <ul>
        {products.map((product) => (
          <li key={product.id}>
            <Link to={`pages/${product.id}`}>
              <Text content={getPageTitle(product)} />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
