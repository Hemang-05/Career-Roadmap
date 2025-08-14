// // components\RoadmapDisplay.tsx

// import { useState } from "react";
// import { Youtube, ExternalLink, Lightbulb } from "lucide-react";
// import Tooltip from "@/components/ui/Tooltip";

// // Helper function to check if a year is complete
// export function isYearComplete(yearItem: any): boolean {
//   if (!yearItem?.phases) return true; // An empty year (no phases) can be considered complete

//   for (const phase of yearItem.phases) {
//     if (!phase?.milestones) continue;
//     for (const milestone of phase.milestones) {
//       if (!milestone?.tasks) continue;
//       for (const task of milestone.tasks) {
//         if (!task.completed) return false;
//       }
//     }
//   }
//   return true;
// }

// // Helper function to convert various YouTube URL formats to embed URL
// function getYouTubeEmbedUrl(url: string): string | undefined {
//   if (!url) return undefined;

//   // Check if it's already an embed URL
//   if (url.includes("youtube.com/embed")) {
//     return url;
//   }

//   // Handle youtube.com/watch?v= format
//   const watchMatch = url.match(
//     /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\/]+)/
//   );
//   if (watchMatch && watchMatch[1]) {
//     return `https://www.youtube.com/embed/${watchMatch[1]}`;
//   }

//   // Handle youtu.be/ID format
//   const shortMatch = url.match(/youtu\.be\/([^&?\/]+)/);
//   if (shortMatch && shortMatch[1]) {
//     return `https://www.youtube.com/embed/${shortMatch[1]}`;
//   }

//   return undefined;
// }

// // YouTube Embed component
// function YouTubeEmbed({ url, title }: { url: string; title?: string }) {
//   const embedUrl = getYouTubeEmbedUrl(url);

//   console.log("RAW URL:", url);
//   console.log("EMBED URL:", embedUrl);

//   if (!embedUrl) return null;

//   return (
//     <div className="w-full flex my-4">
//       <div className="relative w-4/5 md:w-3/4 lg:w-1/3 aspect-video">
//         <iframe
//           className="absolute top-0 left-0 w-full h-full rounded-md"
//           src={embedUrl}
//           title={title || "YouTube Video"}
//           frameBorder="0"
//           allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
//           allowFullScreen
//         ></iframe>
//       </div>
//     </div>
//   );
// }

// interface RoadmapDisplayProps {
//   roadmapData: any;
//   onTaskUpdate: (updatedRoadmap: any) => void; // Pass the whole updated roadmap for progress recalc
//   openYearIndices: number[];
//   toggleYear: (index: number) => void;
// }

// export default function RoadmapDisplay({
//   roadmapData,
//   onTaskUpdate,
//   openYearIndices,
//   toggleYear,
// }: RoadmapDisplayProps) {
//   // Make sure roadmapData and its nested properties are valid before rendering
//   if (!roadmapData?.yearly_roadmap) {
//     return <p className="text-black">Roadmap data is not available.</p>;
//   }

//   return (
//     <div className="space-y-6 md:space-y-8">
//       {roadmapData.yearly_roadmap.map((yearItem: any, yearIndex: number) => {
//         const isFirstYear = yearIndex === 0;
//         const prevYear = roadmapData.yearly_roadmap[yearIndex - 1];
//         // Ensure prevYear is valid before calling isYearComplete
//         const unlocked =
//           isFirstYear || (prevYear ? isYearComplete(prevYear) : true);
//         const isOpen = openYearIndices.includes(yearIndex);

//         return (
//           <section
//             key={yearItem.year || yearIndex} // Use a stable key
//             className="p-4 md:p-6 lg:p-8 rounded-[2rem] md:rounded-[3rem] mb-10 md:mb-16 lg:mb-20 bg-white  shadow-[0_0_15px_rgba(147,51,234,0.12)] md:shadow-[0_0_25px_rgba(147,51,234,0.18)]
// "
//           >
//             <header
//               className="flex justify-between items-center cursor-pointer mb-4 md:mb-6 lg:mb-8"
//               onClick={() => unlocked && toggleYear(yearIndex)}
//             >
//               <h2 className="text-xl md:text-2xl font-bold text-gray-800">
//                 {yearItem.year || `Year ${yearIndex + 1}`}{" "}
//                 {!unlocked && (
//                   <span className="text-red-700 text-sm md:text-base">
//                     (Locked)
//                   </span>
//                 )}
//               </h2>
//               {unlocked && (
//                 <button className="text-[#48b98d] flex items-center transition-all duration-300 hover:opacity-80">
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     width="24"
//                     height="24"
//                     viewBox="0 0 24 24"
//                     fill="none"
//                     stroke="currentColor"
//                     strokeWidth="2"
//                     strokeLinecap="round"
//                     strokeLinejoin="round"
//                     className={`transform transition-transform duration-300 ${
//                       isOpen ? "rotate-180" : ""
//                     }`}
//                   >
//                     <polyline points="6 9 12 15 18 9" />
//                   </svg>
//                   <span className="ml-1 text-xs sm:text-sm font-medium">
//                     {isOpen ? "" : "Show Tasks"}
//                   </span>
//                 </button>
//               )}
//             </header>

//             {yearItem.overview && (
//               <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6 lg:mb-8">
//                 {yearItem.overview}
//               </p>
//             )}

//             {/* Display phases based on unlocked and open state */}
//             {unlocked && isOpen ? (
//               // Open state - show detailed content
//               (yearItem.phases || []).map((phaseItem: any, pIdx: number) => (
//                 <div
//                   key={phaseItem.phase_name || pIdx}
//                   className="mx-0 md:mx-2 lg:mx-4 border-t py-4 md:py-6 lg:py-8"
//                 >
//                   <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 lg:mb-8 text-[#39a894]">
//                     {phaseItem.phase_name || `Phase ${pIdx + 1}`}
//                   </h3>

//                   {phaseItem.description && (
//                     <p className="text-gray-600 text-sm md:text-base mb-4">
//                       {phaseItem.description}
//                     </p>
//                   )}

//                   {/* Show milestones */}
//                   {(phaseItem.milestones || []).map(
//                     (milestone: any, mIdx: number) => (
//                       <div
//                         key={milestone.name || mIdx}
//                         className="mx-0 md:mx-2 lg:mx-4 mb-4 md:mb-6"
//                       >
//                         <h4 className="text-base md:text-lg font-semibold text-gray-800">
//                           {milestone.name || "Milestone"}
//                         </h4>

//                         {milestone.description && (
//                           <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">
//                             {milestone.description}
//                           </p>
//                         )}

//                         {/* Task list */}
//                         <ul className="space-y-4 md:space-y-6">
//                           {(milestone.tasks || []).map(
//                             (task: any, tIdx: number) => (
//                               <li
//                                 key={task.task_title || tIdx}
//                                 className="flex items-start pl-2 md:pl-4 relative"
//                               >
//                                 {/* Bullet Point */}
//                                 <div className="absolute left-0 top-1 text-lg">
//                                   •
//                                 </div>

//                                 {/* Custom Checkbox */}
//                                 <div
//                                   onClick={() => {
//                                     // Optimistically update the task
//                                     const newRoadmapData = JSON.parse(
//                                       JSON.stringify(roadmapData)
//                                     ); // Deep copy
//                                     const currentTask =
//                                       newRoadmapData.yearly_roadmap[yearIndex]
//                                         .phases[pIdx].milestones[mIdx].tasks[
//                                         tIdx
//                                       ];
//                                     currentTask.completed =
//                                       !currentTask.completed;

//                                     onTaskUpdate(newRoadmapData); // Update parent state for re-render & progress calc

//                                     fetch("/api/update-task", {
//                                       method: "POST",
//                                       headers: {
//                                         "Content-Type": "application/json",
//                                       },
//                                       body: JSON.stringify({
//                                         user_id: roadmapData.user_id, // ensure user_id is part of roadmapData
//                                         task_title: task.task_title,
//                                         completed: currentTask.completed,
//                                         // Use the unique phase identifier from the API response
//                                         currentPhaseIdentifier:
//                                           phaseItem.phase_name,
//                                       }),
//                                     })
//                                       .then(async (res) => {
//                                         if (!res.ok) {
//                                           // Revert on failure
//                                           const revertedRoadmap = JSON.parse(
//                                             JSON.stringify(roadmapData)
//                                           ); // Get original copy
//                                           onTaskUpdate(revertedRoadmap);
//                                           console.error(
//                                             "Failed to update task:",
//                                             await res.json()
//                                           );
//                                         } else {
//                                           //  notify analytics listeners
//                                           window.dispatchEvent(
//                                             new Event("analyticsUpdated")
//                                           );
//                                         }
//                                       })
//                                       .catch(() => {
//                                         // Revert on network error
//                                         const revertedRoadmap = JSON.parse(
//                                           JSON.stringify(roadmapData)
//                                         );
//                                         onTaskUpdate(revertedRoadmap);
//                                       });
//                                   }}
//                                   className={`
//                                 w-5 h-5 rounded-full flex items-center justify-center cursor-pointer mr-2 md:mr-3 flex-shrink-0 mt-1
//                                 border-2 transition-colors duration-200
//                                 ${
//                                   task.completed
//                                     ? "bg-green-500 border-green-500"
//                                     : "bg-gray-200 border-gray-300 hover:border-gray-400"
//                                 }
//                               `}
//                                 >
//                                   {task.completed && (
//                                     <svg
//                                       className="w-3 h-3 text-white"
//                                       fill="none"
//                                       stroke="currentColor"
//                                       viewBox="0 0 24 24"
//                                     >
//                                       <path
//                                         strokeLinecap="round"
//                                         strokeLinejoin="round"
//                                         strokeWidth="2"
//                                         d="M5 13l4 4L19 7"
//                                       />
//                                     </svg>
//                                   )}
//                                 </div>

//                                 {/* Hidden native checkbox for accessibility */}
//                                 <input
//                                   type="checkbox"
//                                   checked={task.completed ?? false}
//                                   onChange={() => {}} // Handler is on the div
//                                   className="sr-only"
//                                   aria-labelledby={`task-title-${yearIndex}-${pIdx}-${mIdx}-${tIdx}`}
//                                 />

//                                 {/* Task Content */}
//                                 <div className="flex-grow">
//                                   <div className="flex justify-between items-start flex-wrap">
//                                     <span
//                                       id={`task-title-${yearIndex}-${pIdx}-${mIdx}-${tIdx}`}
//                                       className="font-medium text-sm md:text-base text-black mr-2"
//                                     >
//                                       {task.task_title}
//                                     </span>
//                                     <div className="flex items-center ml-auto">
//                                       {task.importance_explanation && (
//                                         <Tooltip
//                                           label={task.importance_explanation}
//                                         >
//                                           <Lightbulb className="w-4 h-4 text-yellow-500 mr-2" />
//                                         </Tooltip>
//                                       )}
//                                       <span className="text-xs md:text-sm font-thin text-gray-600 whitespace-nowrap">
//                                         Weight: {task.weight}
//                                       </span>
//                                     </div>
//                                   </div>

//                                   <p className="text-gray-600 font-extralight text-xs md:text-sm mt-1 mb-2">
//                                     {task.description}
//                                   </p>

//                                   {/* Media and links section */}
//                                   <div className="mt-2">
//                                     {/* YouTube video embedding using the component */}
//                                     {task.youtube_url && (
//                                       <YouTubeEmbed
//                                         url={task.youtube_url}
//                                         title={task.task_title}
//                                       />
//                                     )}

//                                     {/* Original video handling */}
//                                     {task.video?.url && (
//                                       <YouTubeEmbed
//                                         url={task.video.url}
//                                         title={
//                                           task.video.title || task.task_title
//                                         }
//                                       />
//                                     )}

//                                     {/* Video channel link with updated styling */}
//                                     {task.video_channel?.url &&
//                                       !getYouTubeEmbedUrl(
//                                         task.video_channel.url
//                                       ) && (
//                                         <div className="mb-3 p-2 border border-gray-200 rounded-lg flex items-center hover:bg-gray-50 transition">
//                                           <Youtube className="w-6 h-6 mr-2 text-gray-800" />
//                                           <a
//                                             href={task.video_channel.url}
//                                             target="_blank"
//                                             rel="noopener noreferrer"
//                                             className="font-medium text-sm text-gray-800"
//                                           >
//                                             {task.video_channel.name}
//                                           </a>
//                                         </div>
//                                       )}

//                                     {/* External links */}
//                                     {(task.platform_links || []).map(
//                                       (link: any, i: number) => (
//                                         <a
//                                           key={link.url || i}
//                                           href={link.url}
//                                           target="_blank"
//                                           rel="noopener noreferrer"
//                                           className="flex items-center mb-1 text-blue-600 hover:underline"
//                                         >
//                                           <ExternalLink className="w-4 h-4 mr-1" />
//                                           {link.name || "Platform Link"}
//                                         </a>
//                                       )
//                                     )}
//                                   </div>
//                                 </div>
//                               </li>
//                             )
//                           )}
//                         </ul>
//                       </div>
//                     )
//                   )}
//                 </div>
//               ))
//             ) : (
//               // Closed state - show summary
//               <div>
//                 {(yearItem.phases || []).length > 0 && (
//                   <>
//                     {(yearItem.phases || []).map(
//                       (phase: any, phaseIndex: number) => (
//                         <div
//                           key={phaseIndex}
//                           className="mb-4 md:mb-6 border-t pt-3 md:pt-4"
//                         >
//                           <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-[#97518c]">
//                             {phase.phase_name}
//                           </h3>
//                           {(phase.milestones || []).map(
//                             (milestone: any, mIndex: number) => (
//                               <div
//                                 key={mIndex}
//                                 className="ml-2 md:ml-4 mb-1 md:mb-2"
//                               >
//                                 <h4 className="text-sm md:text-base font-medium text-gray-800">
//                                   {milestone.name}
//                                 </h4>
//                                 <p className="text-gray-600 text-xs md:text-sm">
//                                   {milestone.description}
//                                 </p>
//                               </div>
//                             )
//                           )}
//                         </div>
//                       )
//                     )}

//                     {unlocked && (
//                       <div className="border-t pt-4 mt-4 text-center">
//                         <p className="text-gray-600 text-sm">
//                           Click to view tasks for this year.
//                         </p>
//                       </div>
//                     )}
//                   </>
//                 )}
//               </div>
//             )}
//           </section>
//         );
//       })}

//       {roadmapData.final_notes && (
//         <div className="mt-6 md:mt-8 p-4 border-t">
//           <h3 className="text-xl font-semibold text-gray-800 mb-2">
//             Final Notes
//           </h3>
//           <p className="text-gray-700 text-sm md:text-base">
//             {roadmapData.final_notes}
//           </p>
//         </div>
//       )}
//     </div>
//   );
// }



import { useState } from "react";
import { Youtube, ExternalLink, Lightbulb, RotateCcw } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import RoadmapProofs from "@/components/RoadmapProofs"; // <-- NEW import

// Helper function to check if a year is complete
export function isYearComplete(yearItem: any): boolean {
  if (!yearItem?.phases) return true;

  for (const phase of yearItem.phases) {
    if (!phase?.milestones) continue;
    for (const milestone of phase.milestones) {
      if (!milestone?.tasks) continue;
      for (const task of milestone.tasks) {
        if (!task.completed) return false;
      }
    }
  }
  return true;
}

// NEW: helper to check if a phase is complete
function isPhaseComplete(phaseItem: any): boolean {
  if (!phaseItem?.milestones) return true;
  for (const milestone of phaseItem.milestones) {
    if (!milestone?.tasks) continue;
    for (const task of milestone.tasks) {
      if (!task.completed) return false;
    }
  }
  return true;
}

// Helper function to convert various YouTube URL formats to embed URL
function getYouTubeEmbedUrl(url: string): string | undefined {
  if (!url) return undefined;

  if (url.includes("youtube.com/embed")) {
    return url;
  }

  const watchMatch = url.match(
    /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\/]+)/
  );
  if (watchMatch && watchMatch[1]) {
    return `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  const shortMatch = url.match(/youtu\.be\/([^&?\/]+)/);
  if (shortMatch && shortMatch[1]) {
    return `https://www.youtube.com/embed/${shortMatch[1]}`;
  }

  return undefined;
}

// Enhanced YouTube Embed component with refresh functionality
function YouTubeEmbed({ 
  video, 
  videos, 
  currentIndex, 
  title, 
  onVideoChange 
}: { 
  video?: any; 
  videos?: any[]; 
  currentIndex?: number; 
  title?: string;
  onVideoChange?: (newIndex: number) => void;
}) {
  // Add switching state
  const [isSwitching, setIsSwitching] = useState(false);

  // Handle both old single video and new videos array structure
  const currentVideo = videos && videos.length > 0 
    ? videos[currentIndex || 0] 
    : video;

  if (!currentVideo?.url) return null;

  const embedUrl = getYouTubeEmbedUrl(currentVideo.url);
  if (!embedUrl) return null;

  const handleRefresh = () => {
    if (videos && videos.length > 1 && onVideoChange) {
      setIsSwitching(true); // Show overlay
      const nextIndex = ((currentIndex || 0) + 1) % videos.length;
      onVideoChange(nextIndex);
      
      // Reset after 600ms
      setTimeout(() => {
        setIsSwitching(false);
      }, 600);
    }
  };

  return (
    <div className="w-full flex my-4">
      {/* Video iframe with overlay loader */}
      <div className="relative w-4/5 md:w-3/4 lg:w-1/3 aspect-video">
        <iframe
          className="absolute top-0 left-0 w-full h-full rounded-md"
          src={embedUrl}
          title={currentVideo.title || title || "YouTube Video"}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
        
        {/* Switching overlay */}
        {isSwitching && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-md">
            <div className="text-white text-sm flex items-center">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              Switching video...
            </div>
          </div>
        )}
      </div>

      {/* Video metadata and controls - OUTSIDE the video thumbnail */}
      <div className="ml-4 flex flex-col justify-center">
        {/* Refresh button */}
        {videos && videos.length > 1 && (
          <div className="flex items-center mb-2">
            <Tooltip label={`Switch video (${(currentIndex || 0) + 1}/${videos.length})`}>
              <button
                onClick={handleRefresh}
                disabled={isSwitching}
                className={`flex items-center transition-colors duration-200 text-gray-700 hover:text-gray-900`}
                aria-label="Switch to next video option"
              >
                <RotateCcw className={`w-4 h-4 mr-2`} />
                <span className="sm:text-sm text-xs font-thin">
                  Switch video
                </span>
              </button>
            </Tooltip>
          </div>
        )}

        {/* Video metadata - only show if data exists */}
        {currentVideo && (
          <div className="space-y-1">
            {/* Video counter - only for multiple videos */}
            {videos && videos.length > 1 && (
              <div className="text-xs text-gray-600">
                Video {(currentIndex || 0) + 1} of {videos.length}
              </div>
            )}
            
            {/* Teaching style - only if available */}
            {currentVideo.teaching_style && currentVideo.teaching_style !== 'Unknown' && (
              <div className="text-xs text-gray-500">
                Style: {currentVideo.teaching_style}
              </div>
            )}
            
            {/* Duration - only if available */}
            {currentVideo.duration && currentVideo.duration !== 'Unknown' && (
              <div className="text-xs text-gray-500">
                Duration: {currentVideo.duration}
              </div>
            )}
            
            {/* Quality score - only if available */}
            {currentVideo.rag_score != null && currentVideo.rag_score !== undefined && (
              <div className="text-xs text-gray-500">
                Quality: {currentVideo.rag_score}/100
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface RoadmapDisplayProps {
  roadmapData: any;
  onTaskUpdate: (updatedRoadmap: any) => void;
  openYearIndices: number[];
  toggleYear: (index: number) => void;
}

export default function RoadmapDisplay({
  roadmapData,
  onTaskUpdate,
  openYearIndices,
  toggleYear,
}: RoadmapDisplayProps) {
  // State to track current video indices for each task
  const [taskVideoIndices, setTaskVideoIndices] = useState<{[key: string]: number}>({});

  // Helper function to get unique task key
  const getTaskKey = (yearIndex: number, phaseIndex: number, milestoneIndex: number, taskIndex: number) => {
    return `${yearIndex}-${phaseIndex}-${milestoneIndex}-${taskIndex}`;
  };

  // Handler for video cycling
  const handleVideoChange = (taskKey: string, newIndex: number) => {
    setTaskVideoIndices(prev => ({
      ...prev,
      [taskKey]: newIndex
    }));
  };

  if (!roadmapData?.yearly_roadmap) {
    return <p className="text-black">Roadmap data is not available.</p>;
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {roadmapData.yearly_roadmap.map((yearItem: any, yearIndex: number) => {
        const isFirstYear = yearIndex === 0;
        const prevYear = roadmapData.yearly_roadmap[yearIndex - 1];
        const unlocked =
          isFirstYear || (prevYear ? isYearComplete(prevYear) : true);
        const isOpen = openYearIndices.includes(yearIndex);

        return (
          <section
            key={yearItem.year || yearIndex}
            className="p-4 md:p-6 lg:p-8 rounded-[2rem] md:rounded-[3rem] mb-10 md:mb-16 lg:mb-20 bg-white shadow-[0_0_15px_rgba(147,51,234,0.12)] md:shadow-[0_0_25px_rgba(147,51,234,0.18)]"
          >
            {/* ✅ UPDATED: Removed manual toggle functionality */}
            <header className="flex justify-between items-center mb-4 md:mb-6 lg:mb-8">
              <h2 className="text-xl md:text-2xl font-bold text-gray-800">
                {yearItem.year || `Year ${yearIndex + 1}`}{" "}
                {!unlocked && (
                  <span className="text-red-700 text-sm md:text-base">
                    (Locked)
                  </span>
                )}
              </h2>
              
              {/* ✅ UPDATED: Progress indicator for locked years */}
              {!unlocked && (
                <div className="text-gray-500 text-sm">
                  Complete previous year to unlock
                </div>
              )}
            </header>

            {yearItem.overview && (
              <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6 lg:mb-8">
                {yearItem.overview}
              </p>
            )}

            {unlocked && isOpen ? (
              <>
                {(yearItem.phases || []).map((phaseItem: any, pIdx: number) => (
                  <div
                    key={phaseItem.phase_name || pIdx}
                    className="mx-0 md:mx-2 lg:mx-4 border-t py-4 md:py-6 lg:py-8"
                  >
                    <h3 className="text-lg md:text-xl font-semibold mb-4 md:mb-6 lg:mb-8 text-[#39a894]">
                      {phaseItem.phase_name || `Phase ${pIdx + 1}`}
                    </h3>

                    {phaseItem.description && (
                      <p className="text-gray-600 text-sm md:text-base mb-4">
                        {phaseItem.description}
                      </p>
                    )}

                    {(phaseItem.milestones || []).map(
                      (milestone: any, mIdx: number) => (
                        <div
                          key={milestone.name || mIdx}
                          className="mx-0 md:mx-2 lg:mx-4 mb-4 md:mb-6"
                        >
                          <h4 className="text-base md:text-lg font-semibold text-gray-800">
                            {milestone.name || "Milestone"}
                          </h4>

                          {milestone.description && (
                            <p className="text-gray-600 text-sm md:text-base mb-4 md:mb-6">
                              {milestone.description}
                            </p>
                          )}

                          <ul className="space-y-4 md:space-y-6">
                            {(milestone.tasks || []).map(
                              (task: any, tIdx: number) => {
                                const taskKey = getTaskKey(yearIndex, pIdx, mIdx, tIdx);
                                const currentVideoIndex = taskVideoIndices[taskKey] || 0;

                                return (
                                  <li
                                    key={task.task_title || tIdx}
                                    className="flex items-start pl-2 md:pl-4 relative"
                                  >
                                    <div className="absolute left-0 top-1 text-lg">
                                      •
                                    </div>

                                    <div
                                      onClick={() => {
                                        const newRoadmapData = JSON.parse(
                                          JSON.stringify(roadmapData)
                                        );
                                        const currentTask =
                                          newRoadmapData.yearly_roadmap[yearIndex]
                                            .phases[pIdx].milestones[mIdx].tasks[
                                            tIdx
                                          ];
                                        currentTask.completed =
                                          !currentTask.completed;

                                        onTaskUpdate(newRoadmapData);

                                        fetch("/api/update-task", {
                                          method: "POST",
                                          headers: {
                                            "Content-Type": "application/json",
                                          },
                                          body: JSON.stringify({
                                            user_id: roadmapData.user_id,
                                            task_title: task.task_title,
                                            completed: currentTask.completed,
                                            currentPhaseIdentifier:
                                              phaseItem.phase_name,
                                          }),
                                        })
                                          .then(async (res) => {
                                            if (!res.ok) {
                                              const revertedRoadmap = JSON.parse(
                                                JSON.stringify(roadmapData)
                                              );
                                              onTaskUpdate(revertedRoadmap);
                                              console.error(
                                                "Failed to update task:",
                                                await res.json()
                                              );
                                            } else {
                                              window.dispatchEvent(
                                                new Event("analyticsUpdated")
                                              );
                                            }
                                          })
                                          .catch(() => {
                                            const revertedRoadmap = JSON.parse(
                                              JSON.stringify(roadmapData)
                                            );
                                            onTaskUpdate(revertedRoadmap);
                                          });
                                      }}
                                      className={`
                                        w-5 h-5 rounded-full flex items-center justify-center cursor-pointer mr-2 md:mr-3 flex-shrink-0 mt-1
                                        border-2 transition-colors duration-200
                                        ${
                                          task.completed
                                            ? "bg-green-500 border-green-500"
                                            : "bg-gray-200 border-gray-300 hover:border-gray-400"
                                        }
                                      `}
                                    >
                                      {task.completed && (
                                        <svg
                                          className="w-3 h-3 text-white"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth="2"
                                            d="M5 13l4 4L19 7"
                                          />
                                        </svg>
                                      )}
                                    </div>

                                    <input
                                      type="checkbox"
                                      checked={task.completed ?? false}
                                      onChange={() => {}}
                                      className="sr-only"
                                      aria-labelledby={`task-title-${yearIndex}-${pIdx}-${mIdx}-${tIdx}`}
                                    />

                                    <div className="flex-grow">
                                      <div className="flex justify-between items-start flex-wrap">
                                        <span
                                          id={`task-title-${yearIndex}-${pIdx}-${mIdx}-${tIdx}`}
                                          className="font-medium text-sm md:text-base text-black mr-2"
                                        >
                                          {task.task_title}
                                        </span>
                                        <div className="flex items-center ml-auto">
                                          {task.importance_explanation && (
                                            <Tooltip
                                              label={task.importance_explanation}
                                            >
                                              <Lightbulb className="w-4 h-4 text-yellow-500 mr-2" />
                                            </Tooltip>
                                          )}
                                          <span className="text-xs md:text-sm font-thin text-gray-600 whitespace-nowrap">
                                            Weight: {task.weight}
                                          </span>
                                        </div>
                                      </div>

                                      <p className="text-gray-600 font-extralight text-xs md:text-sm mt-1 mb-2">
                                        {task.description}
                                      </p>

                                      {/* Enhanced video handling */}
                                      <div className="mt-2">
                                        {/* NEW: Handle videos array (RAG-enhanced) */}
                                        {task.videos && task.videos.length > 0 && (
                                          <YouTubeEmbed
                                            videos={task.videos}
                                            currentIndex={currentVideoIndex}
                                            title={task.task_title}
                                            onVideoChange={(newIndex) => 
                                              handleVideoChange(taskKey, newIndex)
                                            }
                                          />
                                        )}

                                        {/* FALLBACK: Original single video (backward compatibility) */}
                                        {!task.videos && task.video?.url && (
                                          <YouTubeEmbed
                                            video={task.video}
                                            title={task.video.title || task.task_title}
                                          />
                                        )}

                                        {/* FALLBACK: YouTube URL field */}
                                        {!task.videos && !task.video?.url && task.youtube_url && (
                                          <YouTubeEmbed
                                            video={{ url: task.youtube_url }}
                                            title={task.task_title}
                                          />
                                        )}

                                        {/* Video channel link */}
                                        {task.video_channel?.url &&
                                          !getYouTubeEmbedUrl(task.video_channel.url) && (
                                            <div className="mb-3 p-2 border border-gray-200 rounded-lg flex items-center hover:bg-gray-50 transition">
                                              <Youtube className="w-6 h-6 mr-2 text-gray-800" />
                                              <a
                                                href={task.video_channel.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="font-medium text-sm text-gray-800"
                                              >
                                                {task.video_channel.name}
                                              </a>
                                            </div>
                                          )}

                                        {/* External links */}
                                        {(task.platform_links || []).map(
                                          (link: any, i: number) => (
                                            <a
                                              key={link.url || i}
                                              href={link.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="flex items-center mb-1 text-blue-600 hover:underline"
                                            >
                                              <ExternalLink className="w-4 h-4 mr-1" />
                                              {link.name || "Platform Link"}
                                            </a>
                                          )
                                        )}
                                      </div>
                                    </div>
                                  </li>
                                );
                              }
                            )}
                          </ul>
                        </div>
                      )
                    )}

                    {/* === NEW: Show proofs UI when this phase is complete === */}
                    {isPhaseComplete(phaseItem) && (
                      <div className="mt-4">
                        <RoadmapProofs
                         ownerUserId={roadmapData.user_id}
                         ownerClerkId={roadmapData.clerk_id}
                         yearIndex={yearIndex}
                         phaseIndex={pIdx}
                         skillName={phaseItem.phase_name}
                        />
                      </div>
                    )}
                    {/* === end proofs UI === */}

                  </div>
                ))}
              </>
            ) : (
              <div>
                {(yearItem.phases || []).length > 0 && (
                  <>
                    {(yearItem.phases || []).map(
                      (phase: any, phaseIndex: number) => (
                        <div
                          key={phaseIndex}
                          className="mb-4 md:mb-6 border-t pt-3 md:pt-4"
                        >
                          <h3 className="text-base md:text-lg font-semibold mb-2 md:mb-3 text-[#97518c]">
                            {phase.phase_name}
                          </h3>
                          {(phase.milestones || []).map(
                            (milestone: any, mIndex: number) => (
                              <div
                                key={mIndex}
                                className="ml-2 md:ml-4 mb-1 md:mb-2"
                              >
                                <h4 className="text-sm md:text-base font-medium text-gray-800">
                                  {milestone.name}
                                </h4>
                                <p className="text-gray-600 text-xs md:text-sm">
                                  {milestone.description}
                                </p>
                              </div>
                            )
                          )}
                        </div>
                      )
                    )}

                    {/* ✅ UPDATED: Auto-progression message */}
                    {unlocked && !isOpen && (
                      <div className="border-t pt-4 mt-4 text-center">
                        <p className="text-gray-600 text-sm">
                          Complete all tasks in this year to unlock the next year.
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </section>
        );
      })}

      {roadmapData.final_notes && (
        <div className="mt-6 md:mt-8 p-4 border-t">
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Final Notes
          </h3>
          <p className="text-gray-700 text-sm md:text-base">
            {roadmapData.final_notes}
          </p>
        </div>
      )}
    </div>
  );
}
