'use client';

import React, { useState, useEffect } from 'react';
import { CustomAccordion } from './ui/CustomAccordion';
import { cmsService } from '../services/cms';

export function FAQ() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cmsService.getFAQs()
      .then(data => {
        setItems(data.map(faq => ({
          id: faq.id,
          title: faq.question,
          content: faq.answer,
        })));
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch FAQs:', err);
        setLoading(false);
      });
  }, []);

  return (
    <section id="faqs" className="py-24 px-4 sm:px-6 lg:px-8 bg-ivory-50 dark:bg-[#0A0A0A]">
      <div className="max-w-3xl mx-auto">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <span className="font-sans text-xs font-bold tracking-[0.25em] text-gold-500 uppercase">
            Have Questions?
          </span>
          <h2 className="mt-3 font-serif text-3xl font-bold tracking-wide text-foreground sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <div className="luxury-divider" />
        </div>

        {/* Accordion list */}
        {loading ? (
          <p className="text-center text-xs text-foreground/40">Loading FAQ articles...</p>
        ) : (
          <CustomAccordion items={items} />
        )}
      </div>
    </section>
  );
}

