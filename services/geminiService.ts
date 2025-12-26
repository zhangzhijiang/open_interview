import { GoogleGenAI, Type, Blob as GenAIBlob } from "@google/genai";
import { EvaluationResult, EvaluationSchema } from "../types";

// Helper to encode bytes to base64
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Helper to decode audio for playback
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

// Helper to create Blob for audio input
export function createBlob(data: Float32Array): GenAIBlob {
  const l = data.length;
  // PCM16 requires integers. Convert Float32 [-1, 1] to Int16 [-32768, 32767]
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    const s = Math.max(-1, Math.min(1, data[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  
  // Note: Gemini expects raw PCM bytes, not a WAV file structure.
  // The SDK helper handles the wrapping if we pass a Blob, but for the 'media' payload
  // in sendRealtimeInput, we pass the base64 string and mimeType.
  
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}

// Function to generate the final evaluation report using Flash
export async function generateEvaluationReport(
  transcript: string, 
  jobTitle: string,
  candidateName: string,
  apiKey?: string
): Promise<EvaluationResult> {
  console.log('[geminiService] Generating evaluation report...');
  console.log('[geminiService] Transcript length:', transcript.length);
  console.log('[geminiService] API Key provided:', !!apiKey);
  
  // Use provided key, or fallback to environment variable
  const finalKey = apiKey || process.env.GEMINI_API_KEY || "";
  
  if (!finalKey) {
    console.error('[geminiService] ❌ Missing API Key for report generation');
    throw new Error("Missing API Key for report generation");
  }

  console.log('[geminiService] Initializing GoogleGenAI with key length:', finalKey.length);
  const ai = new GoogleGenAI({ apiKey: finalKey });
  console.log('[geminiService] GoogleGenAI instance created');
  
  const prompt = `
    Analyze the following interview transcript for the role of ${jobTitle}.
    Candidate Name: ${candidateName}.
    
    Transcript:
    ${transcript}
    
    Provide a detailed evaluation JSON based on the schema provided.
    Be critical but fair. Focus on whether they met the specific job requirements.
  `;

  try {
    console.log('[geminiService] Sending request to Gemini API...');
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: EvaluationSchema,
      },
    });

    console.log('[geminiService] ✅ Received response from Gemini API');
    const text = response.text;
    if (!text) {
      console.error('[geminiService] ❌ No text in response');
      throw new Error("No response from AI");
    }
    
    console.log('[geminiService] Parsing JSON response...');
    const result = JSON.parse(text) as EvaluationResult;
    console.log('[geminiService] ✅ Evaluation report generated successfully');
    return result;
  } catch (error) {
    console.error("[geminiService] ❌ Evaluation Generation Error:", error);
    console.error("[geminiService] Error details:", {
      name: error instanceof Error ? error.name : undefined,
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    return {
      candidateName,
      role: jobTitle,
      score: 0,
      strengths: [],
      weaknesses: ["Error analyzing interview data"],
      technicalAssessment: "N/A",
      communicationSkills: "N/A",
      hiringRecommendation: "No Hire",
      summary: "An error occurred while generating the report. Please review the raw transcript if available."
    };
  }
}