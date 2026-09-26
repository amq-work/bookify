import React from 'react';
import { Modal } from '../ui';
import { Sparkles, CheckCircle2, ShieldCheck, Compass, Users, Target } from 'lucide-react';

interface ProductStrategyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductStrategyModal: React.FC<ProductStrategyModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Strategy & UX Research Documentation"
      description="Portfolio Case Study Architecture, Decisions & Validation Results"
      maxWidth="4xl"
    >
      <div className="space-y-6 text-xs text-slate-700 leading-relaxed pr-2">
        {/* Creator Acknowledgement */}
        <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
          <div className="space-y-2.5">
            <div>
              <span className="font-bold text-purple-900 block text-xs mb-0.5">
                Project Architect & Product Designer
              </span>
              <p className="text-purple-800 text-[11px]">
                This SaaS was designed and engineered by <strong className="text-purple-950">Aayan Qureshi</strong> as a personal portfolio project to demonstrate <strong className="text-purple-950">Product Strategy, UX Research, CX Thinking, UI/UX Design, and Frontend Development</strong>.
              </p>
            </div>
            <div className="bg-purple-100/60 px-3 py-2 rounded-lg border border-purple-200">
              <p className="text-purple-900 text-[10px] leading-relaxed italic">
                <strong>Disclaimer:</strong> The Content is dummy data, their might be some content which is not in-sync. This is just a project to showcase my UI/UX, User Research, Product Thinking and frontend skills.
              </p>
            </div>
          </div>
        </div>

        {/* 1. Problem Statement */}
        <div className="space-y-2">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-blue-600" /> 1. Problem Statement
          </h4>
          <p>
            <strong className="text-slate-900">[Assumption]</strong> Small businesses often rely on WhatsApp, phone calls, social media, or generic booking tools that provide limited control over their booking experience and customer information.
          </p>
          <p>
            <strong className="text-slate-900">[Hypothesis]</strong> If a booking platform understands a business's <strong>niche, target audience, services, and requirements</strong>, it can generate a more relevant starting booking experience that the business can customize and publish without technical knowledge.
          </p>
        </div>

        {/* 2. Product Goal */}
        <div className="space-y-2">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-blue-600" /> 2. Product Goal
          </h4>
          <p>Create a branded appointment-booking platform where:</p>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-center font-semibold text-slate-800 text-[11px] overflow-x-auto whitespace-nowrap">
            Business Context → Recommended Form → Customization → Preview → Publish → Customer Booking → Management
          </div>
          <p>
            Businesses can customize their <strong>questions, branding, layout, CTA, messaging, services, and availability</strong>, then use the result through a <strong>public link or embeddable form</strong>.
          </p>
        </div>

        {/* 3. Core Product Decisions */}
        <div className="space-y-2">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> 3. Core Product Decisions
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse border border-slate-200 text-xs">
              <thead className="bg-slate-50">
                <tr className="border-b border-slate-200 text-slate-600">
                  <th className="p-2.5 font-bold">Area</th>
                  <th className="p-2.5 font-bold">Decision</th>
                  <th className="p-2.5 font-bold">Reason</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Initial Form</td>
                  <td className="p-2.5">Context-based recommendations</td>
                  <td className="p-2.5 text-slate-600">Avoid blank-canvas setup</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Recommendation Engine</td>
                  <td className="p-2.5">Rule-based</td>
                  <td className="p-2.5 text-slate-600">Free, predictable, explainable</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Customization</td>
                  <td className="p-2.5">Full control over recommended fields</td>
                  <td className="p-2.5 text-slate-600">Recommendations assist, not dictate</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Public Booking</td>
                  <td className="p-2.5">Shareable URL</td>
                  <td className="p-2.5 text-slate-600">Works without a website</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Embedding</td>
                  <td className="p-2.5">iframe-based MVP</td>
                  <td className="p-2.5 text-slate-600">Simple website integration</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Draft/Published</td>
                  <td className="p-2.5">Separate states</td>
                  <td className="p-2.5 text-slate-600">Prevent accidental live changes</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Booking</td>
                  <td className="p-2.5">Server-side validation</td>
                  <td className="p-2.5 text-slate-600">Prevent double bookings</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-bold text-slate-900">Historical Data</td>
                  <td className="p-2.5">Snapshots</td>
                  <td className="p-2.5 text-slate-600">Preserve previous booking context</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Research Method */}
        <div className="space-y-2">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-blue-600" /> 4. Research Method
          </h4>
          <p>Clearly distinguish:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg"><strong>[Research Finding]</strong> Evidence from actual users</div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg"><strong>[Assumption]</strong> Unverified belief</div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg"><strong>[Hypothesis]</strong> Testable proposition</div>
            <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg"><strong>[Product Decision]</strong> Resulting product choice</div>
            <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-lg sm:col-span-2 text-emerald-800"><strong>[Validation Result]</strong> Outcome after testing</div>
          </div>
          <p className="text-rose-600 font-medium italic mt-1 text-[11px]">No assumptions will be presented as research findings.</p>
        </div>

        {/* 5. Portfolio Objective */}
        <div className="space-y-2 pb-4">
          <h4 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-blue-600" /> 5. Portfolio Objective
          </h4>
          <p>The project demonstrates the complete product process:</p>
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-center font-bold text-blue-900 text-[11px] overflow-x-auto whitespace-nowrap">
            Research → Strategy → UX → UI → Frontend → Backend → Validation
          </div>
          <p>
            The goal is to show the ability to turn a real business problem into a <strong>usable, researched, and technically functional product</strong>.
          </p>
        </div>
      </div>
    </Modal>
  );
};
