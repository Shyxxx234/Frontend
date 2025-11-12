export type Presentation = SlideCollection & ElementSelection & {
    title: string
}

export type Slide = {
    background: Background
    slideObject: Array<SlideObject>
    id: string
}

export type Background = Color | Picture

export type Color = {
    type: 'color'
    color: string
}

export type Picture = {
    type: 'picture'
    src: string
}

export type SlideCollection = {
    slides: Array<Slide>
}

export type ElementSelection = {
    selectedSlide: string
    selectedObjects: Array<string>
}

export type SlideObject = PlainText | Image

export type PlainText = BaseSlideObject & {
    type: 'plain_text'
    content: string
    fontFamily: string
    weight: number
    scale: number
}

export type Image = BaseSlideObject & Picture

export type BaseSlideObject = {
    rect: {
        x: number
        y: number
        width: number
        height: number
    }
    id: string
}

export const blankText: SlideObject = {
    type: "plain_text",
    content: "",
    fontFamily: "Arial",
    weight: 400,
    scale: 1.0,
    rect: {
        x: 0,
        y: 0,
        width: 255,
        height: 50
    },
    id: ""
}

export const blankImage: SlideObject = {
    type: "picture",
    src: "",
    rect: {
        x: 0,
        y: 0,
        width: 255,
        height: 50
    },
    id: ""
}

export function generateTimestampId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

export function createBlankSlide(): Slide {
    return {
        background: {
            type: "color",
            color: "#FFFFFF",
        },
        slideObject: [],
        id: generateTimestampId()
    }
}

export const initialPresentation: Presentation = {
    title: "Новая презентация",
    slides: [],
    selectedSlide: "",
    selectedObjects: []
};

export type ResizeDirection = 'nw' | 'ne' | 'sw' | 'se' | 'n' | 's' | 'w' | 'e'

export type ResizeCalculation = {
    newX: number
    newY: number
    newWidth: number
    newHeight: number
}

export type Constraints = {
    minX: number
    minY: number
    maxWidth: number
    maxHeight: number
    minSize: number
}

export function calculateResize(
    direction: ResizeDirection,
    deltaX: number,
    deltaY: number,
    startLeft: number,
    startTop: number,
    startWidth: number,
    startHeight: number,
    constraints: Constraints
): ResizeCalculation {
    let newWidth = startWidth
    let newHeight = startHeight
    let newLeft = startLeft
    let newTop = startTop

    const minSize = constraints.minSize

    switch (direction) {
        case 'nw':
            newWidth = Math.max(minSize, startWidth - deltaX)
            newHeight = Math.max(minSize, startHeight - deltaY)
            newLeft = startLeft + (startWidth - newWidth)
            newTop = startTop + (startHeight - newHeight)
            break
        case 'ne':
            newWidth = Math.max(minSize, startWidth + deltaX)
            newHeight = Math.max(minSize, startHeight - deltaY)
            newTop = startTop + (startHeight - newHeight)
            break
        case 'sw':
            newWidth = Math.max(minSize, startWidth - deltaX)
            newHeight = Math.max(minSize, startHeight + deltaY)
            newLeft = startLeft + (startWidth - newWidth)
            break
        case 'se':
            newWidth = Math.max(minSize, startWidth + deltaX)
            newHeight = Math.max(minSize, startHeight + deltaY)
            break
        case 'n':
            newHeight = Math.max(minSize, startHeight - deltaY)
            newTop = startTop + (startHeight - newHeight)
            break
        case 's':
            newHeight = Math.max(minSize, startHeight + deltaY)
            break
        case 'w':
            newWidth = Math.max(minSize, startWidth - deltaX)
            newLeft = startLeft + (startWidth - newWidth)
            break
        case 'e':
            newWidth = Math.max(minSize, startWidth + deltaX)
            break
    }

    const constrainedX = Math.max(constraints.minX, newLeft)
    const constrainedY = Math.max(constraints.minY, newTop)
    const constrainedWidth = Math.min(newWidth, constraints.maxWidth - constrainedX)
    const constrainedHeight = Math.min(newHeight, constraints.maxHeight - constrainedY)

    return {
        newX: constrainedX,
        newY: constrainedY,
        newWidth: constrainedWidth,
        newHeight: constrainedHeight
    }
}