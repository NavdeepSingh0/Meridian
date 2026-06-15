import { useState } from 'react';

// Mock hook for generating inline content
export function useAiGenerate(sectionId?: string, context?: unknown, jobDescription?: string) {
  const [isGenerating, setIsGenerating] = useState(false);

  const generate = async (
    promptType: 'summary' | 'bullet',
    _context?: unknown,
    _jobDescription?: string
  ): Promise<string> => {
    setIsGenerating(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsGenerating(false);
    
    if (promptType === 'summary') {
      return "Results-driven professional with a proven track record of optimizing processes and delivering high-impact solutions. Adept at cross-functional collaboration and leveraging data to drive strategic decision-making in fast-paced environments.";
    } else {
      return "Spearheaded the development of scalable architectures, improving system performance by 40% and reducing operational costs.";
    }
  };

  // Suppress unused variable warnings
  void sectionId; void context; void jobDescription;

  return { generate, isGenerating };
}
