"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { StepsBar } from "@/app/components/steps-bar";
import { API } from "@/lib/api-paths";

const CREATE_KEY = "portfolio_create_draft";

export default function CreatePortfolioPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [resume, setResume] = useState<{ base64: string; name: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem("portfolio_token");
    if (!t) {
      router.push("/register");
      return;
    }
    let hasDraft = false;
    try {
      const draft = sessionStorage.getItem(CREATE_KEY);
      if (draft) {
        const d = JSON.parse(draft);
        if (d.name) { setName(d.name); hasDraft = true; }
        if (d.email) setEmail(d.email);
        if (d.collegeName) setCollegeName(d.collegeName);
        if (d.additionalDetails) setAdditionalDetails(d.additionalDetails);
        if (d.resume) setResume(d.resume);
      }
    } catch {}
    fetch(API._c, {
      headers: { Authorization: `Bearer ${t}` },
    })
      .then((r) => {
        if (r.status === 401) {
          localStorage.removeItem("portfolio_token");
          router.push("/register");
          return;
        }
        return r.json();
      })
      .then((d) => {
        if (!d || d.error) return;
        if (d.portfolio?.paymentStatus === "completed") {
          router.replace("/profile");
          return;
        }
        if (!hasDraft && d.portfolio) {
          setName(d.portfolio.name || "");
          setEmail(d.portfolio.email || "");
          setCollegeName(d.portfolio.collegeName || "");
          setAdditionalDetails(d.portfolio.additionalDetails || "");
        }
      });
  }, [router]);

  useEffect(() => {
    const payload = { name, email, collegeName, additionalDetails };
    if (resume) (payload as Record<string, unknown>).resume = resume;
    try {
      sessionStorage.setItem(CREATE_KEY, JSON.stringify(payload));
    } catch {}
  }, [name, email, collegeName, additionalDetails, resume]);

  const processFile = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".pdf")) {
      setError("Only PDF files allowed");
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setError("Max file size 2MB");
      return;
    }
    setError("");
    const r = new FileReader();
    r.onload = () => {
      const dataUrl = String(r.result);
      const base64 = dataUrl.includes(",") ? dataUrl.split(",")[1] : dataUrl;
      setResume({ base64, name: f.name });
    };
    r.readAsDataURL(f);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) processFile(f);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) processFile(f);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const onDragLeave = () => setDragOver(false);

  const submit = async () => {
    setError("");
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    if (!email.trim()) {
      setError("Email is required");
      return;
    }
    if (!resume) {
      setError("Resume (PDF) is required");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(API._c, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("portfolio_token")}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          collegeName: collegeName.trim() || undefined,
          additionalDetails: additionalDetails.trim() || undefined,
          resumeBase64: resume.base64,
          resumeFileName: resume.name,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      try {
        sessionStorage.removeItem(CREATE_KEY);
      } catch {}
      router.push("/portfolio/pay");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full flex-1 flex flex-col items-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 px-4 py-4 sm:py-6 md:py-8">
      <StepsBar currentStep={2} />
      <div className="w-full max-w-lg flex-1 flex flex-col py-4">
        <div className="bg-slate-900/80 backdrop-blur border border-slate-700/50 rounded-2xl p-5 sm:p-6 md:p-8 shadow-2xl w-full">
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">Your portfolio details</h1>
          <p className="text-slate-400 text-sm mb-6">Fill in your info. We&apos;ll create your portfolio ASAP.</p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Full name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Rahul Sharma"
                className="input-base input-focus"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Email <span className="text-red-400">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-base input-focus"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                College / University <span className="text-slate-500">(optional)</span>
              </label>
              <input
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. IIT Delhi"
                className="input-base input-focus"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Resume (PDF) <span className="text-red-400">*</span> <span className="text-slate-500">max 2MB</span>
              </label>
              <input ref={fileRef} type="file" accept=".pdf,application/pdf" onChange={onFileChange} className="hidden" />
              <div
                onDrop={onDrop}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onClick={() => fileRef.current?.click()}
                className={`cursor-pointer rounded-xl border-2 border-dashed transition-all ${
                  dragOver
                    ? "border-indigo-500 bg-indigo-500/10"
                    : resume
                      ? "border-green-500/50 bg-green-500/5"
                      : "border-slate-600 hover:border-slate-500 bg-slate-800/30"
                } p-6 text-center`}
              >
                {resume ? (
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center sm:text-left">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate px-2">{resume.name}</p>
                      <p className="text-slate-400 text-sm">Click or drop to replace</p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="w-12 h-12 mx-auto mb-2 rounded-xl bg-slate-700/50 flex items-center justify-center">
                      <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-slate-300 font-medium">Drop PDF here or click to upload</p>
                    <p className="text-slate-500 text-sm mt-1">PDF only, max 2MB</p>
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">
                Additional details <span className="text-slate-500">(optional)</span>
              </label>
              <textarea
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="Skills, projects, achievements..."
                rows={3}
                className="input-base input-focus resize-none"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm mt-4">
              <svg className="w-4 h-4 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {error}
            </div>
          )}

          <button onClick={submit} disabled={loading} className="btn-primary mt-6">
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Saving...
              </span>
            ) : (
              "Continue to payment"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
