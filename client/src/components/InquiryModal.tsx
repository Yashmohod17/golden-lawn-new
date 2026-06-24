'use client';

import React, { useState, useEffect } from 'react';
import { useInquiry } from '../lib/InquiryContext';
import { CustomDialog } from './ui/CustomDialog';
import { IndianRupee, Send, Check, CreditCard, AlertCircle, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import { addBooking, payReservation, getAvailabilityDates, deleteBooking } from '../services/booking';
import { usePortal } from '../lib/PortalContext';

export function InquiryModal() {
  const { isOpen, closeInquiry, selectedPackage, selectedDate, estimatedCost } = useInquiry();
  const { user, isAuthenticated } = usePortal();

  // Multi-step reservation flow states: calendar -> details -> payment -> success
  const [step, setStep] = useState<'calendar' | 'details' | 'payment' | 'success'>('calendar');
  const [createdBooking, setCreatedBooking] = useState<any | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card'>('upi');
  const [isPaying, setIsPaying] = useState(false);

  // Calendar states
  const [calDate, setCalDate] = useState<Date>(new Date(2026, 5, 1)); // Start at June 2026 simulation
  const [selectedCalDay, setSelectedCalDay] = useState<number | null>(null);
  const [calUnavailable, setCalUnavailable] = useState<{ date: string; type: string }[]>([]);
  const [loadingCal, setLoadingCal] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventType, setEventType] = useState('wedding');
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('300');
  const [pkg, setPkg] = useState('gold');
  const [notes, setNotes] = useState('');
  const [cost, setCost] = useState(0);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const recalculateCost = (p: string, eType: string, gCountStr: string) => {
    const baseRate = p === 'silver' ? 1200 : p === 'platinum' ? 4500 : 2500;
    const multiplier = eType === 'wedding' ? 1.2 : eType === 'corporate' ? 1.15 : eType === 'birthday' ? 0.8 : 1.0;
    const guestVal = parseInt(gCountStr) || 100;
    setCost(Math.round(baseRate * guestVal * multiplier));
  };

  // Sync state when profile loads or modal opens
  useEffect(() => {
    if (isOpen && isAuthenticated && user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
    }
  }, [isOpen, isAuthenticated, user]);

  // Fetch calendar availability when inside the calendar step
  useEffect(() => {
    if (isOpen && step === 'calendar') {
      let active = true;
      const fetchAvailability = async () => {
        try {
          setLoadingCal(true);
          const yMonth = `${calDate.getFullYear()}-${String(calDate.getMonth() + 1).padStart(2, '0')}`;
          const data = await getAvailabilityDates(yMonth);
          if (active) {
            setCalUnavailable(data);
          }
        } catch (err) {
          console.error('Failed to load modal availability:', err);
        } finally {
          if (active) {
            setLoadingCal(false);
          }
        }
      };
      fetchAvailability();
      return () => {
        active = false;
      };
    }
  }, [calDate, isOpen, step]);

  // Sync state when context values change
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        let currentPkg = pkg;
        if (selectedPackage) {
          const pVal = selectedPackage.toLowerCase().includes('silver')
            ? 'silver'
            : selectedPackage.toLowerCase().includes('platinum')
            ? 'platinum'
            : 'gold';
          setPkg(pVal);
          currentPkg = pVal;
        }
        if (selectedDate) {
          setDate(selectedDate);
          setStep('details'); // Bypasses calendar selection if date is already picked
        } else {
          setStep('calendar'); // Defaults to calendar step
        }
        if (estimatedCost) {
          setCost(estimatedCost);
        } else {
          recalculateCost(currentPkg, eventType, guests);
        }
      }, 0);

      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, selectedPackage, selectedDate, estimatedCost]);

  const validate = () => {
    const tempErrors: { [key: string]: string } = {};
    if (!name.trim()) tempErrors.name = 'Full Name is required';
    if (!email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      tempErrors.email = 'Email address is invalid';
    }
    if (!phone.trim()) {
      tempErrors.phone = 'Phone number is required';
    } else if (!/^\+?([0-9]{2})?[-. ]?([0-9]{5})[-. ]?([0-9]{5})$/.test(phone.replace(/\s+/g, ''))) {
      if (phone.replace(/\D/g, '').length < 10) {
        tempErrors.phone = 'Enter a valid 10-digit phone number';
      }
    }
    if (!date) tempErrors.date = 'Please pick a booking date';

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const payload = {
        name,
        email,
        phone,
        eventType: eventType.charAt(0).toUpperCase() + eventType.slice(1),
        date,
        guests: 100,
        package: 'SLOT RESERVATION',
        cost: 500,
        notes: 'Flat slot reservation booked online.',
      };

      const result = await addBooking(payload);
      setCreatedBooking(result);
      setStep('payment');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayReservation = async () => {
    if (!createdBooking) return;
    setIsPaying(true);
    try {
      await payReservation(createdBooking.id, 500);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('booking-created'));
      }
      
      setStep('success');
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#D4AF37', '#9E1F42', '#FFFFFF'],
      });
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Payment failed. Please try again.');
    } finally {
      setIsPaying(false);
    }
  };

  const handleClose = () => {
    // If the user went to the payment step but closed/cancelled without success, delete the booking to release the slot
    if (createdBooking && step !== 'success') {
      deleteBooking(createdBooking.id).catch(err => {
        console.error('Failed to clean up unpaid booking:', err);
      });
    }

    setStep('calendar');
    setCreatedBooking(null);
    setName('');
    setEmail('');
    setPhone('');
    setNotes('');
    setDate('');
    setSelectedCalDay(null);
    setCalDate(new Date(2026, 5, 1));
    setErrors({});
    closeInquiry();
  };

  // Calendar calculations
  const daysInMonth = new Date(calDate.getFullYear(), calDate.getMonth() + 1, 0).getDate();
  const firstDayIndex = new Date(calDate.getFullYear(), calDate.getMonth(), 1).getDay();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() - 1, 1));
    setSelectedCalDay(null);
  };

  const handleNextMonth = () => {
    setCalDate(new Date(calDate.getFullYear(), calDate.getMonth() + 1, 1));
    setSelectedCalDay(null);
  };

  const getDayInfo = (day: number) => {
    const dayStr = String(day).padStart(2, '0');
    const mStr = String(calDate.getMonth() + 1).padStart(2, '0');
    const dateStr = `${calDate.getFullYear()}-${mStr}-${dayStr}`;
    return calUnavailable.find(d => d.date === dateStr);
  };

  const isDayBooked = (day: number) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dayDate = new Date(calDate.getFullYear(), calDate.getMonth(), day);
    if (dayDate < today) return true;
    return !!getDayInfo(day);
  };

  const handleDateSelect = (day: number) => {
    if (isDayBooked(day)) return;
    setSelectedCalDay(day === selectedCalDay ? null : day);
  };

  const handleProceedToDetails = () => {
    if (selectedCalDay === null) return;
    const formattedDate = `${calDate.getFullYear()}-${String(calDate.getMonth() + 1).padStart(2, '0')}-${String(selectedCalDay).padStart(2, '0')}`;
    setDate(formattedDate);
    setStep('details');
  };

  return (
    <CustomDialog
      isOpen={isOpen}
      onClose={handleClose}
      title={
        step === 'success'
          ? 'Booking Confirmed!'
          : step === 'payment'
          ? 'Pay Reservation Fee'
          : step === 'calendar'
          ? 'Select Date'
          : 'Plan Your Celebration'
      }
      description={
        step === 'success'
          ? 'Your golden celebration has been scheduled'
          : step === 'payment'
          ? 'Submit reservation payment to lock date'
          : step === 'calendar'
          ? 'Choose an available date in the calendar'
          : 'Please provide details about your dream event'
      }
      className="max-w-xl"
    >
      {step === 'success' ? (
        /* Success Screen */
        <div className="text-center py-8 space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
            <Check className="h-8 w-8 stroke-[3]" />
          </div>
          <div className="space-y-2">
            <h4 className="font-serif text-xl font-semibold text-foreground">
              Date Officially Reserved!
            </h4>
            <p className="text-sm text-foreground/70 dark:text-foreground/80 leading-relaxed max-w-sm mx-auto">
              Thank you, <strong className="text-gold-500">{name}</strong>! We have confirmed your token reservation payment of <strong>₹500</strong> for the <strong>{eventType.toUpperCase()}</strong> on <strong>{date}</strong>.
            </p>
            <p className="text-xs text-foreground/50 max-w-sm mx-auto leading-relaxed mt-2">
              Please visit the lawn within <strong>48 hours</strong> to confirm your booking and process the further procedure. If you do not reach the lawn within 48 hours, the date will be automatically made available for other clients.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-6 py-2.5 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase cursor-pointer"
          >
            Close Window
          </button>
        </div>
      ) : step === 'payment' ? (
        /* Payment Step */
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-gold-400/5 border border-gold-400/10 space-y-2">
            <h4 className="font-serif text-sm font-bold text-foreground">Temporary Block Active</h4>
            <p className="text-[11px] text-foreground/70 leading-relaxed">
              Your venue date is temporarily held for the next 48 hours. Submit the reservation token to lock the date on the public calendar.
            </p>
          </div>

          <div className="border border-gold-400/15 rounded-2xl p-5 bg-white dark:bg-zinc-900/40 space-y-4 text-zinc-800 dark:text-zinc-200">
            <div className="flex justify-between text-xs border-b border-gold-400/10 pb-3">
              <span className="text-foreground/50">Lawn Event Date:</span>
              <span className="font-bold">{date}</span>
            </div>
            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-foreground/60 font-medium">Reservation Token Due:</span>
              <span className="font-serif text-lg font-bold text-gold-500">₹500</span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-[10px] uppercase font-bold tracking-wider text-foreground/60">Choose Payment Method</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('upi')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all text-xs cursor-pointer ${
                  paymentMethod === 'upi'
                    ? 'border-gold-400 bg-gold-400/5 text-gold-500 font-bold'
                    : 'border-gold-400/15 bg-ivory-50 text-foreground/75 dark:bg-zinc-900/40'
                }`}
              >
                <span>⚡ UPI / QR Payment</span>
                {paymentMethod === 'upi' && <span className="text-gold-500 text-xs">✓</span>}
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 rounded-xl border flex items-center justify-between transition-all text-xs cursor-pointer ${
                  paymentMethod === 'card'
                    ? 'border-gold-400 bg-gold-400/5 text-gold-500 font-bold'
                    : 'border-gold-400/15 bg-ivory-50 text-foreground/75 dark:bg-zinc-900/40'
                }`}
              >
                <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5" /> Card Payment</span>
                {paymentMethod === 'card' && <span className="text-gold-500 text-xs">✓</span>}
              </button>
            </div>
          </div>

          <button
            onClick={handlePayReservation}
            disabled={isPaying}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 py-3.5 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-lg shadow-gold-600/10 hover:from-gold-500 hover:to-gold-300 disabled:opacity-50 transition-all cursor-pointer"
          >
            {isPaying ? (
              <>Processing Sandbox Checkout...</>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Pay Reservation Token (₹500)
              </>
            )}
          </button>
        </div>
      ) : step === 'calendar' ? (
        /* Calendar Step (Date Picker) */
        <div className="space-y-4">
          <div className="border border-gold-400/15 rounded-2xl overflow-hidden bg-ivory-50 dark:bg-zinc-900/40">
            {/* Calendar Nav Bar */}
            <div className="flex items-center justify-between p-3 bg-gold-400/5 border-b border-gold-400/10">
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-1 rounded-full text-foreground/80 hover:bg-gold-400/10 hover:text-gold-500"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              <h4 className="font-serif text-xs font-bold text-foreground">
                {monthNames[calDate.getMonth()]} {calDate.getFullYear()}
              </h4>

              <button
                type="button"
                onClick={handleNextMonth}
                className="p-1 rounded-full text-foreground/80 hover:bg-gold-400/10 hover:text-gold-500"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Days of Week headers */}
            <div className="grid grid-cols-7 text-center py-1.5 bg-gold-400/5 font-sans text-[10px] font-semibold text-foreground/50 border-b border-gold-400/10">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day, idx) => (
                <div key={idx} className="py-0.5">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days Grid */}
            <div className="grid grid-cols-7 text-center p-1.5 gap-1 min-h-[14rem]">
              {/* Empty lead-in days */}
              {[...Array(firstDayIndex)].map((_, idx) => (
                <div key={`empty-${idx}`} className="py-1.5" />
              ))}

              {/* Days in Month */}
              {[...Array(daysInMonth)].map((_, idx) => {
                const dayNum = idx + 1;
                const dayInfo = getDayInfo(dayNum);
                const inPast = (() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const dayDate = new Date(calDate.getFullYear(), calDate.getMonth(), dayNum);
                  return dayDate < today;
                })();
                const booked = inPast || !!dayInfo;
                const isReserved = !inPast && dayInfo?.type === 'reserved';
                const selected = selectedCalDay === dayNum;

                return (
                  <button
                    key={`day-${dayNum}`}
                    type="button"
                    onClick={() => handleDateSelect(dayNum)}
                    disabled={booked}
                    className={`py-2 text-[10px] font-medium rounded-lg flex flex-col items-center justify-center relative transition-all ${
                      booked
                        ? 'bg-zinc-100 text-zinc-300 dark:bg-zinc-800/20 dark:text-zinc-400 cursor-not-allowed'
                        : selected
                        ? 'bg-gold-400 text-zinc-950 font-bold shadow-md shadow-gold-400/20 scale-[1.03]'
                        : 'bg-white text-foreground hover:bg-gold-400/10 dark:bg-zinc-800 dark:text-zinc-200 border border-gold-400/5'
                    }`}
                  >
                    <span>{dayNum}</span>
                    {/* Micro Status Dot */}
                    <span
                      className={`absolute bottom-1 h-1 w-1 rounded-full ${
                        isReserved
                          ? 'bg-amber-500/70'
                          : booked
                          ? 'bg-red-500/50'
                          : selected
                          ? 'bg-zinc-950'
                          : 'bg-emerald-500/50'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legend */}
          <div className="flex gap-3 text-[9px] justify-center text-foreground/60 flex-wrap pb-1">
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Available</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              <span>Reserved</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              <span>Booked</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-gold-400" />
              <span>Selected</span>
            </div>
          </div>

          {selectedCalDay !== null ? (
            <button
              type="button"
              onClick={handleProceedToDetails}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 py-3 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-md hover:opacity-95 transition-all cursor-pointer"
            >
              Proceed to Details
            </button>
          ) : (
            <div className="flex items-start gap-2 bg-gold-400/5 p-3.5 rounded-xl border border-gold-400/10 text-[10px] leading-relaxed text-foreground/60">
              <AlertCircle className="h-4 w-4 text-gold-500 shrink-0" />
              <span>Please pick an available date above to reserve. Once selected, you can proceed to enter event details and lock the date.</span>
            </div>
          )}
        </div>
      ) : (
        /* Booking Form */
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Row 1: Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alexander Mercer"
                className={`w-full rounded-xl border bg-ivory-50 px-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 dark:bg-zinc-900 ${
                  errors.name ? 'border-red-500' : 'border-gold-400/15'
                }`}
              />
              {errors.name && <p className="mt-1 text-[10px] text-red-500">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alexander@mail.com"
                className={`w-full rounded-xl border bg-ivory-50 px-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 dark:bg-zinc-900 ${
                  errors.email ? 'border-red-500' : 'border-gold-400/15'
                }`}
              />
              {errors.email && <p className="mt-1 text-[10px] text-red-500">{errors.email}</p>}
            </div>
          </div>

          {/* Row 2: Phone & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 9823464705"
                className={`w-full rounded-xl border bg-ivory-50 px-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 dark:bg-zinc-900 ${
                  errors.phone ? 'border-red-500' : 'border-gold-400/15'
                }`}
              />
              {errors.phone && <p className="mt-1 text-[10px] text-red-500">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
                Booking Date *
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={date}
                  disabled
                  className="w-full rounded-xl border border-gold-400/10 bg-zinc-100 dark:bg-zinc-800/40 px-4 py-2.5 text-xs text-foreground/50 outline-none cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {/* Row 3: Event Type */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-foreground/70 mb-1">
              Event Type
            </label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full rounded-xl border border-gold-400/15 bg-ivory-50 px-4 py-2.5 text-xs text-foreground outline-none focus:border-gold-400 dark:bg-zinc-900"
            >
              <option value="wedding">Wedding</option>
              <option value="reception">Reception</option>
              <option value="engagement">Engagement</option>
              <option value="birthday">Birthday Party</option>
              <option value="corporate">Corporate Event</option>
              <option value="anniversary">Anniversary</option>
              <option value="cultural">Cultural Function</option>
            </select>
          </div>

          {/* Cost Indicator & Submit */}
          <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gold-400/15 pt-5 gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gold-400/10 text-gold-500">
                <IndianRupee className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-wider text-foreground/50">Slot Booking Amount</p>
                <p className="font-serif text-lg font-bold text-gold-500">₹500</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-gold-600 to-gold-400 px-6 py-3.5 font-sans text-xs font-bold tracking-widest text-zinc-950 uppercase shadow-lg shadow-gold-600/10 hover:from-gold-500 hover:to-gold-300 disabled:opacity-50 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <Send className="h-3.5 w-3.5" />
                  Proceed to Payment
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </CustomDialog>
  );
}
