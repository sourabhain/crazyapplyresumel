
import React, { useState } from 'react';
import StepIndicator from './StepIndicator';
import StepContent from './StepContent';
import NavigationButtons from './NavigationButtons';
import { toast } from 'sonner';

// Define the step prompts
const STEPS = [
  {
    title: "Job Description Analysis",
    description: "Paste the job description below. We'll extract the top 5 key responsibilities and top 5 qualifications.",
    placeholder: "Paste the full job description here...",
    fieldName: "jobDescription"
  },
  {
    title: "Current Resume",
    description: "Paste your current resume. We'll scan it to understand your experience and skills.",
    placeholder: "Paste your current resume content here...",
    fieldName: "resume"
  },
  {
    title: "Professional Summary",
    description: "Let's rewrite your professional summary to be ATS-friendly and aligned with the job description.",
    placeholder: "Your current professional summary section (if any)...",
    fieldName: "professionalSummary"
  },
  {
    title: "Professional Skills",
    description: "Review your skills to identify which to highlight and which to remove for this specific job application.",
    placeholder: "List your current skills here...",
    fieldName: "skills"
  },
  {
    title: "Experience Overview",
    description: "We'll analyze your work experiences and suggest strategic edits to better align with the target job.",
    placeholder: "Any specific concerns about your experience section...",
    fieldName: "experienceOverview"
  },
  {
    title: "Current Role Optimization",
    description: "Let's rewrite your current/most recent role experience to highlight achievements relevant to the job.",
    placeholder: "Paste your current role description here...",
    fieldName: "currentRole"
  },
  {
    title: "Previous Role Optimization",
    description: "We'll rewrite your previous role to focus on the most impactful accomplishments.",
    placeholder: "Paste your previous role description here...",
    fieldName: "previousRole"
  },
  {
    title: "Earlier Role Optimization",
    description: "Let's optimize your earlier role to align with the product leadership aspects of the target job.",
    placeholder: "Paste your earlier role description here...",
    fieldName: "earlierRole"
  },
  {
    title: "Tools & Technologies Update",
    description: "Update your technical skills to reflect tools most relevant to the job.",
    placeholder: "List your current tools & technologies...",
    fieldName: "tools"
  },
  {
    title: "Final Resume QA",
    description: "We'll perform a final check to identify any misalignments, weak keywords, or missed opportunities.",
    placeholder: "Any specific areas you'd like us to focus on during QA?",
    fieldName: "finalQA"
  }
];

interface FormData {
  [key: string]: string;
}

const ResumeWizard = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    jobDescription: "",
    resume: "",
    professionalSummary: "",
    skills: "",
    experienceOverview: "",
    currentRole: "",
    previousRole: "",
    earlierRole: "",
    tools: "",
    finalQA: ""
  });
  
  const [outputs, setOutputs] = useState<FormData>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      // In a real app, we would process the input and generate an output here
      // For this demo, we'll simulate an output based on the input
      
      // Example output generation - in a real app, this would call an AI service
      if (currentStep === 1 && formData.jobDescription) {
        setOutputs(prev => ({
          ...prev,
          jobDescription: `
Key Responsibilities:
1. Lead product strategy and roadmap development
2. Conduct market research and competitive analysis
3. Collaborate with engineering and design teams
4. Prioritize features based on business impact
5. Define and track product metrics

Key Qualifications:
1. 5+ years in product management
2. Experience with agile methodologies
3. Strong analytical and problem-solving skills
4. Excellent communication and stakeholder management
5. Technical background or ability to work with technical teams
          `
        }));
      }
      
      setCurrentStep(prev => prev + 1);
      toast.success(`Step ${currentStep} completed!`);
    } else {
      // Complete the wizard
      toast.success("Resume optimization complete!");
      // Here we would compile all the inputs/outputs into a final resume
    }
  };

  const handleSave = () => {
    // In a real app, this would save the current progress
    toast.success("Progress saved!");
  };

  const currentStepData = STEPS[currentStep - 1];
  const canProceed = !!formData[currentStepData.fieldName];

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <StepIndicator currentStep={currentStep} totalSteps={STEPS.length} />
      
      <StepContent
        stepNumber={currentStep}
        title={currentStepData.title}
        description={currentStepData.description}
        inputValue={formData[currentStepData.fieldName] || ""}
        onChange={(value) => handleInputChange(currentStepData.fieldName, value)}
        placeholder={currentStepData.placeholder}
        outputValue={outputs[currentStepData.fieldName]}
      />
      
      <NavigationButtons
        currentStep={currentStep}
        totalSteps={STEPS.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSave={handleSave}
        canProceed={canProceed}
      />
    </div>
  );
};

export default ResumeWizard;
