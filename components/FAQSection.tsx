// import { useState } from 'react';

// const FAQSection = () => {
//     const [activeIndex, setActiveIndex] = useState<number | null>(null);

//   const faqItems = [
//     {
//       question: "What is CareerRoadmap?",
//       answer: "CareerRoadmap is an AI-driven platform that provides personalized career roadmap, curated resources, and real-time event notifications to help you achieve your dream career."
//     },
//     {
//       question: "How does the AI assistant work?",
//       answer: "Our AI analyzes your goals and background to build a comprehensive roadmap. It continually updates you with relevant events, scholarships, and programs."
//     },
//     {
//       question: "Can I use CareerRoadmap for free?",
//       answer: "No, we dont offer a free plan."
//     },
//     {
//       question: "How do event notifications work?",
//       answer: "Our system constantly scrapes and monitors for new opportunities—such as events, tech-fest, workshops, internships, olypmiads and scholarships—and sends you timely alerts."
//     },
//     {
//       question: "Can parents track progress?",
//       answer: "Absolutely. Parents can monitor a student's career path, recommend resources, and receive updates on relevant opportunities."
//     },
//     {
//       question: "Is my data secure?",
//       answer: "We take data privacy seriously. All information is stored securely, and we only share essential updates based on your preferences."
//     }
//   ];

//   return (
//     <section id="faq" className="py-16">
//       <div className="container mx-auto px-4">
//         <h2 className="text-3xl md:text-5xl font-bold text-gray-800 text-center mb-24">
//           Frequently Asked <span className='text-[#FF6500]'>Questions</span>
//         </h2>
//         <div className="max-w-3xl mx-auto">
//           {faqItems.map((item, index) => (
//             <div
//               key={index}
//               className="border-b border-[#FF6500]-200 last:border-b-0"
//             >
//               <button
//                 className="w-full px-4 py-6 text-left flex justify-between items-center  transition-colors"
//                 onClick={() => setActiveIndex(activeIndex === index ? null : index)}
//               >
//                 <h3 className="text-lg font-normal text-gray-800 pr-4">
//                   {item.question}
//                 </h3>
//                 <svg
//                   className={`w-6 h-6 text-[#FF6500] transform transition-transform duration-300 ${
//                     activeIndex === index ? 'rotate-180' : ''
//                   }`}
//                   fill="none"
//                   stroke="currentColor"
//                   viewBox="0 0 24 24"
//                 >
//                   <path
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     strokeWidth={2}
//                     d="M19 9l-7 7-7-7"
//                   />
//                 </svg>
//               </button>
//               <div
//                 className={`overflow-hidden transition-all duration-300 ease-in-out ${
//                   activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
//                 }`}
//               >
//                 <div className="pb-1 mb-4 px-4 text-gray-600 ">
//                   {item.answer}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// // export default FAQSection;

// const faqItems = [
//   {
//     question: "What is CareerRoadmap?",
//     answer:
//       "CareerRoadmap is an AI-driven platform that provides personalized career roadmap, curated resources, and real-time event notifications to help you achieve your dream career.",
//   },
//   {
//     question: "How does the AI assistant work?",
//     answer:
//       "Our AI analyzes your goals and background to build a comprehensive roadmap. It continually updates you with relevant events, scholarships, and programs.",
//   },
//   {
//     question: "Can I use CareerRoadmap for free?",
//     answer: "No, we don't offer a free plan.",
//   },
//   {
//     question: "How do event notifications work?",
//     answer:
//       "Our system constantly scrapes and monitors for new opportunities—such as events, tech-fest, workshops, internships, olympiads and scholarships—and sends you timely alerts.",
//   },
//   {
//     question: "Can parents track progress?",
//     answer:
//       "Absolutely. Parents can monitor a student's career path, recommend resources, and receive updates on relevant opportunities.",
//   },
//   {
//     question: "Is my data secure?",
//     answer:
//       "We take data privacy seriously. All information is stored securely, and we only share essential updates based on your preferences.",
//   },
// ];

// export default function FAQSection() {
//   return (
//     <section id="faq" className="py-20 ">
//       <div className="container mx-auto px-4">
//         <h2 className="text-4xl md:text-5xl font-bold text-center text-gray-900 mb-4">
//           Frequently Asked <span className="text-[#FF6500]">Questions</span>
//         </h2>
//         <p className="text-center text-gray-500 mb-20 max-w-2xl mx-auto">
//           With lots of unique blocks, you can easily build a page without
//           coding. Build your next landing page.
//         </p>

//         <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
//           {faqItems.map((item, index) => (
//             <div key={index}>
//               <h3 className="text-xl font-semibold text-gray-900 mb-2">
//                 {item.question}
//               </h3>
//               <p className="text-gray-600">{item.answer}</p>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// }

import React from "react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqItems: FAQItem[] = [
  {
    question: "What is CareerRoadmap?",
    answer:
      "CareerRoadmap is an AI-driven platform that provides personalized career roadmap, curated resources, and real-time event notifications to help you achieve your dream career.",
  },
  {
    question: "How does the AI assistant work?",
    answer:
      "Our AI analyzes your goals and background to build a comprehensive roadmap. It continually updates you with relevant events, scholarships, and programs.",
  },
  {
    question: "Can I use CareerRoadmap for free?",
    answer: "No, we don't offer a free plan.",
  },
  {
    question: "How do event notifications work?",
    answer:
      "Our system constantly scrapes and monitors for new opportunities—such as events, tech-fest, workshops, internships, olympiads and scholarships—and sends you timely alerts.",
  },
  {
    question: "Can parents track progress?",
    answer:
      "Absolutely. Parents can monitor a student's career path, recommend resources, and receive updates on relevant opportunities.",
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
          <p className="text-gray-600" itemProp="text">
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
            Frequently Asked <span className="text-[#FF6500]">Questions</span>
          </h2>
          <p className="text-center text-gray-500 mb-20 max-w-2xl mx-auto">
            With lots of unique blocks, you can easily build a page without
            coding. Build your next landing page.
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
