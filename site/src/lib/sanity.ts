import { createClient } from "@sanity/client";
import { createImageUrlBuilder } from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url";

const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID;
const dataset = import.meta.env.PUBLIC_SANITY_DATASET || "production";
const apiVersion = import.meta.env.PUBLIC_SANITY_API_VERSION || "2024-01-01";

if (!projectId) {
  throw new Error(
    "PUBLIC_SANITY_PROJECT_ID est manquant. Copie site/.env.example vers site/.env et renseigne tes identifiants Sanity."
  );
}

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  token: import.meta.env.SANITY_API_READ_TOKEN || undefined,
  useCdn: true,
  perspective: "published",
});

const builder = createImageUrlBuilder(sanityClient);

export function urlForImage(source: SanityImageSource) {
  return builder.image(source);
}
