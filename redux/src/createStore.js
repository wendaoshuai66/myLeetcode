export default function createStore(reduce, initState) {
    let state = initState;
    let listeners = [];

    function subscibe(listener) {
        listeners.push(listener);
    }

    function getState() {
        return state;
    }

    function dispatch(action) {
        state = reduce(state, action);
        for (const listener of listeners) {
            listener();
        }
    }
    dispatch({
        type: Symbol()
    });
    return {
        subscibe,
        dispatch,
        getState,
    }
}