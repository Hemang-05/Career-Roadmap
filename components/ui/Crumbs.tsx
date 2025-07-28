import React from "react";

function Crumbs() {
  return (
    <div className="min-h-screen p-8">
      {/* <p className="text-center text-sm text-gray-500 mb-16">
        Backed by the most trustworthy authority, i.e.{" "}
        <span className="text-gray-900 font-semibold">
          the Science and the Data.
        </span>
      </p> */}
      <h3 className=" sm:text-6xl md:text-7xl lg:text-7xl font-semibold text-gray-900 max-w-6xl mx-auto px-4 sm:px-4 lg:px-4 mb-16">
        Backed by: Science and Data
      </h3>
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:h-screen">
          {/* Left Column - Two stacked images */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Top Image */}
            <div
              className="bg-gray-300 rounded-[4rem] min-h-64 mb-8 lg:flex-1 flex items-center bg-cover bg-center bg-no-repeat justify-center"
              style={{
                backgroundImage: `
            linear-gradient(
              to bottom,
              rgba(0,0,0,0.3),
              rgba(0,0,0,0.3)
            ),
            url(${"https://res.cloudinary.com/ditn9req1/image/upload/v1753625004/img2_stgfjp.jpg"})
          `,
              }}
            >
              <span className="text-2xl px-8 font-medium text-white">
                Data shows that goal‑based planning can result in{" "}
                <span className="bg-green-600 px-1.5 rounded-xl text-white font-semibold">
                  $200K
                </span>{" "}
                more per year.
              </span>
            </div>

            {/* Mobile: First text after first image */}
            <div className="lg:hidden">
              <h2 className="text-base font-normal text-gray-900">
                Over a decade or full career, this accumulates to{" "}
                <span className="bg-green-600 px-1.5 rounded-xl text-white font-semibold">
                  thousands or even millions
                </span>{" "}
                difference in total earnings.
              </h2>
            </div>

            {/* Bottom Image */}
            <div
              className="bg-gray-300 rounded-[4rem] min-h-64 lg:flex-1 flex items-center bg-cover bg-center bg-no-repeat justify-center"
              style={{
                backgroundImage: `
            linear-gradient(
              to bottom,
              rgba(0,0,0,0.3),
              rgba(0,0,0,0.3)
            ),
            url(${"https://res.cloudinary.com/ditn9req1/image/upload/v1753625005/15_itofak.jpg"})
          `,
              }}
            >
              <span className="text-2xl px-8 font-medium text-white">
                {" "}
                <span className="bg-yellow-400 px-1.5 rounded-xl text-white font-semibold">
                  63% GenZ students
                </span>{" "}
                fear job instability due to changing times
              </span>
            </div>

            {/* Mobile: Second text after second image */}
            <div className="lg:hidden">
              <h2 className="text-base font-thin text-gray-900">
                {" "}
                <span className="bg-red-400 px-1 rounded-lg text-white font-semibold">
                  ~600–800 million students
                </span>{" "}
                feel uneasy about their chosen route or future prospects.
              </h2>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-6 flex flex-col gap-6 h-full">
            {/* Top Text - 1/4 */}
            <div className="hidden lg:flex lg:h-1/5 lg:items-start lg:pt-8 px-24">
              <h2 className="text-base font-thin text-black">
                Over a decade or full career, this accumulates to hundreds of{" "}
                <span className="bg-green-600 px-1.5 rounded-lg text-white font-semibold">
                  thousands or even millions
                </span>{" "}
                difference in total earnings.
              </h2>
            </div>

            {/* Middle Image - 1/2 */}
            {/* <div className="bg-gray-300 rounded-2xl h-64 lg:h-1/2 flex items-center justify-center">
              <span className="text-2xl font-medium text-gray-700">Image</span>
            </div> */}
            <div
              className="rounded-[4rem] min-h-64 lg:m-8 lg:h-3/5 flex items-center justify-center bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: `
            linear-gradient(
              to bottom,
              rgba(0,0,0,0.3),
              rgba(0,0,0,0.3)
            ),
            url(${"https://res.cloudinary.com/ditn9req1/image/upload/v1753625007/oo_wjh7tq.jpg"})
          `,
              }}
            >
              <span className="text-2xl px-8 font-medium text-white">
                Only{" "}
                <span className="bg-blue-400 px-1 rounded-xl text-white font-semibold">
                  3%–5% of students
                </span>{" "}
                around the world follow a genuine, evolving, high‑quality career
                roadmap
              </span>
            </div>

            {/* Bottom Text - 1/4 */}
            <div className="hidden lg:flex lg:h-1/5 lg:items-end lg:pb-8 px-24">
              <h2 className="text-base font-thin text-gray-900">
                {" "}
                <span className="bg-red-400 px-1 rounded-lg text-white font-semibold">
                  ~600–800 million students
                </span>{" "}
                around the world feel uneasy about their chosen route or future
                prospects.
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Crumbs;
