'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Award, Star, MessageSquare, Plus, Trash2, Edit, 
  Save, Check, X, Shield, PlusCircle, HelpCircle, FileText, CheckCircle2,
  Image
} from 'lucide-react';

interface Feature {
  name: string;
  included: boolean;
}

interface Package {
  id: string;
  name: string;
  badge: string;
  desc: string;
  price: number;
  features: Feature[];
  color: string;
  accent: string;
}

interface Testimonial {
  id: string;
  name: string;
  event: string;
  rating: number;
  avatar: string;
  text: string;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const defaultGalleryItems = [
  {
    id: 'gal-1',
    category: 'Weddings',
    title: 'Fairytale Flower Arch Ceremony',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop',
    aspect: 'aspect-[4/5]',
  },
  {
    id: 'gal-2',
    category: 'Night View',
    title: 'Lawn Lighting Illuminations',
    image: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?q=80&w=600&auto=format&fit=crop',
    aspect: 'aspect-video',
  },
  {
    id: 'gal-3',
    category: 'Decorations',
    title: 'Golden Table Dinner Setup',
    image: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=600&auto=format&fit=crop',
    aspect: 'aspect-square',
  },
  {
    id: 'gal-4',
    category: 'Receptions',
    title: 'Canopy Glow Lounge Zone',
    image: 'https://images.unsplash.com/photo-1505232458729-565772b74dd7?q=80&w=600&auto=format&fit=crop',
    aspect: 'aspect-[3/4]',
  },
  {
    id: 'gal-5',
    category: 'Stage Designs',
    title: 'Bespoke Floral Royal Stage',
    image: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=600&auto=format&fit=crop',
    aspect: 'aspect-[4/3]',
  },
  {
    id: 'gal-6',
    category: 'Engagements',
    title: 'Classy Ring Exchanging Stage',
    image: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?q=80&w=600&auto=format&fit=crop',
    aspect: 'aspect-[4/5]',
  },
  {
    id: 'gal-7',
    category: 'Birthdays',
    title: 'Vibrant Theme Balloon Backdrop',
    image: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=600&auto=format&fit=crop',
    aspect: 'aspect-square',
  },
  {
    id: 'gal-8',
    category: 'Corporate Events',
    title: 'Annual Awards Gala Dining Room',
    image: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop',
    aspect: 'aspect-video',
  },
  {
    id: 'gal-9',
    category: 'Weddings',
    title: 'Ivory Walkway Petals Alignment',
    image: 'https://images.unsplash.com/photo-1519225495810-7512c696505a?q=80&w=600&auto=format&fit=crop',
    aspect: 'aspect-square',
  },
];

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<'PACKAGES' | 'TESTIMONIALS' | 'FAQS' | 'GALLERY'>('PACKAGES');
  const [successMsg, setSuccessMsg] = useState('');

  // 1. Packages State
  const [packagesList, setPackagesList] = useState<Package[]>([
    {
      id: 'pkg-1',
      name: 'Silver Package',
      badge: 'Standard Selection',
      desc: 'Perfect for intimate celebrations, small gatherings, and simple family gatherings.',
      price: 1200,
      color: 'border-zinc-300 dark:border-zinc-700 bg-zinc-400/5',
      accent: 'bg-zinc-400 text-zinc-950',
      features: [
        { name: 'Basic Flower & Light Decor', included: true },
        { name: 'Full Lawn Access (8 hrs)', included: true },
        { name: 'Standard Seating Setup', included: true },
        { name: 'Standard Sound System', included: true },
        { name: 'Catering Kitchen Access', included: true },
        { name: 'Dedicated Stage Setup', included: false },
        { name: 'Photography & Video', included: false },
        { name: 'Complete Event Planning', included: false },
        { name: 'VIP Guest Assistance & Valet', included: false },
      ],
    },
    {
      id: 'pkg-2',
      name: 'Gold Package',
      badge: 'Most Popular',
      desc: 'Tailored for elegant evening receptions, engagements, and corporate banquets.',
      price: 2500,
      color: 'border-gold-400/40 bg-gold-400/5',
      accent: 'bg-gold-400 text-zinc-950',
      features: [
        { name: 'Premium Flower & Light Decor', included: true },
        { name: 'Full Lawn Access (12 hrs)', included: true },
        { name: 'Designer Seating Setup', included: true },
        { name: 'High-definition Sound System', included: true },
        { name: 'In-house Catering Support', included: true },
        { name: 'Custom Stage Decoration', included: true },
        { name: 'Candid Photography Support', included: true },
        { name: 'Complete Event Planning', included: false },
        { name: 'VIP Guest Assistance & Valet', included: false },
      ],
    },
    {
      id: 'pkg-3',
      name: 'Platinum Package',
      badge: 'Luxury Unlimited',
      desc: 'Our flagship wedding experience, handling every detail to majestic gold standards.',
      price: 4500,
      color: 'border-burgundy-500/35 bg-burgundy-600/5',
      accent: 'bg-burgundy-600 text-white',
      features: [
        { name: 'Luxury Flower & Light Decor', included: true },
        { name: 'Full Lawn Access (24 hrs)', included: true },
        { name: 'Royal Seating Arrangements', included: true },
        { name: 'Concert Sound System & DJ', included: true },
        { name: 'Premium Multi-cuisine Catering', included: true },
        { name: 'Bespoke Stage Artistry', included: true },
        { name: 'Drone & Candid Photo/Video', included: true },
        { name: 'Complete Event Management', included: true },
        { name: 'VIP Valet & Guest Support Suite', included: true },
      ],
    },
  ]);

  // 2. Testimonials State
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([
    {
      id: 'test-1',
      name: 'Rohit & Sneha Sharma',
      event: 'Grand Wedding',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop',
      text: 'Our wedding at The Golden Celebrations Lawn was nothing short of a fairytale. The lighting decoration at night made the entire lawn look like a starry sky. Our guests were mesmerized, and the catering support was absolutely flawless. Thank you for making our day so special!',
    },
    {
      id: 'test-2',
      name: 'Karan Malhotra',
      event: 'Corporate Annual Gala',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop',
      text: 'We hosted our company’s 10th-anniversary celebration here with over 800 guests. The professional event management team handled everything seamlessly. The space is vast, parking was extremely well managed, and the stage setup was incredibly grand. Highly recommended!',
    },
    {
      id: 'test-3',
      name: 'Priyanka Sen',
      event: 'Engagement Ceremony',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop',
      text: 'The floral design and stage decorations for our engagement ceremony were breathtaking. The booking process was very smooth, and the team accommodated all our customization requests. It felt extremely premium and intimate at the same time.',
    },
  ]);

  // 3. FAQs State
  const [faqsList, setFaqsList] = useState<FAQItem[]>([
    {
      id: 'faq-1',
      category: 'Booking',
      question: 'How do I book the venue for an event?',
      answer: 'Booking is simple: Select an available date on our Calendar Checker or submit an Inquiry Form. A coordinator will lock the date temporarily and call you to arrange a site visit. A 25% advance payment is required to confirm the booking officially.',
    },
    {
      id: 'faq-2',
      category: 'Logistics',
      question: 'What is the maximum guest capacity of the lawn?',
      answer: 'The Golden Celebrations Lawn can accommodate up to 2,000 guests for open-air lawn events. For smaller, intimate celebrations, we can structure partition layouts to fit 150-300 guests comfortably.',
    },
    {
      id: 'faq-3',
      category: 'Logistics',
      question: 'Is parking available on site?',
      answer: 'Yes! We have an adjacent private parking area that fits over 300 vehicles securely. We also provide professional valet assistance for all major weddings and corporate functions at no extra cost.',
    },
    {
      id: 'faq-4',
      category: 'Catering',
      question: 'Do you provide in-house catering, or can we bring our own chef?',
      answer: 'We offer premium, multi-cuisine catering packages. However, you are welcome to hire external, government-approved catering teams. Access to our fully equipped base kitchen is provided.',
    },
  ]);

  // Modals / Forms States
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);
  const [isAddingFAQ, setIsAddingFAQ] = useState(false);

  // Gallery Management States
  const [galleryList, setGalleryList] = useState<any[]>([]);
  const [editingGallery, setEditingGallery] = useState<any | null>(null);
  const [isAddingGallery, setIsAddingGallery] = useState(false);

  // Form Variables - Testimonial
  const [testFormName, setTestFormName] = useState('');
  const [testFormEvent, setTestFormEvent] = useState('');
  const [testFormRating, setTestFormRating] = useState(5);
  const [testFormText, setTestFormText] = useState('');
  const [testFormAvatar, setTestFormAvatar] = useState('');

  // Form Variables - FAQ
  const [faqFormQuestion, setFaqFormQuestion] = useState('');
  const [faqFormAnswer, setFaqFormAnswer] = useState('');
  const [faqFormCategory, setFaqFormCategory] = useState('Booking');

  // Form Variables - Gallery
  const [galleryFormTitle, setGalleryFormTitle] = useState('');
  const [galleryFormCategory, setGalleryFormCategory] = useState('Weddings');
  const [galleryFormImage, setGalleryFormImage] = useState('');
  const [galleryFormAspect, setGalleryFormAspect] = useState('aspect-[4/3]');

  // Image upload options states
  const [testimonialImgSource, setTestimonialImgSource] = useState<'url' | 'file'>('url');
  const [galleryImgSource, setGalleryImgSource] = useState<'url' | 'file'>('url');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setUrlState: (url: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setUrlState(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Show positive alert
  const showAlert = (msg: string) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Synchronize localStorage on mount
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPkgs = localStorage.getItem('gc_packages');
      if (savedPkgs) {
        setPackagesList(JSON.parse(savedPkgs));
      } else {
        localStorage.setItem('gc_packages', JSON.stringify(packagesList));
      }
      
      const savedTests = localStorage.getItem('gc_testimonials');
      if (savedTests) {
        setTestimonialsList(JSON.parse(savedTests));
      } else {
        localStorage.setItem('gc_testimonials', JSON.stringify(testimonialsList));
      }
      
      const savedFaqs = localStorage.getItem('gc_faqs');
      if (savedFaqs) {
        setFaqsList(JSON.parse(savedFaqs));
      } else {
        localStorage.setItem('gc_faqs', JSON.stringify(faqsList));
      }
      
      const savedGal = localStorage.getItem('gc_gallery');
      if (savedGal) {
        setGalleryList(JSON.parse(savedGal));
      } else {
        setGalleryList(defaultGalleryItems);
        localStorage.setItem('gc_gallery', JSON.stringify(defaultGalleryItems));
      }
    }
  }, []);

  // --- Packages Logic ---
  const handleSavePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    
    const updated = packagesList.map(p => p.id === editingPackage.id ? editingPackage : p);
    setPackagesList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gc_packages', JSON.stringify(updated));
    }
    setEditingPackage(null);
    showAlert('Package parameters and features successfully updated.');
  };

  const togglePackageFeature = (featureIdx: number) => {
    if (!editingPackage) return;
    const updatedFeatures = [...editingPackage.features];
    updatedFeatures[featureIdx].included = !updatedFeatures[featureIdx].included;
    setEditingPackage({ ...editingPackage, features: updatedFeatures });
  };

  // --- Testimonials Logic ---
  const handleOpenAddTestimonial = () => {
    setTestFormName('');
    setTestFormEvent('');
    setTestFormRating(5);
    setTestFormText('');
    setTestFormAvatar('https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop');
    setTestimonialImgSource('url');
    setIsAddingTestimonial(true);
  };

  const handleOpenEditTestimonial = (test: Testimonial) => {
    setEditingTestimonial(test);
    setTestFormName(test.name);
    setTestFormEvent(test.event);
    setTestFormRating(test.rating);
    setTestFormText(test.text);
    setTestFormAvatar(test.avatar);
    setTestimonialImgSource('url');
  };

  const handleSaveTestimonial = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: Testimonial[];
    if (isAddingTestimonial) {
      const newTest: Testimonial = {
        id: `test-${Date.now()}`,
        name: testFormName,
        event: testFormEvent,
        rating: testFormRating,
        text: testFormText,
        avatar: testFormAvatar,
      };
      updated = [...testimonialsList, newTest];
      setTestimonialsList(updated);
      setIsAddingTestimonial(false);
      showAlert('New testimonial successfully created and added to landing pool.');
    } else if (editingTestimonial) {
      updated = testimonialsList.map(t => t.id === editingTestimonial.id ? {
        ...t,
        name: testFormName,
        event: testFormEvent,
        rating: testFormRating,
        text: testFormText,
        avatar: testFormAvatar,
      } : t);
      setTestimonialsList(updated);
      setEditingTestimonial(null);
      showAlert('Testimonial details updated.');
    } else {
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('gc_testimonials', JSON.stringify(updated));
    }
  };

  const handleDeleteTestimonial = (id: string) => {
    if (!window.confirm('Delete this testimonial?')) return;
    const updated = testimonialsList.filter(t => t.id !== id);
    setTestimonialsList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gc_testimonials', JSON.stringify(updated));
    }
    showAlert('Testimonial removed from active roster.');
  };

  // --- FAQs Logic ---
  const handleOpenAddFAQ = () => {
    setFaqFormQuestion('');
    setFaqFormAnswer('');
    setFaqFormCategory('Booking');
    setIsAddingFAQ(true);
  };

  const handleOpenEditFAQ = (faq: FAQItem) => {
    setEditingFAQ(faq);
    setFaqFormQuestion(faq.question);
    setFaqFormAnswer(faq.answer);
    setFaqFormCategory(faq.category);
  };

  const handleSaveFAQ = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: FAQItem[];
    if (isAddingFAQ) {
      const newFaq: FAQItem = {
        id: `faq-${Date.now()}`,
        question: faqFormQuestion,
        answer: faqFormAnswer,
        category: faqFormCategory,
      };
      updated = [...faqsList, newFaq];
      setFaqsList(updated);
      setIsAddingFAQ(false);
      showAlert('New FAQ item published to support desk.');
    } else if (editingFAQ) {
      updated = faqsList.map(f => f.id === editingFAQ.id ? {
        ...f,
        question: faqFormQuestion,
        answer: faqFormAnswer,
        category: faqFormCategory,
      } : f);
      setFaqsList(updated);
      setEditingFAQ(null);
      showAlert('FAQ content successfully modified.');
    } else {
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('gc_faqs', JSON.stringify(updated));
    }
  };

  const handleDeleteFAQ = (id: string) => {
    if (!window.confirm('Remove this FAQ item?')) return;
    const updated = faqsList.filter(f => f.id !== id);
    setFaqsList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gc_faqs', JSON.stringify(updated));
    }
    showAlert('FAQ item removed.');
  };

  // --- Gallery Logic ---
  const handleOpenAddGallery = () => {
    setGalleryFormTitle('');
    setGalleryFormCategory('Weddings');
    setGalleryFormImage('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop');
    setGalleryFormAspect('aspect-[4/3]');
    setGalleryImgSource('url');
    setIsAddingGallery(true);
  };

  const handleOpenEditGallery = (item: any) => {
    setEditingGallery(item);
    setGalleryFormTitle(item.title);
    setGalleryFormCategory(item.category);
    setGalleryFormImage(item.image);
    setGalleryFormAspect(item.aspect || 'aspect-[4/3]');
    setGalleryImgSource('url');
  };

  const handleSaveGallery = (e: React.FormEvent) => {
    e.preventDefault();
    let updated: any[];
    if (isAddingGallery) {
      const newItem = {
        id: `gal-${Date.now()}`,
        title: galleryFormTitle,
        category: galleryFormCategory,
        image: galleryFormImage,
        aspect: galleryFormAspect,
      };
      updated = [...galleryList, newItem];
      setGalleryList(updated);
      setIsAddingGallery(false);
      showAlert('New gallery image successfully added.');
    } else if (editingGallery) {
      updated = galleryList.map(item => item.id === editingGallery.id ? {
        ...item,
        title: galleryFormTitle,
        category: galleryFormCategory,
        image: galleryFormImage,
        aspect: galleryFormAspect,
      } : item);
      setGalleryList(updated);
      setEditingGallery(null);
      showAlert('Gallery image specifications updated.');
    } else {
      return;
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('gc_gallery', JSON.stringify(updated));
    }
  };

  const handleDeleteGallery = (id: string) => {
    if (!window.confirm('Delete this gallery image?')) return;
    const updated = galleryList.filter(item => item.id !== id);
    setGalleryList(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('gc_gallery', JSON.stringify(updated));
    }
    showAlert('Gallery image removed.');
  };

  return (
    <div className="space-y-6 relative min-h-[80vh]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gold-400/20 pb-4 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-gold-400 animate-pulse-gold" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-gold-500">Live Website Sync</span>
          </div>
          <h2 className="font-serif text-3xl font-bold text-foreground">Content Management System</h2>
          <p className="text-xs text-foreground/50">Manage public content shown on the landing page, update packages, and customize testimonial lists</p>
        </div>

        {/* Action button based on tab */}
        <div>
          {activeTab === 'TESTIMONIALS' && (
            <button
              onClick={handleOpenAddTestimonial}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-4.5 py-2.5 text-xs font-bold text-zinc-950 uppercase shadow-md hover:opacity-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Testimonial
            </button>
          )}
          {activeTab === 'FAQS' && (
            <button
              onClick={handleOpenAddFAQ}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-4.5 py-2.5 text-xs font-bold text-zinc-950 uppercase shadow-md hover:opacity-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add FAQ
            </button>
          )}
          {activeTab === 'GALLERY' && (
            <button
              onClick={handleOpenAddGallery}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-4.5 py-2.5 text-xs font-bold text-zinc-950 uppercase shadow-md hover:opacity-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Gallery Image
            </button>
          )}
        </div>
      </div>

      {successMsg && (
        <div className="flex items-start gap-2.5 text-xs text-emerald-600 bg-emerald-500/5 p-4 rounded-xl border border-emerald-500/10">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gold-400/10 pb-2 overflow-x-auto no-scrollbar">
        {[
          { id: 'PACKAGES', label: 'Banqueting Packages', icon: Award },
          { id: 'TESTIMONIALS', label: 'Client Reviews', icon: MessageSquare },
          { id: 'FAQS', label: 'Support FAQs', icon: HelpCircle },
          { id: 'GALLERY', label: 'Gallery Management', icon: Image },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all cursor-pointer shrink-0 ${
              activeTab === tab.id 
                ? 'bg-gradient-to-r from-gold-400/10 to-gold-400/5 text-gold-500 border-gold-400/35 shadow-sm' 
                : 'border-transparent text-foreground/60 hover:text-gold-400 hover:bg-gold-400/5'
            }`}
          >
            <tab.icon className="h-3.5 w-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Panel Content */}
      <div className="bg-white dark:bg-zinc-900 border border-gold-400/10 rounded-2xl p-6 shadow-sm min-h-[45vh]">
        
        {/* --- 1. PACKAGES PANEL --- */}
        {activeTab === 'PACKAGES' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packagesList.map((pkg) => {
              const featuresList = JSON.parse(JSON.stringify(pkg.features)) as Feature[];
              const includedCount = featuresList.filter(f => f.included).length;

              return (
                <div key={pkg.id} className="border border-gold-400/10 hover:border-gold-400/30 bg-gold-400/5/10 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-all space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-block rounded-full bg-gold-400/10 text-gold-500 text-[8px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 border border-gold-400/15">{pkg.badge}</span>
                        <h3 className="font-serif text-lg font-bold text-foreground mt-1.5">{pkg.name}</h3>
                      </div>
                      <span className="font-serif text-xl font-bold text-gold-500">₹{pkg.price} <span className="text-[10px] font-sans font-medium text-foreground/45">/ guest</span></span>
                    </div>

                    <p className="text-xs text-foreground/60 leading-relaxed">{pkg.desc}</p>
                    <div className="h-[1px] bg-gold-400/10" />

                    <div className="space-y-2">
                      <span className="text-[9px] font-extrabold text-foreground/50 uppercase tracking-wider">Features Included ({includedCount}/{featuresList.length})</span>
                      <div className="grid grid-cols-1 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
                        {featuresList.slice(0, 5).map((f, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-[10px]">
                            {f.included ? (
                              <Check className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                            ) : (
                              <X className="h-3.5 w-3.5 text-foreground/25 shrink-0" />
                            )}
                            <span className={f.included ? 'text-foreground/80 font-medium' : 'text-foreground/40 line-through'}>{f.name}</span>
                          </div>
                        ))}
                        {featuresList.length > 5 && (
                          <span className="text-[9px] text-gold-500 font-bold block pt-1">+ {featuresList.length - 5} More Features</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => setEditingPackage(pkg)}
                    className="w-full flex items-center justify-center gap-1 rounded-xl border border-gold-400/20 text-gold-500 hover:bg-gold-400/5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                  >
                    <Edit className="h-3.5 w-3.5" /> Edit Package Specs
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* --- 2. TESTIMONIALS PANEL --- */}
        {activeTab === 'TESTIMONIALS' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-gold-400/10 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gold-400/5 font-serif text-[11px] font-bold text-foreground border-b border-gold-400/15">
                    <th className="p-4 w-12">Avatar</th>
                    <th className="p-4 w-48">Client Name</th>
                    <th className="p-4 w-40">Celebration Event</th>
                    <th className="p-4 w-24">Rating</th>
                    <th className="p-4">Review Content</th>
                    <th className="p-4 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-400/10 text-foreground/80">
                  {testimonialsList.map((test) => (
                    <tr key={test.id} className="hover:bg-gold-400/5 transition-colors">
                      <td className="p-4">
                        <img 
                          src={test.avatar} 
                          alt={test.name} 
                          className="h-9 w-9 rounded-full object-cover border border-gold-400/20 shadow-inner"
                        />
                      </td>
                      <td className="p-4 font-bold text-foreground">{test.name}</td>
                      <td className="p-4 font-medium text-foreground">{test.event}</td>
                      <td className="p-4 text-gold-500">
                        <div className="flex gap-0.5">
                          {[...Array(test.rating)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-gold-400 text-gold-400" />
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-[11px] leading-relaxed text-foreground/70">{test.text}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditTestimonial(test)}
                            className="p-1.5 text-gold-600 hover:text-gold-500 rounded hover:bg-gold-400/10 cursor-pointer"
                            title="Edit Review"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTestimonial(test.id)}
                            className="p-1.5 text-red-500 hover:text-red-600 rounded hover:bg-red-500/10 cursor-pointer"
                            title="Delete Review"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {testimonialsList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-foreground/40">No client reviews currently published.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- 3. FAQS PANEL --- */}
        {activeTab === 'FAQS' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-gold-400/10 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gold-400/5 font-serif text-[11px] font-bold text-foreground border-b border-gold-400/15">
                    <th className="p-4 w-28">Category</th>
                    <th className="p-4 w-72">Question</th>
                    <th className="p-4">Answer Details</th>
                    <th className="p-4 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-400/10 text-foreground/80">
                  {faqsList.map((faq) => (
                    <tr key={faq.id} className="hover:bg-gold-400/5 transition-colors">
                      <td className="p-4">
                        <span className="rounded px-2 py-0.5 bg-gold-400/10 text-gold-500 text-[8px] font-bold uppercase tracking-wider">
                          {faq.category}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-foreground leading-snug">{faq.question}</td>
                      <td className="p-4 text-[11px] leading-relaxed text-foreground/70">{faq.answer}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditFAQ(faq)}
                            className="p-1.5 text-gold-600 hover:text-gold-500 rounded hover:bg-gold-400/10 cursor-pointer"
                            title="Edit FAQ"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteFAQ(faq.id)}
                            className="p-1.5 text-red-500 hover:text-red-600 rounded hover:bg-red-500/10 cursor-pointer"
                            title="Delete FAQ"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {faqsList.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-foreground/40">No FAQ articles published.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- 4. GALLERY PANEL --- */}
        {activeTab === 'GALLERY' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryList.map((item) => (
                <div key={item.id} className="group relative rounded-xl overflow-hidden border border-gold-400/10 hover:border-gold-400/30 bg-gold-400/5 transition-all flex flex-col justify-between">
                  <div className="relative aspect-video w-full overflow-hidden bg-zinc-800">
                    <img src={item.image} alt={item.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                    <span className="absolute top-2 left-2 rounded bg-zinc-950/80 px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider text-gold-400 border border-gold-400/20">
                      {item.category}
                    </span>
                  </div>
                  <div className="p-3.5 space-y-3">
                    <div>
                      <h4 className="font-serif text-xs font-bold text-foreground truncate">{item.title}</h4>
                      <p className="text-[9px] text-foreground/50 mt-0.5 uppercase tracking-wide">{item.aspect || 'aspect-[4/3]'}</p>
                    </div>
                    <div className="flex gap-1.5 justify-end">
                      <button
                        onClick={() => handleOpenEditGallery(item)}
                        className="p-1.5 rounded bg-gold-400/10 text-gold-500 hover:bg-gold-500 hover:text-zinc-950 transition-colors cursor-pointer"
                        title="Edit Details"
                      >
                        <Edit className="h-3 w-3" />
                      </button>
                      <button
                        onClick={() => handleDeleteGallery(item.id)}
                        className="p-1.5 rounded bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                        title="Delete Image"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {galleryList.length === 0 && (
                <div className="col-span-full py-12 text-center text-foreground/40 text-xs">
                  No images currently added to gallery portfolio.
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* =======================================================
          MODAL: PACKAGE SPECIFICATION EDITOR
      ======================================================= */}
      <AnimatePresence>
        {editingPackage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingPackage(null)}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            />
            {/* Box */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-gold-400/20 rounded-3xl p-6 shadow-xl space-y-6 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start border-b border-gold-400/10 pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">Modify {editingPackage.name}</h3>
                  <p className="text-[10px] text-foreground/50">Adjust specifications and active features pool</p>
                </div>
                <button 
                  onClick={() => setEditingPackage(null)}
                  className="p-1.5 rounded-lg hover:bg-gold-400/15 text-foreground/50 hover:text-gold-500 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSavePackage} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1">Price per guest (INR)</label>
                    <input 
                      type="number"
                      value={editingPackage.price}
                      onChange={(e) => setEditingPackage({ ...editingPackage, price: Number(e.target.value) || 0 })}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 outline-none focus:border-gold-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1">Badge Tagline</label>
                    <input 
                      type="text"
                      value={editingPackage.badge}
                      onChange={(e) => setEditingPackage({ ...editingPackage, badge: e.target.value })}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 outline-none focus:border-gold-500 font-semibold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-foreground/75 mb-1">Description</label>
                  <textarea 
                    value={editingPackage.desc}
                    onChange={(e) => setEditingPackage({ ...editingPackage, desc: e.target.value })}
                    rows={2}
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 outline-none focus:border-gold-500 font-medium leading-relaxed"
                  />
                </div>

                <div className="space-y-2 border-t border-gold-400/10 pt-3">
                  <span className="block font-bold text-foreground/60 uppercase tracking-wider text-[9px] mb-1">Features Toggle Checklist</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[200px] overflow-y-auto pr-1">
                    {editingPackage.features.map((feat, idx) => (
                      <div 
                        key={idx} 
                        onClick={() => togglePackageFeature(idx)}
                        className={`flex items-center justify-between p-2.5 rounded-xl border cursor-pointer transition-all ${
                          feat.included 
                            ? 'bg-gold-400/5 border-gold-400/25 text-foreground' 
                            : 'border-gold-400/5 text-foreground/45 bg-zinc-50/50 dark:bg-zinc-900/10'
                        }`}
                      >
                        <span className="font-medium text-[10px]">{feat.name}</span>
                        {feat.included ? (
                          <Check className="h-3.5 w-3.5 text-gold-500 shrink-0" />
                        ) : (
                          <X className="h-3.5 w-3.5 opacity-25 shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gold-400/10 pt-4 flex gap-2 justify-end">
                  <button 
                    type="button" 
                    onClick={() => setEditingPackage(null)}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-foreground font-bold rounded-xl uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-gold-600 to-gold-400 text-zinc-950 font-bold rounded-xl uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" /> Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =======================================================
          MODAL: TESTIMONIAL EDITOR / CREATOR
      ======================================================= */}
      <AnimatePresence>
        {(isAddingTestimonial || editingTestimonial) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddingTestimonial(false); setEditingTestimonial(null); }}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-gold-400/20 rounded-3xl p-6 shadow-xl space-y-6"
            >
              <div className="flex justify-between items-start border-b border-gold-400/10 pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    {isAddingTestimonial ? 'Publish Client Review' : 'Edit Review Details'}
                  </h3>
                  <p className="text-[10px] text-foreground/50">Configure testimonial data rendered in homepage carousel</p>
                </div>
                <button 
                  onClick={() => { setIsAddingTestimonial(false); setEditingTestimonial(null); }}
                  className="p-1.5 rounded-lg hover:bg-gold-400/15 text-foreground/50 hover:text-gold-500 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveTestimonial} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1">Client Name</label>
                    <input 
                      type="text"
                      required
                      value={testFormName}
                      onChange={(e) => setTestFormName(e.target.value)}
                      placeholder="e.g. Ramesh & Sunita"
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 outline-none focus:border-gold-500 font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1">Celebrated Event</label>
                    <input 
                      type="text"
                      required
                      value={testFormEvent}
                      onChange={(e) => setTestFormEvent(e.target.value)}
                      placeholder="e.g. Silver Jubilee Anniversary"
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 outline-none focus:border-gold-500 font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-1">
                    <label className="block font-bold text-foreground/75 mb-1">Rating Stars</label>
                    <select
                      value={testFormRating}
                      onChange={(e) => setTestFormRating(Number(e.target.value))}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 outline-none focus:border-gold-500 font-bold"
                    >
                      <option value={5}>5 Stars</option>
                      <option value={4}>4 Stars</option>
                      <option value={3}>3 Stars</option>
                    </select>
                  </div>
                  <div className="col-span-2 space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block font-bold text-foreground/75">Avatar Image</label>
                      <div className="flex gap-2 text-[9px] uppercase tracking-wider font-extrabold">
                        <button
                          type="button"
                          onClick={() => setTestimonialImgSource('url')}
                          className={`px-2 py-0.5 rounded transition-all cursor-pointer ${testimonialImgSource === 'url' ? 'bg-gold-500 text-zinc-950 font-bold' : 'bg-gold-400/10 text-gold-500'}`}
                        >
                          URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setTestimonialImgSource('file')}
                          className={`px-2 py-0.5 rounded transition-all cursor-pointer ${testimonialImgSource === 'file' ? 'bg-gold-500 text-zinc-950 font-bold' : 'bg-gold-400/10 text-gold-500'}`}
                        >
                          Device
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {testFormAvatar && (
                        <div className="h-10 w-10 shrink-0 rounded-full border border-gold-400/20 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                          <img src={testFormAvatar} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        {testimonialImgSource === 'url' ? (
                          <input 
                            key="testimonial-avatar-url"
                            type="text"
                            placeholder="https://..."
                            value={testFormAvatar || ''}
                            onChange={(e) => setTestFormAvatar(e.target.value)}
                            className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 outline-none focus:border-gold-500 font-medium"
                          />
                        ) : (
                          <input 
                            key="testimonial-avatar-file"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, setTestFormAvatar)}
                            className="w-full text-xs text-foreground/70 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-extrabold file:uppercase file:bg-gold-400/10 file:text-gold-500 file:cursor-pointer hover:file:bg-gold-400/20 bg-ivory-50/50 dark:bg-zinc-950 rounded-xl border border-gold-400/15 py-1 px-3 outline-none"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-foreground/75 mb-1">Review Statement</label>
                  <textarea 
                    required
                    value={testFormText}
                    onChange={(e) => setTestFormText(e.target.value)}
                    rows={4}
                    placeholder="Provide a client review quote..."
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 outline-none focus:border-gold-500 font-medium leading-relaxed"
                  />
                </div>

                <div className="border-t border-gold-400/10 pt-4 flex gap-2 justify-end">
                  <button 
                    type="button" 
                    onClick={() => { setIsAddingTestimonial(false); setEditingTestimonial(null); }}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-foreground font-bold rounded-xl uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-gold-600 to-gold-400 text-zinc-950 font-bold rounded-xl uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" /> Publish Review
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =======================================================
          MODAL: FAQ EDITOR / CREATOR
      ======================================================= */}
      <AnimatePresence>
        {(isAddingFAQ || editingFAQ) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddingFAQ(false); setEditingFAQ(null); }}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-gold-400/20 rounded-3xl p-6 shadow-xl space-y-6"
            >
              <div className="flex justify-between items-start border-b border-gold-400/10 pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    {isAddingFAQ ? 'Create FAQ Article' : 'Edit FAQ Article'}
                  </h3>
                  <p className="text-[10px] text-foreground/50">Manage default questions published in landing page FAQ dropdowns</p>
                </div>
                <button 
                  onClick={() => { setIsAddingFAQ(false); setEditingFAQ(null); }}
                  className="p-1.5 rounded-lg hover:bg-gold-400/15 text-foreground/50 hover:text-gold-500 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveFAQ} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-foreground/75 mb-1">FAQ Category</label>
                  <select
                    value={faqFormCategory}
                    onChange={(e) => setFaqFormCategory(e.target.value)}
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 outline-none focus:border-gold-500 font-bold"
                  >
                    <option value="Booking">Booking & Deposits</option>
                    <option value="Logistics">Venue Logistics & Parking</option>
                    <option value="Catering">Catering Rules & Decor</option>
                    <option value="Policies">Cancellation & Rescheduling</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-foreground/75 mb-1">Question Statement</label>
                  <input 
                    type="text"
                    required
                    value={faqFormQuestion}
                    onChange={(e) => setFaqFormQuestion(e.target.value)}
                    placeholder="e.g. Do you allow external caterers?"
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 outline-none focus:border-gold-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-foreground/75 mb-1">Answer explanation</label>
                  <textarea 
                    required
                    value={faqFormAnswer}
                    onChange={(e) => setFaqFormAnswer(e.target.value)}
                    rows={4}
                    placeholder="Provide a brief explanation response..."
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 outline-none focus:border-gold-500 font-medium leading-relaxed"
                  />
                </div>

                <div className="border-t border-gold-400/10 pt-4 flex gap-2 justify-end">
                  <button 
                    type="button" 
                    onClick={() => { setIsAddingFAQ(false); setEditingFAQ(null); }}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-foreground font-bold rounded-xl uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-gold-600 to-gold-400 text-zinc-950 font-bold rounded-xl uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" /> Publish Article
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =======================================================
          MODAL: GALLERY IMAGE EDITOR / CREATOR
      ======================================================= */}
      <AnimatePresence>
        {(isAddingGallery || editingGallery) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddingGallery(false); setEditingGallery(null); }}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-gold-400/20 rounded-3xl p-6 shadow-xl space-y-6 z-10"
            >
              <div className="flex justify-between items-start border-b border-gold-400/10 pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    {isAddingGallery ? 'Add Gallery Image' : 'Edit Gallery Details'}
                  </h3>
                  <p className="text-[10px] text-foreground/50">Manage image link, category categorization and rendering layout</p>
                </div>
                <button 
                  onClick={() => { setIsAddingGallery(false); setEditingGallery(null); }}
                  className="p-1.5 rounded-lg hover:bg-gold-400/15 text-foreground/50 hover:text-gold-500 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveGallery} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-foreground/75 mb-1">Image Title / Label</label>
                  <input 
                    type="text"
                    required
                    value={galleryFormTitle}
                    onChange={(e) => setGalleryFormTitle(e.target.value)}
                    placeholder="e.g. Royal Stage Backdrop"
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 outline-none focus:border-gold-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1">Category Filter</label>
                    <select
                      value={galleryFormCategory}
                      onChange={(e) => setGalleryFormCategory(e.target.value)}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 outline-none focus:border-gold-500 font-bold"
                    >
                      <option value="Weddings">Weddings</option>
                      <option value="Receptions">Receptions</option>
                      <option value="Engagements">Engagements</option>
                      <option value="Birthdays">Birthdays</option>
                      <option value="Corporate Events">Corporate Events</option>
                      <option value="Decorations">Decorations</option>
                      <option value="Night View">Night View</option>
                      <option value="Stage Designs">Stage Designs</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-foreground/75 mb-1">Public Grid Aspect Ratio</label>
                    <select
                      value={galleryFormAspect}
                      onChange={(e) => setGalleryFormAspect(e.target.value)}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 outline-none focus:border-gold-500 font-bold"
                    >
                      <option value="aspect-video">Landscape (Video Aspect)</option>
                      <option value="aspect-square">Square (1:1)</option>
                      <option value="aspect-[4/3]">Standard Photo (4:3)</option>
                      <option value="aspect-[3/4]">Portrait Photo (3:4)</option>
                      <option value="aspect-[4/5]">Long Portrait (4:5)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="block font-bold text-foreground/75">Gallery Image</label>
                    <div className="flex gap-2 text-[9px] uppercase tracking-wider font-extrabold">
                      <button
                        type="button"
                        onClick={() => setGalleryImgSource('url')}
                        className={`px-2 py-0.5 rounded transition-all cursor-pointer ${galleryImgSource === 'url' ? 'bg-gold-500 text-zinc-950 font-bold' : 'bg-gold-400/10 text-gold-500'}`}
                      >
                        URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setGalleryImgSource('file')}
                        className={`px-2 py-0.5 rounded transition-all cursor-pointer ${galleryImgSource === 'file' ? 'bg-gold-500 text-zinc-950 font-bold' : 'bg-gold-400/10 text-gold-500'}`}
                      >
                        Device
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {galleryFormImage && (
                      <div className="h-10 w-16 shrink-0 rounded-lg border border-gold-400/20 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                        <img src={galleryFormImage} alt="Preview" className="h-full w-full object-cover" />
                      </div>
                    )}
                    <div className="flex-1">
                      {galleryImgSource === 'url' ? (
                        <input 
                          key="gallery-image-url"
                          type="text"
                          placeholder="https://..."
                          value={galleryFormImage || ''}
                          onChange={(e) => setGalleryFormImage(e.target.value)}
                          className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 outline-none focus:border-gold-500 font-medium"
                          required={galleryImgSource === 'url'}
                        />
                      ) : (
                        <input 
                          key="gallery-image-file"
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChange(e, setGalleryFormImage)}
                          className="w-full text-xs text-foreground/70 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-extrabold file:uppercase file:bg-gold-400/10 file:text-gold-500 file:cursor-pointer hover:file:bg-gold-400/20 bg-ivory-50/50 dark:bg-zinc-950 rounded-xl border border-gold-400/15 py-1 px-3 outline-none"
                        />
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-gold-400/10 pt-4 flex gap-2 justify-end">
                  <button 
                    type="button" 
                    onClick={() => { setIsAddingGallery(false); setEditingGallery(null); }}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-foreground font-bold rounded-xl uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-gold-600 to-gold-400 text-zinc-950 font-bold rounded-xl uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" /> Save Image
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
