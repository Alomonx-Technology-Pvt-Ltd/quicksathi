import SectionHeader from "./SectionHeader";
import { ChevronDown } from "lucide-react";

const FAQSection = ({ faqs = [], openFaq, setOpenFaq }) => {
  if (!faqs?.length) return null;

  return (
    <div id="faq-section" className="scroll-mt-24">
      <SectionHeader
        title="Frequently Asked Questions"
        subtitle="Answers to common queries regarding this service"
      />

      <div className="flex flex-col gap-2.5">
        {faqs.map((faq, index) => {
          const isOpen = openFaq === index;
          return (
            <div
              key={index}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? "border-purple-200 bg-purple-50/20 shadow-xs"
                  : "border-slate-200/80 bg-white hover:border-slate-300"
              }`}
            >
              <button
                type="button"
                onClick={() => setOpenFaq(isOpen ? null : index)}
                className="w-full text-left flex items-center justify-between px-5 py-4 border-0 cursor-pointer bg-transparent"
              >
                <span className="font-bold text-xs sm:text-sm text-slate-800 pr-4">
                  {faq.question}
                </span>

                <ChevronDown
                  size={16}
                  className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? "rotate-180 text-purple-600" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="px-5 pb-4 pt-1 border-t border-slate-100/80 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  <p className="m-0">{faq.answer}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FAQSection;
