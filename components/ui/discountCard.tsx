// components/ui/discountCard.tsx
import React from 'react';

interface DiscountCardProps {
  className?: string;
}

const DiscountCard: React.FC<DiscountCardProps> = ({ className = "" }) => {
  return (
    <div className={`max-w-[85vh] p-2 border rounded-3xl ${className}`}>
      <h1 className="text-lg sm:text-3xl md:text-3xl lg:text-3xl font-semibold text-gray-900 px-3 mb-2">Get up to 80% Refund!</h1>
      <ol className="px-8 text-gray-700 font-light text-xs list-decimal space-y-2">
        <li>Complete your payment and generate your roadmap.</li>
        <li>Go to the <strong className='text-[#4fbdb7]'>User Analytics</strong> page from the navbar.</li>
        <li>Click the button to generate your unique referral code (which gives 10% discount to others).</li>
        <li>Share your code and at least <strong className='text-[#4fbdb7]'>3 new users</strong> must use your code to make their payment.</li>
        <li>Once these steps are completed, up to <strong className='text-[#4fbdb7]'>80% refund</strong> will be initiated back to you!</li>
      </ol>
    </div>
  );
};

export default DiscountCard;
