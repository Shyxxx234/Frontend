import './App.css'
import { Toolbar } from './views/toolbar/toolbar'
import { selectSlide, type Presentation } from './store/typeAndFunctions'
import { Workspace } from './views/workspace/workspace'
import { SlideCollection } from './views/slideCollection/slideCollection'
import { SidePanel } from './views/sidePanel/sidePanel'
let presentationMin: Presentation = {
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
                    src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnEic3RATSmeIjz9Od8oo32tLryBmeXCBA3g&s",
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
        }, 
        {
            background: {
                type: "color",
                color: "#923333ff"
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
                    id: "5"
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
                    id: "6"
                },
                {
                    type: "picture",
                    src: "https://shapka-youtube.ru/wp-content/uploads/2024/08/kartinka-dlya-avatarki-siluety-muzhchin-risunok-odnogo-muzhskogo-silueta.jpg",
                    rect: {
                        x: 0,
                        y: 0,
                        width: 500,
                        height: 500
                    },
                    id: "7",
                }
            ],
            id: "4"
        },
        {
            background: {
                type: "color",
                color: "#923333ff"
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
                    id: "8"
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
                    id: "9"
                },
                {
                    type: "picture",
                    src: "https://shapka-youtube.ru/wp-content/uploads/2024/08/kartinka-dlya-avatarki-siluety-muzhchin-risunok-odnogo-muzhskogo-silueta.jpg",
                    rect: {
                        x: 0,
                        y: 0,
                        width: 500,
                        height: 500
                    },
                    id: "10",
                }
            ],
            id: "11"
        },
        {
            background: {
                type: "color",
                color: "#923333ff"
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
                    id: "12"
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
                    id: "13"
                },
                {
                    type: "picture",
                    src: "https://shapka-youtube.ru/wp-content/uploads/2024/08/kartinka-dlya-avatarki-siluety-muzhchin-risunok-odnogo-muzhskogo-silueta.jpg",
                    rect: {
                        x: 0,
                        y: 0,
                        width: 500,
                        height: 500
                    },
                    id: "14",
                }
            ],
            id: "15"
        },
        {
            background: {
                type: "color",
                color: "#923333ff"
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
                    id: "16"
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
                    id: "17"
                },
                {
                    type: "picture",
                    src: "https://shapka-youtube.ru/wp-content/uploads/2024/08/kartinka-dlya-avatarki-siluety-muzhchin-risunok-odnogo-muzhskogo-silueta.jpg",
                    rect: {
                        x: 0,
                        y: 0,
                        width: 500,
                        height: 500
                    },
                    id: "18",
                }
            ],
            id: "19"
        },
        {
            background: {
                type: "color",
                color: "#923333ff"
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
                    id: "20"
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
                    id: "21"
                },
                {
                    type: "picture",
                    src: "https://shapka-youtube.ru/wp-content/uploads/2024/08/kartinka-dlya-avatarki-siluety-muzhchin-risunok-odnogo-muzhskogo-silueta.jpg",
                    rect: {
                        x: 0,
                        y: 0,
                        width: 500,
                        height: 500
                    },
                    id: "22",
                }
            ],
            id: "23"
        },
        {
            background: {
                type: "color",
                color: "#923333ff"
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
                    id: "24"
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
                    id: "25"
                },
                {
                    type: "picture",
                    src: "https://shapka-youtube.ru/wp-content/uploads/2024/08/kartinka-dlya-avatarki-siluety-muzhchin-risunok-odnogo-muzhskogo-silueta.jpg",
                    rect: {
                        x: 0,
                        y: 0,
                        width: 500,
                        height: 500
                    },
                    id: "26",
                }
            ],
            id: "27"
        },
        
    ],
    selectedObjects: [],
    selectedSlide: 0
}   

function App() {
    const handleSlideSelect = (slideIndex: number) => {
        presentationMin = selectSlide(presentationMin, slideIndex);
    }

    return (
        <div>
            <Toolbar presentation={presentationMin} />
            <Workspace presentation={presentationMin} />
            <SlideCollection 
                presentation={presentationMin} 
                onSlideSelect={handleSlideSelect}
            />
            <SidePanel></SidePanel>
        </div>
    )
}

export default App