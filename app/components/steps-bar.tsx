"use client";

const STEPS = [
  { num: 1, label: "Verify", short: "Verify" },
  { num: 2, label: "Details", short: "Details" },
  { num: 3, label: "Payment", short: "Pay" },
  { num: 4, label: "Done", short: "Done" },
];

export function StepsBar({ currentStep }: { currentStep: number }) {
  return (
    <div className="w-full max-w-xl mx-auto mb-4 sm:mb-6 md:mb-8 px-2 sm:px-4">
      <div className="flex items-stretch justify-between gap-0.5 sm:gap-1">
        {STEPS.map((step, i) => {
          const done = step.num < currentStep;
          const active = step.num === currentStep;
          return (
            <div key={step.num} className="flex items-center flex-1 min-w-0 basis-0">
              <div className="flex flex-col items-center flex-1 min-w-0">
                <div
                  className={`flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-full text-sm font-semibold shrink-0 transition-all duration-300 ${
                    done
                      ? "bg-green-600 text-white"
                      : active
                        ? "bg-indigo-600 text-white ring-4 ring-indigo-600/30"
                        : "bg-slate-800 text-slate-500 border border-slate-600"
                  }`}
                >
                  {done ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    step.num
                  )}
                </div>
                <span
                  className={`mt-2 text-xs font-medium hidden sm:block truncate max-w-full text-center w-full ${
                    done ? "text-green-400" : active ? "text-white" : "text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
              <div
                className={`flex-1 min-w-[4px] sm:min-w-[8px] self-center h-0.5 mx-0.5 sm:mx-1 rounded-full transition-colors duration-300 shrink-0 ${
                  i < STEPS.length - 1 ? (done ? "bg-green-600" : "bg-slate-700") : "bg-transparent"
                }`}
                aria-hidden="true"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
