import { Fragment, useState } from "react";
import { randomNumber } from "~/utils/misc";
import {
  GetBlockResponse,
  GetPageResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { IRichTextItemResponse } from "~/types";

export default function Text({
  content = [],
}: {
  content: IRichTextItemResponse[];
}) {
  const [uniqueId] = useState(randomNumber(1, 99999));

  function renderContent(text: IRichTextItemResponse["text"]) {
    if (!text) return;
    return text.link ? (
      <a href={text.link.url}>{text.content}</a>
    ) : (
      text.content
    );
  }

  return (
    <Fragment>
      {content.map((value, index) => {
        const {
          annotations: { bold, code, color, italic, strikethrough, underline },
          text,
        } = value;
        const classNames = [];
        if (bold) classNames.push("bold");
        if (code) classNames.push("code");
        if (color) classNames.push(`color-${color}`);
        if (italic) classNames.push("italic");
        if (strikethrough) classNames.push("strikethrough");
        if (underline) classNames.push("underline");

        return !!classNames.length ? (
          <span
            className={classNames.join(" ")}
            key={`id-${uniqueId}-${index}`}
          >
            {renderContent(text)}
          </span>
        ) : (
          <Fragment key={`id-${uniqueId}-${index}`}>
            {renderContent(text)}
          </Fragment>
        );
      })}
    </Fragment>
  );
}
