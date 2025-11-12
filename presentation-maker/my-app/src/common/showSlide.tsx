// common/ShowSlide.tsx
import type { Slide } from "../store/typeAndFunctions"
import { useDispatch } from 'react-redux'
import { calculateResize } from "../store/typeAndFunctions"
import { selectObject, moveObject, resizeObject } from "../store/presentationSlice"
import React, { useState, useRef } from "react"
import styles from "./ShowSlide.module.css"

type ShowSlideProps = {
    slide: Slide
    disableObjectClicks: boolean
    className?: string
    slideId: string
    objSelection?: Array<string>
}

type ResizeDirection = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e'

export function ShowSlide(props: ShowSlideProps) {
    const dispatch = useDispatch()
    const [resizingId, setResizingId] = useState<string | null>(null)
    const slideRef = useRef<HTMLDivElement>(null)

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
        if (e.target === e.currentTarget) {
            dispatch(selectObject([]))
        }
    }

    const startDrag = (e: React.MouseEvent) => {
        e.stopPropagation()

        const slideRect = slideRef.current?.getBoundingClientRect()
        if (!slideRect) return

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = moveEvent.clientX - e.clientX
            const deltaY = moveEvent.clientY - e.clientY

            const selectedObjects = props.objSelection || []
            selectedObjects.forEach(selectedObjId => {
                const selectedObj = props.slide.slideObject?.find(obj => obj.id === selectedObjId)
                if (selectedObj) {
                    const newX = Math.min(Math.max(0, selectedObj.rect.x + deltaX), slideRect.width - selectedObj.rect.width)
                    const newY = Math.min(Math.max(0, selectedObj.rect.y + deltaY), slideRect.height - selectedObj.rect.height)
                    dispatch(moveObject({ objectId: selectedObjId, x: newX, y: newY }))
                }
            })
        }

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }

    const startResize = (e: React.MouseEvent, objId: string, direction: ResizeDirection) => {
        e.stopPropagation()

        const slideRect = slideRef.current?.getBoundingClientRect()
        if (!slideRect) return

        const obj = props.slide.slideObject?.find(obj => obj.id === objId)
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

            dispatch(resizeObject({ 
                objectId: objId, 
                x: newX, 
                y: newY, 
                width: newWidth, 
                height: newHeight 
            }))
        }

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
            setResizingId(null)
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }

    const ResizeHandler = ({ direction, objId }: { direction: ResizeDirection, objId: string }) => {
        const handleClassNames = {
            'nw': `${styles.resizeHandle} ${styles.resizeHandleNw}`,
            'ne': `${styles.resizeHandle} ${styles.resizeHandleNe}`,
            'sw': `${styles.resizeHandle} ${styles.resizeHandleSw}`,
            'se': `${styles.resizeHandle} ${styles.resizeHandleSe}`,
            'n':  `${styles.resizeHandle} ${styles.resizeHandleN}`,
            's':  `${styles.resizeHandle} ${styles.resizeHandleS}`,
            'w':  `${styles.resizeHandle} ${styles.resizeHandleW}`,
            'e':  `${styles.resizeHandle} ${styles.resizeHandleE}`,
        }

        return (
            <div
                onMouseDown={(e) => startResize(e, objId, direction)}
                className={handleClassNames[direction]}
            />
        )
    }

    const objSelection = props.objSelection || []
    const slideObjects = props.slide.slideObject || []

    return (
        <div
            ref={slideRef}
            className={`${styles.slide} ${props.className || ''}`}
            onClick={handleSlideClick}
            style={{
                backgroundColor: props.slide.background.type === 'color' ? props.slide.background.color : 'transparent',
                backgroundImage: props.slide.background.type === 'picture' ? `url(${props.slide.background.src})` : 'none',
            }}
        >
            {slideObjects.map(obj => {
                const isSelected = objSelection.includes(obj.id)
                const isMultipleSelected = isSelected && objSelection.length > 1

                const objectClasses = [
                    styles.slideObject,
                    isSelected ? styles.selected : '',
                    isMultipleSelected ? styles.multipleSelected : ''
                ].join(' ')

                return (
                    <div
                        key={obj.id}
                        className={objectClasses}
                        onClick={(e) => handleObjectClick(e, obj.id)}
                        onMouseDown={startDrag}
                        style={{
                            left: obj.rect.x,
                            top: obj.rect.y,
                            width: obj.rect.width,
                            height: obj.rect.height,
                        }}
                    >
                        {obj.type === 'plain_text' && (
                            <div
                                className={styles.textObject}
                                style={{
                                    fontFamily: obj.fontFamily,
                                    fontWeight: obj.weight,
                                    fontSize: `${obj.scale}em`,
                                }}
                                contentEditable={false}
                            >
                                {obj.content}
                            </div>
                        )}
                        {obj.type === 'picture' && (
                            <img
                                src={obj.src}
                                className={styles.imageObject}
                                alt=""
                                draggable={false}
                            />
                        )}

                        {isSelected && objSelection.length === 1 && (
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