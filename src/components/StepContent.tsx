
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface StepContentProps {
  stepNumber: number;
  title: string;
  description: string;
  inputValue: string;
  onChange: (value: string) => void;
  placeholder?: string;
  outputValue?: string;
}

const StepContent = ({
  stepNumber,
  title,
  description,
  inputValue,
  onChange,
  placeholder,
  outputValue
}: StepContentProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm">
            {stepNumber}
          </span>
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          value={inputValue}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[200px]"
        />
        
        {outputValue && (
          <div className="mt-4">
            <h4 className="font-medium mb-2">Output:</h4>
            <div className="p-4 bg-secondary rounded-md whitespace-pre-wrap">
              {outputValue}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StepContent;
