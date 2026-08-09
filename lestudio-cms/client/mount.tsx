import * as React from "react";
import { createRoot } from "react-dom/client";
import { TestimonialSlider } from "@/components/ui/testimonial-slider-1";
import { Comparison } from "@/components/ui/comparison";
import { FlipWords } from "@/components/ui/flip-words";
import { reviews } from "@/data/testimonials";

const HERO_FLIP_WORDS = [
  "business-driven",
  "orienté conversion",
  "SEO-GEO friendly",
];

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

const heroFlipRootEl = document.getElementById("hero-flip-root");
if (heroFlipRootEl) {
  createRoot(heroFlipRootEl).render(
    <FlipWords words={HERO_FLIP_WORDS} className="text-inherit" />,
  );
}
