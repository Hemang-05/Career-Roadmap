import React from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "Is it CareerRoadmap or Careeroadmap?",
    answer:
      "Ofc we know the correct spelling is CareerRoadmap. But we couldn't get the domain for that. So we had to go with Careeroadmap. But don't worry, it's still the same great service!",
  },
  {
    question: "How does the AI assistant work?",
    answer:
      "First of all, its not an assistant, we have AI God, Our AI analyzes your goals and background to build a comprehensive roadmap. It continually updates you with relevant events, scholarships, and programs.",
  },
  {
    question: "Can I use CareerRoadmap for free?",
    answer:
      "All the best things in life come with a price, and our service is no exception. However, we offer affordable plans that provide immense value.",
  },
  {
    question: "How do event notifications work?",
    answer:
      "Our system constantly scrapes and monitors for new opportunities—such as events, tech-fest, workshops, internships, olympiads and scholarships—and sends you timely alerts.",
  },
  {
    question: "Can this make me money?",
    answer:
      "Absolutely. Not directly, but by following the roadmap and taking advantage of opportunities, you can significantly increase your earning potential over time.",
  },
  {
    question: "Is my data secure?",
    answer:
      "We take data privacy seriously. All information is stored securely, and we only share essential updates based on your preferences.",
  },
];

interface FAQItemProps {
  item: FAQItem;
  index: number;
}

const FAQItemComponent: React.FC<FAQItemProps> = ({ item, index }) => {
  // Generate structured data for individual FAQ
  const structuredData = {
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  };

  return (
    <article
      itemScope
      itemType="https://schema.org/Question"
      aria-labelledby={`faq-question-${index}`}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData),
        }}
      />

      <div>
        <h3
          id={`faq-question-${index}`}
          className="text-xl font-semibold text-gray-900 mb-2"
          itemProp="name"
        >
          {item.question}
        </h3>
        <div itemScope itemType="https://schema.org/Answer">
          <p className="text-gray-900 text-base font-thin" itemProp="text">
            {item.answer}
          </p>
        </div>
      </div>
    </article>
  );
};

export default function FAQSection() {
  // Main structured data for FAQ page
  const mainStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };

  return (
    <section
      id="faq"
      className="py-20"
      itemScope
      itemType="https://schema.org/FAQPage"
      aria-labelledby="faq-heading"
    >
      {/* Main FAQ structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(mainStructuredData),
        }}
      />

      <div className="container mx-auto px-4">
        <header className="text-center mb-20">
          <h2
            id="faq-heading"
            className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4"
          >
            Frequently Asked Questions
          </h2>
          <p className="text-center font-thin text-sm text-gray-900 mb-20 max-w-2xl mx-auto">
            Have questions about CareerRoadmap? Here are some common queries
            answered to help you understand our platform and its features.
          </p>

          {/* Hidden SEO content */}
          <div className="sr-only">
            <p>
              CareerRoadmap FAQ section covering AI career planning, event
              notifications, parent tracking, data security, and platform
              features for students and professionals.
            </p>
          </div>
        </header>

        <div
          className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto"
          role="main"
          aria-label="Frequently Asked Questions"
        >
          {faqItems.map((item, index) => (
            <FAQItemComponent key={index} item={item} index={index} />
          ))}
        </div>

        {/* Additional SEO content */}
        <footer className="sr-only">
          <h3>About CareerRoadmap FAQ</h3>
          <p>
            This FAQ section provides comprehensive information about
            CareerRoadmap's AI-powered career planning services, including
            features like personalized roadmaps, event notifications, parent
            tracking, and data security measures.
          </p>
        </footer>
      </div>
    </section>
  );
}
