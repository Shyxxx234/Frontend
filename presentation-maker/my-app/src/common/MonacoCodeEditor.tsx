import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';

loader.config({ 
  monaco,
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.34.0/min/vs'
  }
});

interface MonacoCodeEditorProps {
  language?: string;
  value?: string;
  onChange?: (value: string) => void;
  height?: string;
  width?: string;
  theme?: string;
  options?: monaco.editor.IStandaloneEditorConstructionOptions;
  readOnly?: boolean;
  className?: string;
  onMount?: (editor: monaco.editor.IStandaloneCodeEditor) => void;
}

export interface MonacoEditorRef {
  getValue: () => string;
  setValue: (value: string) => void;
  focus: () => void;
  saveContent: () => void;
}

const MonacoCodeEditor = forwardRef<MonacoEditorRef, MonacoCodeEditorProps>(
  ({
    language = 'typescript',
    value = '',
    onChange,
    height = '300px',
    width = '100%',
    theme = 'vs-dark',
    options = {},
    readOnly = false,
    className = '',
    onMount
  }, ref) => {
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const isInitialized = useRef(false);

    useImperativeHandle(ref, () => ({
      getValue: () => editorRef.current?.getValue() || '',
      setValue: (newValue: string) => {
        if (editorRef.current) {
          editorRef.current.setValue(newValue);
        }
      },
      focus: () => editorRef.current?.focus(),
      saveContent: () => {
        if (editorRef.current) {
          const content = editorRef.current.getValue();
          if (onChange) {
            onChange(content);
          }
        }
      }
    }));

    useEffect(() => {
      if (!containerRef.current || isInitialized.current) return;

      isInitialized.current = true;

      editorRef.current = monaco.editor.create(containerRef.current, {
        value,
        language,
        theme,
        automaticLayout: true,
        minimap: { enabled: false },
        scrollBeyondLastLine: false,
        fontSize: 14,
        fontFamily: "'Cascadia Code', 'Consolas', 'Monaco', 'Courier New', monospace",
        wordWrap: 'on',
        renderLineHighlight: 'all',
        readOnly,
        lineNumbers: 'on',
        roundedSelection: false,
        scrollbar: {
          vertical: 'visible',
          horizontal: 'visible',
          useShadows: false
        },
        overviewRulerBorder: false,
        renderValidationDecorations: 'off',
        suggestOnTriggerCharacters: true,
        acceptSuggestionOnEnter: 'on',
        tabSize: 2,
        insertSpaces: true,
        autoIndent: 'full',
        formatOnPaste: true,
        formatOnType: true,
        ...options,
      });

      const disposable = editorRef.current.onDidChangeModelContent(() => {
        const newValue = editorRef.current?.getValue() || '';
        if (onChange) {
          onChange(newValue);
        }
      });

      if (onMount && editorRef.current) {
        onMount(editorRef.current);
      }

      const style = document.createElement('style');
      style.textContent = `
        .monaco-editor .margin {
          background-color: #1e1e1e;
        }
        .monaco-editor .line-numbers {
          color: #858585 !important;
        }
        .monaco-editor .current-line {
          border: none !important;
          background-color: rgba(255, 255, 255, 0.04) !important;
        }
      `;
      document.head.appendChild(style);

      return () => {
        disposable.dispose();
        if (editorRef.current) {
          editorRef.current.dispose();
        }
        document.head.removeChild(style);
      };
    }, [language, theme, readOnly, options, value, onChange, onMount]);

    useEffect(() => {
      if (editorRef.current && value !== editorRef.current.getValue()) {
        editorRef.current.setValue(value);
      }
    }, [value]);

    useEffect(() => {
      if (editorRef.current) {
        const model = editorRef.current.getModel();
        if (model) {
          monaco.editor.setModelLanguage(model, language);
        }
      }
    }, [language]);

    useEffect(() => {
      if (editorRef.current) {
        monaco.editor.setTheme(theme);
      }
    }, [theme]);

    useEffect(() => {
      const handleResize = () => {
        if (editorRef.current) {
          editorRef.current.layout();
        }
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
      <div 
        className={`monaco-editor-container ${className}`}
        style={{ 
          height, 
          width, 
          position: 'relative',
          border: '1px solid #333',
          borderRadius: '4px',
          overflow: 'hidden'
        }}
      >
        <div ref={containerRef} style={{ 
          height: '100%', 
          width: '100%',
          outline: 'none'
        }} />
      </div>
    );
  }
);

MonacoCodeEditor.displayName = 'MonacoCodeEditor';

export default MonacoCodeEditor;