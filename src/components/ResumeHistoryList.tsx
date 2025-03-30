
import React, { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Download, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { ResumeHistory, getUserResumeHistory } from "@/utils/resumeHistoryService";
import { generateWordDocument } from "@/utils/wordExport";
import { format } from "date-fns";

interface ResumeHistoryListProps {
  onClose: () => void;
}

const ResumeHistoryList: React.FC<ResumeHistoryListProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [resumeHistory, setResumeHistory] = useState<ResumeHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumeHistory = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const history = await getUserResumeHistory(user.uid);
        setResumeHistory(history);
      } catch (error) {
        console.error("Error fetching resume history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchResumeHistory();
  }, [user]);

  const handleDownload = (resume: ResumeHistory) => {
    generateWordDocument(resume.resumeText);
  };

  return (
    <Card className="w-full max-w-xl mx-auto">
      <CardHeader className="relative">
        <CardTitle>My Resume History</CardTitle>
        <CardDescription>Previous resumes you've optimized</CardDescription>
        <Button 
          variant="ghost" 
          size="icon" 
          className="absolute top-2 right-2"
          onClick={onClose}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-8 text-center">Loading your resume history...</div>
        ) : resumeHistory.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">You haven't created any resumes yet.</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {resumeHistory.map((resume) => (
                <div key={resume.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium">{resume.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {resume.timestamp ? format(resume.timestamp.toDate(), 'PPP') : 'Date unknown'}
                      </p>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleDownload(resume)}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                  <Separator />
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full" onClick={onClose}>
          Close
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResumeHistoryList;
