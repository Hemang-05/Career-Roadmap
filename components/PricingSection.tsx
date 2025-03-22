'use client'
import { GlareCard } from '@/components/ui/GlareCard';
import { SignInButton } from '@clerk/nextjs'

export default function PricingSection() {
  return (
    <section id="pricing" className="container mx-auto px-4 py-16 text-center">
      <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">Pricing</h2>
      <p className="text-gray-600 text-lg mb-10 max-w-2xl mx-auto">
        Choose a plan that fits your needs. Get started for free, upgrade anytime.
      </p>
      {/* Updated grid layout to 2 columns on md screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 justify-items-center">
        {/* Free Plan */}
        <GlareCard>
          <div className="bg-white h-full p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-2 text-[#FF6500]">Free</h3>
            <p className="text-gray-600 mb-4">$0 / month</p>
            <ul className="text-gray-600 mb-6 list-disc pl-5 space-y-2">
              <li>Basic AI Career Counselor</li>
              <li>Limited Roadmaps</li>
              <li>Email Updates</li>
            </ul>
            <button className="bg-white text-black py-2 px-8 rounded-full border-2 hover:border-transparent border-black transition-all duration-500 hover:bg-orange-400 mb-2">
              Get Started
            </button>
          </div>
        </GlareCard>

        {/* Pro Plan */}
        <GlareCard>
          <div className="bg-white h-full p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-semibold mb-2 text-[#FF6500]">Pro</h3>
            <p className="text-gray-600 mb-4">$9.99 / month</p>
            <ul className="text-gray-600 mb-6 list-disc pl-5 space-y-2">
              <li>Unlimited Roadmaps</li>
              <li>Personalized Email Alerts</li>
              <li>Resource Recommendations</li>
              <li>Priority Support</li>
            </ul>
            <button className="bg-white text-black py-2 px-8 rounded-full border-2 hover:border-transparent border-black transition-all duration-500 hover:bg-orange-400 mb-2">
              Upgrade
            </button>
          </div>
        </GlareCard>
      </div>
    </section>
  );
}
