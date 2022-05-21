export default function combineReducer(reducers) {
    const keys = Object.keys(reducers);
    return function (state = {}, action) {
        let newState = {};
        for (const item of keys) {
            const reducer = reducers[item];
            newState[item] = reducer(state[item], action);
        }
        return newState;
    }
}