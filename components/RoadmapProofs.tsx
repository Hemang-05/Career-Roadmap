// //components\RoadmapProofs.tsx
// 'use client';
// import React, { useEffect, useState } from 'react';
// import ProofInput from './ui/ProofInput';
// import { useUser } from '@clerk/nextjs';

// interface RoadmapProofsProps {
//   ownerClerkId?: string;
//   ownerUserId?: string;
//   yearIndex?: number;
//   phaseIndex?: number;
//   skillName?: string;
// }

// export default function RoadmapProofs({
//   ownerClerkId,
//   ownerUserId,
//   yearIndex,
//   phaseIndex,
//   skillName,
// }: RoadmapProofsProps) {
//   const { user } = useUser();
//   const [inputs, setInputs] = useState<string[]>(['']);
//   const [proofs, setProofs] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [refreshing, setRefreshing] = useState(false);
//   const [message, setMessage] = useState<string | null>(null);

//   const fetchProofs = async (isRefresh = false) => {
//     if (isRefresh) {
//       setRefreshing(true);
//     } else {
//       setLoading(true);
//     }
    
//     try {
//       const params = new URLSearchParams();
//       if (ownerClerkId) params.set('clerk_id', ownerClerkId);
//       if (ownerUserId) params.set('user_id', ownerUserId);
//       if (yearIndex !== undefined) params.set('yearIndex', String(yearIndex));
//       if (phaseIndex !== undefined) params.set('phaseIndex', String(phaseIndex));
//       if (skillName) params.set('skillName', String(skillName));

//       const res = await fetch(`/api/proofs/list?${params.toString()}`);
//       const data = await res.json();
//       if (data?.success) setProofs(data.proofs || []);
//       else setProofs([]);
//     } catch (err) {
//       console.error('fetchProofs error', err);
//       setProofs([]);
//     } finally {
//       if (isRefresh) {
//         setRefreshing(false);
//       } else {
//         setLoading(false);
//       }
//     }
//   };

//   useEffect(() => {
//     fetchProofs();
//   }, [ownerClerkId, ownerUserId, yearIndex, phaseIndex, skillName]);

//   const addInput = () => setInputs(prev => [...prev, '']);
//   const updateInput = (idx: number, val: string) => setInputs(prev => prev.map((p, i) => (i === idx ? val : p)));
//   const removeInput = (idx: number) => setInputs(prev => prev.filter((_, i) => i !== idx));

//   const handleConfirmSingle = async (idx: number) => {
//     setMessage(null);
//     const url = inputs[idx].trim();
//     if (!url) {
//       setMessage('Please enter a valid URL.');
//       return;
//     }

//     setLoading(true);
//     try {
//       const body: any = { url };
//       if (ownerClerkId) body.clerk_id = ownerClerkId;
//       if (ownerUserId) body.user_id = ownerUserId;
//       if (yearIndex !== undefined) body.roadmap_year_index = yearIndex;
//       if (phaseIndex !== undefined) body.phase_index = phaseIndex;
//       if (skillName) body.skill_name = skillName;

//       const res = await fetch('/api/proofs/add', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body),
//       });

//       // Handle conflict (already exist)
//       if (res.status === 409) {
//         const d = await res.json().catch(() => ({}));
//         // setMessage(`Already added: ${url}`);
//         // Clear the confirmed input
//         updateInput(idx, '');
//         await fetchProofs();
//         setLoading(false);
//         return;
//       }

//       const data = await res.json().catch(() => ({}));
//       if (!res.ok || !data?.success) {
//         setMessage(`Failed to add: ${url}`);
//         setLoading(false);
//         return;
//       }

//       // Success
//     //  setMessage(`Added: ${url}`);
      
//       // Clear the confirmed input
//       updateInput(idx, '');

//       // Trigger verification (fire-and-forget)
//       const proofId = data?.proof?.id;
//       if (proofId) {
//         fetch('/api/skills-verify', {
//           method: 'POST',
//           headers: { 'Content-Type': 'application/json' },
//           body: JSON.stringify({ proof_id: proofId }),
//         }).catch((err) => {
//           console.error('Failed to trigger skill-verify for', proofId, err);
//         });
//       }

//       // Refresh the proof list
//       await fetchProofs();
//     } catch (err) {
//       console.error('confirm error', err);
//       setMessage(`Error adding: ${url}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleDelete = async (proofId: string) => {
//     if (!confirm('Delete this proof?')) return;
//     try {
//       const body: any = { proof_id: proofId };
//       if (ownerClerkId) body.clerk_id = ownerClerkId;
//       if (ownerUserId) body.user_id = ownerUserId;

//       const res = await fetch('/api/proofs/delete', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(body),
//       });
//       const data = await res.json();
//       if (data?.success) {
//         await fetchProofs();
//       } else {
//         alert('Delete failed');
//       }
//     } catch (err) {
//       console.error('delete error', err);
//       alert('Delete failed (see console)');
//     }
//   };

//   const handleRefreshProofs = async () => {
//     await fetchProofs(true);
//   };

//   return (
//     <div className="mt-4 p-4 rounded-lg bg-white">
//       <h3 className="font-medium mb-2 text-black">Attach proofs for this phase</h3>
//       <div className="space-y-2">
//         {inputs.map((val, idx) => (
//           <ProofInput
//             key={idx}
//             value={val}
//             onChange={(v) => updateInput(idx, v)}
//             onRemove={inputs.length > 1 ? () => removeInput(idx) : undefined}
//             onConfirm={() => handleConfirmSingle(idx)}
//             isFirst={idx === 0}
//           />
//         ))}

//         <div className="flex gap-2 mt-2">
//           <button
//             type="button"
//             onClick={addInput}
//             className="px-1.5 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors"
//             disabled={loading}
//           >
//             +
//           </button>
//         </div>

//         {message && (
//           <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-700 bg-gray-50 p-2 rounded">
//             {message}
//           </pre>
//         )}
//       </div>

//       {/* <hr className="my-4" /> */}

//       <div>
//         <div className="flex justify-between items-center mt-2">
//           <div className="text-sm font-normal text-gray-600">Existing proofs</div>
//           <div className="flex items-center gap-2">
//             <button
//                 onClick={handleRefreshProofs}
//                 className="p-1.5 text-gray-600 "
//                 title="Refresh proofs"
//                 disabled={refreshing}
//             >
//                 <svg 
//                 width="16" 
//                 height="16" 
//                 viewBox="0 0 24 24" 
//                 fill="none" 
//                 xmlns="http://www.w3.org/2000/svg"
//                 className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
//                 style={refreshing ? { animationDirection: 'reverse' } : {}}
//                 >
//                 <path 
//                     d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" 
//                     stroke="currentColor" 
//                     strokeWidth="2" 
//                     strokeLinecap="round" 
//                     strokeLinejoin="round"
//                 />
//                 <path 
//                     d="M3 3v5h5" 
//                     stroke="currentColor" 
//                     strokeWidth="2" 
//                     strokeLinecap="round" 
//                     strokeLinejoin="round"
//                 />
//                 </svg>
//             </button>
//             <div className="text-xs text-gray-500">{proofs.length} proof(s)</div>
// </div>


//         </div>

//         {loading && proofs.length === 0 ? (
//           <div className="text-sm text-gray-500">Loading proofs…</div>
//         ) : proofs.length === 0 ? (
//           <div className="text-sm text-gray-500">No proofs attached for this phase yet.</div>
//         ) : (
//           <ul className="space-y-2">
//             {proofs.map((p) => (
//               <li key={p.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-3xl">
//                 <div className="flex-1">
//                   <a href={p.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600  block mb-2">
//                     {p.url}
//                   </a>
//                   <div className="flex items-center gap-3">
//                     <span className=" text-green-700 rounded text-xs font-medium">
//                       Added
//                     </span>
//                     {p.verification_confidence && (
//                       <span className="text-xs text-gray-600">
//                         Score: {p.verification_confidence}/100
//                       </span>
//                     )}
//                   </div>
//                 </div>

//                 <div className="ml-3">
//                     <button
//                         className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
//                         onClick={() => handleDelete(p.id)}
//                         title="Delete proof"
//                     >
//                         <svg 
//                         width="16" 
//                         height="16" 
//                         viewBox="0 0 24 24" 
//                         fill="none" 
//                         xmlns="http://www.w3.org/2000/svg"
//                         className="w-4 h-4"
//                         >
//                         <path 
//                             d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2m-6 5v6m4-6v6" 
//                             stroke="currentColor" 
//                             strokeWidth="2" 
//                             strokeLinecap="round" 
//                             strokeLinejoin="round"
//                         />
//                         </svg>
//                     </button>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         )}
//       </div>
//     </div>
//   );
// }

//components\RoadmapProofs.tsx
//components\RoadmapProofs.tsx
'use client';
import React, { useEffect, useState } from 'react';
import ProofInput from './ui/ProofInput';
import { useUser } from '@clerk/nextjs';

interface RoadmapProofsProps {
  clerkId?: string; 
  ownerClerkId?: string;
  ownerUserId?: string;
  yearIndex?: number;
  phaseIndex?: number;
  skillName?: string;
}

export default function RoadmapProofs({
    clerkId,
  ownerClerkId,
  ownerUserId,
  yearIndex,
  phaseIndex,
  skillName,
}: RoadmapProofsProps) {
  const { user } = useUser();
  const [inputs, setInputs] = useState<string[]>(['']);
  const [proofs, setProofs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Get latest suggestions from proofs
  const getLatestSuggestions = (proofsData: any[]) => {
    const proofsWithSuggestions = proofsData
      .filter(p => p.metadata?.suggestions_generated && p.metadata?.future_suggestions)
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    
    if (proofsWithSuggestions.length > 0) {
      return proofsWithSuggestions[0].metadata.future_suggestions || [];
    }
    
    // Default suggestions if no LLM suggestions available
    return [
      "Add Proofs",
    ];
  };

  // Format proof type for display
  const formatProofType = (type: string | null) => {
    if (!type) return 'In Check..';
    
    // Convert snake_case to readable format
    return type
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Get skill name from proof or use fallback
  const getDisplaySkillName = (proof: any) => {
    // Use the skill_name from the proof (generated by LLM) if available
    if (proof.skill_name) {
      return proof.skill_name;
    }
    // Fallback to the prop skillName if proof doesn't have skill_name yet
    return skillName || 'General Programming';
  };

  const fetchProofs = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    
    try {
        const currentClerkId = clerkId || user?.id;
      
        if (!currentClerkId) {
          console.error('No clerk_id available');
          setProofs([]);
          setSuggestions(getLatestSuggestions([]));
          return;
        }
  
        // Build request body following fetch-events pattern
        const requestBody: any = { 
          clerk_id: currentClerkId
        };
        
        if (yearIndex !== undefined) requestBody.yearIndex = yearIndex;
        if (phaseIndex !== undefined) requestBody.phaseIndex = phaseIndex;
        
        const res = await fetch('/api/proofs/list', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });
      const data = await res.json();
      
      if (data?.success) {
        setProofs(data.proofs || []);
        setSuggestions(getLatestSuggestions(data.proofs || []));
      } else {
        setProofs([]);
        setSuggestions(getLatestSuggestions([]));
      }
    } catch (err) {
      console.error('fetchProofs error', err);
      setProofs([]);
      setSuggestions(getLatestSuggestions([]));
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchProofs();
  }, [ownerClerkId, ownerUserId, yearIndex, phaseIndex]);

  const addInput = () => setInputs(prev => [...prev, '']);
  const updateInput = (idx: number, val: string) => setInputs(prev => prev.map((p, i) => (i === idx ? val : p)));
  const removeInput = (idx: number) => setInputs(prev => prev.filter((_, i) => i !== idx));

  const handleConfirmSingle = async (idx: number) => {
    setMessage(null);
    const url = inputs[idx].trim();
    if (!url) {
      setMessage('Please enter a valid URL.');
      return;
    }
    setLoading(true);
    try {
      const body: any = { url };
      if (ownerClerkId) body.clerk_id = ownerClerkId;
      if (ownerUserId) body.user_id = ownerUserId;
      if (yearIndex !== undefined) body.roadmap_year_index = yearIndex;
      if (phaseIndex !== undefined) body.phase_index = phaseIndex;
      // Don't send skillName here - let the API determine it from phase context

      const res = await fetch('/api/proofs/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      // Handle conflict (already exist)
      if (res.status === 409) {
        updateInput(idx, '');
        await fetchProofs();
        setLoading(false);
        return;
      }

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.success) {
        setMessage(`Failed to add: ${url}`);
        setLoading(false);
        return;
      }

      // Clear the confirmed input
      updateInput(idx, '');
      
      // Trigger verification (fire-and-forget)
      const proofId = data?.proof?.id;
      if (proofId) {
        fetch('/api/skills-verify', {  // Fixed API endpoint name
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ proof_id: proofId }),
        }).catch((err) => {
          console.error('Failed to trigger skills-verify for', proofId, err);
        });
      }
      
      // Refresh the proof list
      await fetchProofs();
    } catch (err) {
      console.error('confirm error', err);
      setMessage(`Error adding: ${url}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (proofId: string) => {
    if (!confirm('Delete this proof?')) return;
    try {
      const body: any = { proof_id: proofId };
      if (ownerClerkId) body.clerk_id = ownerClerkId;
      if (ownerUserId) body.user_id = ownerUserId;

      const res = await fetch('/api/proofs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data?.success) {
        await fetchProofs();
      } else {
        alert('Delete failed');
      }
    } catch (err) {
      console.error('delete error', err);
      alert('Delete failed (see console)');
    }
  };

  const handleRefreshProofs = async () => {
    await fetchProofs(true);
  };

  return (
    <div className="mt-4 p-4 rounded-lg bg-white">
      <div className="flex items-center gap-2 mb-2">
        <h3 className="font-medium text-black">Attach proofs for this phase</h3>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
            title="View proof suggestions"
          >
            <svg 
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="w-4 h-4"
            >
              <circle 
                cx="12" 
                cy="12" 
                r="10" 
                stroke="currentColor" 
                strokeWidth="2"
              />
              <path 
                d="M9,9h0a3,3,0,0,1,5.12-2.12A3,3,0,0,1,15,9c0,1-1,1.5-1,2.5" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <circle 
                cx="12" 
                cy="17" 
                r="1" 
                fill="currentColor"
              />
            </svg>
          </button>
          
          {showSuggestions && (
            <div className="absolute top-full left-0 mt-1 w-80 sm:w-80 xs:w-72 bg-white border border-gray-200 rounded-lg shadow-lg z-10 p-4 max-w-[calc(100vw-2rem)] sm:max-w-none">
                <div className="flex justify-between items-center mb-3">
                <h4 className="font-medium text-sm text-gray-900">Proof Suggestions</h4>
                <button
                    onClick={() => setShowSuggestions(false)}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                </button>
                </div>
                <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                    <div key={index} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-xs text-gray-700 leading-relaxed break-words">{suggestion}</p>
                    </div>
                ))}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500 italic break-words">
                    Suggestions are generated based on your learning phase and previous submissions.
                </p>
                </div>
            </div>
            )}
        </div>
      </div>

      <div className="space-y-2">
        {inputs.map((val, idx) => (
          <ProofInput
            key={idx}
            value={val}
            onChange={(v) => updateInput(idx, v)}
            onRemove={inputs.length > 1 ? () => removeInput(idx) : undefined}
            onConfirm={() => handleConfirmSingle(idx)}
            isFirst={idx === 0}
          />
        ))}
        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={addInput}
            className="px-1.5 border border-gray-300 rounded-full text-sm text-gray-700 hover:bg-gray-200 transition-colors"
            disabled={loading}
          >
            +
          </button>
        </div>
        {message && (
          <pre className="mt-2 whitespace-pre-wrap text-xs text-gray-700 bg-gray-50 p-2 rounded">
            {message}
          </pre>
        )}
      </div>

      <div>
        <div className="flex justify-between items-center mt-2">
          <div className="text-sm font-normal text-gray-600">Existing proofs</div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleRefreshProofs}
              className="p-1.5 text-gray-600"
              title="Refresh proofs"
              disabled={refreshing}
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`}
                style={refreshing ? { animationDirection: 'reverse' } : {}}
              >
                <path 
                  d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
                <path 
                  d="M3 3v5h5" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <div className="text-xs text-gray-500">{proofs.length} proof(s)</div>
          </div>
        </div>
        
        {loading && proofs.length === 0 ? (
          <div className="text-sm text-gray-500">Loading proofs…</div>
        ) : proofs.length === 0 ? (
          <div className="text-sm text-gray-500">No proofs attached for this phase yet.</div>
        ) : (
          <ul className="space-y-2">
            {proofs.map((p) => (
              <li key={p.id} className="flex items-center justify-between bg-gray-50 p-4 rounded-3xl">
                <div className="flex-1">
                  <a href={p.url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 block mb-2">
                  {formatProofType(p.type)}
                  </a>
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* <span className="text-blue-700 rounded text-xs font-medium bg-blue-50 px-2 py-1">
                      
                    </span> */}
                    {/* {p.skill_name && (
                      <span className="text-purple-700 rounded text-xs font-medium bg-purple-50 px-2 py-1">
                        {p.skill_name}
                      </span>
                    )} */}
                    {p.verification_confidence && (
                      <span className="text-xs text-gray-600">
                        Score: {p.verification_confidence}/100
                      </span>
                    )}
                    
                  </div>
                </div>
                <div className="ml-3">
                  <button
                    className="p-1.5 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                    onClick={() => handleDelete(p.id)}
                    title="Delete proof"
                  >
                    <svg 
                      width="16" 
                      height="16" 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-4 h-4"
                    >
                      <path 
                        d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c0-1 1-2 2-2v2m-6 5v6m4-6v6" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}