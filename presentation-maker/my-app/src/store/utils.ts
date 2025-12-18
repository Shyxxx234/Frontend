import type {
    SlideObject,
    Slide,
    Presentation,
    ResizeDirection,
    ResizeCalculation,
    Constraints
} from './types'

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
            color: "#000000",
        },
        slideObject: [],
        id: generateTimestampId(),
        notes: ''
    }
}

export const initialPresentation: Presentation = {
    title: "Новая презентация",
    slides: [],
    selectedSlide: "",
    selectedObjects: []
};

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

export function openSpeakerModeInNewWindow(): Window | null {
    const width = 1200
    const height = 800
    const left = (window.screen.width - width) / 2
    const top = (window.screen.height - height) / 2
    
    const newWindow = window.open(
        '',
        'speakerMode',
        `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
    )
    
    if (!newWindow) {
        alert('Пожалуйста, разрешите всплывающие окна для использования режима докладчика')
        return null
    }
    
    newWindow.document.write(`
        <!DOCTYPE html>
        <html lang="ru">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Режим докладчика</title>
            <style>
                * { margin: 0; padding: 0; box-sizing: border-box; }
                body { font-family: Arial, sans-serif; }
                #root { height: 100vh; }
            </style>
        </head>
        <body>
            <div id="root"></div>
            <script>
                // Сообщаем основному окну, что мы готовы
                window.opener.postMessage({ type: 'SPEAKER_MODE_READY' }, '*');
            </script>
        </body>
        </html>
    `)
    
    return newWindow
}