import { json, LoaderFunction } from "@remix-run/node";
import { getDatabase, getPage, getBlocks } from "~/utils/notion.server";
import type { MetaFunction } from "@remix-run/node";
import { Link, useLoaderData } from "@remix-run/react";
import { getPageTitle } from "~/utils/notion";
import {
  GetBlockResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";
import Text from "~/components/Text";

export const loader: LoaderFunction = async ({ params }) => {
  const result = await getStaticProps(params.pageId!);
  return json(result.props, { headers: { "Cache-Control": "max-age=3600" } });
};

export default function PageRoute() {
  const { page, blocks } =
    useLoaderData<Awaited<ReturnType<typeof getStaticProps>>["props"]>();

  return (
    <article>
      <h1>
        <Text content={getPageTitle(page)} />
        {console.log(page)}
      </h1>
      <section>
        {blocks.map((block) => (
          <Fragment key={block.id}>{renderBlock(block)}</Fragment>
        ))}
      </section>
    </article>
  );
}

import { Fragment } from "react";
const renderBlock = (block: GetBlockResponse) => {
  if (!("type" in block)) return [];
  const { type, id } = block;
  switch (type) {
    case "paragraph":
      return (
        <p>
          <Text content={block[type].rich_text} />
        </p>
      );
    case "heading_1":
      return block.has_children ? (
        <details>
          <summary>
            <Text content={block[type].rich_text} />
          </summary>
          {renderChildren(block)}
        </details>
      ) : (
        <h1>
          <Text content={block[type].rich_text} />
        </h1>
      );
    case "heading_2":
      return block.has_children ? (
        <details>
          <summary>
            <Text content={block[type].rich_text} />
          </summary>
          {renderChildren(block)}
        </details>
      ) : (
        <h2>
          <Text content={block[type].rich_text} />
        </h2>
      );
    case "heading_3":
      return block.has_children ? (
        <details>
          <summary>
            <Text content={block[type].rich_text} />
          </summary>
          {renderChildren(block)}
        </details>
      ) : (
        <h3>
          <Text content={block[type].rich_text} />
        </h3>
      );
    case "bulleted_list_item":
      return (
        <li>
          <Text content={block[type].rich_text} />
          {block.has_children && <ul>{renderChildren(block)}</ul>}
        </li>
      );
    case "numbered_list_item":
      return (
        <li>
          <Text content={block[type].rich_text} />
          {block.has_children && <ul>{renderChildren(block)}</ul>}
        </li>
      );
    case "to_do":
      return (
        <li>
          <label htmlFor={id}>
            <input
              type="checkbox"
              readOnly
              id={id}
              defaultChecked={block[type].checked}
            />{" "}
            <Text content={block[type].rich_text} />
          </label>
          {block.has_children && <ul>{renderChildren(block)}</ul>}
        </li>
      );
    case "toggle":
      return (
        <details>
          <summary>
            <Text content={block[type].rich_text} />
          </summary>
          {renderChildren(block)}
        </details>
      );
    case "child_page":
      return <p>{block[type].title}</p>;
    case "image":
      const value = block[type];
      const src =
        value.type === "external" ? value.external.url : value.file.url;
      const caption = value.caption.length ? value.caption[0].plain_text : "";
      return (
        <figure>
          <img src={src} alt={caption} />
          {caption && <figcaption>{caption}</figcaption>}
        </figure>
      );
    case "divider":
      return <hr />;
    case "bookmark":
      return (
        <div>
          <a href={block[type].url}>{block[type].url}</a>
        </div>
      );
    case "code":
      return (
        <pre>
          <Text content={block[type].rich_text} />
        </pre>
      );
    case "callout":
      return (
        <section>
          <Text content={block[type].rich_text} />
        </section>
      );
    case "quote":
      return (
        <blockquote>
          <Text content={block[type].rich_text} />
        </blockquote>
      );
    default:
      return `❌ Unsupported block (${
        type === "unsupported" ? "unsupported by Notion API" : type
      })`;
  }
};

export const getStaticProps = async (pageId: string) => {
  const [page, blocks] = await Promise.all([
    getPage(pageId),
    getBlocks(pageId),
  ]);

  // Retrieve block children for nested blocks (one level deep), for example toggle blocks
  // https://developers.notion.com/docs/working-with-page-content#reading-nested-blocks
  const childBlocks = await Promise.all(
    blocks
      .filter((block) => "has_children" in block && block.has_children)
      .map(async ({ id }) => ({
        id,
        children: await getBlocks(id),
      }))
  );

  const blocksWithChildren = blocks.map((block) => {
    if (
      "has_children" in block &&
      block.has_children &&
      !(block as IBlockWithChildren).children
    ) {
      (block as IBlockWithChildren).children = childBlocks.find(
        (x) => x.id === block.id
      )?.children;
    }
    return block;
  });
  return {
    props: {
      page,
      blocks: blocksWithChildren,
    },
    revalidate: 1,
  };
};
interface IBlockWithChildren {
  has_children: boolean;
  children?: GetBlockResponse[];
}
export const isPartialResponse = (block: GetBlockResponse) =>
  !("has_children" in block);

export const renderChildren = (block: IBlockWithChildren) => {
  const { children = [] } = block;
  return children.map((block: GetBlockResponse) => (
    <Fragment key={block.id}>{renderBlock(block)}</Fragment>
  ));
};
