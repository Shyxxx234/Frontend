import { useState, useCallback, useRef, useEffect } from "react";
import { showNotification } from "../views/SpeakerNotesModalWindow/utils/notification";

const MAX_BUFFER_SIZE = 500;
const ACTIVATION_COMMANDS = [
    "хороший вопрос",
    "хороший вопрос.",
    "хороший вопрос!",
    "интересный вопрос",
    "вопрос",
    "помощь с вопросом"
];

interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
}

interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

export const useSpeechRecognition = (
    onActivationCommand: (buffer: string) => void,
    onBufferUpdate?: (buffer: string, size: number) => void
) => {
    const [isListening, setIsListening] = useState<boolean>(false);
    const [isSpeechSupported, setIsSpeechSupported] = useState<boolean>(false);
    const [interimTranscript, setInterimTranscript] = useState<string>("");
    const [finalTranscript, setFinalTranscript] = useState<string>("");
    const [recognitionError, setRecognitionError] = useState<string>("");
    const [audioLevel, setAudioLevel] = useState<number>(0);
    const [speechBuffer, setSpeechBuffer] = useState<string>("");
    const [bufferSize, setBufferSize] = useState<number>(0);
    const [isProcessingCommand, setIsProcessingCommand] = useState<boolean>(false);

    const recognitionRef = useRef<SpeechRecognition | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const animationFrameRef = useRef<number>(0);
    const commandProcessingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const fullBufferRef = useRef<string>("");

    const updateSpeechBuffer = useCallback((text: string) => {
        setSpeechBuffer(prev => {
            const newBuffer = prev + text + ' ';
            const newSize = newBuffer.length;

            fullBufferRef.current = newBuffer;
            setBufferSize(newSize);

            onBufferUpdate?.(newBuffer, newSize);

            if (newSize >= MAX_BUFFER_SIZE) {
                showNotification("Буфер автоматически очищен (достиг 500 символов)");
                fullBufferRef.current = "";
                return "";
            }

            return newBuffer;
        });
    }, [onBufferUpdate]);

    const checkForActivationCommand = useCallback((transcript: string) => {
        const lowerTranscript = transcript.toLowerCase().trim();

        for (const command of ACTIVATION_COMMANDS) {
            const lowerCommand = command.toLowerCase();
            if (lowerTranscript.includes(lowerCommand)) {
                const completeBuffer = fullBufferRef.current.trim() || speechBuffer.trim();
                if (completeBuffer) {
                    setIsProcessingCommand(true);
                    showNotification(`Команда распознана! Добавляю буфер (${completeBuffer.length} символов) в AI...`);

                    onActivationCommand(completeBuffer);

                    setSpeechBuffer("");
                    setBufferSize(0);
                    fullBufferRef.current = "";
                    setInterimTranscript("");
                    setFinalTranscript("");

                    if (commandProcessingTimeoutRef.current) {
                        clearTimeout(commandProcessingTimeoutRef.current);
                    }
                    commandProcessingTimeoutRef.current = setTimeout(() => {
                        setIsProcessingCommand(false);
                    }, 2000);
                }
                break;
            }
        }
    }, [speechBuffer, onActivationCommand]);

    const startAudioAnalysis = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });
            mediaStreamRef.current = stream;

            const AudioContextClass = window.AudioContext || (window).AudioContext;

            audioContextRef.current = new AudioContextClass();
            analyserRef.current = audioContextRef.current.createAnalyser();
            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);

            analyserRef.current.fftSize = 256;
            const bufferLength = analyserRef.current.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            const updateAudioLevel = () => {
                if (!analyserRef.current || !audioContextRef.current) return;

                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < bufferLength; i++) {
                    sum += dataArray[i];
                }
                const average = sum / bufferLength;
                setAudioLevel(Math.min(average / 255, 1));

                animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
            };

            animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
        } catch {
            setRecognitionError('Не удалось получить доступ к микрофону');
        }
    }, []);

    const stopAudioAnalysis = useCallback(() => {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }
        setAudioLevel(0);
    }, []);

    useEffect(() => {
        const supported = 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
        setIsSpeechSupported(supported);

        if (supported) {
            const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognitionConstructor();

            if (recognitionRef.current) {
                recognitionRef.current.continuous = true;
                recognitionRef.current.interimResults = true;
                recognitionRef.current.lang = 'ru-RU';

                recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
                    let interim = '';
                    let final = '';

                    for (let i = event.resultIndex; i < event.results.length; i++) {
                        const transcript = event.results[i][0].transcript;
                        if (event.results[i].isFinal) {
                            final += transcript;
                            updateSpeechBuffer(transcript);
                            checkForActivationCommand(transcript);
                        } else {
                            interim += transcript;
                        }
                    }

                    setInterimTranscript(interim);

                    if (final) {
                        setFinalTranscript(prev => prev + final + ' ');
                    }
                };

                recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
                    console.error('Speech recognition error:', event.error);
                    setRecognitionError(`Ошибка распознавания: ${event.error}`);
                    showNotification(`Ошибка распознавания: ${event.error}. Продолжаю слушать...`);
                };

                recognitionRef.current.onend = () => {
                    if (isListening) {
                        setTimeout(() => {
                            if (recognitionRef.current && isListening) {
                                recognitionRef.current.start();
                            }
                        }, 100);
                    }
                };
            }
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            stopAudioAnalysis();
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (commandProcessingTimeoutRef.current) {
                clearTimeout(commandProcessingTimeoutRef.current);
            }
        };
    }, [isListening, checkForActivationCommand, updateSpeechBuffer, stopAudioAnalysis]);

    const toggleListening = useCallback(() => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
            stopAudioAnalysis();
            showNotification("Распознавание речи остановлено");
        } else {
            setRecognitionError("");
            setInterimTranscript("");
            setFinalTranscript("");
            setSpeechBuffer("");
            setBufferSize(0);
            fullBufferRef.current = "";
            setIsProcessingCommand(false);

            if (commandProcessingTimeoutRef.current) {
                clearTimeout(commandProcessingTimeoutRef.current);
                commandProcessingTimeoutRef.current = null;
            }

            try {
                recognitionRef.current.start();
                setIsListening(true);
                startAudioAnalysis();
                showNotification("Распознавание речи запущено. Скажите 'Хороший вопрос' для активации.");
            } catch {
                showNotification("Ошибка запуска распознавания речи");
            }
        }
    }, [isListening, startAudioAnalysis, stopAudioAnalysis]);

    const clearSpeechTranscript = useCallback(() => {
        setInterimTranscript("");
        setFinalTranscript("");
        setSpeechBuffer("");
        setBufferSize(0);
        fullBufferRef.current = "";
        setIsProcessingCommand(false);
        setRecognitionError("");

        if (commandProcessingTimeoutRef.current) {
            clearTimeout(commandProcessingTimeoutRef.current);
            commandProcessingTimeoutRef.current = null;
        }
        showNotification("Текст голосового ввода очищен");
    }, []);

    const getFullBuffer = useCallback(() => {
        return fullBufferRef.current.trim() || speechBuffer.trim();
    }, [speechBuffer]);

    return {
        isListening,
        isSpeechSupported,
        interimTranscript,
        finalTranscript,
        recognitionError,
        audioLevel,
        speechBuffer,
        bufferSize,
        isProcessingCommand,
        toggleListening,
        clearSpeechTranscript,
        getFullBuffer
    };
};