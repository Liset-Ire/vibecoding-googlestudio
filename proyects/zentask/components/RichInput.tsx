import React, { useRef, useEffect, useState } from 'react';
import { Bold, Italic, Mic, MicOff } from 'lucide-react';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

interface RichInputProps {
  value: string;
  onChange: (html: string, text: string) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  language?: 'en' | 'es';
}

export const RichInput: React.FC<RichInputProps> = ({ 
  value, 
  onChange, 
  placeholder, 
  className = '',
  onKeyDown,
  language = 'en'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Sync external value changes to editor (only if different to avoid cursor jumps)
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (value === '' && editorRef.current.innerHTML === '<br>') {
        return; // Ignore empty break
      }
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (editorRef.current) {
             // Simple append logic
             const currentText = editorRef.current.innerText;
             // Add space if needed
             const prefix = currentText && !currentText.endsWith(' ') ? ' ' : '';
             const newText = prefix + transcript;
             
             document.execCommand('insertText', false, newText);
             
             // Trigger change
             onChange(editorRef.current.innerHTML, editorRef.current.innerText);
          }
        };

        recognitionRef.current = recognition;
      }
    }
  }, [onChange]);

  // Safety: Stop listening if language changes while active to avoid mismatch
  useEffect(() => {
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, [language]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
        alert("Speech recognition is not supported in this browser.");
        return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = language === 'es' ? 'es-ES' : 'en-US';
      recognitionRef.current.start();
    }
  };

  const handleInput = () => {
    if (editorRef.current) {
      const html = editorRef.current.innerHTML;
      const text = editorRef.current.innerText;
      onChange(html, text);
    }
  };

  const execCmd = (command: string) => {
    document.execCommand(command, false);
    if (editorRef.current) editorRef.current.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  };

  const langCode = language === 'en' ? 'EN' : 'ES';

  return (
    <div className={`relative flex flex-col border border-slate-200 rounded-lg bg-slate-50 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400 transition-all ${className}`}>
      <div className="flex items-center gap-1 p-1 border-b border-slate-100 bg-white rounded-t-lg">
        <button 
          type="button"
          onClick={() => execCmd('bold')} 
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
          title="Bold"
        >
          <Bold size={14} />
        </button>
        <button 
          type="button"
          onClick={() => execCmd('italic')} 
          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded"
          title="Italic"
        >
          <Italic size={14} />
        </button>
        <div className="w-px h-4 bg-slate-200 mx-1" />
        <button 
          type="button"
          onClick={toggleListening} 
          className={`p-1.5 rounded transition-all flex items-center gap-1 ${isListening ? 'text-red-500 bg-red-50 ring-1 ring-red-100' : 'text-slate-500 hover:text-indigo-600 hover:bg-slate-100'}`}
          title={isListening ? "Stop Dictation" : `Dictate (${language === 'es' ? 'Spanish' : 'English'})`}
        >
          {isListening ? (
              <>
                <MicOff size={14} className="animate-pulse" />
                <span className="text-[10px] font-bold">{langCode}</span>
              </>
          ) : (
              <Mic size={14} />
          )}
        </button>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={onKeyDown}
        onPaste={handlePaste}
        className="px-4 py-3 min-h-[50px] max-h-[200px] overflow-y-auto outline-none text-slate-800 text-sm"
        data-placeholder={placeholder}
        style={{ whiteSpace: 'pre-wrap' }}
      />
      {!value && (
        <div className="absolute top-[46px] left-4 text-slate-400 text-sm pointer-events-none">
          {placeholder}
        </div>
      )}
    </div>
  );
};