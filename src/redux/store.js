import { configureStore } from "@reduxjs/toolkit";
import settingReducer from "./settingSlice";
import { saveState, loadState } from "./persist"

const persistedState = loadState()

const store = configureStore({
    reducer: settingReducer,
    preloadedState: persistedState
})

//Save when settings change
store.subscribe(() => {
    saveState(store.getState())
})

export default store