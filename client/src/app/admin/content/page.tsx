'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, Award, Star, MessageSquare, Plus, Trash2, Edit, 
  Save, Check, X, HelpCircle, CheckCircle2, Image, ToggleLeft, ToggleRight, ArrowUp, ArrowDown
} from 'lucide-react';
import { cmsService } from '../../../services/cms';

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
  color?: string | null;
  accent?: string | null;
  isActive: boolean;
  order: number;
}

interface Testimonial {
  id: string;
  name: string;
  event: string;
  rating: number;
  avatar: string | null;
  text: string;
  isActive: boolean;
  order: number;
}

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  isActive: boolean;
  order: number;
}

export default function ContentManagementPage() {
  const [activeTab, setActiveTab] = useState<'PACKAGES' | 'SERVICES' | 'TESTIMONIALS' | 'FAQS' | 'GALLERY'>('PACKAGES');
  const [successMsg, setSuccessMsg] = useState('');

  // CMS Lists States
  const [packagesList, setPackagesList] = useState<Package[]>([]);
  const [servicesList, setServicesList] = useState<any[]>([]);
  const [testimonialsList, setTestimonialsList] = useState<Testimonial[]>([]);
  const [faqsList, setFaqsList] = useState<FAQItem[]>([]);
  const [galleryList, setGalleryList] = useState<any[]>([]);

  // Modals / Forms States
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  
  const [editingService, setEditingService] = useState<any | null>(null);
  const [isAddingService, setIsAddingService] = useState(false);
  const [serviceFormTitle, setServiceFormTitle] = useState('');
  const [serviceFormDesc, setServiceFormDesc] = useState('');
  const [serviceFormImage, setServiceFormImage] = useState('');
  const [serviceFormIconName, setServiceFormIconName] = useState('Sparkles');
  const [serviceImgSource, setServiceImgSource] = useState<'url' | 'file'>('url');

  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [isAddingTestimonial, setIsAddingTestimonial] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState<FAQItem | null>(null);
  const [isAddingFAQ, setIsAddingFAQ] = useState(false);
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

  // Fetch all CMS lists on mount
  const loadCMSData = () => {
    cmsService.getAdminPackages().then(setPackagesList).catch(console.error);
    cmsService.getAdminServices().then(setServicesList).catch(console.error);
    cmsService.getAdminTestimonials().then(setTestimonialsList).catch(console.error);
    cmsService.getAdminFAQs().then(setFaqsList).catch(console.error);
    cmsService.getAdminGallery().then(setGalleryList).catch(console.error);
  };

  useEffect(() => {
    loadCMSData();
  }, []);

  // --- Packages Logic ---
  const handleSavePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;
    try {
      await cmsService.updatePackage(editingPackage.id, editingPackage);
      setEditingPackage(null);
      loadCMSData();
      showAlert('Package parameters and features successfully updated.');
    } catch (err: any) {
      alert(err.message || 'Failed to save package.');
    }
  };

  const handleTogglePackage = async (id: string, currentActive: boolean) => {
    try {
      await cmsService.togglePackageActive(id, !currentActive);
      loadCMSData();
      showAlert('Package active state successfully changed.');
    } catch (err: any) {
      alert(err.message || 'Failed to toggle active state.');
    }
  };

  const handleReorderPackage = async (index: number, direction: 'up' | 'down') => {
    const newList = [...packagesList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;
    
    // Swap
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    try {
      await cmsService.reorderPackages(newList.map(p => p.id));
      loadCMSData();
      showAlert('Packages reordered.');
    } catch (err: any) {
      alert(err.message || 'Failed to reorder.');
    }
  };

  const togglePackageFeature = (featureIdx: number) => {
    if (!editingPackage) return;
    const updatedFeatures = [...editingPackage.features];
    updatedFeatures[featureIdx].included = !updatedFeatures[featureIdx].included;
    setEditingPackage({ ...editingPackage, features: updatedFeatures });
  };

  // --- Services Logic ---
  const handleOpenAddService = () => {
    setServiceFormTitle('');
    setServiceFormDesc('');
    setServiceFormImage('https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=400&auto=format&fit=crop');
    setServiceFormIconName('Sparkles');
    setServiceImgSource('url');
    setIsAddingService(true);
  };

  const handleOpenEditService = (service: any) => {
    setEditingService(service);
    setServiceFormTitle(service.title);
    setServiceFormDesc(service.desc);
    setServiceFormImage(service.image);
    setServiceFormIconName(service.iconName || 'Sparkles');
    setServiceImgSource('url');
  };

  const handleSaveService = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: serviceFormTitle,
        desc: serviceFormDesc,
        image: serviceFormImage,
        iconName: serviceFormIconName,
      };

      if (isAddingService) {
        await cmsService.addService(payload as any);
        setIsAddingService(false);
        showAlert('New event service successfully created and published.');
      } else if (editingService) {
        await cmsService.updateService(editingService.id, payload as any);
        setEditingService(null);
        showAlert('Service specifications successfully updated.');
      }
      loadCMSData();
    } catch (err: any) {
      alert(err.message || 'Failed to save service.');
    }
  };

  const handleDeleteService = async (id: string) => {
    if (!window.confirm('Delete this service?')) return;
    try {
      await cmsService.deleteService(id);
      loadCMSData();
      showAlert('Service removed successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to delete service.');
    }
  };

  const handleToggleService = async (id: string, currentActive: boolean) => {
    try {
      await cmsService.toggleServiceActive(id, !currentActive);
      loadCMSData();
      showAlert('Service status toggled successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to toggle service.');
    }
  };

  const handleReorderService = async (index: number, direction: 'up' | 'down') => {
    const newList = [...servicesList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;
    
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    try {
      await cmsService.reorderServices(newList.map(s => s.id));
      loadCMSData();
      showAlert('Services reordered.');
    } catch (err: any) {
      alert(err.message || 'Failed to reorder.');
    }
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
    setTestFormAvatar(test.avatar || '');
    setTestimonialImgSource('url');
  };

  const handleSaveTestimonial = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: testFormName,
        event: testFormEvent,
        rating: testFormRating,
        text: testFormText,
        avatar: testFormAvatar,
      };

      if (isAddingTestimonial) {
        await cmsService.addTestimonial(payload as any);
        setIsAddingTestimonial(false);
        showAlert('New testimonial successfully created and added to landing pool.');
      } else if (editingTestimonial) {
        await cmsService.updateTestimonial(editingTestimonial.id, payload as any);
        setEditingTestimonial(null);
        showAlert('Testimonial details updated.');
      }
      loadCMSData();
    } catch (err: any) {
      alert(err.message || 'Failed to save testimonial.');
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await cmsService.deleteTestimonial(id);
      loadCMSData();
      showAlert('Testimonial removed from active roster.');
    } catch (err: any) {
      alert(err.message || 'Failed to delete testimonial.');
    }
  };

  const handleToggleTestimonial = async (id: string, currentActive: boolean) => {
    try {
      await cmsService.toggleTestimonialActive(id, !currentActive);
      loadCMSData();
      showAlert('Testimonial active state changed.');
    } catch (err: any) {
      alert(err.message || 'Failed to toggle testimonial active state.');
    }
  };

  const handleReorderTestimonial = async (index: number, direction: 'up' | 'down') => {
    const newList = [...testimonialsList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;
    
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    try {
      await cmsService.reorderTestimonials(newList.map(t => t.id));
      loadCMSData();
      showAlert('Testimonials reordered.');
    } catch (err: any) {
      alert(err.message || 'Failed to reorder.');
    }
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

  const handleSaveFAQ = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        question: faqFormQuestion,
        answer: faqFormAnswer,
        category: faqFormCategory,
      };

      if (isAddingFAQ) {
        await cmsService.addFAQ(payload as any);
        setIsAddingFAQ(false);
        showAlert('New FAQ item published to support desk.');
      } else if (editingFAQ) {
        await cmsService.updateFAQ(editingFAQ.id, payload as any);
        setEditingFAQ(null);
        showAlert('FAQ content successfully modified.');
      }
      loadCMSData();
    } catch (err: any) {
      alert(err.message || 'Failed to save FAQ.');
    }
  };

  const handleDeleteFAQ = async (id: string) => {
    if (!window.confirm('Remove this FAQ item?')) return;
    try {
      await cmsService.deleteFAQ(id);
      loadCMSData();
      showAlert('FAQ item removed.');
    } catch (err: any) {
      alert(err.message || 'Failed to delete FAQ.');
    }
  };

  const handleToggleFAQ = async (id: string, currentActive: boolean) => {
    try {
      await cmsService.toggleFAQActive(id, !currentActive);
      loadCMSData();
      showAlert('FAQ status toggled successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to toggle FAQ.');
    }
  };

  const handleReorderFAQ = async (index: number, direction: 'up' | 'down') => {
    const newList = [...faqsList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;
    
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    try {
      await cmsService.reorderFAQs(newList.map(f => f.id));
      loadCMSData();
      showAlert('FAQs reordered.');
    } catch (err: any) {
      alert(err.message || 'Failed to reorder FAQs.');
    }
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

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: galleryFormTitle,
        category: galleryFormCategory,
        image: galleryFormImage,
        aspect: galleryFormAspect,
      };

      if (isAddingGallery) {
        await cmsService.addGalleryItem(payload as any);
        setIsAddingGallery(false);
        showAlert('New gallery image successfully added.');
      } else if (editingGallery) {
        await cmsService.updateGalleryItem(editingGallery.id, payload as any);
        setEditingGallery(null);
        showAlert('Gallery image specifications updated.');
      }
      loadCMSData();
    } catch (err: any) {
      alert(err.message || 'Failed to save gallery item.');
    }
  };

  const handleDeleteGallery = async (id: string) => {
    if (!window.confirm('Delete this gallery image?')) return;
    try {
      await cmsService.deleteGalleryItem(id);
      loadCMSData();
      showAlert('Gallery image removed.');
    } catch (err: any) {
      alert(err.message || 'Failed to delete gallery item.');
    }
  };

  const handleToggleGalleryItem = async (id: string, currentActive: boolean) => {
    try {
      await cmsService.toggleGalleryItemActive(id, !currentActive);
      loadCMSData();
      showAlert('Gallery image status toggled.');
    } catch (err: any) {
      alert(err.message || 'Failed to toggle gallery image.');
    }
  };

  const handleReorderGalleryItem = async (index: number, direction: 'up' | 'down') => {
    const newList = [...galleryList];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newList.length) return;
    
    const temp = newList[index];
    newList[index] = newList[targetIndex];
    newList[targetIndex] = temp;

    try {
      await cmsService.reorderGalleryItems(newList.map(g => g.id));
      loadCMSData();
      showAlert('Gallery items reordered.');
    } catch (err: any) {
      alert(err.message || 'Failed to reorder.');
    }
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
          {activeTab === 'SERVICES' && (
            <button
              onClick={handleOpenAddService}
              className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-4.5 py-2.5 text-xs font-bold text-zinc-950 uppercase shadow-md hover:opacity-95 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Add Service
            </button>
          )}
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
          { id: 'SERVICES', label: 'Event Services', icon: Sparkles },
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
            {packagesList.map((pkg, idx) => {
              const featuresList = JSON.parse(JSON.stringify(pkg.features)) as Feature[];
              const includedCount = featuresList.filter(f => f.included).length;

              return (
                <div key={pkg.id} className="border border-gold-400/10 hover:border-gold-400/30 bg-gold-400/5/10 rounded-3xl p-6 flex flex-col justify-between hover:shadow-md transition-all space-y-6">
                  <div className="flex justify-between items-center border-b border-gold-400/10 pb-2 mb-2">
                    <button
                      onClick={() => handleTogglePackage(pkg.id, pkg.isActive)}
                      className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-foreground/70"
                    >
                      {pkg.isActive ? (
                        <ToggleRight className="h-4.5 w-4.5 text-gold-500" />
                      ) : (
                        <ToggleLeft className="h-4.5 w-4.5 text-foreground/30" />
                      )}
                      <span>{pkg.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleReorderPackage(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-gold-400/10 text-foreground/50 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowUp className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleReorderPackage(idx, 'down')}
                        disabled={idx === packagesList.length - 1}
                        className="p-1 rounded hover:bg-gold-400/10 text-foreground/50 disabled:opacity-30 cursor-pointer"
                      >
                        <ArrowDown className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
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

        {/* --- 2. SERVICES PANEL --- */}
        {activeTab === 'SERVICES' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-gold-400/10 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gold-400/5 font-serif text-[11px] font-bold text-foreground border-b border-gold-400/15">
                    <th className="p-4 w-16">Image</th>
                    <th className="p-4 w-48">Service Title</th>
                    <th className="p-4 w-32">Icon Name</th>
                    <th className="p-4 w-20">Status</th>
                    <th className="p-4 w-24">Reorder</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-400/10 text-foreground/80">
                  {servicesList.map((service, idx) => (
                    <tr key={service.id} className="hover:bg-gold-400/5 transition-colors">
                      <td className="p-4">
                        <img 
                          src={service.image} 
                          alt={service.title} 
                          className="h-10 w-16 rounded object-cover border border-gold-400/20 shadow-inner"
                        />
                      </td>
                      <td className="p-4 font-bold text-foreground">{service.title}</td>
                      <td className="p-4 font-medium text-foreground">{service.iconName || 'Sparkles'}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleService(service.id, service.isActive)}
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-foreground/70"
                        >
                          {service.isActive ? (
                            <ToggleRight className="h-4.5 w-4.5 text-gold-500" />
                          ) : (
                            <ToggleLeft className="h-4.5 w-4.5 text-foreground/30" />
                          )}
                          <span>{service.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleReorderService(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-gold-400/10 text-foreground/50 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleReorderService(idx, 'down')}
                            disabled={idx === servicesList.length - 1}
                            className="p-1 rounded hover:bg-gold-400/10 text-foreground/50 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                      <td className="p-4 text-[11px] leading-relaxed text-foreground/70">{service.desc}</td>
                      <td className="p-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditService(service)}
                            className="p-1.5 text-gold-600 hover:text-gold-500 rounded hover:bg-gold-400/10 cursor-pointer"
                            title="Edit Service"
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteService(service.id)}
                            className="p-1.5 text-red-500 hover:text-red-600 rounded hover:bg-red-500/10 cursor-pointer"
                            title="Delete Service"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {servicesList.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-foreground/40">No services currently published.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- 3. TESTIMONIALS PANEL --- */}
        {activeTab === 'TESTIMONIALS' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-gold-400/10 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gold-400/5 font-serif text-[11px] font-bold text-foreground border-b border-gold-400/15">
                    <th className="p-4 w-12">Avatar</th>
                    <th className="p-4 w-40">Client Name</th>
                    <th className="p-4 w-32">Celebration Event</th>
                    <th className="p-4 w-20">Rating</th>
                    <th className="p-4 w-20">Status</th>
                    <th className="p-4 w-24">Reorder</th>
                    <th className="p-4">Review Content</th>
                    <th className="p-4 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-400/10 text-foreground/80">
                  {testimonialsList.map((test, idx) => (
                    <tr key={test.id} className="hover:bg-gold-400/5 transition-colors">
                      <td className="p-4">
                        <img 
                          src={test.avatar || undefined} 
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
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleTestimonial(test.id, test.isActive)}
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-foreground/70"
                        >
                          {test.isActive ? (
                            <ToggleRight className="h-4.5 w-4.5 text-gold-500" />
                          ) : (
                            <ToggleLeft className="h-4.5 w-4.5 text-foreground/30" />
                          )}
                          <span>{test.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleReorderTestimonial(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-gold-400/10 text-foreground/50 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleReorderTestimonial(idx, 'down')}
                            disabled={idx === testimonialsList.length - 1}
                            className="p-1 rounded hover:bg-gold-400/10 text-foreground/50 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
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
                      <td colSpan={8} className="p-8 text-center text-foreground/40">No client reviews currently published.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- 4. FAQS PANEL --- */}
        {activeTab === 'FAQS' && (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-gold-400/10 rounded-xl">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-gold-400/5 font-serif text-[11px] font-bold text-foreground border-b border-gold-400/15">
                    <th className="p-4 w-28">Category</th>
                    <th className="p-4 w-64">Question</th>
                    <th className="p-4 w-20">Status</th>
                    <th className="p-4 w-24">Reorder</th>
                    <th className="p-4">Answer Details</th>
                    <th className="p-4 text-right w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-400/10 text-foreground/80">
                  {faqsList.map((faq, idx) => (
                    <tr key={faq.id} className="hover:bg-gold-400/5 transition-colors">
                      <td className="p-4">
                        <span className="rounded px-2 py-0.5 bg-gold-400/10 text-gold-500 text-[8px] font-bold uppercase tracking-wider">
                          {faq.category}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-foreground leading-snug">{faq.question}</td>
                      <td className="p-4">
                        <button
                          onClick={() => handleToggleFAQ(faq.id, faq.isActive)}
                          className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-foreground/70"
                        >
                          {faq.isActive ? (
                            <ToggleRight className="h-4.5 w-4.5 text-gold-500" />
                          ) : (
                            <ToggleLeft className="h-4.5 w-4.5 text-foreground/30" />
                          )}
                          <span>{faq.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleReorderFAQ(idx, 'up')}
                            disabled={idx === 0}
                            className="p-1 rounded hover:bg-gold-400/10 text-foreground/50 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowUp className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleReorderFAQ(idx, 'down')}
                            disabled={idx === faqsList.length - 1}
                            className="p-1 rounded hover:bg-gold-400/10 text-foreground/50 disabled:opacity-30 cursor-pointer"
                          >
                            <ArrowDown className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
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
                      <td colSpan={6} className="p-8 text-center text-foreground/40">No FAQ articles published.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- 5. GALLERY PANEL --- */}
        {activeTab === 'GALLERY' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {galleryList.map((item, idx) => (
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
                    <div className="flex items-center justify-between border-t border-gold-400/10 pt-2 pb-1">
                      <button
                        onClick={() => handleToggleGalleryItem(item.id, item.isActive)}
                        className="flex items-center gap-1 text-[9px] font-extrabold uppercase tracking-wider text-foreground/60 hover:text-gold-500"
                      >
                        {item.isActive ? (
                          <ToggleRight className="h-4.5 w-4.5 text-gold-500" />
                        ) : (
                          <ToggleLeft className="h-4.5 w-4.5 text-foreground/30" />
                        )}
                        <span>{item.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                      <div className="flex items-center gap-0.5">
                        <button
                          onClick={() => handleReorderGalleryItem(idx, 'up')}
                          disabled={idx === 0}
                          className="p-1 rounded hover:bg-gold-400/10 text-foreground/50 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowUp className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => handleReorderGalleryItem(idx, 'down')}
                          disabled={idx === galleryList.length - 1}
                          className="p-1 rounded hover:bg-gold-400/10 text-foreground/50 disabled:opacity-30 cursor-pointer"
                        >
                          <ArrowDown className="h-3 w-3" />
                        </button>
                      </div>
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

      {/* =======================================================
          MODAL: SERVICE EDITOR / CREATOR
      ======================================================= */}
      <AnimatePresence>
        {(isAddingService || editingService) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setIsAddingService(false); setEditingService(null); }}
              className="absolute inset-0 bg-zinc-950/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-white dark:bg-zinc-900 border border-gold-400/20 rounded-3xl p-6 shadow-xl space-y-6 z-[60]"
            >
              <div className="flex justify-between items-start border-b border-gold-400/10 pb-3">
                <div>
                  <h3 className="font-serif text-lg font-bold text-foreground">
                    {isAddingService ? 'Publish Event Service' : 'Edit Service Details'}
                  </h3>
                  <p className="text-[10px] text-foreground/50">Configure service name, description, icon and image</p>
                </div>
                <button 
                  onClick={() => { setIsAddingService(false); setEditingService(null); }}
                  className="p-1.5 rounded-lg hover:bg-gold-400/15 text-foreground/50 hover:text-gold-500 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleSaveService} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-foreground/75 mb-1">Service Title</label>
                  <input 
                    type="text"
                    required
                    value={serviceFormTitle}
                    onChange={(e) => setServiceFormTitle(e.target.value)}
                    placeholder="e.g. Royal Stage Styling"
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 outline-none focus:border-gold-500 font-semibold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-foreground/75 mb-1">Lucide Icon Name</label>
                    <select
                      value={serviceFormIconName}
                      onChange={(e) => setServiceFormIconName(e.target.value)}
                      className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 outline-none focus:border-gold-500 font-bold"
                    >
                      <option value="Sparkles">Sparkles (General)</option>
                      <option value="Award">Award (Premium)</option>
                      <option value="Star">Star (Reviews)</option>
                      <option value="Camera">Camera (Photography)</option>
                      <option value="Music">Music (DJ/Sound)</option>
                      <option value="UtensilsCrossed">Utensils (Catering)</option>
                      <option value="Flower">Flower (Decorations)</option>
                      <option value="Heart">Heart (Wedding/Rites)</option>
                      <option value="Mic">Mic (MC/Anchor)</option>
                      <option value="GlassWater">Drink (Beverages)</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between items-center">
                      <label className="block font-bold text-foreground/75">Service Image</label>
                      <div className="flex gap-2 text-[9px] uppercase tracking-wider font-extrabold">
                        <button
                          type="button"
                          onClick={() => setServiceImgSource('url')}
                          className={`px-2 py-0.5 rounded transition-all cursor-pointer ${serviceImgSource === 'url' ? 'bg-gold-500 text-zinc-950 font-bold' : 'bg-gold-400/10 text-gold-500'}`}
                        >
                          URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setServiceImgSource('file')}
                          className={`px-2 py-0.5 rounded transition-all cursor-pointer ${serviceImgSource === 'file' ? 'bg-gold-500 text-zinc-950 font-bold' : 'bg-gold-400/10 text-gold-500'}`}
                        >
                          Device
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {serviceFormImage && (
                        <div className="h-10 w-16 shrink-0 rounded-lg border border-gold-400/20 overflow-hidden bg-zinc-100 dark:bg-zinc-800">
                          <img src={serviceFormImage} alt="Preview" className="h-full w-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1">
                        {serviceImgSource === 'url' ? (
                          <input 
                            key="service-image-url"
                            type="text"
                            placeholder="https://..."
                            value={serviceFormImage || ''}
                            onChange={(e) => setServiceFormImage(e.target.value)}
                            className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 outline-none focus:border-gold-500 font-medium"
                            required={serviceImgSource === 'url'}
                          />
                        ) : (
                          <input 
                            key="service-image-file"
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChange(e, setServiceFormImage)}
                            className="w-full text-xs text-foreground/70 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-[10px] file:font-extrabold file:uppercase file:bg-gold-400/10 file:text-gold-500 file:cursor-pointer hover:file:bg-gold-400/20 bg-ivory-50/50 dark:bg-zinc-950 rounded-xl border border-gold-400/15 py-1 px-3 outline-none"
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-foreground/75 mb-1">Service Description</label>
                  <textarea 
                    required
                    value={serviceFormDesc}
                    onChange={(e) => setServiceFormDesc(e.target.value)}
                    rows={4}
                    placeholder="Provide a detailed description of the service..."
                    className="w-full rounded-xl border border-gold-400/15 bg-ivory-50/50 dark:bg-zinc-950 px-3 py-2 outline-none focus:border-gold-500 font-medium leading-relaxed"
                  />
                </div>

                <div className="border-t border-gold-400/10 pt-4 flex gap-2 justify-end">
                  <button 
                    type="button" 
                    onClick={() => { setIsAddingService(false); setEditingService(null); }}
                    className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-foreground font-bold rounded-xl uppercase tracking-wider cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-gradient-to-r from-gold-600 to-gold-400 text-zinc-950 font-bold rounded-xl uppercase tracking-wider flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="h-3.5 w-3.5" /> Publish Service
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
