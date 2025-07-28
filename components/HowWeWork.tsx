// // components/HowWeWork.tsx

// import React from "react";
// import Image from "next/image";

// const steps = [
//   {
//     step: "Step-001",
//     title: "Scan-maxxing",
//     img: "/1.png",
//     imgAlt: "Consultation illustration",
//     desc: "Connect with our experts to assess your educational goals and visa requirements",
//   },
//   {
//     step: "Step-002",
//     title: "Brainstorm( AI )",
//     img: "/2.png",
//     imgAlt: "Application illustration",
//     desc: "We guide you in selecting the right program, university and provide full support for your visa application.",
//   },
//   {
//     step: "Step-003",
//     title: "Provide",
//     img: "/3.png",
//     imgAlt: "Fly to destination illustration",
//     desc: "Once approved, you’re ready to start your journey to your dream destination.",
//   },
// ];

// export default function HowWeWork() {
//   return (
//     <section aria-labelledby="how-we-work-heading" className="py-16 lg:py-24">
//       <div className="max-w-5xl mx-auto px-4 sm:px-8">
//         <header className="flex flex-col md:flex-row justify-between  items-start md:items-center mb-12">
//           <h3
//             id="how-we-work-heading"
//             className="text-8xl md:text-8xl font-semibold text-gray-900"
//           >
//             How it works?
//           </h3>
//           <span className="text-base md:text-right text-[#3b3b3b] mt-2 md:mt-0">
//             Make your first step
//             <br />
//             the only step
//           </span>
//         </header>
//         <ol className="space-y-8">
//           {steps.map((step, idx) => (
//             <li
//               className="relative flex items-center bg-white border rounded-[4rem] "
//               key={step.title}
//               aria-label={`${step.title} step`}
//             >
//               <div className="flex-1 flex flex-col justify-start ">
//                 <span className="inline-block w-fit  bg-[#ededed] text-xs font-medium rounded-xl mx-4 px-3 py-1 mb-4 text-gray-500">
//                   {step.step}
//                 </span>

//                 <span className=" text-2xl md:text-3xl mx-4 font-medium mt-4 text-gray-900">
//                   {step.title}
//                 </span>
//               </div>

//               <div className="flex-1 flex justify-center">
//                 <Image
//                   src={step.img}
//                   alt={step.imgAlt}
//                   className="rounded-lg m-2"
//                   width={250}
//                   height={250}
//                   priority={idx === 0}
//                 />
//               </div>

//               {/* ─── Right Description ─── */}
//               <div className="flex-1 flex items-center justify-end md:pl-8">
//                 <p className="text-sm md:text-sm text-gray-900 mx-4 leading-relaxed font-light text-right">
//                   {step.desc}
//                 </p>
//               </div>
//             </li>
//           ))}
//         </ol>
//       </div>
//     </section>
//   );
// }

// components/HowWeWork.tsx

import React from "react";
import Image from "next/image";

const steps = [
  {
    step: "Step-001",
    title: "Scan-maxxing",
    img: "https://res.cloudinary.com/ditn9req1/image/upload/v1753624998/1_phxxuw.png",
    imgAlt: "Consultation illustration",
    desc: "Scan the internet, figure out trends, and find the best opportunities for your career.",
  },
  {
    step: "Step-002",
    title: "Brainstorm( AI )",
    img: "https://res.cloudinary.com/ditn9req1/image/upload/v1753624998/2_pqcqeh.png",
    imgAlt: "Application illustration",
    desc: "We do rigorous deep research and analyze the data with SOTA AI models",
  },
  {
    step: "Step-003",
    title: "Provide",
    img: "https://res.cloudinary.com/ditn9req1/image/upload/v1753625003/3_zjau83.png",
    imgAlt: "Fly to destination illustration",
    desc: "Once analyzed, we then provide you with the best possible personalized roadmap.",
  },
];

export default function HowWeWork() {
  return (
    <section
      aria-labelledby="how-we-work-heading"
      className="py-12 sm:py-16 lg:py-24"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 sm:mb-12">
          <h3
            id="how-we-work-heading"
            className="text-6xl sm:text-6xl md:text-7xl lg:text-8xl font-semibold text-gray-900"
          >
            How it works?
          </h3>
          <span className="text-sm sm:text-base sm:text-right text-[#3b3b3b] mt-4 sm:mt-0">
            Make your first step
            <br />
            the only step
          </span>
        </header>
        <ol className="space-y-6 sm:space-y-8">
          {steps.map((step, idx) => (
            <li
              className="relative flex flex-col lg:flex-row items-center bg-white border rounded-3xl sm:rounded-3xl lg:rounded-[4rem] p-4 sm:p-6 lg:p-0"
              key={step.title}
              aria-label={`${step.title} step`}
            >
              {/* Step and Title Section */}
              <div className="w-full lg:flex-1 flex flex-col justify-start order-1 lg:order-1">
                <span className="inline-block w-fit bg-[#ededed] text-xs font-medium rounded-xl px-3 py-1 mb-3 sm:mb-4 text-gray-500 lg:mx-8">
                  {step.step}
                </span>
                <span className="text-xl sm:text-2xl md:text-3xl font-medium text-gray-900 lg:mx-8 lg:mt-4">
                  {step.title}
                </span>
              </div>

              {/* Image Section */}
              <div className="w-full lg:flex-1 flex justify-center order-2 lg:order-2 lg:my-0">
                <Image
                  src={step.img}
                  alt={step.imgAlt}
                  className="rounded-lg lg:m-2"
                  width={300}
                  height={300}
                  priority={idx === 0}
                  sizes="(max-width: 640px) 200px, (max-width: 1024px) 220px, 250px"
                />
              </div>

              {/* Description Section */}
              <div className="w-full lg:flex-1 flex items-center justify-center lg:justify-end order-3 lg:order-3 lg:pl-8">
                <p className="text-sm md:text-sm text-gray-900 leading-relaxed font-light text-center lg:text-right lg:mx-4">
                  {step.desc}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
