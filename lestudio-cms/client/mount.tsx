import * as React from "react";
import { createRoot } from "react-dom/client";
import { TestimonialSlider } from "@/components/ui/testimonial-slider-1";
import { Comparison } from "@/components/ui/comparison";
import { reviews } from "@/data/testimonials";

const testimonialRootEl = document.getElementById("testimonial-slider-root");
if (testimonialRootEl) {
  createRoot(testimonialRootEl).render(
    <div className="tw-scope">
      <TestimonialSlider reviews={reviews} className="rounded-2xl" />
    </div>,
  );
}

const comparisonRootEl = document.getElementById("comparison-root");
if (comparisonRootEl) {
  createRoot(comparisonRootEl).render(
    <div className="tw-scope">
      <Comparison />
    </div>,
  );
}
