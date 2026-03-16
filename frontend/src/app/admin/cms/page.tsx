"use client";

import { useState, useEffect } from "react";
import { 
  Loader2, Database, CheckCircle, AlertCircle, Plus, Edit, Trash2, 
  HelpCircle, MessageSquare, Syringe, TrendingUp
} from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type TabType = "seed" | "faqs" | "testimonials" | "vaccines" | "milestones";

export default function AdminCMSPage() {
  const [activeTab, setActiveTab] = useState<TabType>("seed");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [faqs, setFaqs] = useState<any[]>([]);
  const [testimonials, setTestimonials] = useState<any[]>([]);
  const [vaccines, setVaccines] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab !== "seed") {
      loadData(activeTab);
    }
  }, [activeTab]);

  async function loadData(type: TabType) {
    if (type === "seed") return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem("wt18_token");
      const endpoints: Record<string, string> = {
        faqs: "/cms/faqs",
        testimonials: "/cms/testimonials",
        vaccines: "/cms/vaccine-templates",
        milestones: "/cms/milestone-templates",
      };

      const response = await fetch(`${API_BASE}${endpoints[type]}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to load data");

      const data = await response.json();
      
      if (type === "faqs") setFaqs(data.data || []);
      else if (type === "testimonials") setTestimonials(data.data || []);
      else if (type === "vaccines") setVaccines(data.data || []);
      else if (type === "milestones") setMilestones(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  async function handleSeedData() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const token = localStorage.getItem("wt18_token");
      if (!token) {
        setError("Not authenticated. Please login again.");
        return;
      }

      const response = await fetch(`${API_BASE}/cms/seed`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to seed data");

      const data = await response.json();
      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to seed data");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(type: TabType, id: string) {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const token = localStorage.getItem("wt18_token");
      const endpoints: Record<string, string> = {
        faqs: `/cms/faqs/${id}`,
        testimonials: `/cms/testimonials/${id}`,
        vaccines: `/cms/vaccine-templates/${id}`,
        milestones: `/cms/milestone-templates/${id}`,
      };

      const response = await fetch(`${API_BASE}${endpoints[type]}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to delete");

      loadData(type);
    } catch (err) {
      alert("Failed to delete item");
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">CMS Management</h1>
          <p className="mt-2 text-sm text-slate-600">
            Manage content and seed default data for the system
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 border-b border-slate-200">
          {[
            { key: "seed", label: "Seed Data", icon: Database },
            { key: "faqs", label: "FAQs", icon: HelpCircle },
            { key: "testimonials", label: "Testimonials", icon: MessageSquare },
            { key: "vaccines", label: "Vaccines", icon: Syringe },
            { key: "milestones", label: "Milestones", icon: TrendingUp },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-600 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Seed Tab */}
        {activeTab === "seed" && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Database className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Seed Default Data</h2>
                <p className="text-sm text-slate-600">
                  Load default FAQs, testimonials, vaccine templates, and milestone templates
                </p>
              </div>
            </div>

            <button
              onClick={handleSeedData}
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Seeding Data...
                </>
              ) : (
                <>
                  <Database className="h-4 w-4" />
                  Seed Default Data
                </>
              )}
            </button>

            {result && (
              <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="mb-3 flex items-center gap-2 text-green-800">
                  <CheckCircle className="h-5 w-5" />
                  <h3 className="font-semibold">Data Seeded Successfully!</h3>
                </div>
                <div className="space-y-2 text-sm text-green-700">
                  <p>✓ FAQs: {result.faqs || 0} items</p>
                  <p>✓ Testimonials: {result.testimonials || 0} items</p>
                  <p>✓ Vaccine Templates: {result.vaccines || 0} items</p>
                  <p>✓ Milestone Templates: {result.milestones || 0} items</p>
                </div>
              </div>
            )}

            {error && (
              <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="h-5 w-5" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* FAQs Tab */}
        {activeTab === "faqs" && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {faqs.map((faq) => (
                  <div key={faq._id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{faq.question}</h3>
                        <p className="mt-2 text-sm text-slate-600">{faq.answer}</p>
                        <div className="mt-2 flex gap-2 text-xs text-slate-500">
                          <span>Category: {faq.category || "General"}</span>
                          <span>•</span>
                          <span>Order: {faq.order}</span>
                          <span>•</span>
                          <span>{faq.isActive ? "Active" : "Inactive"}</span>
                        </div>
                      </div>
                      <div className="ml-4 flex gap-2">
                        <button
                          onClick={() => alert("Edit functionality: Update FAQ via API endpoint PATCH /cms/faqs/" + faq._id)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          title="Edit FAQ"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete("faqs", faq._id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          title="Delete FAQ"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {faqs.length === 0 && (
                  <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
                    No FAQs found. Click "Seed Default Data" to load defaults.
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === "testimonials" && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {testimonials.map((item) => (
                  <div key={item._id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="italic text-slate-700">"{item.quote}"</p>
                        <div className="mt-3 flex items-center gap-2">
                          <span className="font-semibold text-slate-900">{item.author}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-sm text-slate-600">{item.role}</span>
                          <span className="text-slate-500">•</span>
                          <span className="text-sm text-amber-600">★ {item.rating}/5</span>
                        </div>
                      </div>
                      <div className="ml-4 flex gap-2">
                        <button
                          onClick={() => alert("Edit functionality: Update testimonial via API endpoint PATCH /cms/testimonials/" + item._id)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          title="Edit Testimonial"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete("testimonials", item._id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          title="Delete Testimonial"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {testimonials.length === 0 && (
                  <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
                    No testimonials found. Click "Seed Default Data" to load defaults.
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Vaccines Tab */}
        {activeTab === "vaccines" && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {vaccines.map((vaccine) => (
                  <div key={vaccine._id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-900">{vaccine.title}</h3>
                        <p className="mt-1 text-sm text-slate-600">{vaccine.description}</p>
                        <div className="mt-2 flex gap-2 text-xs text-slate-500">
                          <span>Vaccine: {vaccine.vaccineName}</span>
                          <span>•</span>
                          <span>Age: {vaccine.ageInMonths} months</span>
                          <span>•</span>
                          <span>Category: {vaccine.category}</span>
                        </div>
                      </div>
                      <div className="ml-4 flex gap-2">
                        <button
                          onClick={() => alert("Edit functionality: Update vaccine template via API endpoint PATCH /cms/vaccine-templates/" + vaccine._id)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          title="Edit Vaccine Template"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete("vaccines", vaccine._id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          title="Delete Vaccine Template"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {vaccines.length === 0 && (
                  <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
                    No vaccine templates found. Click "Seed Default Data" to load defaults.
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Milestones Tab */}
        {activeTab === "milestones" && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <>
                {milestones.map((milestone) => (
                  <div key={milestone._id} className="rounded-lg border border-slate-200 bg-white p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{milestone.title}</h3>
                          <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                            {milestone.ageGroup}
                          </span>
                          <span className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                            {milestone.type}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-slate-600">{milestone.description}</p>
                        {milestone.tips && (
                          <p className="mt-2 text-xs italic text-slate-500">💡 {milestone.tips}</p>
                        )}
                      </div>
                      <div className="ml-4 flex gap-2">
                        <button
                          onClick={() => alert("Edit functionality: Update milestone template via API endpoint PATCH /cms/milestone-templates/" + milestone._id)}
                          className="rounded-lg p-2 text-blue-600 hover:bg-blue-50"
                          title="Edit Milestone Template"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete("milestones", milestone._id)}
                          className="rounded-lg p-2 text-red-600 hover:bg-red-50"
                          title="Delete Milestone Template"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                {milestones.length === 0 && (
                  <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-slate-500">
                    No milestone templates found. Click "Seed Default Data" to load defaults.
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
