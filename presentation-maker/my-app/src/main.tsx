import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { addPresentationChangeHandler, getPresentation } from './presentation.ts'

const root = createRoot(document.getElementById('root')!)

function render() {
  console.log('Rendering with slides:', getPresentation().slides.length);
  root.render(
    <StrictMode>
      <App presentation={getPresentation()} />
    </StrictMode>,
  )
}

addPresentationChangeHandler(render)
render()