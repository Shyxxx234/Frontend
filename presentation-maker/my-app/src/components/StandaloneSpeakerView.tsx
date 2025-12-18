// src/components/StandaloneSpeakerView.tsx
import { Provider } from 'react-redux'
import { store } from '../store/store'
import '../index.css'
import { SpeakerNotesModalWindow } from '../views/SpeakerNotesModalWindow/SpeakerNotesModalWIndow'

export function StandaloneSpeakerView() {
    return (
        <Provider store={store}>
            <SpeakerNotesModalWindow 
                isOpen={true}
                onClose={() => window.close()}
            />
        </Provider>
    )
}