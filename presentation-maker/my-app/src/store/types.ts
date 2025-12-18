export type Presentation = SlideCollection & ElementSelection & {
    title: string
}

export type Slide = {
    background: Background
    slideObject: Array<SlideObject>
    id: string
    notes?: string
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

export type Rect = {
  x: number
  y: number
  width: number
  height: number
}

export type ImageObject =  {
  type: 'image'
  src: string
  rect: Rect
  id: string
}
