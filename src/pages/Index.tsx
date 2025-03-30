
import React from 'react';
import Logo from '@/components/Logo';
import ResumeWizard from '@/components/ResumeWizard';
import { Toaster } from '@/components/ui/sonner';

const Index = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <Logo />
          <h1 className="text-lg font-medium text-gray-600">Resume Tailoring Assistant</h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Optimize Your Resume in 10 Steps</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our guided process helps you tailor your resume for each job application,
            increasing your chances of getting noticed by recruiters and ATS systems.
          </p>
        </div>
        
        <ResumeWizard />
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-500 text-sm">
            Resume Optimus Helper © {new Date().getFullYear()} - Optimization tools for job seekers
          </p>
        </div>
      </footer>
      
      <Toaster />
    </div>
  );
};

export default Index;
