"use client";

import React, { useState, useEffect, useRef } from 'react';

interface VoiceInputProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  onTranscript?: (text: string) => void;
}

export default function VoiceTextarea({ onTranscript, className, ...props }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports Web Speech API
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        if (finalTranscript) {
           const newText = finalTranscript + ' ';
           setTranscript((prev) => prev + newText);
           if (onTranscript) onTranscript(newText);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [onTranscript]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTranscript(e.target.value);
    if (props.onChange) props.onChange(e);
  };

  useEffect(() => {
    if (props.value !== undefined) {
      setTranscript(String(props.value));
    }
  }, [props.value]);


  return (
    <div className="relative">
      <textarea
        {...props}
        value={transcript}
        onChange={handleChange}
        className={`w-full pr-10 ${className || ''}`}
      />
      <button
        type="button"
        onClick={toggleListening}
        className={`absolute right-2 bottom-2 p-2 rounded-full ${
          isListening ? 'text-red-600 animate-pulse' : 'text-gray-500 hover:text-blue-600'
        }`}
        title="Voice Typing"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}
