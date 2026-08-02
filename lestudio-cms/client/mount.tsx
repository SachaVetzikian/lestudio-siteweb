import * as React from "react";
import { createRoot } from "react-dom/client";
import { TestimonialSlider } from "@/components/ui/testimonial-slider-1";
import { reviews } from "@/data/testimonials";

const rootEl = document.getElementById("testimonial-slider-root");
if (rootEl) {
  createRoot(rootEl).render(
    <div className="tw-scope">
      <TestimonialSlider reviews={reviews} className="rounded-2xl" />
    </div>,
  );
}
