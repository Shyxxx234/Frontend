export const syncStateBetweenWindows = () => {
    window.addEventListener('message', (event) => {
        if (event.data.type === 'REDUX_STATE_UPDATE') {
            localStorage.setItem('reduxState', JSON.stringify(event.data.state));
            
            window.dispatchEvent(new CustomEvent('reduxStateUpdated', {
                detail: event.data.state
            }));
        }
    });

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