"use client";

import { useState } from "react";
import { MapPin, Phone, Mail, Send, CheckCircle2 } from "lucide-react";

export default function ContactForm() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    // Add real API submission logic here later
    setTimeout(() => setIsSubmitted(false), 5000); 
  };

  return (
    <section className="mb-24 w-full">
      <div className="overflow-hidden rounded-[3rem] border border-slate-100 bg-white shadow-2xl shadow-primary/5">
        <div className="grid lg:grid-cols-5">
          
          {/* Left Side: Contact Information */}
          <div className="flex flex-col justify-between bg-slate-900 p-10 text-white lg:col-span-2 lg:p-12">
            <div>
              <h3 className="mb-4 text-3xl font-normal">Get in Touch</h3>
              <p className="mb-12 font-light leading-relaxed text-slate-300">
                Our support team typically responds within 2 hours during normal business hours. For medical emergencies, please use the red emergency button in your dashboard.
              </p>
              
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-primary">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-normal uppercase tracking-widest text-slate-400">Email Us</p>
                    <p className="mt-1 text-lg font-medium text-white">support@wombto18.in</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-primary">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-normal uppercase tracking-widest text-slate-400">Call Us</p>
                    <p className="mt-1 text-lg font-medium text-white">+91 98765 43210</p>
                    <p className="mt-1 text-sm font-light text-slate-400">Mon-Sat, 9am - 7pm IST</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-normal uppercase tracking-widest text-slate-400">Headquarters</p>
                    <p className="mt-1 text-lg font-medium leading-relaxed text-white">
                      {process.env.NEXT_PUBLIC_COMPANY_NAME || 'WombTo18 Health Tech'}<br />
                      {process.env.NEXT_PUBLIC_COMPANY_ADDRESS || 'HSR Layout, Sector 2'}<br />
                      {process.env.NEXT_PUBLIC_COMPANY_CITY || 'Bengaluru'}, {process.env.NEXT_PUBLIC_COMPANY_STATE || 'Karnataka'} {process.env.NEXT_PUBLIC_COMPANY_PINCODE || '560102'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Decorative element */}
            <div className="mt-12 flex gap-2 opacity-50">
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <div className="h-2 w-2 rounded-full bg-primary"></div>
              <div className="h-2 w-2 rounded-full bg-primary"></div>
            </div>
          </div>
          
          {/* Right Side: Contact Form */}
          <div className="bg-white p-10 lg:col-span-3 lg:p-12">
            {isSubmitted ? (
              <div className="flex h-full min-h-[400px] flex-col items-center justify-center animate-in zoom-in duration-300">
                <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Message Sent!</h3>
                <p className="mt-2 text-center font-medium text-slate-500">
                  Thank you for reaching out. A member of our support team will get back to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex h-full flex-col gap-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-normal text-slate-700">Full Name *</label>
                    <input 
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20" 
                      placeholder="e.g. Priya Sharma" 
                      type="text" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-normal text-slate-700">Registered Email *</label>
                    <input 
                      required
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20" 
                      placeholder="priya@example.com" 
                      type="email" 
                    />
                  </div>
                </div>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-normal text-slate-700">Mobile Number</label>
                    <input 
                      className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20" 
                      placeholder="+91" 
                      type="tel" 
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-sm font-normal text-slate-700">How can we help? *</label>
                    <select required className="h-12 w-full cursor-pointer appearance-none rounded-xl border border-slate-200 bg-slate-50 px-4 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20">
                      <option value="" disabled selected>Select an option</option>
                      <option value="app_support">App & Dashboard Support</option>
                      <option value="medical_query">Medical Records Query</option>
                      <option value="partnership">School/Hospital Partnership</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-normal text-slate-700">Your Message *</label>
                  <textarea 
                    required
                    rows={5}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-4 outline-none transition-all focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20" 
                    placeholder="Please describe your issue or inquiry in detail..." 
                  />
                </div>
                
                <button type="submit" className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-4 font-normal text-white shadow-lg shadow-primary/20 transition-all hover:-translate-y-1 hover:bg-primary/90">
                  <Send className="h-5 w-5" />
                  Send Message
                </button>
              </form>
            )}
          </div>
          
        </div>
      </div>
    </section>
  );
}