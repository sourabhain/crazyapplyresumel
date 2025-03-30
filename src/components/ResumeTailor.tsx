
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Copy, Download } from 'lucide-react';
import { processResume, generateFullResume } from '@/utils/aiService';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';

const ResumeTailor = () => {
  const [resumeText, setResumeText] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiProvider, setApiProvider] = useState<"openai" | "deepseek">("openai");
  const [showApiKeyInput, setShowApiKeyInput] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [optimizedSummary, setOptimizedSummary] = useState('');
  const [optimizedCurrentJob, setOptimizedCurrentJob] = useState('');
  const [optimizedPreviousJob, setOptimizedPreviousJob] = useState('');
  const [optimizedEarlierJob, setOptimizedEarlierJob] = useState('');
  const [finalResume, setFinalResume] = useState('');
  
  const handleProcessSection = async (section: "summary" | "currentJob" | "previousJob" | "earlierJob" | "all") => {
    if (!apiKey) {
      toast.error("Please enter your API key first");
      return;
    }
    
    if (!jobDescription) {
      toast.error("Please enter a job description");
      return;
    }
    
    if (!resumeText) {
      toast.error("Please enter your resume");
      return;
    }
    
    setIsProcessing(true);
    try {
      const result = await processResume({
        apiKey,
        apiProvider,
        jobDescription,
        resumeText,
        section
      });
      
      switch (section) {
        case "summary":
          setOptimizedSummary(result);
          break;
        case "currentJob":
          setOptimizedCurrentJob(result);
          break;
        case "previousJob":
          setOptimizedPreviousJob(result);
          break;
        case "earlierJob":
          setOptimizedEarlierJob(result);
          break;
        case "all":
          // Process all sections at once
          setFinalResume(result);
          break;
      }
      
      toast.success(`${section === "all" ? "Full resume" : section.charAt(0).toUpperCase() + section.slice(1)} optimized successfully!`);
    } catch (error) {
      console.error("Error processing section:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : "Failed to process"}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleGenerateFinalResume = async () => {
    if (!apiKey) {
      toast.error("Please enter your API key first");
      return;
    }
    
    if (!jobDescription || !resumeText) {
      toast.error("Please enter both job description and resume");
      return;
    }
    
    if (!optimizedSummary && !optimizedCurrentJob && !optimizedPreviousJob && !optimizedEarlierJob) {
      toast.error("Please optimize at least one section first");
      return;
    }
    
    setIsProcessing(true);
    try {
      const result = await generateFullResume(
        apiKey,
        apiProvider,
        jobDescription,
        resumeText,
        {
          summary: optimizedSummary,
          currentJob: optimizedCurrentJob,
          previousJob: optimizedPreviousJob,
          earlierJob: optimizedEarlierJob
        }
      );
      
      setFinalResume(result);
      toast.success("Final resume generated successfully!");
    } catch (error) {
      console.error("Error generating final resume:", error);
      toast.error(`Error: ${error instanceof Error ? error.message : "Failed to generate final resume"}`);
    } finally {
      setIsProcessing(false);
    }
  };
  
  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };
  
  const handleDownload = (text: string, filename: string) => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success(`Downloaded as ${filename}`);
  };
  
  const handleOptimizeAll = async () => {
    await handleProcessSection("all");
  };
  
  // Save progress to localStorage
  const saveProgress = () => {
    const data = {
      resumeText,
      jobDescription,
      apiKey,
      apiProvider,
      optimizedSummary,
      optimizedCurrentJob,
      optimizedPreviousJob,
      optimizedEarlierJob,
      finalResume
    };
    localStorage.setItem('resumeTailorData', JSON.stringify(data));
    toast.success("Progress saved!");
  };
  
  // Load progress from localStorage
  React.useEffect(() => {
    const savedData = localStorage.getItem('resumeTailorData');
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setResumeText(parsedData.resumeText || '');
        setJobDescription(parsedData.jobDescription || '');
        setApiKey(parsedData.apiKey || '');
        setApiProvider(parsedData.apiProvider || 'openai');
        setOptimizedSummary(parsedData.optimizedSummary || '');
        setOptimizedCurrentJob(parsedData.optimizedCurrentJob || '');
        setOptimizedPreviousJob(parsedData.optimizedPreviousJob || '');
        setOptimizedEarlierJob(parsedData.optimizedEarlierJob || '');
        setFinalResume(parsedData.finalResume || '');
        
        if (parsedData.apiKey) {
          setShowApiKeyInput(false);
        }
      } catch (e) {
        console.error("Error loading saved data:", e);
      }
    }
  }, []);
  
  return (
    <div className="container mx-auto py-8 space-y-6">
      {showApiKeyInput ? (
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>Enter your API key to get started</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>API Provider</Label>
              <RadioGroup 
                defaultValue={apiProvider} 
                onValueChange={(value) => setApiProvider(value as "openai" | "deepseek")}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="openai" id="openai" />
                  <Label htmlFor="openai">OpenAI</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="deepseek" id="deepseek" />
                  <Label htmlFor="deepseek">DeepSeek</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="apiKey">
                {apiProvider === "openai" ? "OpenAI API Key" : "DeepSeek API Key"}
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder={`Enter your ${apiProvider === "openai" ? "OpenAI" : "DeepSeek"} API key`}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Your API key is stored only in your browser's local storage and is never sent to our servers.
              </p>
            </div>
            
            <Button onClick={() => setShowApiKeyInput(false)} disabled={!apiKey}>
              Save API Key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setShowApiKeyInput(true)}>
            Change API Configuration
          </Button>
          <Button variant="outline" onClick={saveProgress}>
            Save Progress
          </Button>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Job Description</CardTitle>
            <CardDescription>Paste the job description you're applying for</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste job description here..."
              className="min-h-[200px]"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Resume</CardTitle>
            <CardDescription>Paste your current resume</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Paste your current resume here..."
              className="min-h-[200px]"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
            />
          </CardContent>
        </Card>
      </div>
      
      <div className="flex gap-4 justify-center">
        <Button 
          onClick={handleOptimizeAll} 
          disabled={!apiKey || !jobDescription || !resumeText || isProcessing}
          className="w-full md:w-auto"
        >
          {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Optimize Full Resume
        </Button>
      </div>
      
      {!finalResume && (
        <Tabs defaultValue="summary" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="summary">Professional Summary</TabsTrigger>
            <TabsTrigger value="currentJob">Current Job</TabsTrigger>
            <TabsTrigger value="previousJob">Previous Job</TabsTrigger>
            <TabsTrigger value="earlierJob">Earlier Job</TabsTrigger>
          </TabsList>
          
          <TabsContent value="summary">
            <Card>
              <CardHeader>
                <CardTitle>Professional Summary</CardTitle>
                <CardDescription>Optimize your professional summary to match the job description</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => handleProcessSection("summary")} 
                  disabled={!apiKey || !jobDescription || !resumeText || isProcessing}
                >
                  {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Optimize Summary
                </Button>
                
                {optimizedSummary && (
                  <div className="border rounded-md p-4 bg-secondary/20">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">Optimized Summary:</h3>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCopyToClipboard(optimizedSummary)}
                        >
                          <Copy className="h-4 w-4 mr-1" /> Copy
                        </Button>
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap">{optimizedSummary}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="currentJob">
            <Card>
              <CardHeader>
                <CardTitle>Current Job</CardTitle>
                <CardDescription>Optimize your current job experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => handleProcessSection("currentJob")} 
                  disabled={!apiKey || !jobDescription || !resumeText || isProcessing}
                >
                  {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Optimize Current Job
                </Button>
                
                {optimizedCurrentJob && (
                  <div className="border rounded-md p-4 bg-secondary/20">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">Optimized Current Job:</h3>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCopyToClipboard(optimizedCurrentJob)}
                        >
                          <Copy className="h-4 w-4 mr-1" /> Copy
                        </Button>
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap">{optimizedCurrentJob}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="previousJob">
            <Card>
              <CardHeader>
                <CardTitle>Previous Job</CardTitle>
                <CardDescription>Optimize your previous job experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => handleProcessSection("previousJob")} 
                  disabled={!apiKey || !jobDescription || !resumeText || isProcessing}
                >
                  {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Optimize Previous Job
                </Button>
                
                {optimizedPreviousJob && (
                  <div className="border rounded-md p-4 bg-secondary/20">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">Optimized Previous Job:</h3>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCopyToClipboard(optimizedPreviousJob)}
                        >
                          <Copy className="h-4 w-4 mr-1" /> Copy
                        </Button>
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap">{optimizedPreviousJob}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="earlierJob">
            <Card>
              <CardHeader>
                <CardTitle>Earlier Job</CardTitle>
                <CardDescription>Optimize your earlier job experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => handleProcessSection("earlierJob")} 
                  disabled={!apiKey || !jobDescription || !resumeText || isProcessing}
                >
                  {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Optimize Earlier Job
                </Button>
                
                {optimizedEarlierJob && (
                  <div className="border rounded-md p-4 bg-secondary/20">
                    <div className="flex justify-between mb-2">
                      <h3 className="font-medium">Optimized Earlier Job:</h3>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleCopyToClipboard(optimizedEarlierJob)}
                        >
                          <Copy className="h-4 w-4 mr-1" /> Copy
                        </Button>
                      </div>
                    </div>
                    <div className="whitespace-pre-wrap">{optimizedEarlierJob}</div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
      
      {(optimizedSummary || optimizedCurrentJob || optimizedPreviousJob || optimizedEarlierJob) && !finalResume && (
        <Card>
          <CardHeader>
            <CardTitle>Generate Final Resume</CardTitle>
            <CardDescription>Combine all optimized sections into a final resume</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleGenerateFinalResume} 
              disabled={
                isProcessing || 
                !apiKey || 
                !jobDescription || 
                !resumeText || 
                (!optimizedSummary && !optimizedCurrentJob && !optimizedPreviousJob && !optimizedEarlierJob)
              }
            >
              {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Final Resume
            </Button>
          </CardContent>
        </Card>
      )}
      
      {finalResume && (
        <Card>
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Your Optimized Resume</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleCopyToClipboard(finalResume)}
                >
                  <Copy className="h-4 w-4 mr-1" /> Copy
                </Button>
                <Button 
                  size="sm" 
                  onClick={() => handleDownload(finalResume, "optimized-resume.txt")}
                >
                  <Download className="h-4 w-4 mr-1" /> Download
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md p-4 bg-secondary/20 max-h-[600px] overflow-y-auto whitespace-pre-wrap">
              {finalResume}
            </div>
            <Button 
              variant="outline" 
              onClick={() => setFinalResume('')} 
              className="mt-4"
            >
              Back to Sections
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ResumeTailor;
