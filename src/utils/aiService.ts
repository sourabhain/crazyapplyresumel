
import { toast } from "sonner";

// Cache for API responses to avoid duplicate calls
const responseCache = new Map<string, string>();

interface ProcessParams {
  apiKey: string;
  apiProvider: "openai" | "deepseek";
  jobDescription: string;
  resumeText: string;
  section: "summary" | "currentJob" | "previousJob" | "earlierJob" | "all";
}

export const processResume = async ({
  apiKey,
  apiProvider,
  jobDescription,
  resumeText,
  section
}: ProcessParams): Promise<string> => {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  // Create cache key based on inputs
  const cacheKey = `${apiProvider}-${section}-${jobDescription.substring(0, 50)}-${resumeText.substring(0, 50)}`;
  
  // Return cached response if available
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey) as string;
  }

  try {
    // Construct the prompt based on the section
    let prompt = "";
    let endpoint = "";
    let headers: Record<string, string> = {};
    let body: any = {};
    
    switch (section) {
      case "summary":
        prompt = `Rewrite the following professional summary to be ATS-friendly, align with the job description, use relevant keywords, and be short, powerful, and enticing.
        
Job Description:
${jobDescription}

Current Professional Summary:
${resumeText}`;
        break;
      case "currentJob":
        prompt = `Rewrite this current role experience in present tense, using "Accomplished X as measured by Y doing Z" format. Create EXACTLY 5 bullet points, each max 2 lines. Emphasize growth, leadership, and outcomes relevant to the job.

Job Description:
${jobDescription}

Current Role:
${resumeText}`;
        break;
      case "previousJob":
        prompt = `Rewrite this previous role experience in past tense, focusing on EXACTLY 4 impactful accomplishments using "Accomplished X as measured by Y doing Z" format. Each bullet point max 2 lines. Align with job requirements.

Job Description:
${jobDescription}

Previous Role:
${resumeText}`;
        break;
      case "earlierJob":
        prompt = `Rewrite this earlier role experience in past tense, focusing on top 4 achievements using "Accomplished X as measured by Y doing Z" format. Each bullet point max 2 lines. Align with product leadership or digital transformation aspects if applicable.

Job Description:
${jobDescription}

Earlier Role:
${resumeText}`;
        break;
      case "all":
        prompt = `Optimize this entire resume to match the job description. Rewrite the professional summary and all job experiences using "Accomplished X as measured by Y doing Z" format where appropriate. Make it ATS-friendly with relevant keywords. Format each section clearly.

For the current role, provide EXACTLY 5 bullet points.
For previous roles, provide EXACTLY 4 bullet points each.

Job Description:
${jobDescription}

Resume:
${resumeText}`;
        break;
      default:
        throw new Error("Invalid section specified");
    }

    // Configure request based on API provider
    if (apiProvider === "openai") {
      endpoint = "https://api.openai.com/v1/chat/completions";
      headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      };
      body = {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert resume optimizer that helps tailor resumes to specific job descriptions. Provide clear, concise, and actionable advice formatted in a clean, readable way."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      };
    } else if (apiProvider === "deepseek") {
      endpoint = "https://api.deepseek.com/v1/chat/completions";
      headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      };
      body = {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are an expert resume optimizer that helps tailor resumes to specific job descriptions. Provide clear, concise, and actionable advice formatted in a clean, readable way."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      };
    } else {
      throw new Error("Invalid API provider");
    }

    // Make the API call
    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    const data = await response.json();
    let result = "";
    
    if (apiProvider === "openai") {
      result = data.choices[0]?.message?.content || "No response generated";
    } else if (apiProvider === "deepseek") {
      result = data.choices[0]?.message?.content || "No response generated";
    }
    
    // Cache the response
    responseCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error(`Error calling ${apiProvider} API:`, error);
    throw error;
  }
};

export const generateFullResume = async (
  apiKey: string,
  apiProvider: "openai" | "deepseek",
  jobDescription: string,
  resumeText: string,
  optimizedSections: Record<string, string>
): Promise<string> => {
  if (!apiKey) {
    throw new Error("API key is required");
  }

  try {
    const prompt = `
Generate a complete, optimized resume based on the job description and the optimized sections below.
Format the resume in a clean, professional way that would be ready for submission.

JOB DESCRIPTION:
${jobDescription}

ORIGINAL RESUME:
${resumeText}

OPTIMIZED SECTIONS:
${Object.entries(optimizedSections)
  .map(([key, value]) => `${key.toUpperCase()}:\n${value}`)
  .join('\n\n')}
`;

    let endpoint = "";
    let headers: Record<string, string> = {};
    let body: any = {};

    if (apiProvider === "openai") {
      endpoint = "https://api.openai.com/v1/chat/completions";
      headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      };
      body = {
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert resume optimizer that helps tailor resumes to specific job descriptions. Generate a complete, optimized resume that is ATS-friendly and tailored to the job."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      };
    } else if (apiProvider === "deepseek") {
      endpoint = "https://api.deepseek.com/v1/chat/completions";
      headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      };
      body = {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are an expert resume optimizer that helps tailor resumes to specific job descriptions. Generate a complete, optimized resume that is ATS-friendly and tailored to the job."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    const data = await response.json();
    let result = "";
    
    if (apiProvider === "openai") {
      result = data.choices[0]?.message?.content || "No resume generated";
    } else if (apiProvider === "deepseek") {
      result = data.choices[0]?.message?.content || "No resume generated";
    }
    
    return result;
  } catch (error) {
    console.error(`Error generating final resume with ${apiProvider}:`, error);
    throw error;
  }
};
