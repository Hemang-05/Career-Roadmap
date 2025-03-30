// // utils/generateFreshRoadmap.ts
// export async function generateFreshRoadmap(desired_career: string, currentParams: any): Promise<any> {
//   // Construct an updated prompt (you can modify it as needed)
//   const prompt = `Generate an updated roadmap in JSON format for a student aiming to pursue a career as a "${desired_career}". 
//   The roadmap should reflect the latest trends, technologies, and curriculum changes.
//   Use the same structure as before.`;
  
//   // Call the external API (same as in your generate-roadmap file)
//   const apiKey = process.env.OPENROUTER_API_KEY;
//   const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//       'Authorization': `Bearer ${apiKey}`,
//     },
//     body: JSON.stringify({
//       model: "deepseek/deepseek-r1-distill-llama-70b:free",
//       messages: [{ role: "user", content: prompt }],
//       top_p: 1,
//       temperature: 1,
//       frequency_penalty: 0,
//       presence_penalty: 0,
//       repetition_penalty: 1,
//       top_k: 0,
//     }),
//   });

//   const data = await response.json();
//   const rawContent = data.choices[0].message.content.trim();
//   const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/i) || rawContent.match(/{[\s\S]*}/);
//   if (!jsonMatch) {
//     throw new Error('No valid JSON found in response');
//   }
//   const cleanContent = jsonMatch[1] || jsonMatch[0];
//   return JSON.parse(cleanContent.trim());
// }
