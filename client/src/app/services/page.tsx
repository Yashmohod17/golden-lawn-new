'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import { useInquiry } from '../../lib/InquiryContext';
import { cmsService } from '../../services/cms';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const cardVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { duration: 0.5 } }
};

export default function Services() {
  const { openInquiry } = useInquiry();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cmsService.getServices()
      .then(data => {
        setItems(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch services:', err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="w-full py-16 bg-ivory-50 dark:bg-zinc-950">
      
      {/* Page Header */}
      <div className="text-center py-12 max-w-7xl mx-auto px-4">
        <span className="font-sans text-xs font-bold tracking-[0.25em] text-gold-500 uppercase">
          Elite Offerings
        </span>
        <h1 className="mt-3 font-serif text-4xl font-bold tracking-wide text-foreground sm:text-5xl">
          Premium Event Services
        </h1>
        <div className="luxury-divider" />
        <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base text-foreground/70 dark:text-foreground/80 leading-relaxed">
          From majestic floral structures to multi-cuisine dining lists, we handle every detail of your special event to golden perfection.
        </p>
      </div>

      {/* Services Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {items.map((service, idx) => {
            const IconComponent = (Icons as any)[service.iconName] || Icons.Sparkles;
            return (
              <motion.div
                key={idx}
                variants={cardVariants}
                className="glass-card rounded-3xl overflow-hidden border border-gold-400/10 flex flex-col justify-between"
              >
                {/* Service Visual Header */}
                <div className="relative h-48 w-full overflow-hidden">
                  <div
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-500 hover:scale-105"
                    style={{ backgroundImage: `url(${service.image})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-4 left-4 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold-400 text-zinc-950">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <h3 className="font-serif text-xl font-bold text-white tracking-wide">
                      {service.title}
                    </h3>
                  </div>
                </div>

                {/* Service Description */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <p className="text-sm text-foreground/75 dark:text-foreground/80 leading-relaxed mb-6">
                    {service.desc}
                  </p>

                  <button
                    onClick={() => openInquiry(service.title)}
                    className="w-full rounded-xl border border-gold-400/30 text-gold-500 py-3 font-sans text-xs font-bold tracking-widest uppercase hover:bg-gold-400 hover:text-zinc-950 transition-all duration-300"
                  >
                    Inquire Service
                  </button>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}
