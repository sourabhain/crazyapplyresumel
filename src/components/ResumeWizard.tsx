
import React, { useState, useEffect } from 'react';
import StepIndicator from './StepIndicator';
import StepContent from './StepContent';
import NavigationButtons from './NavigationButtons';
import { toast } from 'sonner';
import { processStep, generateFinalResume } from '@/utils/openaiService';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Copy, Download } from 'lucide-react';

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [finalResume, setFinalResume] = useState("");
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const [autoProcess, setAutoProcess] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const processCurrentStep = async () => {
    if (!apiKey) {
      toast.error("Please enter your OpenAI API key first");
      return false;
    }

    const currentStepData = STEPS[currentStep - 1];
    const currentInput = formData[currentStepData.fieldName];

    if (!currentInput) {
      toast.error("Please enter some text before proceeding");
      return false;
    }

    setIsProcessing(true);
    try {
      const result = await processStep({
        apiKey,
        stepNumber: currentStep,
        stepTitle: currentStepData.title,
        jobDescription: formData.jobDescription,
        resumeText: formData.resume,
        currentInput,
        previousOutputs: outputs
      });

      setOutputs(prev => ({
        ...prev,
        [currentStepData.fieldName]: result
      }));

      toast.success(`Step ${currentStep} completed!`);
      return true;
    } catch (error) {
      console.error("Error processing step:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : "Failed to process step"}`);
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNext = async () => {
    if (currentStep < STEPS.length) {
      const success = await processCurrentStep();
      if (success) {
        setCurrentStep(prev => prev + 1);
      }
    } else {
      // Generate final resume
      setIsProcessing(true);
      try {
        const finalResumeText = await generateFinalResume(
          apiKey,
          formData.jobDescription,
          outputs
        );
        setFinalResume(finalResumeText);
        toast.success("Resume optimization complete!");
      } catch (error) {
        console.error("Error generating final resume:", error);
        toast.error(`Error: ${error instanceof Error ? error.message : "Failed to generate final resume"}`);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const handleSave = () => {
    localStorage.setItem('resumeWizardData', JSON.stringify({ formData, outputs, currentStep, apiKey }));
    toast.success("Progress saved!");
  };

  const handleCopyFinalResume = () => {
    navigator.clipboard.writeText(finalResume);
    toast.success("Copied to clipboard!");
  };

  const handleDownloadFinalResume = () => {
    const blob = new Blob([finalResume], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized-resume.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Resume downloaded!");
  };

  // Load saved data from localStorage on initial load
  useEffect(() => {
    const savedData = localStorage.getItem('resumeWizardData');
    if (savedData) {
      try {
        const { formData: savedFormData, outputs: savedOutputs, currentStep: savedStep, apiKey: savedApiKey } = JSON.parse(savedData);
        setFormData(savedFormData);
        setOutputs(savedOutputs);
        setCurrentStep(savedStep);
        setApiKey(savedApiKey || "");
        if (savedApiKey) {
          setShowApiKeyInput(false);
        }
      } catch (e) {
        console.error("Error loading saved data:", e);
      }
    }
  }, []);

  // Auto-process steps when enabled and input changes
  useEffect(() => {
    if (autoProcess && apiKey && !isProcessing && currentStep < STEPS.length) {
      const currentStepData = STEPS[currentStep - 1];
      if (formData[currentStepData.fieldName]) {
        const timeoutId = setTimeout(() => {
          processCurrentStep().then(success => {
            if (success) {
              setCurrentStep(prev => prev + 1);
            }
          });
        }, 1500); // Delay to allow typing to finish
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [formData, autoProcess, apiKey, currentStep, isProcessing]);

  const currentStepData = STEPS[currentStep - 1];
  const canProceed = !!formData[currentStepData.fieldName] && !!apiKey;

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      {showApiKeyInput ? (
        <Card className="p-4">
          <CardContent className="p-0 pt-4">
            <div className="space-y-4">
              <div className="grid gap-2">
                <label htmlFor="apiKey" className="text-sm font-medium">OpenAI API Key</label>
                <Input
                  id="apiKey"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your OpenAI API key"
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Your API key is stored only in your browser's local storage and is never sent to our servers.
                </p>
              </div>
              <Button 
                onClick={() => setShowApiKeyInput(false)} 
                disabled={!apiKey}
                className="w-full"
              >
                Save API Key
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" onClick={() => setShowApiKeyInput(true)}>
            Change API Key
          </Button>
          <div className="flex items-center gap-2">
            <label htmlFor="autoProcess" className="text-sm font-medium">Auto-Process</label>
            <input
              type="checkbox"
              id="autoProcess"
              checked={autoProcess}
              onChange={(e) => setAutoProcess(e.target.checked)}
              className="rounded text-primary focus:ring-primary"
            />
          </div>
        </div>
      )}
      
      <StepIndicator currentStep={currentStep} totalSteps={STEPS.length} isProcessing={isProcessing} />
      
      {finalResume ? (
        <Card className="w-full">
          <CardContent className="p-6 space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Your Optimized Resume</h3>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleCopyFinalResume}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
                <Button size="sm" onClick={handleDownloadFinalResume}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
            <div className="whitespace-pre-wrap border p-4 rounded-md bg-secondary/20 max-h-[600px] overflow-y-auto">
              {finalResume}
            </div>
            <Button onClick={() => setFinalResume("")} variant="outline" className="w-full">
              Back to Steps
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
};

export default ResumeWizard;
