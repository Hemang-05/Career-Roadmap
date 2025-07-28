"use client";

interface AwareUnawareButtonProps {
  user: any;
  onAwareClick: () => void;
  onConfusedClick: () => void;
}

export default function AwareUnawareButton({ 
  user, 
  onAwareClick, 
  onConfusedClick 
}: AwareUnawareButtonProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 bg-[#ffff]">
      <div className="text-center max-w-3xl">
        <h1 className="text-2xl font-medium text-black mb-2">
        Welcome <span>{user?.firstName}!</span>
        </h1>
        <p className="text-base font-light text-gray-600 mb-12" >No more career gaps. Let’s build your success story.</p>
        
        <div className="md:space-x-2 space-y-2 md:space-y-0 ">
          <button
            onClick={onAwareClick}
            className="w-80% max-w-lg bg-gray-500/5 backdrop-blur-md text-gray-700 py-4 px-6 rounded-full border border-gray-200 transition-all duration-300 font-light hover:shadow-sm hover:shadow-gray-700/60 hover:-translate-y-0.5 hover:bg-white/25"
          >
            I know what career to pursue
          </button>
          
          <button
            onClick={onConfusedClick}
            className="w-80% max-w-lg bg-gray-500/5 backdrop-blur-md text-gray-700 py-4 px-6 rounded-full border border-gray-200 transition-all duration-300 font-light hover:shadow-sm hover:shadow-gray-700/60 hover:-translate-y-0.5 hover:bg-white/25"    //w-80% max-w-lg bg-gray-500/5 backdrop-blur-md text-gray-700 py-4 px-6 rounded-full border border-gray-200 transition-all duration-300 font-light hover:shadow-sm hover:shadow-gray-700/60 hover:-translate-y-0.5 hover:bg-white/25
          >
            I am confused about my career
          </button>
        </div>
        <p className="text-xs font-light text-gray-400 mt-4" >Choose one</p>
      </div>
    </div>
  );
}
