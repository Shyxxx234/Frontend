import { useState, useEffect, useCallback } from "react";
import { useDispatch } from "react-redux";
import { selectSlide } from "../store/presentationSlice";
import { updateSlideNotes } from "../store/slideSlice";
import type { Slide } from "../store/types";
import { showNotification } from "../views/SpeakerNotesModalWindow/utils/notification";

export const useSlideNavigation = (
    slides: Slide[],
    selectedSlideId?: string,
    isNewWindow?: boolean
) => {
    const dispatch = useDispatch();
    const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
    const [notes, setNotes] = useState<string>("");
    const [debouncedNotes, setDebouncedNotes] = useState<string>("");

    const currentSlide = slides[currentSlideIndex] || null;

    useEffect(() => {
        if (slides.length > 0 && !selectedSlideId) {
            const firstSlideId = slides[0].id;
            setCurrentSlideIndex(0);

            if (!isNewWindow) {
                dispatch(selectSlide(firstSlideId));
            }
        }
    }, [slides, selectedSlideId, dispatch, isNewWindow]);

    useEffect(() => {
        if (selectedSlideId && slides.length > 0) {
            const slideIndex = slides.findIndex(slide => slide.id === selectedSlideId);
            if (slideIndex !== -1) {
                setCurrentSlideIndex(slideIndex);
                const slide = slides[slideIndex];
                setNotes(slide.notes || "");
                setDebouncedNotes(slide.notes || "");
            }
        }
    }, [selectedSlideId, slides]);

    const handlePreviousSlide = useCallback(() => {
        if (currentSlideIndex > 0) {
            const newIndex = currentSlideIndex - 1;
            const newSlideId = slides[newIndex].id;

            if (isNewWindow) {
                window.opener?.postMessage({
                    type: 'SLIDE_CHANGED',
                    slideId: newSlideId
                }, '*');
                
                localStorage.setItem('currentSlideId', newSlideId);
                
                setCurrentSlideIndex(newIndex);
                const slide = slides[newIndex];
                setNotes(slide.notes || "");
                setDebouncedNotes(slide.notes || "");
            } else {
                dispatch(selectSlide(newSlideId));
            }
        }
    }, [currentSlideIndex, slides, dispatch, isNewWindow]);

    const handleNextSlide = useCallback(() => {
        if (currentSlideIndex < slides.length - 1) {
            const newIndex = currentSlideIndex + 1;
            const newSlideId = slides[newIndex].id;

            if (isNewWindow) {
                window.opener?.postMessage({
                    type: 'SLIDE_CHANGED',
                    slideId: newSlideId
                }, '*');
                
                localStorage.setItem('currentSlideId', newSlideId);
                
                setCurrentSlideIndex(newIndex);
                const slide = slides[newIndex];
                setNotes(slide.notes || "");
                setDebouncedNotes(slide.notes || "");
            } else {
                dispatch(selectSlide(newSlideId));
            }
        }
    }, [currentSlideIndex, slides, dispatch, isNewWindow]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (currentSlide?.id && debouncedNotes !== notes && debouncedNotes !== undefined) {
                if (isNewWindow) {
                    localStorage.setItem(`notes_${currentSlide.id}`, debouncedNotes);
                    window.opener?.postMessage({
                        type: 'NOTES_UPDATED',
                        slideId: currentSlide.id,
                        notes: debouncedNotes
                    }, '*');
                } else {
                    dispatch(updateSlideNotes({
                        slideId: currentSlide.id,
                        notes: debouncedNotes
                    }));
                }
            }
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [debouncedNotes, currentSlide?.id, dispatch, notes, isNewWindow]);

    const handleNotesChange = useCallback((newNotes: string) => {
        setNotes(newNotes);
        setDebouncedNotes(newNotes);
    }, []);

    const handleUseAIResponse = useCallback((aiResponse: string) => {
        if (!aiResponse.trim()) {
            showNotification("Нет ответа AI для добавления в заметки");
            return;
        }
        
        const userConfirmation = window.confirm(
            "Добавить совет AI в заметки к слайду?\n\n" +
            "Будет добавлен раздел '--- AI совет ---' с текстом ответа."
        );
        
        if (userConfirmation) {
            const separator = notes.trim() ? "\n\n--- AI совет ---\n" : "--- AI совет ---\n";
            const newNotes = notes + separator + aiResponse;
            setNotes(newNotes);
            setDebouncedNotes(newNotes);
            showNotification("Совет AI добавлен в заметки");
        }
    }, [notes]);

    return {
        currentSlideIndex,
        currentSlide,
        notes,
        setNotes,
        handlePreviousSlide,
        handleNextSlide,
        handleNotesChange,
        handleUseAIResponse
    };
};