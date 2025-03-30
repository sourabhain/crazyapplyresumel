
// Function to generate a Word document (.docx format) with specific formatting:
// - Title is bold
// - Body text is normal
// - Font is Arial 11pt
// - No spacing after paragraphs
// - Line break after each section

export const generateWordDocument = (resumeText: string): void => {
  // Create a Blob with HTML content that will be converted to Word format
  const htmlContent = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word'
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset="utf-8">
      <title>Resume</title>
      <style>
        body {
          font-family: Arial;
          font-size: 11pt;
          line-height: 1.15;
        }
        p {
          margin-top: 0;
          margin-bottom: 0;
        }
        h1, h2, h3, h4, h5, h6 {
          font-weight: bold;
          margin-top: 0;
          margin-bottom: 0;
        }
        .section {
          margin-bottom: 12pt; /* Line break after section */
        }
        /* Add specific Word styling mso tags for better formatting */
        @page WordSection1 {
          size: 8.5in 11.0in;
          margin: 1.0in 1.0in 1.0in 1.0in;
          mso-header-margin: .5in;
          mso-footer-margin: .5in;
          mso-paper-source: 0;
        }
        div.WordSection1 {
          page: WordSection1;
        }
      </style>
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->
    </head>
    <body>
      <div class="WordSection1">
        ${formatResumeForWord(resumeText)}
      </div>
    </body>
    </html>
  `;

  // Create a Blob with this HTML content
  const blob = new Blob([htmlContent], { type: 'application/msword' });
  
  // Create a URL for this blob
  const url = URL.createObjectURL(blob);
  
  // Create a temporary anchor element and trigger download
  const a = document.createElement('a');
  a.href = url;
  a.download = 'optimized-resume.doc';
  document.body.appendChild(a);
  a.click();
  
  // Cleanup
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

// Helper function to format the resume text for Word
const formatResumeForWord = (resumeText: string): string => {
  // First, split by double newlines which typically indicate sections
  const sections = resumeText.split(/\n\s*\n/);
  
  let formattedHtml = '';
  
  sections.forEach(section => {
    // Check if the section is empty
    if (!section.trim()) return;
    
    // Split the section into lines
    const lines = section.split('\n');
    
    // If we have at least one line, format the first line as a heading
    if (lines.length > 0 && lines[0].trim()) {
      formattedHtml += `<h3>${lines[0]}</h3>`;
      
      // Process the rest of the lines
      if (lines.length > 1) {
        for (let i = 1; i < lines.length; i++) {
          if (lines[i].trim()) {
            // Check if this is a bullet point
            if (lines[i].trim().startsWith('•') || lines[i].trim().startsWith('-') || lines[i].trim().startsWith('*')) {
              formattedHtml += `<p>${lines[i]}</p>`;
            } else {
              formattedHtml += `<p>${lines[i]}</p>`;
            }
          }
        }
      }
    } else {
      // If there's no clear heading, just add all lines as paragraphs
      lines.forEach(line => {
        if (line.trim()) {
          formattedHtml += `<p>${line}</p>`;
        }
      });
    }
    
    // Add a div with section class for spacing
    formattedHtml += `<div class="section"></div>`;
  });
  
  return formattedHtml;
};
