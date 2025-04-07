import { useState } from 'react';


const FAQSection = () => {
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const faqItems = [
    {
      question: "What is CareerRoadmap?",
      answer: "CareerRoadmap is an AI-driven platform that provides personalized career roadmap, curated resources, and real-time event notifications to help you achieve your dream career."
    },
    {
      question: "How does the AI assistant work?",
      answer: "Our AI analyzes your goals and background to build a comprehensive roadmap. It continually updates you with relevant events, scholarships, and programs."
    },
    {
      question: "Can I use CareerRoadmap for free?",
      answer: "No, we dont offer a free plan."
    },
    {
      question: "How do event notifications work?",
      answer: "Our system constantly scrapes and monitors for new opportunities—such as events, tech-fest, workshops, internships, olypmiads and scholarships—and sends you timely alerts."
    },
    {
      question: "Can parents track progress?",
      answer: "Absolutely. Parents can monitor a student's career path, recommend resources, and receive updates on relevant opportunities."
    },
    {
      question: "Is my data secure?",
      answer: "We take data privacy seriously. All information is stored securely, and we only share essential updates based on your preferences."
    }
  ];

  return (
    <section id="faq" className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-5xl font-bold text-gray-800 text-center mb-24">
          Frequently Asked <span className='text-[#FF6500]'>Questions</span>
        </h2>
        <div className="max-w-3xl mx-auto">
          {faqItems.map((item, index) => (
            <div 
              key={index}
              className="border-b border-[#FF6500]-200 last:border-b-0"
            >
              <button
                className="w-full px-4 py-6 text-left flex justify-between items-center  transition-colors"
                onClick={() => setActiveIndex(activeIndex === index ? null : index)}
              >
                <h3 className="text-lg font-normal text-gray-800 pr-4">
                  {item.question}
                </h3>
                <svg
                  className={`w-6 h-6 text-[#FF6500] transform transition-transform duration-300 ${
                    activeIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  activeIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="pb-1 mb-4 px-4 text-gray-600 ">
                  {item.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;