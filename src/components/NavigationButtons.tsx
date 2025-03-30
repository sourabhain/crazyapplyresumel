
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';

interface NavigationButtonsProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  onSave?: () => void;
  canProceed: boolean;
}

const NavigationButtons = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSave,
  canProceed
}: NavigationButtonsProps) => {
  return (
    <div className="flex justify-between mt-6">
      <Button
        variant="outline"
        onClick={onPrevious}
        disabled={currentStep === 1}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Previous
      </Button>
      <div className="flex gap-2">
        {onSave && (
          <Button variant="outline" onClick={onSave} className="flex items-center gap-2">
            <Save className="h-4 w-4" />
            Save
          </Button>
        )}
        <Button
          onClick={onNext}
          disabled={!canProceed}
          className="flex items-center gap-2"
        >
          {currentStep === totalSteps ? 'Complete' : 'Next'}
          {currentStep < totalSteps && <ArrowRight className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
};

export default NavigationButtons;
