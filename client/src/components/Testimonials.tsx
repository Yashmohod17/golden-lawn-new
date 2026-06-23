'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Quote, ChevronLeft, ChevronRight } from 'lucide-react';
import { cmsService } from '../services/cms';

export function Testimonials() {
  const [items, setItems] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cmsService.getTestimonials()
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch testimonials:', err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (items.length === 0) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % items.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [items.length]);

  const nextSlide = () => {
    if (items.length === 0) return;
    setCurrent((prev) => (prev + 1) % items.length);
  };
  const prevSlide = () => {
    if (items.length === 0) return;
    setCurrent((prev) => (prev - 1 + items.length) % items.length);
  };

  if (items.length === 0) {
    return (
      <section id="testimonials" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-ivory-100 dark:bg-zinc-950 overflow-hidden">
        <div className="max-w-4xl mx-auto text-center">
          <span className="font-sans text-xs font-bold tracking-[0.25em] text-gold-500 uppercase">
            Client Stories
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-wide text-foreground sm:text-4xl">
            What Our Guests Say
          </h2>
          <div className="luxury-divider" />
          <p className="text-foreground/50 text-xs mt-8">No client reviews currently published.</p>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="relative py-24 px-4 sm:px-6 lg:px-8 bg-ivory-100 dark:bg-zinc-950 overflow-hidden">
      
      {/* Background radial accent */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(212,175,55,0.02),transparent_70%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="font-sans text-xs font-bold tracking-[0.25em] text-gold-500 uppercase">
            Client Stories
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-wide text-foreground sm:text-4xl">
            What Our Guests Say
          </h2>
          <div className="luxury-divider" />
        </div>

        {/* Carousel Window */}
        <div className="relative glass-panel rounded-3xl border border-gold-400/20 p-8 md:p-12 shadow-xl">
          {/* Quote Icon */}
          <div className="absolute top-6 left-6 text-gold-400/10 dark:text-gold-400/5">
            <Quote className="h-24 w-24 -scale-y-100 rotate-180" />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5 }}
              className="relative z-10 text-center"
            >
              {/* Star Ratings */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(items[current]?.rating || 5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 fill-gold-400 text-gold-400" />
                ))}
              </div>

              {/* Review Text */}
              <blockquote className="font-serif text-lg md:text-xl italic leading-relaxed text-foreground/90 dark:text-foreground/80 max-w-2xl mx-auto">
                &ldquo;{items[current]?.text}&rdquo;
              </blockquote>

              {/* Author info */}
              <div className="mt-8 flex flex-col items-center gap-3">
                {items[current]?.avatar && (
                  <img
                    src={items[current].avatar}
                    alt={items[current].name}
                    className="h-14 w-14 rounded-full object-cover border-2 border-gold-400"
                  />
                )}
                <div>
                  <h4 className="font-serif text-base font-bold text-foreground">
                    {items[current]?.name}
                  </h4>
                  <p className="font-sans text-xs text-gold-500 tracking-wider uppercase">
                    {items[current]?.event}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows */}
          <div className="absolute inset-y-0 left-4 right-4 flex items-center justify-between pointer-events-none">
            <button
              onClick={prevSlide}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-gold-400/10 bg-white/50 text-foreground hover:bg-gold-400 hover:text-zinc-950 transition-all dark:bg-zinc-900/50"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-full border border-gold-400/10 bg-white/50 text-foreground hover:bg-gold-400 hover:text-zinc-950 transition-all dark:bg-zinc-900/50"
              aria-label="Next testimonial"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Carousel indicators */}
        <div className="flex justify-center gap-2 mt-6">
          {items.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-2 transition-all rounded-full ${
                current === i ? 'w-6 bg-gold-400' : 'w-2 bg-gold-400/20'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
