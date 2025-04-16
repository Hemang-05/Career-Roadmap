'use client'
import { GlareCard } from '@/components/ui/GlareCard';

export default function Plans() {
  return (
    <section id="pricing"className="container mx-auto py-24">
      <h2 className="text-3xl md:text-5xl font-bold text-center text-black mb-8">Our<span className='text-[#FF6500]'> plans?</span></h2>
      <p className="text-gray-600 text-lg text-center px-8 mb-24 max-w-2xl mx-auto">
      Achieve your goals for the price of a one-off fast-food treat. It’s a smart choice to invest in something that truly benefits your future.
      </p>
      <div className="flex flex-row flex-wrap justify-center gap-12">

        {/* Career Roadmap Option */}
        <GlareCard className=" w-[340px] h-auto -mt-4 z-10">
          <div className="bg-white h-full p-6 shadow-xl min-h-[530px]  relative">
            
            <h3 className="text-2xl font-bold mb-2 mt-8 text-center text-[#FF6500]">Pricing</h3>
            <p className="text-gray-700 mb-12 font-medium text-center">Differ by time period</p>
            <ul className="text-gray-700 list-disc pl-5 space-y-2">
  <li>
    <span className="font-medium">Monthly: </span> 
    <span className="text-[#FF6500] font-semibold">  ₹ 499</span>
  </li>
  <li>
    <span className="font-medium">Quarterly: </span> 
    <span className="text-[#FF6500] font-semibold">  ₹ 1299</span>
    <span className="text-gray-500 line-through ml-2"> ₹ 1497</span>
  </li>
  <li>
    <span className="font-medium">Yearly: </span> 
    <span className="text-[#FF6500] font-semibold">  ₹ 4999</span>
    <span className="text-gray-500 line-through ml-2"> ₹ 5988</span>
  </li>
</ul>

            <p className=" mt-12 font-thin text-sm text-slate-500 text-center">Taxes not included</p>
          </div>
        </GlareCard> 
        
      </div>
    </section>
  );
}
