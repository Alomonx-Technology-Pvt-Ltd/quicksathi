import SectionHeader from "./SectionHeader";

const FAQSection = ({ faqs, openFaq, setOpenFaq }) => {
  if (!faqs?.length) return null;

  return (
    <div>
      <SectionHeader title="Frequently Asked Questions" />

      <div className="flex flex-col gap-3">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className="rounded-2xl border overflow-hidden"
            style={{
              backgroundColor: "var(--color-bg-white)",
              borderColor: "var(--color-border)",
            }}
          >
            <button
              onClick={() => setOpenFaq(openFaq === index ? null : index)}
              className="w-full text-left flex items-center justify-between px-5 py-4 border-0 cursor-pointer"
              style={{
                backgroundColor: "transparent",
                fontFamily: "var(--font-body)",
              }}
            >
              <span
                className="font-semibold text-sm"
                style={{
                  color: "var(--color-text-dark)",
                }}
              >
                {faq.question}
              </span>

              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  color: "var(--color-text-mid)",
                  transform:
                    openFaq === index ? "rotate(180deg)" : "rotate(0deg)",
                  transition: "0.25s",
                }}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {openFaq === index && (
              <div className="px-5 pb-4">
                <p
                  className="text-sm italic leading-relaxed m-0"
                  style={{
                    fontFamily: "var(--font-body)",
                    color: "var(--color-text-mid)",
                  }}
                >
                  {faq.answer}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQSection;
