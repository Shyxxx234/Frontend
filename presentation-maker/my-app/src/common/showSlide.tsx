import { useDispatch, useSelector } from 'react-redux'
import React, { useState, useRef, useEffect } from "react"
import styles from "./ShowSlide.module.css"
import type { Slide, SlideObject } from '../store/types'
import type { RootState } from '../store/store'
import { selectObject } from '../store/presentationSlice'
import { 
    moveObject, 
    resizeObject, 
    changePlainTextContent 
} from '../store/slideObjectSlice'
import { calculateResize } from '../store/utils'

type ShowSlideProps = {
    slide: Slide
    disableObjectClicks: boolean
    className?: string
    slideId: string
    objSelection?: Array<string>
}

type ResizeDirection = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e'

type TempTransform = {
    objectId: string
    x: number
    y: number
    width: number
    height: number
}

export function ShowSlide(props: ShowSlideProps) {
    const dispatch = useDispatch()

    const slideObjects = useSelector((state: RootState) =>
        state.slideObjects.objects[props.slideId] || [],
        (prev, next) => JSON.stringify(prev) === JSON.stringify(next)
    )

    const [resizingId, setResizingId] = useState<string | null>(null)
    const [tempTransform, setTempTransform] = useState<TempTransform | null>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [editingTextId, setEditingTextId] = useState<string | null>(null)
    const [initialContent, setInitialContent] = useState<string>('')
    const slideRef = useRef<HTMLDivElement>(null)
    const textEditRef = useRef<HTMLDivElement>(null)
    const tempTransformRef = useRef<TempTransform | null>(null)

    useEffect(() => {
        tempTransformRef.current = tempTransform
    }, [tempTransform])

    useEffect(() => {
        if (!isDragging && !resizingId) {
            setTempTransform(null)
        }
    }, [isDragging, resizingId])

    useEffect(() => {
        if (editingTextId && textEditRef.current) {
            textEditRef.current.focus()
            const range = document.createRange()
            const sel = window.getSelection()
            range.selectNodeContents(textEditRef.current)
            range.collapse(false)
            sel?.removeAllRanges()
            sel?.addRange(range)
        }
    }, [editingTextId])

    const handleObjectClick = (e: React.MouseEvent, objId: string) => {
        if (props.disableObjectClicks || resizingId) return

        const currentSelection = props.objSelection || []
        let newSelection: string[]
        if (e.ctrlKey || e.metaKey) {
            newSelection = [...currentSelection, objId]
        } else {
            newSelection = [objId]
        }

        dispatch(selectObject(newSelection))
    }

    const handleSlideClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget && !props.disableObjectClicks) {
            dispatch(selectObject([]))
            stopEditingText()
        }
    }

    const startTextEditing = (e: React.MouseEvent, obj: SlideObject) => {
        if (props.disableObjectClicks || resizingId) return
        
        e.stopPropagation()
        setEditingTextId(obj.id)
        if (obj.type === 'plain_text') {
            setInitialContent(obj.content)
        }
        dispatch(selectObject([obj.id]))
    }

    const stopEditingText = () => {
        if (editingTextId && textEditRef.current) {
            const newContent = textEditRef.current.textContent || ''
            const obj = slideObjects.find(o => o.id === editingTextId)
            if (obj && obj.type === 'plain_text' && newContent !== initialContent) {
                dispatch(changePlainTextContent({
                    content: newContent,
                    objectId: editingTextId,
                    slideId: props.slideId
                }))
            }
            setEditingTextId(null)
            setInitialContent('')
        }
    }

    const handleTextKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            e.stopPropagation()
            e.preventDefault()
            setEditingTextId(null)
            setInitialContent('')
        } else if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            stopEditingText()
        }
        // Разрешаем все остальные клавиши, включая backspace
    }

    const handleTextInput = () => {
        // Пустая функция для обработки изменений
    }

    const startDrag = (e: React.MouseEvent, objId: string) => {
        if (props.disableObjectClicks || editingTextId === objId) return

        e.stopPropagation()
        stopEditingText()

        const slideRect = slideRef.current?.getBoundingClientRect()
        if (!slideRect) return

        const selectedObj = slideObjects.find(obj => obj.id === objId)
        if (!selectedObj) return

        const startMouseX = e.clientX
        const startMouseY = e.clientY
        const startObjX = selectedObj.rect.x
        const startObjY = selectedObj.rect.y

        setIsDragging(true)

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startMouseX
            const deltaY = moveEvent.clientY - startMouseY

            const newX = Math.min(Math.max(0, startObjX + deltaX), slideRect.width - selectedObj.rect.width)
            const newY = Math.min(Math.max(0, startObjY + deltaY), slideRect.height - selectedObj.rect.height)

            setTempTransform({
                objectId: objId,
                x: newX,
                y: newY,
                width: selectedObj.rect.width,  
                height: selectedObj.rect.height
            })
        }

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)

            const finalTransform = tempTransformRef.current

            if (finalTransform) {
                dispatch(moveObject({
                    objectId: objId,
                    slideId: props.slideId,
                    x: finalTransform.x,
                    y: finalTransform.y
                }))
            }

            setTimeout(() => {
                setTempTransform(null)
                setIsDragging(false)
            }, 0)
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }

    const startResize = (e: React.MouseEvent, objId: string, direction: ResizeDirection) => {
        if (props.disableObjectClicks || editingTextId === objId) return

        e.stopPropagation()
        stopEditingText()

        const slideRect = slideRef.current?.getBoundingClientRect()
        if (!slideRect) return

        const obj = slideObjects.find(obj => obj.id === objId)
        if (!obj) return

        const startMouseX = e.clientX
        const startMouseY = e.clientY
        const startLeft = obj.rect.x
        const startTop = obj.rect.y
        const startWidth = obj.rect.width
        const startHeight = obj.rect.height

        setResizingId(objId)

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - startMouseX
            const deltaY = moveEvent.clientY - startMouseY

            const MIN_SIZE = 20

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
            )

            setTempTransform({
                objectId: objId,
                x: newX,
                y: newY,
                width: newWidth,
                height: newHeight
            })
        }

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)

            const finalTransform = tempTransformRef.current

            if (finalTransform) {
                dispatch(resizeObject({
                    objectId: objId,
                    slideId: props.slideId,
                    x: finalTransform.x,
                    y: finalTransform.y,
                    width: finalTransform.width,
                    height: finalTransform.height
                }))
            }

            setTimeout(() => {
                setTempTransform(null)
                setResizingId(null)
            }, 0)
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }

    const ResizeHandler = ({ direction, objId }: { direction: ResizeDirection, objId: string }) => {
        if (props.disableObjectClicks) return null

        const handleClassNames = {
            'nw': `${styles.resizeHandle} ${styles.resizeHandleNw}`,
            'ne': `${styles.resizeHandle} ${styles.resizeHandleNe}`,
            'sw': `${styles.resizeHandle} ${styles.resizeHandleSw}`,
            'se': `${styles.resizeHandle} ${styles.resizeHandleSe}`,
            'n': `${styles.resizeHandle} ${styles.resizeHandleN}`,
            's': `${styles.resizeHandle} ${styles.resizeHandleS}`,
            'w': `${styles.resizeHandle} ${styles.resizeHandleW}`,
            'e': `${styles.resizeHandle} ${styles.resizeHandleE}`,
        }

        return (
            <div
                onMouseDown={(e) => startResize(e, objId, direction)}
                className={handleClassNames[direction]}
            />
        )
    }

    const objSelection = props.objSelection || []

    const getObjectRect = (obj: SlideObject) => {
        if (tempTransform && tempTransform.objectId === obj.id) {
            return {
                x: tempTransform.x,
                y: tempTransform.y,
                width: tempTransform.width,
                height: tempTransform.height
            }
        }
        return obj.rect
    }

    return (
        <div
            ref={slideRef}
            className={`${styles.slide} ${props.className || ''}`}
            onClick={handleSlideClick}
            style={{
                backgroundColor: props.slide.background.type === 'color' ? props.slide.background.color : 'transparent',
                backgroundImage: props.slide.background.type === 'picture' ? `url(${props.slide.background.src})` : 'none',
                cursor: props.disableObjectClicks ? 'default' : 'pointer'
            }}
        >
            {slideObjects.map(obj => {
                const isSelected = objSelection.includes(obj.id)
                const isMultipleSelected = isSelected && objSelection.length > 1
                const isEditing = editingTextId === obj.id && obj.type === 'plain_text'
                const rect = getObjectRect(obj)

                const objectClasses = [
                    styles.slideObject,
                    isSelected ? styles.selected : '',
                    isMultipleSelected ? styles.multipleSelected : '',
                    props.disableObjectClicks ? styles.slideShowMode : '',
                    isEditing ? styles.editing : ''
                ].join(' ')

                return (
                    <div
                        key={obj.id}
                        className={objectClasses}
                        onClick={(e) => handleObjectClick(e, obj.id)}
                        onMouseDown={(e) => startDrag(e, obj.id)}
                        style={{
                            left: rect.x,
                            top: rect.y,
                            width: rect.width,
                            height: rect.height,
                            cursor: props.disableObjectClicks ? 'default' : (isEditing ? 'text' : 'move')
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
                                            fontSize: `${obj.scale}em`,
                                            outline: 'none'
                                        }}
                                        contentEditable={true}
                                        suppressContentEditableWarning={true}
                                        onBlur={stopEditingText}
                                        onKeyDown={handleTextKeyDown}
                                        onInput={handleTextInput}
                                    >
                                        {initialContent}
                                    </div>
                                ) : (
                                    <div
                                        className={styles.textObject}
                                        style={{
                                            fontFamily: obj.fontFamily,
                                            fontWeight: obj.weight,
                                            fontSize: `${obj.scale}em`,
                                            cursor: props.disableObjectClicks ? 'default' : 'text'
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

                        {!props.disableObjectClicks && isSelected && objSelection.length === 1 && !isEditing && (
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
                )
            })}
        </div>
    )
}