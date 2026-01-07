"use client";

import { useState, useRef } from 'react';

export default function VoiceCommandFAB() {
  const [isListening, setIsListening] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendAudioCommand(audioBlob);
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const sendAudioCommand = async (audioBlob: Blob) => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'command.wav');

    try {
      const response = await fetch('/api/ai/voice/command', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      console.log('Voice Command Response:', data);

      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      }
    } catch (error) {
      console.error('Error sending voice command:', error);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-50">
      <button
        onMouseDown={startRecording}
        onMouseUp={stopRecording}
        onTouchStart={startRecording}
        onTouchEnd={stopRecording}
        className={`p-4 rounded-full shadow-lg transition-all ${
          isListening ? 'bg-red-500 scale-110' : 'bg-blue-600 hover:bg-blue-700'
        } text-white`}
        aria-label="Voice Command"
      >
        {isListening ? (
          <div className="flex items-center space-x-1">
             <div className="w-1 h-4 bg-white animate-pulse"></div>
             <div className="w-1 h-6 bg-white animate-pulse delay-75"></div>
             <div className="w-1 h-4 bg-white animate-pulse delay-150"></div>
          </div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}
      </button>
      {isListening && (
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded">
          Listening...
        </div>
      )}
    </div>
  );
}
