import React, { useState } from "react";
import { CheckCircle2, Ticket, HelpCircle, ArrowRight, ShieldCheck, CreditCard, Sparkles } from "lucide-react";

export default function SubscriptionPage() {
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState(0);
  const [successCode, setSuccessCode] = useState("");

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === "KALINGA50" || promoCode.trim().toUpperCase() === "ODISHA100") {
      setDiscountPercent(50);
      setSuccessCode(promoCode.trim().toUpperCase());
      alert("Success! 50% Promocode Coupon applied to order.");
    } else {
      alert("Invalid Code. Try applying 'KALINGA50' for a special regional discount!");
    }
  };

  const [activeBillCycle, setActiveBillCycle] = useState<"monthly" | "yearly">("monthly");

  const pricingPlans = [
    {
      id: "basic",
      title: "Mahanadi Basic Plan",
      price: 0,
      sub: "Bilingual Practice Free",
      features: [
        "2 Daily Practice Quizzes",
        "Limited bilingual translation access",
        "1 AI Doubt Mentor slot standard daily",
        "Score progress tracker logs"
      ],
      cta: "Explore Free"
    },
    {
      id: "prime",
      title: "Kalinga Prime Pro Pass",
      price: activeBillCycle === "monthly" ? 149 : 999,
      sub: "Most Popular - Active Selector Choice",
      features: [
        "Unlimited OPSC Civil and OSSSC RI Mock Series",
        "Unlimited simulated live mock battle rooms",
        "Full proctored simulation report analysis",
        "Unlimited Prerana AI doubts & exam schedules",
        "Weekly grand scholarship test admittance",
        "Bilingual toggles (English & full Odia Vyakarana)"
      ],
      cta: "Activate Prime Pro Membership"
    },
    {
      id: "academic",
      title: "BSE/CHSE School Bundle",
      price: activeBillCycle === "monthly" ? 99 : 699,
      sub: "Class 9, 10 & 12 Specialized Board blueprint",
      features: [
        "Science, Commerce, Arts full revision papers",
        "Chapterwise testing palette selection",
        "Detailed bilingual answers with step metrics",
        "School syllabus PYQs + printed certificates"
      ],
      cta: "Claim Board Membership Pass"
    }
  ];

  const handleTriggerMockPayment = (planName: string, amount: number) => {
    const finalAmount = Math.round(amount * (1 - discountPercent / 100));
    // Simulate Razorpay Gateway trigger
    alert(`[Razorpay Payment Simulator] Initializing secure checkout sequence for ${planName}...\nAmount due: ₹${finalAmount} (INR) \nToll-Free Customer Care ID: 1800-ODISHA-PAY\n\nCheckout successful! Invoice generated automatically.`);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto font-sans" id="subscription-root">
      {/* Monetization Header */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-orange-950 text-white p-6 rounded-3xl relative overflow-hidden shadow-xl border-b border-orange-500/10">
        <div className="relative z-10 max-w-2xl">
          <span className="text-[10px] bg-orange-500 text-slate-950 px-3 py-1 rounded-full uppercase font-black tracking-widest block w-fit mb-4">
            Aspirant Prime Member Access
          </span>
          <h2 className="text-2xl font-black mb-2 leading-tight">Empower Your Odisha govt goals with Kalinga Prime</h2>
          <p className="text-xs text-slate-350 leading-relaxed">
            Unlock premium comprehensive study series, AI evaluation blueprints, unlimited doubts solving desks, and live state rank simulators designed natively for low bandwidth mobile access.
          </p>
        </div>
      </div>

      {/* Bill Cycle switcher controls */}
      <div className="flex items-center justify-center gap-3">
        <span className="text-xs font-bold text-slate-500">Billing frequency:</span>
        <div className="bg-slate-100 p-1 rounded-xl flex">
          <button
            onClick={() => setActiveBillCycle("monthly")}
            className={`px-3.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              activeBillCycle === "monthly" ? "bg-white text-blue-950 shadow-xs" : "text-slate-600"
            }`}
          >
            Monthly Plan
          </button>
          <button
            onClick={() => setActiveBillCycle("yearly")}
            className={`px-3.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
              activeBillCycle === "yearly" ? "bg-white text-blue-950 shadow-xs" : "text-slate-600"
            }`}
          >
            Yearly Pass (Save 40%)
          </button>
        </div>
      </div>

      {/* Pricing Grid */}
      <div className="grid md:grid-cols-3 gap-6">
        {pricingPlans.map((plan) => {
          const finalPrice = Math.round(plan.price * (1 - discountPercent / 100));
          const isPrime = plan.id === "prime";

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-5 border flex flex-col hover:shadow-lg transition-all relative ${
                isPrime
                  ? "border-2 border-orange-400 bg-amber-50/15"
                  : "border-slate-150 bg-white"
              }`}
            >
              {isPrime && (
                <span className="absolute top-0 right-0 transform -translate-y-1/2 bg-orange-400 text-slate-950 text-[8px] font-black uppercase px-2.5 py-1 rounded-full w-fit">
                  Highly Recommended
                </span>
              )}

              <span className="text-[9px] uppercase font-bold text-slate-500 mb-2 block">{plan.sub}</span>
              <h3 className="font-extrabold text-blue-950 text-sm mb-1">{plan.title}</h3>

              <div className="my-4 flex items-baseline gap-1 border-b border-slate-100 pb-4">
                <span className="text-3xl font-black text-slate-900">₹{finalPrice}</span>
                <span className="text-xs text-slate-400">/{activeBillCycle === "monthly" ? "mo" : "yr"}</span>
                {discountPercent > 0 && plan.price > 0 && (
                  <span className="text-[10px] text-red-500 font-extrabold line-through ml-2">₹{plan.price}</span>
                )}
              </div>

              <ul className="space-y-3 mb-8 flex-1 text-xs text-slate-600">
                {plan.features.map((feat, fIdx) => (
                  <li key={fIdx} className="flex items-start gap-2.5">
                    <CheckCircle2 className={`h-4 w-4 shrink-0 ${isPrime ? "text-orange-500" : "text-[#1e3a8a]"}`} />
                    <span className="leading-normal">{feat}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleTriggerMockPayment(plan.title, plan.price)}
                className={`w-full py-2.5 font-bold text-[11px] rounded-xl transition-all cursor-pointer text-center ${
                  isPrime
                    ? "bg-orange-500 text-white shadow-md shadow-orange-500/20 hover:bg-orange-600"
                    : "bg-slate-150 hover:bg-slate-200 text-slate-700"
                }`}
              >
                {plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      {/* Promo Code card holder */}
      <div className="bg-slate-100 border border-slate-200 p-5 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] bg-slate-200 text-slate-600 font-bold uppercase tracking-wide px-2 py-0.5 rounded-md mb-1 inline-block">
            Sponsorship Coupon Codes
          </span>
          <h4 className="font-black text-xs text-slate-800">Have an institutional referral code or Odisha govt scholarship pass?</h4>
          <p className="text-[11px] text-slate-500 leading-normal">Type **KALINGA50** in the text box below to lock in a half-price seasonal screening subscription pass.</p>
        </div>

        <form onSubmit={handleApplyPromo} className="flex gap-2 shrink-0">
          <input
            type="text"
            placeholder="e.g. KALINGA50"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value)}
            className="px-3.5 py-2 border border-slate-200 bg-white rounded-xl text-xs outline-none uppercase font-mono font-bold"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-[#1e3a8a] text-white hover:bg-blue-950 font-bold text-xs rounded-xl"
          >
            Apply
          </button>
        </form>
      </div>
    </div>
  );
}
