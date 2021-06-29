import React, { useState, useEffect } from "react";
import PokemonData from './data/pokemon.json'
import { GENERATIONS, GAME_MODES, DIFFICULTIES, getDifficulty, getGeneration, GAME_MODE, getPokemonImage, SETTINGS } from './utility/pokemon'
import { updateSetting } from './redux/settingSlice'
import { useSelector, useDispatch } from 'react-redux'

function App() {

  const dispatch = useDispatch()
  
  const [selectedPokemon, setSelectedPokemon] = useState(null)

  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(0)
  const [input, setInput] = useState("")

  //For Multi-choice 
  const [pokemonList, setPokemonList] = useState([])

  //To handle correct/incorrect state
  const [userSelectedPokemon, setUserSelectedPokemon] = useState(-1) 

  //For Mobile & XS Screens
  const [optionsVisible, setOptionsVisible] = useState(false)
  const [statsVisible, setStatsVisible] = useState(false)

  //Settings
  const generations = useSelector(state => state.generations)
  const mode = useSelector(state => state.mode)
  const difficulty = useSelector(state => state.difficulty)

  //To apply changes only when randomPokemon is changed
  const [hasPendingChanges, setPendingChanges] = useState(false)
  const [pendingMode, setPendingMode] = useState(null)
  const [pendingDifficulty, setPendingDifficulty] = useState(null)

  //For avg. time calculation
  const [times, setTimes] = useState([])
  const [time, setTime] = useState(0)

  //Delay to show next pokemon
  const DELAY = 900

  //Functions
  const getAverageTime = () => {

    let len = times.length

    if (len > 0) {

        let average = 0

        for (let i = 0; i < len; i++){
            average += times[i]
        }

        //In seconds
        average = (average / len).toFixed(2)

        //If bigger or equal to 60 show >1m
        return average >= 60 ? ">1m" : average

    }

    return 0

  }

  const drawImage = () => {
      let canvas = document.getElementById("canvas")
      let ctx = canvas.getContext("2d")

      let image = new Image()
      image.src = getPokemonImage(selectedPokemon.id, difficulty.imageType)

      image.onload = function() {

          if(image.width <= 100) {
              canvas.width = image.width * 4;
              canvas.height = image.height * 4;
          } else {
              canvas.width = image.width;
              canvas.height = image.height;
          }
         
          ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
         
      }

  }

  const skip = () => {
      setAnswered(answered + 1)
      getRandomPokemon()
  }

  //Listeners
  const onInputChanged = (e) => {
    setInput(e.target.value)

    if (e.target.value.toLowerCase() === selectedPokemon.name.toLowerCase()){
      setScore(score + 1)
      setTimes([...times, time])
      setAnswered(answered + 1)

      setTimeout(() => getRandomPokemon(), DELAY)
    }

  }

  const onPokemonSelected = () => {

    //Append score, show they are right
    if (userSelectedPokemon === selectedPokemon.id) {
      setScore(score + 1)
    }

    //After generate new random pokemon
    setAnswered(answered + 1)
    setTimes([...times, time])

    setTimeout(() => {setUserSelectedPokemon(-1); getRandomPokemon()}, DELAY)
    
  }

  const onGenerationChange = (e) => {
      const name = e.target.name

      //If doesnt exist, add it
      if (!generations.some((generation) => generation.name === name)) {
          
          dispatch(updateSetting({key: SETTINGS.GENERATIONS, value: [...generations, getGeneration(name)]}))
          setPendingChanges(true)
      }

      //If included, get index and remove 
      else {
          //If they click the same one again, don't remove so there is always an active generation
            if (generations.length > 1) {

              dispatch(updateSetting({key: SETTINGS.GENERATIONS, value: generations.filter((generation) => generation.name !== name)}))
              setPendingChanges(true)
          }
      }

  }

  const onModeChange = (e) => {

      //If different mode, set pending
      if (e.target.name !== mode){
        setPendingMode(e.target.name)
      }

      //If set back to existing
      else if (e.target.name === mode) {
        setPendingMode(null)
      }

  }

  const onDifficultyChange = (e) => {

      //Signal a change only If the pending difficulty !== current difficulty
      if (e.target.name !== difficulty.name) {
        setPendingDifficulty(getDifficulty(e.target.name))
      }

      //Ignore change, if set back to existing
      else if (e.target.name === difficulty.name){
        //TODO IS THIS CORRECT?
        setPendingDifficulty(null)
      }

  }


  const getRandomPokemon = () => {

    //Set pending changes | TODO mode may not save in time so use a boolean to flag which to use
    var usePendingMode = false

    if (hasPendingChanges){

      if (pendingMode !== null) {
        dispatch(updateSetting({key: SETTINGS.MODE, value: pendingMode}))
        setPendingMode(null)

        //In-case it does not update in time
        usePendingMode = true
      }

      if (pendingDifficulty !== null) {
        dispatch(updateSetting({key: SETTINGS.DIFFICULTY, value: pendingDifficulty}))
        setPendingDifficulty(null)
      }

    }

    const m = generations.length

    const pokemonSlice = []

    for (let i = 0; i < m; i++){
        const gen = generations[i]

        pokemonSlice.push(...PokemonData.slice(gen.slice[0], gen.slice[1]))
    }
    
    if (usePendingMode ? pendingMode === GAME_MODE.SPELLING : mode === GAME_MODE.SPELLING) {

      setSelectedPokemon(pokemonSlice[Math.floor(Math.random() * pokemonSlice.length)])

      setInput("")
    
      //To focus input again after answer has been made
      document.querySelector("input").focus()
    }

    //Multi-Choice
    else {

      const randomList = []
      const ids = []

      //Get a group of pokemon that were not in the previous group
      //Converts pokemon list to their ids for comparison
      const previousIds = pokemonList.map((p) => p.id)

      while (randomList.length < 4) {
          let randomPokemon = pokemonSlice[Math.floor(Math.random() * pokemonSlice.length)]

          if (ids.includes(randomPokemon.id) || previousIds.includes(randomPokemon.id)) {

             //Union - merge ids and previous ids
             const union = [...ids, ...previousIds]

             while (union.includes(randomPokemon.id)){
                randomPokemon = pokemonSlice[Math.floor(Math.random() * pokemonSlice.length)]
             }
          }

          randomList.push(randomPokemon)
          ids.push(randomPokemon.id)
      }

      setSelectedPokemon(randomList[Math.floor(Math.random() * 4)])
      setPokemonList(randomList)

    }

    
    setPendingChanges(false)
    setTime(0)


  }

  const toggled = () => {
    return optionsVisible || statsVisible
  }

  useEffect(() => {

    if (selectedPokemon) {
      drawImage()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPokemon])


  //To flag pending changes, should not call onmount i.e. when both are null
  useEffect(() => {
    if (pendingDifficulty !== null || pendingMode !== null) {
      setPendingChanges(true)
    }
  }, [pendingMode, pendingDifficulty])

  //Calls only once for mounting
  useEffect(() => {
    getRandomPokemon()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  //When a user has made his choice, verify it
  useEffect(() => {

    if (userSelectedPokemon !== -1) {
      onPokemonSelected()
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSelectedPokemon])

  //Timer for each question, resets on when selectedPokemon has been set
  useEffect(() => {
    const timerID = setTimeout(() => setTime(time + 1), 1000)

    return () => clearTimeout(timerID)
  }, [time])



  return (
    <div className="App flex bg-gray-100 min-h-screen ">

      <div className="container mx-auto px-8 pt-4 sm:pt-12">
        
        <div className="flex flex-row gap-4">

        <div className="hidden lg:flex flex-col w-1/6 bg-white shadow-xl rounded-3xl p-4 space-y-2">

          <div>
            <p className="font-bold text-xl text-center mb-2">Generation</p>

            {Object.entries(GENERATIONS).map(([key, generation]) => {

              const buttonType = generations.some((gen) => gen.name === generation.name ) ? "button-active" : "button"

              return (
                <button 
                  key={key}
                  name={generation.name}
                  title={generation.title}
                  onClick={onGenerationChange} 
                  className={`${buttonType} m-1 py-1 px-4 mb-2`}>{generation.name}
                </button>
              )

            })}

          
          </div>

          <div className="flex flex-col">
            <p className="font-bold text-xl text-center mb-2">Mode</p>
            
            {GAME_MODES.map((m, index) => {

              const buttonType = mode === m ? "button-active" : ( pendingMode && pendingMode === m ? "button-pending" : "button")

              return (
                <button
                key={index}
                name={m}
                onClick={onModeChange}
                className={`${buttonType} m-1 py-1 px-4 mb-2`}
                >{m}
                </button>
              )

            })}

          </div>

          <div className="flex flex-col">
            <p className="font-bold text-xl text-center mb-2">Difficulty</p>

            {Object.entries(DIFFICULTIES).map(([key, value]) => {

            //Create a third button-type which indicates a replacement, 
            const buttonType = difficulty.name === value.name  ? "button-active" 
                  : ( (pendingDifficulty && pendingDifficulty.name === value.name) ? "button-pending" : "button")

            return (
              <button
              key={key}
              name={value.name}
              title={value.title}
              onClick={onDifficultyChange}
              className={`${buttonType} m-1 py-1 px-4 mb-2`}
              >{value.name}
              </button>
            )

            })}

          </div>

        </div>

        <div className="flex flex-col w-full lg:w-2/3 bg-white shadow-xl rounded-3xl p-4">

            <div className="flex justify-between lg:justify-center items-start">

            <button title="Options" aria-label="Options" className="lg:hidden" onClick={() => setOptionsVisible(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current text-gray-500 h-6 w-6 hover:text-red-500 transition duration-500 ease-in-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>

              <h1 className="font-extrabold text-xl sm:text-3xl lg:text-4xl uppercase tracking-widest text-center mb-4">Who's That Pokemon?</h1>

            <button title="Stats" aria-label="Stats" className="lg:hidden" onClick={() => setStatsVisible(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current text-gray-500 h-6 w-6 hover:text-red-500 transition duration-500 ease-in-out" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>

            </div>

              <canvas 
              id="canvas" 
              className={`w-48 h-48 sm:w-72 sm:h-72 mx-auto my-4 filter ${difficulty.hidden && "brightness-0"} ${(userSelectedPokemon !== -1 || (selectedPokemon && input.toLowerCase() === selectedPokemon.name) ) && "brightness-100"}`}>
              Browser does not support HTML5 canvas!</canvas>
                            
              {(mode === "Spelling" ) ? 
              
              <input 
                id="input"
                className="bg-gray-50 py-2 text-center px-4 rounded-3xl shadow sm:w-1/2 mx-auto mb-4 focus:outline-none"
                type="text" 
                value={input}
                aria-label="pokemonName"
                autoComplete="off" 
                autoCorrect="off" 
                spellCheck="false"
                disabled={selectedPokemon && input.toLowerCase() === selectedPokemon.name}
                onChange={onInputChanged}
                />

                :

                <div className="grid grid-cols-2 grid-rows-2 sm:w-1/2 gap-4 mb-4 mx-auto">
                    {pokemonList && 

                      pokemonList.map((pokemon) => {

                        //Three states, normal, correct, incorrect
                        const buttonType = `${userSelectedPokemon === -1 && "hover:bg-gray-100"} ${userSelectedPokemon === pokemon.id && "bg-red-500 text-white"}
                         ${(pokemon.id === selectedPokemon.id && userSelectedPokemon !== -1) && "bg-green-500 text-white"}`

                        //Disable buttons when answered

                        return (
                          <button 
                          key={pokemon.id}
                          disabled={userSelectedPokemon !== -1}
                          onClick={() => {setUserSelectedPokemon(pokemon.id)}}
                          className={`${buttonType} transition duration-200 ease-in-out rounded-full border font-medium p-2 capitalize`}>
                          {pokemon.name}</button>

                        )
                      })
                    
                    }
             

                </div>

              }

              
              <button onClick={skip} className="font-bold mx-auto mb-2 hover:text-red-500 transition duration-200 ease-in-out">Skip</button>

              {hasPendingChanges && 
                  <p className="text-xs sm:text-sm text-gray-500 text-center">Changes will apply the after this Pokemon.</p>
              }

        </div>

        <div className="hidden lg:flex flex-col w-1/6 bg-white shadow-xl rounded-3xl p-4 space-y-8">

          <div className="flex flex-col"> 
            <p className="font-bold text-xl mb-2 text-center">Score</p>
            <p className="font-bold text-center text-4xl">{score}</p>
          </div>

          <div className="flex flex-col"> 
            <p className="font-bold text-xl mb-2 text-center">Accuracy</p>
            <p className="font-bold text-center text-2xl mb-2">{answered > 0 ? `${( (score / answered) * 100).toFixed(1)}%` : "?"}</p>
            <p className="text-center text-sm font-medium">{answered > 0 && `${score}/${answered}`}</p>
          </div>
          
          <div className="flex flex-col"> 
            <p className="font-bold text-xl mb-2 text-center">Average Time</p>
            <p className="font-bold text-center text-2xl">{times.length === 0 ? "?" : getAverageTime()}</p>
          </div>


        </div>

        </div>

        <p className="text-xs font-medium mt-4 text-center">Source Code available on <a className="underline" href="https://github.com/AaronWLChan/whosthatpokemon">GitHub</a>.</p>

        <p className="text-xs font-medium mt-2 text-center">Images from <a className="underline" href="https://github.com/PokeAPI/sprites">PokeApi</a>.</p>
        
   

      </div>
    
      {/* Mobile Menus*/}

      {toggled() && 
      
      <div className="lg:hidden fixed inset w-full h-full  bg-black bg-opacity-70 z-10">
          
          {/* Settings */}

          {optionsVisible ?
          <div className="flex flex-col overflow-y-auto w-3/5 h-full bg-white shadow-xl rounded-r-3xl p-4 z-20">
            
            <button title="Close" aria-label="Close" className="mr-auto" onClick={() => setOptionsVisible(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current text-gray-400 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            </button>
        
            <div>
            <p className="font-bold text-xl text-center mb-2">Generation</p>

            {Object.entries(GENERATIONS).map(([key, generation]) => {

              const buttonType = generations.some((gen) => gen.name === generation.name ) ? "button-active" : "button"

              return (
                <button 
                  key={key}
                  name={generation.name}
                  title={generation.title}
                  onClick={onGenerationChange} 
                  className={`${buttonType} m-1 py-1 px-4 mb-2`}>{generation.name}
                </button>
              )

            })}

          
          </div>

          <div className="flex flex-col">
            <p className="font-bold text-xl text-center mb-2">Mode</p>
            
            {GAME_MODES.map((m, index) => {

              const buttonType = mode === m ? "button-active" : ( pendingMode && pendingMode === m ? "button-pending" : "button")

              return (
                <button
                key={index}
                name={m}
                onClick={onModeChange}
                className={`${buttonType} m-1 py-1 px-4 mb-2`}
                >{m}
                </button>
              )

            })}

          </div>

          <div className="flex flex-col">
            <p className="font-bold text-xl text-center mb-2">Difficulty</p>

            {Object.entries(DIFFICULTIES).map(([key, value]) => {

            //Create a third button-type which indicates a replacement, 
            const buttonType = difficulty.name === value.name  ? "button-active" 
                  : ( (pendingDifficulty && pendingDifficulty.name === value.name) ? "button-pending" : "button")

            return (
              <button
              key={key}
              name={value.name}
              title={value.title}
              onClick={onDifficultyChange}
              className={`${buttonType} m-1 py-1 px-4 mb-2`}
              >{value.name}
              </button>
            )

            })}

          </div>

        </div>
           
          
          :
          
          <div className="flex flex-col w-3/5 h-full bg-white shadow-xl rounded-l-3xl p-4 z-20 ml-auto">

            <button title="Close" aria-label="Close" className="ml-auto" onClick={() => setStatsVisible(false)}>
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current text-gray-400 h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="flex flex-col"> 
              <p className="font-bold text-xl mb-2 text-center">Score</p>
              <p className="font-bold text-center text-4xl mb-8">{score}</p>
            </div>

            <div className="flex flex-col"> 
              <p className="font-bold text-xl mb-2 text-center">Accuracy</p>
              <p className="font-bold text-center text-2xl mb-2">{answered > 0 ? `${( (score / answered) * 100).toFixed(1)}%` : "?"}</p>
              <p className="text-center text-sm font-medium mb-8">{answered > 0 && `${score}/${answered}`}</p>
            </div>
            
            <div className="flex flex-col"> 
              <p className="font-bold text-xl mb-2 text-center">Average Time</p>
              <p className="font-bold text-center text-2xl">{times.length === 0 ? "?" : getAverageTime()}</p>
            </div>
          </div>  
          }
      </div>
    
      }
    </div>
  );
}

export default App;
