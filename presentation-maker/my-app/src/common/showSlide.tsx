import { useDispatch, useSelector } from 'react-redux';
import { useState, useRef, useEffect, useCallback } from "react";
import styles from "./ShowSlide.module.css";
import type { Slide, SlideObject } from '../store/types';
import type { RootState } from '../store/store';
import { selectObject } from '../store/presentationSlice';
import {
    moveObject,
    resizeObject,
    changePlainTextContent
} from '../store/slideObjectSlice';
import { calculateResize } from '../store/utils';
import { updateCodeBlockContent } from '../store/slideObjectSlice';
import SimpleCodeBlock from './SimpleCodeBlock';

type ShowSlideProps = {
    slide: Slide;
    disableObjectClicks: boolean;
    className?: string;
    slideId: string;
    objSelection?: Array<string>;
    style?: React.CSSProperties;
    onTextObjectContextMenu?: (e: React.MouseEvent, objectId: string) => void;
    onCodeBlockContextMenu?: (e: React.MouseEvent, objectId: string) => void;
    externalObjects?: SlideObject[];
}

type ResizeDirection = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e';

type SingleTransform = {
    objectId: string;
    x: number;
    y: number;
    width: number;
    height: number;
};

type MultiTransform = {
    objectIds: string[];
    transforms: SingleTransform[];
};

type TempTransform = SingleTransform | MultiTransform | null;

const SCALE_TO_PX = 16;

export function ShowSlide(props: ShowSlideProps) {
    const dispatch = useDispatch();

    const slideObjectsFromStore = useSelector((state: RootState) =>
        state.slideObjects.objects[props.slideId] || [],
        (prev, next) => JSON.stringify(prev) === JSON.stringify(next)
    );

    const slideObjects = props.externalObjects || slideObjectsFromStore;

    const [resizingId, setResizingId] = useState<string | null>(null);
    const [tempTransform, setTempTransform] = useState<TempTransform>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [editingTextId, setEditingTextId] = useState<string | null>(null);
    const [editingCodeBlockId, setEditingCodeBlockId] = useState<string | null>(null);
    const [initialContent, setInitialContent] = useState<string>('');
    const [codeContent, setCodeContent] = useState<string>('');
    const slideRef = useRef<HTMLDivElement>(null);
    const textEditRef = useRef<HTMLDivElement>(null);
    const codeEditRef = useRef<HTMLTextAreaElement>(null);
    const tempTransformRef = useRef<TempTransform>(null);

    const scaleToPx = (scale: number): number => {
        return Math.round(scale * SCALE_TO_PX);
    };

    useEffect(() => {
        tempTransformRef.current = tempTransform;
    }, [tempTransform]);

    useEffect(() => {
        if (!isDragging && !resizingId) {
            setTempTransform(null);
        }
    }, [isDragging, resizingId]);

    useEffect(() => {
        if (editingTextId && textEditRef.current) {
            textEditRef.current.focus();
            const range = document.createRange();
            const sel = window.getSelection();
            range.selectNodeContents(textEditRef.current);
            range.collapse(false);
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
    }, [editingTextId]);

    useEffect(() => {
        if (editingCodeBlockId && codeEditRef.current) {
            codeEditRef.current.focus();
            const obj = slideObjects.find(o => o.id === editingCodeBlockId);
            if (obj && obj.type === 'code_block') {
                setCodeContent(obj.content);
            }
        }
    }, [editingCodeBlockId, slideObjects]);

    const handleObjectClick = (e: React.MouseEvent, objId: string) => {
        if (props.disableObjectClicks || resizingId) return;

        const currentSelection = props.objSelection || [];
        let newSelection: string[];
        if (e.ctrlKey || e.metaKey) {
            newSelection = [...currentSelection, objId];
        } else {
            newSelection = [objId];
        }

        dispatch(selectObject(newSelection));
    };

    const handleSlideClick = (e: React.MouseEvent) => {
        const target = e.target as HTMLElement;
        const isFormElement = target.tagName === 'SELECT' || 
                              target.tagName === 'INPUT' || 
                              target.tagName === 'BUTTON' ||
                              target.tagName === 'TEXTAREA' ||
                              target.closest('select, input, button, textarea');
        
        if (e.target === e.currentTarget && 
            !props.disableObjectClicks && 
            !isFormElement) {
            dispatch(selectObject([]));
            stopEditingText();
            stopEditingCodeBlock();
        }
    };

    const startTextEditing = (e: React.MouseEvent, obj: SlideObject) => {
        if (props.disableObjectClicks || resizingId) return;
        
        e.stopPropagation();
        setEditingTextId(obj.id);
        if (obj.type === 'plain_text') {
            setInitialContent(obj.content);
        }
        dispatch(selectObject([obj.id]));
        setEditingCodeBlockId(null);
    };

    const startCodeBlockEditing = useCallback((objId: string) => {
        if (props.disableObjectClicks) return;
        
        setEditingCodeBlockId(objId);
        dispatch(selectObject([objId]));
        setEditingTextId(null);
    }, [props.disableObjectClicks, dispatch]);

    const stopEditingText = () => {
        if (editingTextId && textEditRef.current) {
            const newContent = textEditRef.current.textContent || '';
            const obj = slideObjects.find(o => o.id === editingTextId);
            if (obj && obj.type === 'plain_text' && newContent !== initialContent) {
                dispatch(changePlainTextContent({
                    content: newContent,
                    objectId: editingTextId,
                    slideId: props.slideId
                }));
            }
            setEditingTextId(null);
            setInitialContent('');
        }
    };

    const stopEditingCodeBlock = () => {
        if (editingCodeBlockId && codeContent) {
            const obj = slideObjects.find(o => o.id === editingCodeBlockId);
            if (obj && obj.type === 'code_block' && codeContent !== obj.content) {
                dispatch(updateCodeBlockContent({
                    content: codeContent,
                    objectId: editingCodeBlockId,
                    slideId: props.slideId,
                    theme: obj.theme,
                    fontSize: obj.fontSize,
                    showLineNumbers: obj.showLineNumbers
                }));
            }
            setEditingCodeBlockId(null);
            setCodeContent('');
        }
    };

    const handleTextKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.stopPropagation();
            e.preventDefault();
            setEditingTextId(null);
            setInitialContent('');
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            stopEditingText();
        }
    };

    const handleCodeKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Escape') {
            e.stopPropagation();
            e.preventDefault();
            setEditingCodeBlockId(null);
            setCodeContent('');
        } else if (e.key === 'Enter' && e.ctrlKey) {
            e.preventDefault();
            stopEditingCodeBlock();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            const textarea = e.currentTarget;
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            
            const newValue = codeContent.substring(0, start) + '  ' + codeContent.substring(end);
            setCodeContent(newValue);
            
            setTimeout(() => {
                textarea.selectionStart = textarea.selectionEnd = start + 2;
            }, 0);
        }
    };

    const startDrag = (e: React.MouseEvent, objId: string) => {
        if (props.disableObjectClicks || editingTextId === objId || editingCodeBlockId === objId) return;

        e.stopPropagation();
        stopEditingText();
        stopEditingCodeBlock();

        const slideRect = slideRef.current?.getBoundingClientRect();
        if (!slideRect) return;

        const selectedIds = props.objSelection?.includes(objId) 
            ? props.objSelection
            : [objId];
        
        const objectsToDrag = slideObjects.filter(obj => 
            selectedIds.includes(obj.id)
        );

        const startMouseX = e.clientX;
        const startMouseY = e.clientY;
        
        const startPositions = objectsToDrag.map(obj => ({
            id: obj.id,
            startX: obj.rect.x,
            startY: obj.rect.y,
            width: obj.rect.width,
            height: obj.rect.height
        }));

        setIsDragging(true);

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startMouseX;
            const deltaY = moveEvent.clientY - startMouseY;

            const transforms = startPositions.map(pos => {
                const newX = Math.min(
                    Math.max(0, pos.startX + deltaX),
                    slideRect.width - pos.width
                );
                const newY = Math.min(
                    Math.max(0, pos.startY + deltaY),
                    slideRect.height - pos.height
                );

                return {
                    objectId: pos.id,
                    x: newX,
                    y: newY,
                    width: pos.width,
                    height: pos.height
                };
            });
            setTempTransform({
                objectIds: transforms.map(t => t.objectId),
                transforms
            });
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            const finalTransform = tempTransformRef.current;

            if (finalTransform && 'transforms' in finalTransform) {
                finalTransform.transforms.forEach((transform: SingleTransform) => {
                    dispatch(moveObject({
                        objectId: transform.objectId,
                        slideId: props.slideId,
                        x: transform.x,
                        y: transform.y
                    }));
                });
            }

            setTimeout(() => {
                setTempTransform(null);
                setIsDragging(false);
            }, 0);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const startResize = (e: React.MouseEvent, objId: string, direction: ResizeDirection) => {
        if (props.disableObjectClicks || editingTextId === objId || editingCodeBlockId === objId) return;

        e.stopPropagation();
        stopEditingText();
        stopEditingCodeBlock();

        const slideRect = slideRef.current?.getBoundingClientRect();
        if (!slideRect) return;

        const obj = slideObjects.find(obj => obj.id === objId);
        if (!obj) return;

        const startMouseX = e.clientX;
        const startMouseY = e.clientY;
        const startLeft = obj.rect.x;
        const startTop = obj.rect.y;
        const startWidth = obj.rect.width;
        const startHeight = obj.rect.height;

        setResizingId(objId);

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startMouseX;
            const deltaY = moveEvent.clientY - startMouseY;

            const MIN_SIZE = 20;

            const { newX, newY, newWidth, newHeight } = calculateResize(
                direction,
                deltaX,
                deltaY,
                startLeft,
                startTop,
                startWidth,
                startHeight,
                {
                    minX: 0,
                    minY: 0,
                    maxWidth: slideRect.width,
                    maxHeight: slideRect.height,
                    minSize: MIN_SIZE
                }
            );

            setTempTransform({
                objectId: objId,
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight
            });
        };

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);

            const finalTransform = tempTransformRef.current;

            if (finalTransform && 'objectId' in finalTransform) {
                dispatch(resizeObject({
                    objectId: finalTransform.objectId,
                    slideId: props.slideId,
                    x: finalTransform.x,
                    y: finalTransform.y,
                    width: finalTransform.width,
                    height: finalTransform.height
                }));
            }

            setTimeout(() => {
                setTempTransform(null);
                setResizingId(null);
            }, 0);
        };

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const handleTextObjectContextMenu = (e: React.MouseEvent, objId: string) => {
        if (props.disableObjectClicks || resizingId) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        if (props.onTextObjectContextMenu) {
            props.onTextObjectContextMenu(e, objId);
        }
    };

    const handleCodeBlockContextMenu = (e: React.MouseEvent, objId: string) => {
        if (props.disableObjectClicks || resizingId) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        if (props.onCodeBlockContextMenu) {
            props.onCodeBlockContextMenu(e, objId);
        }
    };

    const ResizeHandler = ({ direction, objId }: { direction: ResizeDirection, objId: string }) => {
        if (props.disableObjectClicks) return null;

        const handleClassNames = {
            'nw': `${styles.resizeHandle} ${styles.resizeHandleNw}`,
            'ne': `${styles.resizeHandle} ${styles.resizeHandleNe}`,
            'sw': `${styles.resizeHandle} ${styles.resizeHandleSw}`,
            'se': `${styles.resizeHandle} ${styles.resizeHandleSe}`,
            'n': `${styles.resizeHandle} ${styles.resizeHandleN}`,
            's': `${styles.resizeHandle} ${styles.resizeHandleS}`,
            'w': `${styles.resizeHandle} ${styles.resizeHandleW}`,
            'e': `${styles.resizeHandle} ${styles.resizeHandleE}`,
        };

        return (
            <div
                onMouseDown={(e) => startResize(e, objId, direction)}
                className={handleClassNames[direction]}
            />
        );
    };

    const objSelection = props.objSelection || [];

    const getObjectRect = (obj: SlideObject) => {
        if (!tempTransform) return obj.rect;
        
        if ('objectId' in tempTransform && tempTransform.objectId === obj.id) {
            return {
                x: tempTransform.x,
                y: tempTransform.y,
                width: tempTransform.width,
                height: tempTransform.height
            };
        }
        
        if ('transforms' in tempTransform) {
            const transform = tempTransform.transforms.find(t => t.objectId === obj.id);
            if (transform) {
                return {
                    x: transform.x,
                    y: transform.y,
                    width: transform.width,
                    height: transform.height
                };
            }
        }
        
        return obj.rect;
    };

    const handleCodeBlockDoubleClick = (obj: SlideObject) => {
        if (props.disableObjectClicks || editingCodeBlockId === obj.id) return;
        
        if (obj.type === 'code_block') {
            startCodeBlockEditing(obj.id);
        }
    };

    const handleCodeContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setCodeContent(e.target.value);
    };

    const handleCodeBlur = () => {
        stopEditingCodeBlock();
    };

    return (
        <div
            ref={slideRef}
            className={`${styles.slide} ${props.className || ''}`}
            onClick={handleSlideClick}
            style={{
                ...props.style,
                backgroundColor: props.slide.background.type === 'color' ? props.slide.background.color : 'transparent',
                backgroundImage: props.slide.background.type === 'picture' ? `url(${props.slide.background.src})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                cursor: props.disableObjectClicks ? 'default' : 'pointer'
            }}
        >
            {slideObjects.map(obj => {
                const isSelected = objSelection.includes(obj.id);
                const isMultipleSelected = isSelected && objSelection.length > 1;
                const isEditing = editingTextId === obj.id && obj.type === 'plain_text';
                const isCodeEditing = editingCodeBlockId === obj.id && obj.type === 'code_block';
                const rect = getObjectRect(obj);

                const objectClasses = [
                    styles.slideObject,
                    isSelected ? styles.selected : '',
                    isMultipleSelected ? styles.multipleSelected : '',
                    props.disableObjectClicks ? styles.slideShowMode : '',
                    isEditing ? styles.editing : '',
                    isCodeEditing ? styles.codeEditing : '',
                    obj.type === 'code_block' ? styles.codeBlockObject : ''
                ].join(' ');

                const fontSize = obj.type === 'plain_text' ? 
                    scaleToPx(obj.scale) : 
                    obj.type === 'code_block' ? obj.fontSize || 14 : 16;

                return (
                    <div
                        key={obj.id}
                        className={objectClasses}
                        onClick={(e) => handleObjectClick(e, obj.id)}
                        onMouseDown={(e) => startDrag(e, obj.id)}
                        onContextMenu={(e) => {
                            if (obj.type === 'plain_text') {
                                handleTextObjectContextMenu(e, obj.id);
                            } else if (obj.type === 'code_block') {
                                handleCodeBlockContextMenu(e, obj.id);
                            }
                        }}
                        style={{
                            left: rect.x,
                            top: rect.y,
                            width: rect.width,
                            height: rect.height,
                            cursor: props.disableObjectClicks ? 'default' : (isEditing ? 'text' : (isCodeEditing ? 'text' : 'move')),
                            overflow: 'hidden'
                        }}
                    >
                        {obj.type === 'plain_text' && (
                            <>
                                {isEditing ? (
                                    <div
                                        ref={textEditRef}
                                        className={styles.textEditor}
                                        style={{
                                            fontFamily: obj.fontFamily,
                                            fontWeight: obj.weight,
                                            fontSize: `${fontSize}px`,
                                            outline: 'none',
                                            color: obj.color || '#000000',
                                            textAlign: obj.alignment || 'left',
                                            lineHeight: 1.2,
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: obj.alignment === 'right' ? 'flex-end' : 
                                                          obj.alignment === 'center' ? 'center' : 'flex-start'
                                        }}
                                        contentEditable={true}
                                        suppressContentEditableWarning={true}
                                        onBlur={stopEditingText}
                                        onKeyDown={handleTextKeyDown}
                                    >
                                        {initialContent}
                                    </div>
                                ) : (
                                    <div
                                        className={styles.textObject}
                                        style={{
                                            fontFamily: obj.fontFamily,
                                            fontWeight: obj.weight,
                                            fontSize: `${fontSize}px`,
                                            color: obj.color || '#000000',
                                            textAlign: obj.alignment || 'left',
                                            cursor: props.disableObjectClicks ? 'default' : 'text',
                                            lineHeight: 1.2,
                                            width: '100%',
                                            height: '100%',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: obj.alignment === 'right' ? 'flex-end' : 
                                                          obj.alignment === 'center' ? 'center' : 'flex-start',
                                            overflow: 'hidden',
                                            wordWrap: 'break-word'
                                        }}
                                        onDoubleClick={(e) => startTextEditing(e, obj)}
                                    >
                                        {obj.content}
                                    </div>
                                )}
                            </>
                        )}
                        {obj.type === 'picture' && (
                            <img
                                src={obj.src}
                                className={styles.imageObject}
                                alt=""
                                draggable={false}
                                style={{
                                    cursor: props.disableObjectClicks ? 'default' : 'move'
                                }}
                            />
                        )}
                        {obj.type === 'code_block' && (
                            <div 
                                className={styles.codeBlockContainer}
                                onDoubleClick={() => handleCodeBlockDoubleClick(obj)}
                            >
                                {isCodeEditing ? (
                                    <div className={styles.codeEditorWrapper}>
                                        <textarea
                                            ref={codeEditRef}
                                            className={styles.codeEditor}
                                            value={codeContent}
                                            onChange={handleCodeContentChange}
                                            onBlur={handleCodeBlur}
                                            onKeyDown={handleCodeKeyDown}
                                            style={{
                                                fontFamily: "'Cascadia Code', 'Consolas', 'Monaco', 'Courier New', monospace",
                                                fontSize: `${obj.fontSize || 14}px`,
                                                backgroundColor: obj.theme === 'vs-dark' ? '#1e1e1e' : '#ffffff',
                                                color: obj.theme === 'vs-dark' ? '#d4d4d4' : '#000000'
                                            }}
                                            spellCheck="false"
                                        />
                                    </div>
                                ) : (
                                    <SimpleCodeBlock
                                        codeBlock={obj}
                                        readOnly={props.disableObjectClicks}
                                        style={{
                                            width: '100%',
                                            height: '100%'
                                        }}
                                    />
                                )}
                            </div>
                        )}

                        {!props.disableObjectClicks && isSelected && objSelection.length === 1 && !isEditing && !isCodeEditing && (
                            <>
                                <ResizeHandler direction="nw" objId={obj.id} />
                                <ResizeHandler direction="ne" objId={obj.id} />
                                <ResizeHandler direction="sw" objId={obj.id} />
                                <ResizeHandler direction="se" objId={obj.id} />
                                <ResizeHandler direction="n" objId={obj.id} />
                                <ResizeHandler direction="s" objId={obj.id} />
                                <ResizeHandler direction="w" objId={obj.id} />
                                <ResizeHandler direction="e" objId={obj.id} />
                            </>
                        )}
                    </div>
                );
            })}
        </div>
    );
}