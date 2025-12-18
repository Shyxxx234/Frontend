// services/syncState.ts
export const syncStateBetweenWindows = () => {
    // Слушаем сообщения от других окон
    window.addEventListener('message', (event) => {
        if (event.data.type === 'REDUX_STATE_UPDATE') {
            // Сохраняем состояние из другого окна
            localStorage.setItem('reduxState', JSON.stringify(event.data.state));
            
            // Если нужно, можно диспатчить события для обновления текущего store
            window.dispatchEvent(new CustomEvent('reduxStateUpdated', {
                detail: event.data.state
            }));
        }
    });

    // Отправляем текущее состояние другим окнам при изменении
    return (state: unknown) => {
        window.parent.postMessage({
            type: 'REDUX_STATE_UPDATE',
            state
        }, '*');
        
        window.opener?.postMessage({
            type: 'REDUX_STATE_UPDATE',
            state
        }, '*');
    };
};