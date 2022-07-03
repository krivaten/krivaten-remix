import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";
import { IRichTextItemResponse } from "~/types";

const createEmptyRichTextItem = () => {
  return {
    text: {
      content: "",
      link: null,
    },
    annotations: {
      bold: false,
      italic: false,
      strikethrough: false,
      underline: false,
      code: false,
      color: "default",
    },
    plain_text: "",
  };
};
export const getPageTitle = (
  product: QueryDatabaseResponse["results"][number]
): IRichTextItemResponse[] => {
  if (!("properties" in product)) return [];
  if (product.properties.Name.type !== "title") return [];

  return product.properties.Name.title;
};
