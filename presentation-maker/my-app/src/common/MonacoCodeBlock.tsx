import React, { useEffect, useRef, useState, useCallback } from 'react';
import { loader } from '@monaco-editor/react';
import type * as Monaco from 'monaco-editor';
import type { CodeBlock as CodeBlockType } from '../store/types';
import styles from './MonacoCodeBlock.module.css';

let monacoInitialized = false;
let monacoInstance: typeof Monaco | null = null;

interface MonacoCodeBlockProps {
  codeBlock: CodeBlockType;
  readOnly?: boolean;
  onContentChange?: (content: string) => void;
  className?: string;
  style?: React.CSSProperties;
  onEditorMount?: (editor: Monaco.editor.IStandaloneCodeEditor) => void;
}

const MonacoCodeBlock: React.FC<MonacoCodeBlockProps> = ({
  codeBlock,
  readOnly = true,
  onContentChange,
  className = '',
  style,
  onEditorMount
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isMonacoReady, setIsMonacoReady] = useState(false);
  const [editorLoaded, setEditorLoaded] = useState(false);

  useEffect(() => {
    const initMonaco = async () => {
      if (!monacoInitialized) {
        try {
          if (typeof window !== 'undefined') {
            loader.config({ 
              paths: { 
                vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.43.0/min/vs' 
              } 
            });
            
            const monaco = await loader.init();
            monacoInstance = monaco;
            
            monaco.editor.defineTheme('vs-dark-custom', {
              base: 'vs-dark',
              inherit: true,
              rules: [],
              colors: {
                'editor.background': '#1e1e1e',
                'editor.foreground': '#d4d4d4',
                'editor.lineHighlightBackground': '#2a2d2e',
                'editor.lineHighlightBorder': '#2a2d2e',
                'editorCursor.foreground': '#aeafad',
                'editorLineNumber.foreground': '#858585',
                'editorLineNumber.activeForeground': '#c6c6c6',
                'editor.selectionBackground': '#264f78',
                'editor.inactiveSelectionBackground': '#3a3d41',
                'editorIndentGuide.background': '#404040',
                'editorIndentGuide.activeBackground': '#707070',
              }
            });

            monaco.editor.defineTheme('vs-custom', {
              base: 'vs',
              inherit: true,
              rules: [],
              colors: {
                'editor.background': '#ffffff',
                'editor.foreground': '#000000',
                'editor.lineHighlightBackground': '#f5f5f5',
                'editor.lineHighlightBorder': '#f5f5f5',
                'editorCursor.foreground': '#000000',
                'editorLineNumber.foreground': '#2a2a2a',
                'editorLineNumber.activeForeground': '#000000',
                'editor.selectionBackground': '#add6ff',
                'editor.inactiveSelectionBackground': '#e5ebf1',
                'editorIndentGuide.background': '#d3d3d3',
                'editorIndentGuide.activeBackground': '#939393',
              }
            });

            monaco.editor.defineTheme('hc-black-custom', {
              base: 'hc-black',
              inherit: true,
              rules: [],
              colors: {
                'editor.background': '#000000',
                'editor.foreground': '#ffffff',
                'editor.lineHighlightBackground': '#0c141f',
                'editor.lineHighlightBorder': '#0c141f',
                'editorCursor.foreground': '#ffffff',
                'editorLineNumber.foreground': '#858585',
                'editorLineNumber.activeForeground': '#ffffff',
                'editor.selectionBackground': '#ffffff',
                'editor.inactiveSelectionBackground': '#3a3d41',
                'editorIndentGuide.background': '#404040',
                'editorIndentGuide.activeBackground': '#707070',
              }
            });
          }
          
          monacoInitialized = true;
          setIsMonacoReady(true);
        } catch (error) {
          console.error('Error initializing Monaco:', error);
        }
      } else {
        setIsMonacoReady(true);
      }
    };

    initMonaco();
  }, []);

  const createEditor = useCallback(() => {
    if (!isMonacoReady || !containerRef.current || editorLoaded || !monacoInstance) return;

    const themeMap: Record<string, string> = {
      'vs-dark': 'vs-dark-custom',
      'vs': 'vs-custom',
      'hc-black': 'hc-black-custom'
    };
    
    const monacoTheme = themeMap[codeBlock.theme || 'vs-dark'] || 'vs-dark-custom';
    
    const options: Monaco.editor.IStandaloneEditorConstructionOptions = {
      value: codeBlock.content,
      language: codeBlock.language,
      theme: monacoTheme,
      readOnly: readOnly,
      fontSize: codeBlock.fontSize || 14,
      lineNumbers: codeBlock.showLineNumbers !== false ? 'on' : 'off',
      lineNumbersMinChars: 3,
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      wordWrap: 'on',
      automaticLayout: true,
      folding: true,
      lineDecorationsWidth: 5,
      renderLineHighlight: 'all',
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        useShadows: false,
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10
      },
      overviewRulerLanes: 0,
      hideCursorInOverviewRuler: true,
      matchBrackets: 'always',
      accessibilitySupport: 'off',
      suggestOnTriggerCharacters: true,
      acceptSuggestionOnEnter: 'on',
      tabSize: 2,
      insertSpaces: true,
      autoClosingBrackets: 'always',
      autoClosingQuotes: 'always',
      formatOnPaste: true,
      formatOnType: false,
      suggestSelection: 'first',
      parameterHints: { enabled: true },
      quickSuggestions: {
        other: true,
        comments: false,
        strings: false
      },
      domReadOnly: false,
      mouseWheelZoom: true,
      mouseStyle: 'default',
      dragAndDrop: true,
      links: true,
      find: {
        addExtraSpaceOnTop: false,
        autoFindInSelection: 'never',
      },
      renderValidationDecorations: 'off',
      fixedOverflowWidgets: true,
      padding: { top: 8, bottom: 8 },
      renderWhitespace: 'none',
      renderControlCharacters: false,
      smoothScrolling: true,
      cursorBlinking: 'blink',
      cursorStyle: 'line',
      cursorWidth: 1
    };

    try {
      editorRef.current = monacoInstance.editor.create(containerRef.current, options);

      if (!readOnly && onContentChange) {
        editorRef.current.onDidChangeModelContent(() => {
          const content = editorRef.current?.getValue() || '';
          onContentChange(content);
        });
      }

      if (onEditorMount && editorRef.current) {
        onEditorMount(editorRef.current);
      }

      const resizeObserver = new ResizeObserver(() => {
        if (editorRef.current) {
          editorRef.current.layout();
        }
      });
      resizeObserver.observe(containerRef.current);

      setEditorLoaded(true);

      return () => {
        resizeObserver.disconnect();
        if (editorRef.current) {
          editorRef.current.dispose();
          editorRef.current = null;
        }
      };
    } catch (error) {
      console.error('Error creating Monaco editor:', error);
    }
  }, [isMonacoReady, editorLoaded, codeBlock.theme, codeBlock.content, codeBlock.language, codeBlock.fontSize, codeBlock.showLineNumbers, readOnly, onContentChange, onEditorMount]);

  useEffect(() => {
    const cleanup = createEditor();
    return cleanup;
  }, [createEditor]);

  useEffect(() => {
    if (editorRef.current && editorLoaded && codeBlock.content !== editorRef.current.getValue()) {
      const model = editorRef.current.getModel();
      const position = editorRef.current.getPosition();
      
      editorRef.current.setValue(codeBlock.content);
      
      if (position && model) {
        editorRef.current.setPosition(position);
      }
    }
  }, [codeBlock.content, editorLoaded]);

  useEffect(() => {
    if (editorRef.current && editorLoaded && monacoInstance) {
      const model = editorRef.current.getModel();
      if (model) {
        monacoInstance.editor.setModelLanguage(model, codeBlock.language);
      }
    }
  }, [codeBlock.language, editorLoaded]);

  useEffect(() => {
    if (editorRef.current && editorLoaded && monacoInstance) {
      const themeMap: Record<string, string> = {
        'vs-dark': 'vs-dark-custom',
        'vs': 'vs-custom',
        'hc-black': 'hc-black-custom'
      };
      const monacoTheme = themeMap[codeBlock.theme || 'vs-dark'] || 'vs-dark-custom';
      monacoInstance.editor.setTheme(monacoTheme);
    }
  }, [codeBlock.theme, editorLoaded]);

  useEffect(() => {
    if (editorRef.current && editorLoaded) {
      editorRef.current.updateOptions({ 
        fontSize: codeBlock.fontSize || 14,
        lineNumbers: codeBlock.showLineNumbers !== false ? 'on' : 'off'
      });
    }
  }, [codeBlock.fontSize, codeBlock.showLineNumbers, editorLoaded]);

  if (!isMonacoReady) {
    return (
      <div 
        className={`${styles.codeBlockFallback} ${className}`}
        style={{
          ...style,
          height: '100%',
          width: '100%',
          backgroundColor: codeBlock.theme === 'vs-dark' ? '#1e1e1e' : 
                         codeBlock.theme === 'hc-black' ? '#000000' : '#ffffff'
        }}
      >
        <div style={{
          position: 'relative',
          height: '100%',
          width: '100%',
          overflow: 'auto',
          fontFamily: "'Cascadia Code', 'Consolas', 'Monaco', 'Courier New', monospace",
          fontSize: `${codeBlock.fontSize || 14}px`,
          color: codeBlock.theme === 'vs-dark' ? '#d4d4d4' : 
                codeBlock.theme === 'hc-black' ? '#ffffff' : '#000000',
          padding: '8px',
          boxSizing: 'border-box'
        }}>
          <pre style={{ 
            margin: 0,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}>
            <code>{codeBlock.content}</code>
          </pre>
          {!readOnly && (
            <div style={{
              position: 'absolute',
              top: '5px',
              right: '5px',
              background: 'rgba(0, 0, 0, 0.7)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: '3px',
              fontSize: '11px',
              fontFamily: 'monospace',
              pointerEvents: 'none'
            }}>
              {codeBlock.language}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={`${styles.monacoCodeBlock} ${className}`}
      style={{
        ...style,
        height: '100%',
        width: '100%',
        backgroundColor: codeBlock.theme === 'vs-dark' ? '#1e1e1e' : 
                       codeBlock.theme === 'hc-black' ? '#000000' : '#ffffff'
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
    >
      {!readOnly && (
        <div style={{
          position: 'absolute',
          top: '5px',
          right: '5px',
          background: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '2px 6px',
          borderRadius: '3px',
          fontSize: '11px',
          fontFamily: 'monospace',
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          {codeBlock.language}
        </div>
      )}
    </div>
  );
};

export default MonacoCodeBlock;