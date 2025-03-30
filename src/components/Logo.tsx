
import React from 'react';
import { FileText } from 'lucide-react';

const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <FileText className="h-6 w-6 text-primary" />
      <span className="font-bold text-xl">Resume Optimus</span>
    </div>
  );
};

export default Logo;
