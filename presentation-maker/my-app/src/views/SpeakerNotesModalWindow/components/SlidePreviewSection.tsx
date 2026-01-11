import React, { useRef } from "react";
import { ShowSlide } from "../../../common/ShowSlide";
import type { Slide, SlideObject } from "../../../store/types";
import styles from "../SpeakerNotesModalWindow.module.css";

const PREVIEW_SCALE = 0.85;

interface SlidePreviewSectionProps {
    currentSlide: Slide | null;
    slideObjects: Record<string, SlideObject[]>;
    currentSlideIndex: number;
    totalSlides: number;
    onPreviousSlide: () => void;
    onNextSlide: () => void;
}

export const SlidePreviewSection: React.FC<SlidePreviewSectionProps> = ({
    currentSlide,
    slideObjects,
    currentSlideIndex,
    totalSlides,
    onPreviousSlide,
    onNextSlide
}) => {
    const previewContainerRef = useRef<HTMLDivElement>(null);

    return (
        <div className={styles.leftPanel}>
            <div className={styles.slidePreview}>
                <div className={styles.slideNumber}>
                    Слайд {currentSlideIndex + 1} из {totalSlides}
                </div>
                <div 
                    className={styles.previewContainer}
                    ref={previewContainerRef}
                >
                    {currentSlide ? (
                        <div
                            className={styles.zoomContainer}
                            style={{
                                transform: `scale(${PREVIEW_SCALE})`,
                                transformOrigin: 'top left',
                                position: 'relative'
                            }}
                        >
                            <ShowSlide
                                slide={currentSlide}
                                className={styles.slide}
                                disableObjectClicks={true}
                                slideId={currentSlide.id}
                                objSelection={[]}
                                externalObjects={slideObjects[currentSlide.id] || []}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    width:'10000px',
                                    left: 0
                                }}
                            />
                        </div>
                    ) : (
                        <div className={styles.noSlide}>
                            {totalSlides === 0 ? "Нет слайдов" : "Выберите слайд"}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.navigation}>
                <button
                    className={styles.navButton}
                    onClick={onPreviousSlide}
                    disabled={currentSlideIndex === 0}
                >
                    ← Предыдущий
                </button>
                <button
                    className={styles.navButton}
                    onClick={onNextSlide}
                    disabled={currentSlideIndex === totalSlides - 1}
                >
                    Следующий →
                </button>
            </div>
        </div>
    );
};