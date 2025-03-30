
import { toast } from "sonner";

// Cache for API responses to avoid duplicate calls
const responseCache = new Map<string, string>();

interface ProcessStepParams {
  apiKey: string;
  stepNumber: number;
  stepTitle: string;
  jobDescription?: string;
  resumeText?: string;
  currentInput: string;
  previousOutputs: Record<string, string>;
}

export const processStep = async ({
  apiKey,
  stepNumber,
  stepTitle,
  jobDescription,
  resumeText,
  currentInput,
  previousOutputs
}: ProcessStepParams): Promise<string> => {
  if (!apiKey) {
    throw new Error("OpenAI API key is required");
  }

  // Create cache key based on inputs
  const cacheKey = `${stepNumber}-${currentInput}-${Object.values(previousOutputs).join('-')}`;
  
  // Return cached response if available
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey) as string;
  }

  try {
    // Construct the prompt based on the current step
    let prompt = "";
    
    switch (stepNumber) {
      case 1:
        prompt = `Parse the provided job description. Extract and list the top 5 key responsibilities and top 5 qualifications that the resume must reflect.\n\nJob Description:\n${currentInput}`;
        break;
      case 2:
        prompt = `Scan the following resume. Remember its details for upcoming optimization tasks.\n\nResume:\n${currentInput}`;
        break;
      case 3:
        prompt = `Rewrite the professional summary section to be ATS-friendly, align with the job description, use relevant keywords, and be short, powerful, and enticing.\n\nJob Description Analysis:\n${previousOutputs.jobDescription || ''}\n\nCurrent Professional Summary:\n${currentInput}`;
        break;
      case 4:
        prompt = `Review the user's skills and generate two lists: Skills to remove and Skills to add or emphasize. Ensure the new list is ATS-optimized and aligned with the role.\n\nJob Description Analysis:\n${previousOutputs.jobDescription || ''}\n\nCurrent Skills:\n${currentInput}`;
        break;
      case 5:
        prompt = `Analyze the work experiences and suggest 5 strategic edits or rewrites to better align with the target job.\n\nJob Description Analysis:\n${previousOutputs.jobDescription || ''}\n\nExperience Overview:\n${currentInput}`;
        break;
      case 6:
        prompt = `Rewrite this current role experience in present tense, using "Accomplished X as measured by Y doing Z" format. Each bullet point max 2 lines. Emphasize growth, leadership, and outcomes relevant to the job.\n\nJob Description Analysis:\n${previousOutputs.jobDescription || ''}\n\nCurrent Role:\n${currentInput}`;
        break;
      case 7:
        prompt = `Rewrite this experience in past tense, focusing on top 4 impactful accomplishments using "Accomplished X as measured by Y doing Z" format. Each bullet point max 2 lines. Align with job requirements.\n\nJob Description Analysis:\n${previousOutputs.jobDescription || ''}\n\nPrevious Role:\n${currentInput}`;
        break;
      case 8:
        prompt = `Rewrite this experience in past tense, focusing on top 4 achievements using "Accomplished X as measured by Y doing Z" format. Each bullet point max 2 lines. Align with product leadership or digital transformation aspects if applicable.\n\nJob Description Analysis:\n${previousOutputs.jobDescription || ''}\n\nEarlier Role:\n${currentInput}`;
        break;
      case 9:
        prompt = `Update the Tools & Technologies section to reflect tools most relevant to the job and be easy to scan and grouped logically (e.g., PM tools, analytics, dev, collaboration).\n\nJob Description Analysis:\n${previousOutputs.jobDescription || ''}\n\nCurrent Tools & Technologies:\n${currentInput}`;
        break;
      case 10:
        prompt = `Perform a final check on the optimized resume. Identify any misalignments with the job description, weak or missing keywords, vague or outdated statements, or missed opportunities for improvement. Focus on content and job alignment.\n\nJob Description Analysis:\n${previousOutputs.jobDescription || ''}\n\nOptimized Resume Sections:\n${Object.entries(previousOutputs)
          .filter(([key]) => key !== 'jobDescription' && key !== 'resume' && key !== 'finalQA')
          .map(([key, value]) => `${key.toUpperCase()}:\n${value}`)
          .join('\n\n')}`;
        break;
      default:
        prompt = `Analyze the following input for step ${stepNumber}: ${currentInput}`;
    }

    // Make the API call to OpenAI
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
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
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    const data = await response.json();
    const result = data.choices[0]?.message?.content || "No response generated";
    
    // Cache the response
    responseCache.set(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
};

export const generateFinalResume = async (
  apiKey: string,
  jobDescription: string,
  outputs: Record<string, string>
): Promise<string> => {
  if (!apiKey) {
    throw new Error("OpenAI API key is required");
  }

  try {
    const prompt = `
Generate a complete, optimized resume based on the job description and the optimized sections below.
Format the resume in a clean, professional way that would be ready for submission.

JOB DESCRIPTION:
${jobDescription}

OPTIMIZED SECTIONS:
${Object.entries(outputs)
  .filter(([key]) => key !== 'jobDescription' && key !== 'resume' && key !== 'finalQA')
  .map(([key, value]) => `${key.toUpperCase()}:\n${value}`)
  .join('\n\n')}

FINAL QA NOTES:
${outputs.finalQA || ''}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
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
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || "No resume generated";
  } catch (error) {
    console.error("Error generating final resume:", error);
    throw error;
  }
};
