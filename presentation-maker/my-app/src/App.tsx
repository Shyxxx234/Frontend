import './App.css'
import { Toolbar } from './views/toolbar/toolbar'
import type { Presentation } from './store/typeAndFunctions'
import { Workspace } from './views/workspace/workspace'
import { SlideCollection } from './views/slideCollection/slideCollection'


const presentationMin: Presentation = {
    title: "My presentation",
    slides: [
        {
            background: {
                type: "color",
                color: "#030303"
            },
            slideObject: [
                {
                    type: "plain_text",
                    content: "Hi",
                    fontFamily: "Arial",
                    weight: 400,
                    scale: 1.0,
                    rect: {
                        x: 500,
                        y: 100,
                        width: 200,
                        height: 50
                    },
                    id: "1"
                },
                {
                    type: "plain_text",
                    content: "OOOO",
                    fontFamily: "Times New Roman",
                    weight: 600,
                    scale: 1.1,
                    rect: {
                        x: 150,
                        y: 150,
                        width: 200,
                        height: 50
                    },
                    id: "2"
                },
                {
                    type: "picture",
                    src: "data:image/jpeg;base64,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",
                    rect: {
                        x: 0,
                        y: 0,
                        width: 500,
                        height: 500
                    },
                    id: "3",
                }
            ],
            id: "0"
        }
    ],
    selectedObjects: [],
    selectedSlide: 0
}   

function App() {

    return (
        <div>
            <Toolbar presentation={presentationMin} />
            <Workspace presentation={presentationMin} />
            <SlideCollection presentation={presentationMin} />
        </div>
    )
}

export default App
