"use client";

import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First one open by default

  const faqs = [
    {
      question: "Is my child's medical data secure and private?",
      answer: "Absolutely. We use bank-level, end-to-end encryption (AES-256) and are fully HIPAA-compliant. Your data is never sold to third parties, and only you and your authorized healthcare providers can access it."
    },
    {
      question: "How do the automated vaccination reminders work?",
      answer: "Based on your child's date of birth and the official IAP (Indian Academy of Pediatrics) or WHO schedules, our system automatically calculates due dates. You will receive SMS, Email, and Push notifications 7 days and 1 day before a vaccine is due."
    },
    {
      question: "How does the AI-powered milestone tracking work?",
      answer: "Our proprietary AI analyzes the developmental milestones you log (like first steps or first words) against global pediatric datasets. It provides personalized growth curves and gentle, proactive alerts if a critical milestone is delayed, allowing for early intervention."
    },
    {
      question: "Can I share these digital records with my pediatrician?",
      answer: "Yes! WombTo18 is designed to eliminate carrying physical files. You can instantly generate a formatted, secure PDF report of all logged milestones, prescriptions, and vaccination certificates to share with your doctor before checkups."
    },
    {
      question: "Can multiple family members access the account?",
      answer: "Yes, you can securely invite a co-parent, guardian, or even a primary caregiver to have shared access to your child's health dashboard so everyone stays in the loop."
    },
    {
      question: "What is the 'Go Green' initiative?",
      answer: "We believe in leaving a healthy planet for the next generation. For every child registered on WombTo18, our foundation plants a tree. You can even track the growth of your cohort's trees right alongside your child's milestones!"
    },
    {
      question: "What happens to the account when my child turns 18?",
      answer: "WombTo18 is built to create a lifelong health passport. When your child reaches 18, full ownership and access of the digital health profile can be seamlessly transferred to them, ensuring they enter adulthood with a complete medical history."
    }
  ];

  return (
    <section className="py-24 bg-white" id="faq">
      <div className="mx-auto max-w-3xl px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl font-medium text-slate-900">Frequently Asked Questions</h2>
        </div>
        
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            
            return (
              <div 
                key={index}
                onClick={() => setOpenIndex(isOpen ? null : index)}
                className={`border rounded-2xl p-6 cursor-pointer transition-all duration-300 ${isOpen ? "border-primary/30 bg-primary/5 shadow-sm" : "border-slate-200 hover:bg-slate-50"}`}
              >
                <div className="flex items-center justify-between">
                  <h4 className={`font-medium transition-colors ${isOpen ? "text-primary" : "text-slate-900"}`}>
                    {faq.question}
                  </h4>
                  <span className={`material-symbols-outlined transition-transform duration-300 ${isOpen ? "text-primary rotate-45" : "text-slate-400"}`}>
                    add
                  </span>
                </div>
                
                {/* Expandable Answer */}
                <div 
                  className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr] mt-4 opacity-100" : "grid-rows-[0fr] opacity-0"}`}
                >
                  <p className="overflow-hidden text-slate-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
      </div>
    </section>
  );
}