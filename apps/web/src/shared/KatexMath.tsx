import katex from 'katex';
import { useMemo } from 'react';

interface KatexMathProps {
  latex: string;
  displayMode?: boolean;
  className?: string;
}

export function KatexMath({ latex, displayMode = false, className }: KatexMathProps) {
  const html = useMemo(() => {
    try {
      return katex.renderToString(latex, {
        displayMode,
        throwOnError: false,
        strict: false,
      });
    } catch {
      return '';
    }
  }, [latex, displayMode]);

  if (!html) {
    return <code className={className}>{latex}</code>;
  }

  return (
    <span
      className={className}
      // KaTeX AST output from internal trusted equation registry
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
