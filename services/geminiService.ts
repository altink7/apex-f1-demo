import { GoogleGenAI, Type } from "@google/genai";

// Helper to get the AI client. 
const getAiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateF1Analysis = async (prompt: string): Promise<string> => {
  try {
    const ai = getAiClient();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', 
      contents: prompt,
      config: {
        systemInstruction: "You are an expert Formula 1 analyst and historian. Provide concise, data-driven insights about drivers, tracks, and strategies.",
      }
    });
    return response.text || "No analysis available.";
  } catch (error) {
    console.error("Analysis Error:", error);
    return "Unable to retrieve analysis at this time.";
  }
};

export const generateDriverAnalysis = async (driverName: string, team: string, recentPerformance: string) => {
  try {
    const ai = getAiClient();
    const prompt = `Analyze Formula 1 driver ${driverName} driving for ${team}. 
    Based on their recent performance (${recentPerformance}), provide a concise 3-bullet point summary of:
    1. Driving Style & Strengths
    2. Current Season Form
    3. Outlook for the next race
    
    Keep it professional and analytical.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text || "Driver analysis currently unavailable.";
  } catch (error) {
    console.error("Driver Analysis Error:", error);
    return "AI Analysis system offline.";
  }
};

export const getTrackRecords = async (trackName: string, location: string) => {
  try {
    const ai = getAiClient();
    const prompt = `For the Formula 1 circuit "${trackName}" in ${location}, provide the current Lap Record (Driver, Time, Year) and the driver with the Most Wins there. Return strictly valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            lap_record: {
              type: Type.OBJECT,
              properties: {
                time: { type: Type.STRING },
                driver: { type: Type.STRING },
                year: { type: Type.STRING }
              }
            },
            most_wins: {
              type: Type.OBJECT,
              properties: {
                driver: { type: Type.STRING },
                count: { type: Type.STRING }
              }
            },
            description: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Track Records Error:", error);
    return null;
  }
};

export const exploreTrackWithMaps = async (trackName: string, location: string, lat?: number, lng?: number) => {
  try {
    const ai = getAiClient();
    
    // Combine maps and search into a single tool object for best compatibility
    const tools = [{ googleMaps: {}, googleSearch: {} }];
    
    const prompt = `Provide a detailed intelligence report for the Formula 1 circuit "${trackName}" located in ${location}.
    
    Use Google Maps to find specific circuit details and Google Search for historical context if needed.
    
    Structure your response to cover:
    1. Technical Layout: Length, corners, DRS zones.
    2. Strategy Notes: Tyre wear, overtaking difficulty.
    3. Historical Significance: Lap record, most wins.
    
    Important: If you find Google Maps data, include it.`;

    const config: any = {
      tools: tools,
    };

    // Add grounding location if coordinates are available
    if (lat !== undefined && lng !== undefined) {
      config.toolConfig = {
        retrievalConfig: {
          latLng: {
            latitude: lat,
            longitude: lng
          }
        }
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: config,
    });

    const text = response.text || "No detailed analysis available for this track.";
    
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];

    // Extract Web Search Links
    const webLinks = groundingChunks
      .filter((chunk: any) => chunk.web?.uri && chunk.web?.title)
      .map((chunk: any) => ({
        title: chunk.web?.title || "Source",
        uri: chunk.web?.uri || "#"
      }));

    // Extract Google Maps Links
    const mapLinks = groundingChunks
      .filter((c: any) => c.maps && c.maps.googleMapsUri)
      .map((c: any) => ({
        title: c.maps.title || "View on Google Maps",
        uri: c.maps.googleMapsUri
      }));
    
    // Deduplicate based on URI
    const allLinks = [...mapLinks, ...webLinks];
    const uniqueLinks = Array.from(new Map(allLinks.map(item => [item.uri, item])).values());

    return {
      text,
      links: uniqueLinks
    };

  } catch (error) {
    console.error("Maps/Intelligence Error:", error);
    return { 
      text: "We couldn't retrieve the intelligence report for this track right now. Connection to Gemini services may be interrupted.", 
      links: [] 
    };
  }
};
