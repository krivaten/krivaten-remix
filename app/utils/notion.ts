import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import { IRichTextItemResponse } from "~/types";

export const getPageTitle = (
  product: QueryDatabaseResponse["results"][number]
): IRichTextItemResponse[] => {
  if (!("properties" in product)) return [];
  if (product.properties.Name.type !== "title") return [];

  return product.properties.Name.title;
};
