// src/hooks/useCommandExecution.ts
import { useState, useCallback } from 'react';

export const useCommandExecution = () => {
  const [outputLines, setOutputLines] = useState<string[]>([
    'Ready to execute commands...'
  ]);

  const addOutput = useCallback((line: string) => {
    setOutputLines(prev => [...prev, line]);
  }, []);

  const clearOutput = useCallback(() => {
    setOutputLines(['Ready to execute commands...']);
  }, []);

  const addMultipleOutputs = useCallback((lines: string[]) => {
    setOutputLines(prev => [...prev, ...lines]);
  }, []);

  return {
    outputLines,
    addOutput,
    clearOutput,
    addMultipleOutputs
  };
};