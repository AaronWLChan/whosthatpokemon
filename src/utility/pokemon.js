
//Excludes mega forms those not in official count
export const NUM_POKEMON = 898 

export const SETTINGS = {
  GENERATIONS: "generations",
  MODE: "mode",
  DIFFICULTY: "difficulty"
}

export const GAME_MODE = {
  SPELLING: "Spelling",
  MULTICHOICE: "Multi-Choice"
}

export const GAME_MODES = [GAME_MODE.SPELLING, GAME_MODE.MULTICHOICE]

export const DIFFICULTIES = {

    //Image is shown
    EASY: {
        name: "Easy",
        imageType: "official",
        title: "Guess based on official artwork."
    },

    //Image is not shown
    NORMAL: {
        name: "Normal",
        imageType: "official",
        hidden: true,
        title: "Guess based on hidden artwork."
    },

    //Image are now sprites and are hidden
    HARD: {
        name: "Hard",
        imageType: "sprite",
        hidden: true,
        title: "Guess based on sprites."
    },

    //Images are now the back of sprites
    EXPERT: {
        name: "Expert",
        imageType: "back-sprite",
        hidden: true,
        title: "Guess based on the back of sprites."
    }

}

export const GENERATIONS = {

    I: {name: "I", slice: [0, 151], count: 151, title: "Kanto Region (Red/Blue/Yellow)"},
    II: {name: "II", slice: [151, 251], count: 100, title: "Johto Region (Gold/Silver/Crystal)"},
    III: {name: "III", slice: [251, 386], count: 135, title: "Hoenn Region (Ruby/Sapphire/Emerald)"},
    IV: {name: "IV", slice: [386, 493], count: 107, title: "Sinnoh Region (Diamond/Pearl/Platinum)"},
    V: {name: "V", slice: [493, 649], count: 156, title: "Unova Region (Black/White)"},
    VI: {name: "VI", slice: [649, 721], count: 72, title: "Kalos Region (X/Y)"},
    VII: {name: "VII", slice: [721, 809], count: 88, title: "Alola Region (Sun/Moon)"},
    VIII: {name: "VIII", slice: [809, 898], count: 89, title: "Galar Region (Sword/Shield)"},

}

export const getGeneration = (name) => {

    switch (name) {
      case "I":
        return GENERATIONS.I
      case "II":
        return GENERATIONS.II
      case "III":
        return GENERATIONS.III
      case "IV":
        return GENERATIONS.IV
      case "V":
        return GENERATIONS.V
      case "VI":
        return GENERATIONS.VI
      case "VII":
        return GENERATIONS.VII
      case "VIII":
        return GENERATIONS.VIII
      default: 
        break
    }

  }

export  const getDifficulty = (name) => {
    switch (name) {
      case "Easy":
        return DIFFICULTIES.EASY
      case "Normal":
        return DIFFICULTIES.NORMAL
      case "Medium":
        return DIFFICULTIES.MEDIUM
      case "Hard":
        return DIFFICULTIES.HARD
      case "Expert":
        return DIFFICULTIES.EXPERT
      default: 
        break
    }
  }


export const getPokemonImage = (id, type = "official") => {

    if (type === "sprite") {
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`

    }

    else if (type === "back-sprite"){
        return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/back/${id}.png`

    }

    return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${id}.png`
}


