'use client'
import { GlareCard } from '@/components/ui/GlareCard';

export default function PricingSection() {
  return (
    <section id="pricing" className="container mx-auto py-24">
      <h2 className="text-3xl md:text-5xl font-bold text-center text-black mb-8">Why <span className='text-[#FF6500]'>us?</span></h2>
      <p className="text-gray-600 text-lg text-center px-8 mb-24 max-w-2xl mx-auto">
      Your success story begins with a single smart decision. Partner with us and make every move count.
      </p>
      <div className="flex flex-row flex-wrap justify-center gap-12">
        {/* Self-Guidance Option */}
        <GlareCard>
          <div className="bg-white h-full p-6">
            <h3 className="text-xl text-center font-semibold mt-8 mb-2 text-[#FF6500]">Self-Guidance</h3>
            <p className="text-gray-600 mb-12 text-center">DIY Approach</p>
            <ul className="text-gray-600 list-disc pl-5 space-y-2">
              <li><span className="font-medium">Personalization:</span> Basic</li>
              <li><span className="font-medium">Real-Time Updates:</span> No</li>
              <li><span className="font-medium">Opportunity Alerts:</span> Sporadic</li>
              <li><span className="font-medium">Guidance Depth:</span> Shallow </li>
              <li><span className="font-medium">Cost:</span> Low</li>
              <li><span className="font-medium">Effort:</span> High</li>
            </ul>
          </div>
        </GlareCard>

        {/* Career Roadmap Option */}
        <GlareCard className=" w-[340px] h-auto -mt-4 z-10">
          <div className="bg-white h-full p-6 shadow-xl min-h-[530px]  relative">
            {/* Featured badge */}
            {/* <div className="absolute -top-3 right-6 bg-[#FF6500] text-white text-sm font-bold py-1 px-3 rounded-full">
              RECOMMENDED
            </div> */}
            
            <h3 className="text-2xl font-bold mb-2 mt-8 text-center text-[#FF6500]">Career Roadmap</h3>
            <p className="text-gray-700 mb-12 font-medium text-center">AI-Driven Success</p>
            <ul className="text-gray-700 list-disc pl-5 space-y-2">
              <li><span className="font-medium">Personalization:</span> <span className="text-[#FF6500] font-semibold">High</span></li>
              <li><span className="font-medium">Real-Time Updates:</span> <span className="text-[#FF6500] font-semibold">Instant </span></li>
              <li><span className="font-medium">Opportunity Alerts:</span> <span className="text-[#FF6500] font-semibold">Timely</span></li>
              <li><span className="font-medium">Guidance Depth:</span> <span className="text-[#FF6500] font-semibold">Extensive</span></li>
              <li><span className="font-medium">Cost:</span> <span className="text-[#FF6500] font-semibold">Affordable</span></li>
              <li><span className="font-medium">Effort:</span> <span className="text-[#FF6500] font-semibold">Low</span></li>
            </ul>
          </div>
        </GlareCard>
        
        {/* Career Counselor Option */}
        <GlareCard>
          <div className="bg-white h-full p-6 ">
            <h3 className="text-xl text-center font-semibold mt-8 mb-2 text-[#FF6500]">Career Counselor</h3>
            <p className="text-gray-600 mb-12 text-center">Traditional Guidance</p>
            <ul className="text-gray-600 list-disc pl-5 space-y-2">
              <li><span className="font-medium">Personalization:</span> Moderate</li>
              <li><span className="font-medium">Real-Time Updates:</span> Limited</li>
              <li><span className="font-medium">Opportunity Alerts:</span> Sessional</li>
              <li><span className="font-medium">Guidance Depth:</span> Average</li>
              <li><span className="font-medium">Cost:</span> Expensive</li>
              <li><span className="font-medium">Effort:</span> Moderate</li>
            </ul>
          </div>
        </GlareCard>

        
        
      </div>
    </section>
  );
}