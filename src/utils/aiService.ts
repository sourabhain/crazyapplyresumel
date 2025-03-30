
export interface OptimizeResumeParams {
  apiKey: string;
  resumeText: string;
  jobDescription: string;
  provider: 'openai' | 'deepseek';
  optimizationOption: 'full' | 'summary' | 'experience' | 'skills';
}

export const generateOptimizedResume = async ({
  apiKey,
  resumeText,
  jobDescription,
  provider,
  optimizationOption
}: OptimizeResumeParams): Promise<string> => {
  // Build the appropriate prompt based on the optimization option
  let systemPrompt = "You are a professional resume writer with expertise in optimizing resumes for ATS (Applicant Tracking Systems).";
  let userPrompt = "";

  switch (optimizationOption) {
    case 'summary':
      userPrompt = `Please rewrite only the professional summary of the following resume to better match the job description. Focus on relevant keywords and quantifiable achievements:

Job Description:
${jobDescription}

Resume:
${resumeText}

Instructions:
1. Only rewrite the professional summary/profile section
2. Include relevant keywords from the job description
3. Be concise but impactful
4. Focus on achievements with metrics when possible`;
      break;
    
    case 'experience':
      userPrompt = `Please optimize the work experience section of the following resume to better match the job description. For the most recent job, include 5 bullet points. For the second most recent job, include 4 bullet points. For older positions, include 3 or fewer bullet points as appropriate.

Job Description:
${jobDescription}

Resume:
${resumeText}

Instructions:
1. Only rewrite the work experience section
2. For the most recent job, include exactly 5 bullet points
3. For the second most recent job, include exactly 4 bullet points
4. For older jobs, include 3 or fewer bullet points
5. Focus on achievements relevant to the target job
6. Use action verbs and quantifiable results
7. Incorporate relevant keywords from the job description`;
      break;
    
    case 'skills':
      userPrompt = `Please optimize the skills section of the following resume to better match the job description. Prioritize technical skills and competencies mentioned in the job posting.

Job Description:
${jobDescription}

Resume:
${resumeText}

Instructions:
1. Only rewrite the skills section
2. Prioritize skills mentioned in the job description
3. Remove irrelevant skills
4. Organize skills by category if appropriate
5. Keep the format clean and ATS-friendly`;
      break;
    
    case 'full':
    default:
      userPrompt = `Please optimize the following resume to better match the job description and improve ATS compatibility. Follow these specific formatting requirements:

Job Description:
${jobDescription}

Resume:
${resumeText}

Instructions:
1. Rewrite the entire resume to better match the job description
2. Create a strong professional summary that highlights relevant qualifications
3. For the most recent job, include exactly 5 bullet points
4. For the second most recent job, include exactly 4 bullet points
5. For older jobs, include 3 or fewer bullet points
6. Prioritize skills mentioned in the job description
7. Use action verbs and quantifiable achievements
8. Maintain clean formatting that will work well in MS Word`;
      break;
  }

  if (provider === 'openai') {
    return await callOpenAI(apiKey, systemPrompt, userPrompt);
  } else {
    return await callDeepSeek(apiKey, systemPrompt, userPrompt);
  }
};

const callOpenAI = async (apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error calling OpenAI API');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
};

const callDeepSeek = async (apiKey: string, systemPrompt: string, userPrompt: string): Promise<string> => {
  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2500
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Error calling DeepSeek API');
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error calling DeepSeek:', error);
    throw error;
  }
};
