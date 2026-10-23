import { useState, useEffect, useRef, useCallback } from 'react';

export function useSpeechRecognition() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [permissionError, setPermissionError] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  const recognitionRef = useRef(null);
  const startTimeRef = useRef(null);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const timerRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSupported(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let currentInterim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
            finalChunk += result[0].transcript + ' ';
          } else {
            currentInterim += result[0].transcript;
          }
        }

        if (finalChunk) {
          setTranscript((prev) => (prev ? `${prev.trim()} ${finalChunk.trim()}` : finalChunk.trim()));
        }
        setInterimTranscript(currentInterim);
      };

      recognition.onerror = (event) => {
        console.warn('SpeechRecognition error:', event.error);
        if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
          setPermissionError('Microphone permission was denied. Please allow microphone access in your browser settings (Chrome recommended) or use typed answer mode.');
        } else if (event.error === 'no-speech') {
          // Normal timeout when candidate pauses
        } else {
          setPermissionError(`Speech recognition notice: ${event.error}. You can continue typing your answer.`);
        }
        setIsListening(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (timerRef.current) clearInterval(timerRef.current);
      };

      recognitionRef.current = recognition;
    } catch (err) {
      console.warn('SpeechRecognition initialization error:', err);
      setIsSupported(false);
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (_) {}
      }
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startListening = useCallback(() => {
    setPermissionError(null);
    setInterimTranscript('');
    if (!recognitionRef.current) {
      setPermissionError('Speech recognition is not supported in this browser. Please use Google Chrome or typed answer mode.');
      return;
    }

    try {
      startTimeRef.current = Date.now();
      setRecordingDuration(0);

      // Start duration ticker
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        if (startTimeRef.current) {
          setRecordingDuration((Date.now() - startTimeRef.current) / 1000);
        }
      }, 500);

      recognitionRef.current.start();
      setIsListening(true);
    } catch (err) {
      console.warn('Start listening failed:', err);
      // Already running or permission issue
      if (err.name === 'InvalidStateError') {
        setIsListening(true);
      }
    }
  }, []);

  const stopListening = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (startTimeRef.current) {
      setRecordingDuration((Date.now() - startTimeRef.current) / 1000);
    }

    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    setIsListening(false);
  }, [isListening]);

  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setRecordingDuration(0);
    setPermissionError(null);
  }, []);

  return {
    isListening,
    transcript,
    setTranscript,
    interimTranscript,
    recordingDuration,
    permissionError,
    isSupported,
    startListening,
    stopListening,
    resetTranscript
  };
}
