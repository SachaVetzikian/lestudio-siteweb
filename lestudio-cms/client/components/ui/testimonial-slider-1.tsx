"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ArrowRight, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { Review } from "@/data/testimonials";

// Define the props for the slider component
interface TestimonialSliderProps {
  reviews: Review[];
  /** Optional class name for the container */
  className?: string;
}

const QUOTE_TRUNCATE_LENGTH = 260;

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

/**
 * A reusable, animated testimonial slider component.
 * It uses framer-motion for animations and is styled with
 * shadcn/ui theme variables.
 */
export const TestimonialSlider = ({
  reviews,
  className,
}: TestimonialSliderProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // 'direction' helps framer-motion understand slide direction (next vs. prev)
  const [direction, setDirection] = useState<"left" | "right">("right");
  const [expanded, setExpanded] = useState(false);
  const [playingVideo, setPlayingVideo] = useState(false);

  useEffect(() => {
    setExpanded(false);
    setPlayingVideo(false);
  }, [currentIndex]);

  const activeReview = reviews[currentIndex];
  const isLongQuote = activeReview.quote.length > QUOTE_TRUNCATE_LENGTH;
  const displayedQuote =
    isLongQuote && !expanded
      ? activeReview.quote.slice(0, QUOTE_TRUNCATE_LENGTH).trimEnd() + "…"
      : activeReview.quote;

  const handleNext = () => {
    setDirection("right");
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setDirection("left");
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const handleThumbnailClick = (index: number) => {
    // Determine direction for animation
    setDirection(index > currentIndex ? "right" : "left");
    setCurrentIndex(index);
  };

  // Get the next 3 reviews for the thumbnails, excluding the current one
  const thumbnailReviews = reviews
    .filter((_, i) => i !== currentIndex)
    .slice(0, 3);

  // Animation variants for the main visual
  const imageVariants = {
    enter: (direction: "left" | "right") => ({
      y: direction === "right" ? "100%" : "-100%",
      opacity: 0,
    }),
    center: { y: 0, opacity: 1 },
    exit: (direction: "left" | "right") => ({
      y: direction === "right" ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  // Animation variants for the text content
  const textVariants = {
    enter: (direction: "left" | "right") => ({
      x: direction === "right" ? 50 : -50,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: "left" | "right") => ({
      x: direction === "right" ? -50 : 50,
      opacity: 0,
    }),
  };

  return (
    <div
      className={cn(
        "relative w-full min-h-[650px] md:min-h-[600px] overflow-hidden bg-background text-foreground p-8 md:p-12",
        className,
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 h-full">
        {/* === Left Column: Meta and Review Badges === */}
        <div className="md:col-span-3 flex flex-col justify-between order-2 md:order-1">
          <div className="flex flex-col space-y-4">
            {/* Pagination */}
            <span className="text-sm text-muted-foreground font-mono">
              {String(currentIndex + 1).padStart(2, "0")} /{" "}
              {String(reviews.length).padStart(2, "0")}
            </span>

            {/* Review site badges (static, same for every review) */}
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href="https://maps.app.goo.gl/Mf8NG4F4ACxs2e857?g_st=ic"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-sm text-foreground no-underline hover:bg-accent transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M12 10.2v3.9h5.6c-.25 1.4-1.7 4.1-5.6 4.1-3.37 0-6.12-2.8-6.12-6.2s2.75-6.2 6.12-6.2c1.92 0 3.2.82 3.94 1.52l2.68-2.58C17.1 3.02 14.8 2 12 2 6.98 2 2.9 6.03 2.9 11s4.08 9 9.1 9c5.25 0 8.74-3.7 8.74-8.9 0-.6-.07-1.05-.15-1.5z"
                  />
                </svg>
                Avis Google
              </a>
              <a
                href="https://fr.trustpilot.com/review/lestudiodesign.fr"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1.5 rounded-xl border border-border px-3.5 py-2 text-sm text-foreground no-underline hover:bg-accent transition-colors"
              >
                <svg width="14" height="14" viewBox="0 0 24 24">
                  <path
                    fill="#00B67A"
                    d="M12 2l2.6 7.6H22l-6.2 4.5l2.4 7.6L12 17.2L5.8 21.7l2.4-7.6L2 9.6h7.4z"
                  />
                </svg>
                Avis Trustpilot
              </a>
            </div>
          </div>
        </div>

        {/* === Center Column: Main Visual === */}
        <div className="md:col-span-4 relative h-80 min-h-[400px] md:min-h-[500px] order-1 md:order-2">
          <AnimatePresence initial={false} custom={direction}>
            {activeReview.variant === "video" && activeReview.videoSrc ? (
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0 rounded-lg overflow-hidden bg-slate-900"
              >
                {playingVideo ? (
                  <video
                    src={activeReview.videoSrc}
                    poster={activeReview.posterSrc}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setPlayingVideo(true)}
                    aria-label={`Lire le témoignage vidéo de ${activeReview.name}`}
                    className="relative w-full h-full flex items-center justify-center focus:outline-none"
                  >
                    {activeReview.posterSrc && (
                      <img
                        src={activeReview.posterSrc}
                        alt={activeReview.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    )}
                    <span className="absolute inset-0 bg-black/25" />
                    <span className="relative flex items-center justify-center w-16 h-16 rounded-full bg-primary text-primary-foreground">
                      <Play className="w-6 h-6 ml-0.5" fill="currentColor" />
                    </span>
                  </button>
                )}
              </motion.div>
            ) : activeReview.variant === "photo" && activeReview.imageSrc ? (
              <motion.img
                key={currentIndex}
                src={activeReview.imageSrc}
                alt={activeReview.name}
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0 w-full h-full object-cover rounded-lg"
              />
            ) : (
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={imageVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0 rounded-lg bg-accent flex items-center justify-center"
              >
                <span className="flex items-center justify-center w-20 h-20 rounded-full bg-primary text-primary-foreground text-xl font-semibold">
                  {initials(activeReview.name)}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* === Right Column: Text and Navigation === */}
        <div className="md:col-span-5 flex flex-col justify-between md:pl-8 order-3 md:order-3">
          {/* Text Content */}
          <div className="relative overflow-hidden pt-4 md:pt-16 min-h-[280px] md:min-h-[300px]">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentIndex}
                custom={direction}
                variants={textVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
              >
                <p className="text-sm font-medium text-muted-foreground">
                  {activeReview.affiliation}
                </p>
                <h3 className="text-xl font-semibold mt-1">
                  {activeReview.name}
                </h3>
                <blockquote className="mt-6 text-lg md:text-xl font-medium leading-relaxed">
                  "{displayedQuote}"
                </blockquote>
                {isLongQuote && (
                  <button
                    type="button"
                    onClick={() => setExpanded((v) => !v)}
                    className="mt-3 text-sm font-medium text-muted-foreground underline hover:text-foreground transition-colors"
                  >
                    {expanded ? "Réduire" : "Lire la suite"}
                  </button>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons + Thumbnails */}
          <div className="mt-8 md:mt-0">
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full w-12 h-12 border-muted-foreground/50"
                onClick={handlePrev}
                aria-label="Previous review"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="default"
                size="icon"
                className="rounded-full w-12 h-12 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={handleNext}
                aria-label="Next review"
              >
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Thumbnail Navigation */}
            <div className="flex space-x-2 mt-4">
              {thumbnailReviews.map((review) => {
                // Find the original index to navigate to
                const originalIndex = reviews.findIndex(
                  (r) => r.id === review.id,
                );
                return (
                  <button
                    key={review.id}
                    onClick={() => handleThumbnailClick(originalIndex)}
                    className="overflow-hidden rounded-md w-16 h-20 md:w-20 md:h-24 opacity-70 hover:opacity-100 transition-opacity duration-300 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                    aria-label={`View review from ${review.name}`}
                  >
                    {review.thumbnailSrc ? (
                      <img
                        src={review.thumbnailSrc}
                        alt={review.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center bg-accent text-sm font-semibold">
                        {initials(review.name)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
