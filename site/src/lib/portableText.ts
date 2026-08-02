import { toHTML } from "@portabletext/to-html";
import type { PortableTextBlock } from "./types";
import { urlForImage } from "./sanity";

export function portableTextToHtml(blocks?: PortableTextBlock[]): string {
  if (!blocks || blocks.length === 0) return "";
  return toHTML(blocks, {
    components: {
      types: {
        image: ({ value }) =>
          `<img src="${urlForImage(value).width(1200).fit("max").auto("format").url()}" alt="${
            value.alt ?? ""
          }" loading="lazy" />`,
      },
    },
  });
}
