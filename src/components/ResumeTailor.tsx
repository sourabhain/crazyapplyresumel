
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download, Copy, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateOptimizedResume } from '@/utils/aiService';
import { generateWordDocument } from '@/utils/wordExport';
import { useAuth } from '@/context/AuthContext';
import { saveResumeToHistory } from '@/utils/resumeHistoryService';
import LoginForm from '@/components/LoginForm';
import UserProfile from '@/components/UserProfile';
import ResumeHistoryList from '@/components/ResumeHistoryList';

const ResumeTailor: React.FC = () => {
  const { user } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [optimizedResume, setOptimizedResume] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const [selectedProvider, setSelectedProvider] = useState('openai');
  const [optimizationOption, setOptimizationOption] = useState('full');
  const [showHistoryList, setShowHistoryList] = useState(false);
  const [resumeTitle, setResumeTitle] = useState('');

  // Load saved data from localStorage on initial load
  useEffect(() => {
    const savedData = localStorage.getItem('resumeTailorData');
    if (savedData) {
      try {
        const { resumeText: savedResume, jobDescription: savedJob, apiKey: savedApiKey, provider: savedProvider } = JSON.parse(savedData);
        setResumeText(savedResume || '');
        setJobDescription(savedJob || '');
        setApiKey(savedApiKey || '');
        setSelectedProvider(savedProvider || 'openai');
        if (savedApiKey) {
          setShowApiKeyInput(false);
        }
      } catch (e) {
        console.error("Error loading saved data:", e);
      }
    }
  }, []);

  // Save data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('resumeTailorData', JSON.stringify({
      resumeText,
      jobDescription,
      apiKey,
      provider: selectedProvider
    }));
  }, [resumeText, jobDescription, apiKey, selectedProvider]);

  const handleGenerate = async () => {
    if (!resumeText || !jobDescription) {
      toast.error("Please enter both your resume and the job description");
      return;
    }

    if (!apiKey) {
      toast.error("Please enter your API key");
      return;
    }

    setIsLoading(true);
    try {
      const optimized = await generateOptimizedResume({
        apiKey,
        resumeText,
        jobDescription,
        provider: selectedProvider,
        optimizationOption
      });
      
      setOptimizedResume(optimized);
      
      // Generate a title for the resume based on job description
      const jobTitle = extractJobTitle(jobDescription);
      setResumeTitle(jobTitle);
      
      toast.success("Resume successfully optimized!");
      
      // Save to history if user is logged in
      if (user) {
        await saveResumeToHistory(user.uid, optimized, jobDescription, jobTitle);
      }
    } catch (error) {
      console.error("Error generating optimized resume:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : "Failed to optimize resume"}`);
    } finally {
      setIsLoading(false);
    }
  };

  const extractJobTitle = (jobDesc: string): string => {
    // Try to extract a job title from the first few lines of the job description
    const lines = jobDesc.split('\n').slice(0, 5);
    
    // Look for lines that might contain job titles (typically in the first few lines)
    for (const line of lines) {
      const trimmedLine = line.trim();
      // If line is short, capitalized, and doesn't end with punctuation, it's likely a title
      if (trimmedLine.length > 0 && 
          trimmedLine.length < 50 && 
          !trimmedLine.endsWith('.') &&
          !trimmedLine.endsWith(':')) {
        return trimmedLine;
      }
    }
    
    return "Optimized Resume";
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(optimizedResume);
    toast.success("Copied to clipboard!");
  };

  const handleDownloadWord = () => {
    generateWordDocument(optimizedResume);
    toast.success("Word document downloaded!");
  };

  const handleReset = () => {
    setOptimizedResume('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        {user ? (
          <UserProfile onShowHistory={() => setShowHistoryList(true)} />
        ) : (
          <div></div> // Empty div for spacing when user is not logged in
        )}
        
        <div className="flex items-center gap-2">
          {showApiKeyInput ? (
            <div className="flex gap-2">
              <Input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="max-w-xs"
              />
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Provider" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="deepseek">DeepSeek</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowApiKeyInput(false)} 
                disabled={!apiKey}
              >
                Save
              </Button>
            </div>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setShowApiKeyInput(true)}>
              Change API Key
            </Button>
          )}
        </div>
      </div>
      
      {showHistoryList ? (
        <ResumeHistoryList onClose={() => setShowHistoryList(false)} />
      ) : optimizedResume ? (
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Your Optimized Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="whitespace-pre-wrap border p-4 rounded-md bg-secondary/20 max-h-[600px] overflow-y-auto">
              {optimizedResume}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleReset}>
              Back
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleCopy}>
                <Copy className="h-4 w-4 mr-2" />
                Copy
              </Button>
              <Button onClick={handleDownloadWord}>
                <Download className="h-4 w-4 mr-2" />
                Download DOC
              </Button>
              {!user && (
                <Button variant="secondary" onClick={() => setShowHistoryList(true)}>
                  Sign in to Save
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      ) : !user ? (
        <div className="grid gap-8 grid-cols-1 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Enter Your Resume & Job Description</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="resume" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="resume">Resume</TabsTrigger>
                    <TabsTrigger value="job">Job Description</TabsTrigger>
                  </TabsList>
                  <TabsContent value="resume" className="space-y-4">
                    <Textarea
                      value={resumeText}
                      onChange={(e) => setResumeText(e.target.value)}
                      placeholder="Paste your current resume here..."
                      className="min-h-[300px]"
                    />
                  </TabsContent>
                  <TabsContent value="job" className="space-y-4">
                    <Textarea
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description here..."
                      className="min-h-[300px]"
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
              <CardFooter>
                <div className="w-full space-y-4">
                  <Select value={optimizationOption} onValueChange={setOptimizationOption}>
                    <SelectTrigger>
                      <SelectValue placeholder="What to optimize?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full">Full Resume Optimization</SelectItem>
                      <SelectItem value="summary">Professional Summary Only</SelectItem>
                      <SelectItem value="experience">Work Experience Only</SelectItem>
                      <SelectItem value="skills">Skills Section Only</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    className="w-full" 
                    onClick={handleGenerate} 
                    disabled={isLoading || !resumeText || !jobDescription || !apiKey}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Optimizing...
                      </>
                    ) : (
                      "Optimize My Resume"
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
          
          <div>
            <LoginForm />
          </div>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Optimize Your Resume</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="resume" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="resume">Resume</TabsTrigger>
                <TabsTrigger value="job">Job Description</TabsTrigger>
              </TabsList>
              <TabsContent value="resume" className="space-y-4">
                <Textarea
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your current resume here..."
                  className="min-h-[300px]"
                />
              </TabsContent>
              <TabsContent value="job" className="space-y-4">
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="min-h-[300px]"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <div className="w-full space-y-4">
              <Select value={optimizationOption} onValueChange={setOptimizationOption}>
                <SelectTrigger>
                  <SelectValue placeholder="What to optimize?" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">Full Resume Optimization</SelectItem>
                  <SelectItem value="summary">Professional Summary Only</SelectItem>
                  <SelectItem value="experience">Work Experience Only</SelectItem>
                  <SelectItem value="skills">Skills Section Only</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                className="w-full" 
                onClick={handleGenerate} 
                disabled={isLoading || !resumeText || !jobDescription || !apiKey}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  "Optimize My Resume"
                )}
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  );
};

export default ResumeTailor;
