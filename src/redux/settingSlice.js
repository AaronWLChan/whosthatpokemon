import { createSlice } from "@reduxjs/toolkit";
import { GENERATIONS, DIFFICULTIES, GAME_MODE, SETTINGS } from "../utility/pokemon";

//Only stores settings. Scores etc not saved
const initialState = {
    generations: [GENERATIONS.I],
    mode: GAME_MODE.SPELLING,
    difficulty: DIFFICULTIES.NORMAL,
}

const settingSlice = createSlice({
    name: "settings",
    initialState,
    reducers: {
        updateSetting(state, action){

            const key = action.payload.key
            const value = action.payload.value

            switch (key) {

                case SETTINGS.GENERATIONS:
                    state.generations = value
                    break

                case SETTINGS.MODE:
                    state.mode = value
                    break

                case SETTINGS.DIFFICULTY:
                    state.difficulty = value
                    break

                default:
                    break
            }

        }
    }
})

export const { updateSetting } = settingSlice.actions

export default settingSlice.reducer