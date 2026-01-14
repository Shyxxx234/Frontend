import React, { useState, useEffect, useRef } from 'react';
import type { CodeBlock as CodeBlockType } from '../store/types';
import styles from './SimpleCodeBlock.module.css';

interface SimpleCodeBlockProps {
  codeBlock: CodeBlockType;
  readOnly?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

interface PrismStatic {
  highlight: (text: string, grammar: unknown, language: string) => string;
  languages: Record<string, unknown>;
}

const SimpleCodeBlock: React.FC<SimpleCodeBlockProps> = ({
  codeBlock,
  readOnly = true,
  className = '',
  style
}) => {
  const [copied, setCopied] = useState(false);
  const [highlightedCode, setHighlightedCode] = useState('');
  const codeRef = useRef<HTMLPreElement>(null);
  const [isPrismLoaded, setIsPrismLoaded] = useState(false);

  useEffect(() => {
    const loadPrism = async () => {
      if ((window as { Prism?: PrismStatic }).Prism) {
        setIsPrismLoaded(true);
        return;
      }

      const prismScript = document.createElement('script');
      prismScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/prism.min.js';
      prismScript.async = true;
      
      prismScript.onload = () => {
        const languages = ['javascript', 'typescript', 'python', 'jsx', 'tsx', 'css', 'markup', 'java', 'cpp', 'json', 'markdown'];
        let loadedCount = 0;
        
        languages.forEach(lang => {
          const langScript = document.createElement('script');
          langScript.src = `https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/components/prism-${lang}.min.js`;
          langScript.async = true;
          langScript.onload = () => {
            loadedCount++;
            if (loadedCount === languages.length) {
              setIsPrismLoaded(true);
            }
          };
          document.head.appendChild(langScript);
        });
      };
      
      document.head.appendChild(prismScript);
    };

    loadPrism();
  }, []);

  useEffect(() => {
    const Prism = (window as unknown as { Prism?: PrismStatic }).Prism;
    
    if (!isPrismLoaded || !Prism || !codeBlock.content) {
      setHighlightedCode(codeBlock.content || '// Нет кода');
      return;
    }

    try {
      const languageMap: Record<string, string> = {
        'javascript': 'javascript',
        'typescript': 'typescript',
        'python': 'python',
        'jsx': 'jsx',
        'tsx': 'tsx',
        'html': 'markup',
        'xml': 'markup',
        'css': 'css',
        'json': 'json',
        'markdown': 'markdown',
        'bash': 'bash',
        'shell': 'bash',
        'sql': 'sql',
        'java': 'java',
        'c': 'c',
        'cpp': 'cpp',
        'csharp': 'csharp',
        'php': 'php',
        'ruby': 'ruby',
        'go': 'go',
        'rust': 'rust',
        'swift': 'swift',
        'kotlin': 'kotlin'
      };

      const prismLang = languageMap[codeBlock.language.toLowerCase()] || 'javascript';
      const grammar = Prism.languages[prismLang] || Prism.languages.javascript;
      
      const highlighted = Prism.highlight(codeBlock.content, grammar, prismLang);
      setHighlightedCode(highlighted);
    } catch (error) {
      console.error('Prism highlighting error:', error);
      setHighlightedCode(codeBlock.content);
    }
  }, [isPrismLoaded, codeBlock.content, codeBlock.language]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeBlock.content)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy:', err);
      });
  };

  const getThemeClass = () => {
    switch (codeBlock.theme) {
      case 'vs-dark': return styles.themeDark;
      case 'hc-black': return styles.themeHighContrast;
      default: return styles.themeLight;
    }
  };

  const fontSize = codeBlock.fontSize || 14;

  const renderCode = () => {
    if (!codeBlock.content.trim()) {
      return (
        <div className={styles.noCode}>
          // Нет кода
        </div>
      );
    }

    const lines = highlightedCode.split('\n');
    const showLineNumbers = codeBlock.showLineNumbers !== false;

    return (
      <div className={styles.codeWrapper} style={{ fontSize: `${fontSize}px` }}>
        {showLineNumbers && (
          <div className={styles.lineNumbers}>
            {lines.map((_, i) => (
              <div key={i} className={styles.lineNumber}>
                {i + 1}
              </div>
            ))}
          </div>
        )}
        <pre
          ref={codeRef}
          className={styles.codeContent}
        >
          <code
            className={`language-${codeBlock.language}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      </div>
    );
  };

  return (
    <div 
      className={`${styles.simpleCodeBlock} ${getThemeClass()} ${className}`}
      style={style}
      data-theme={codeBlock.theme || 'vs-dark'}
    >
      <div className={styles.codeContainer}>
        {renderCode()}
      </div>

      {!readOnly && (
        <div className={styles.codeToolbar}>
          <div className={styles.languageBadge}>
            {codeBlock.language}
          </div>
          <button 
            className={styles.copyButton}
            onClick={handleCopyCode}
          >
            {copied ? '✓ Скопировано!' : '📋 Копировать'}
          </button>
        </div>
      )}
    </div>
  );
};

export default SimpleCodeBlock;