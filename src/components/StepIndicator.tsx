
import React from 'react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  isProcessing?: boolean;
}

const StepIndicator = ({ currentStep, totalSteps, isProcessing = false }: StepIndicatorProps) => {
  return (
    <div className="w-full">
      <div className="flex justify-between mb-2">
        <span className="text-sm font-medium flex items-center gap-2">
          Step {currentStep} of {totalSteps}
          {isProcessing && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        </span>
        <span className="text-sm font-medium">{Math.round((currentStep / totalSteps) * 100)}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out" 
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        ></div>
      </div>
    </div>
  );
};

export default StepIndicator;
