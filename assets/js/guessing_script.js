const Api = (() => {
  const getNewWord = () => {
    return fetch("https://random-word-api.herokuapp.com/word").then((res) =>
      res.json()
    );
  };
  return { getNewWord };
})();

const View = (() => {
  const domSelector = {
    startBtn: document.querySelector("#start"),
    wordContainer: document.querySelector("#word"),
    input: document.querySelector("#text-input"),
    wrongGuesses: document.querySelector("#score"),
    timeLeft: document.querySelector("#time"),
    history: document.querySelector("#history"),
  };

  const createTemp = (data) => {
    let temp = "";
    for (let item in data) {
      temp += `<span id="letter_${item}">${data[item]}</span>`;
    }
    return temp;
  };

  const createHistory = (newHistory) => {
    let temp = "";
    for (let item in newHistory) {
      if (newHistory[item].correct) {
        temp += `<span id="correct">${newHistory[item].letter}</span>`;
      } else {
        temp += `<span id="wrong">${newHistory[item].letter}</span>`;
      }
    }
    return temp;
  };

  const render = (ele, template) => {
    ele.innerHTML = template;
  };

  return {
    domSelector,
    createTemp,
    createHistory,
    render,
  };
})();

const Model = ((api, view) => {
  const { getNewWord } = api;
  const { domSelector, createTemp, createHistory, render } = view;

  class State {
    constructor(timeLeft) {
      this._word = "";
      this._answer = "";
      this._wrongGuesses = 0;
      this._correctNum = 0;
      this._totalTime = timeLeft;
      this._timeLeft = timeLeft;
      this._history = [];
    }

    get word() {
      return this._word;
    }

    set word(value) {
      this._word = value;
      const temp = createTemp(this._word);
      render(domSelector.wordContainer, temp);
    }

    get answer() {
      return this._answer;
    }

    set answer(value) {
      this._answer = value;
    }

    get wrongGuesses() {
      return this._wrongGuesses;
    }

    set wrongGuesses(value) {
      this._wrongGuesses = value;
      this.renderWrongGuesses();
    }

    get correctNum() {
      return this._correctNum;
    }

    set correctNum(value) {
      this._correctNum = value;
    }

    get timeLeft() {
      return this._timeLeft;
    }

    set timeLeft(time) {
      this._timeLeft = time;
      this.renderTimeLeft();
    }

    get history() {
      return this._history;
    }

    set history(value) {
      this._history = value;
      const temp = createHistory(this._history);
      render(domSelector.history, temp);
    }

    countDown() {
      this._timeLeft -= 1;
      this.renderTimeLeft();
    }

    renderTimeLeft() {
      const timeLeftDom = domSelector.timeLeft;
      timeLeftDom.textContent = this._timeLeft + "s";
    }

    renderWrongGuesses() {
      const wrongGuessDom = domSelector.wrongGuesses;
      wrongGuessDom.innerHTML = this._wrongGuesses + " / 10";
    }
  }

  return {
    State,
    createTemp,
    render,
    getNewWord,
  };
})(Api, View);

const Controller = ((view, model) => {
  const { State, getNewWord } = model;
  const { domSelector } = view;

  let countDown;

  var state = new State(60);
  const randomUnderscore = (state) => {
    var numSubstitutions =
      1 + Math.floor(Math.random() * (state.word.length - 1));

    var substitutionIndices = [];

    while (substitutionIndices.length < numSubstitutions) {
      var randomIndex = Math.floor(Math.random() * state.word.length);
      if (!substitutionIndices.includes(randomIndex)) {
        substitutionIndices.push(randomIndex);
      }
    }

    var wordArray = state.word.split("");

    for (var i = 0; i < substitutionIndices.length; i++) {
      var index = substitutionIndices[i];
      wordArray[index] = "_";
    }
    var substitutedWord = wordArray.join("");

    return substitutedWord;
  };

  const fillLetter = (state, letter) => {
    var wordArray = state.word.split("");
    var answerArray = state.answer.split("");
    var correct = false;

    for (var i = 0; i < wordArray.length; i++) {
      if (wordArray[i] === "_" && answerArray[i] === letter) {
        wordArray[i] = letter;
        correct = true;
      }
    }
    if (
      !correct &&
      state.history.findIndex((item) => item.letter === letter) === -1
    ) {
      state.wrongGuesses++;
      state.history = [...state.history, { letter: letter, correct: false }];
    } else if (!correct) {
      alert("You've tried the letter \"" + letter + "\"! Try another letter!");
    } else {
      state.history = [...state.history, { letter: letter, correct: true }];
    }
    var newWord = wordArray.join("");

    return newWord;
  };

  const popNewWord = () => {
    getNewWord().then((data) => {
      state.history = [];
      state.answer = data[0];
      state.word = data[0];
      state.word = randomUnderscore(state);
    });
  };

  const startNewGame = () => {
    state = new State(60);
    state.wrongGuesses = 0;
    clearInterval(countDown);
    popNewWord();
  };

  const startTimer = () => {
    countDown = setInterval(() => {
      state.countDown();
      if (state.timeLeft === 0) {
        clearInterval(countDown);
        alert("Game over! You have guessed " + state.correctNum + " words!");
        startNewGame();
        startTimer();
      }
    }, 1000);
  };

  domSelector.startBtn.addEventListener("click", () => {
    startNewGame();
    startTimer();
    domSelector.input.disabled = false;
  });

  domSelector.input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      let guessLetter = e.target.value;
      e.target.value = "";
      state.word = fillLetter(state, guessLetter);

      if (state.word.includes("_") === false) {
        state.correctNum++;
        popNewWord();
      }

      if (state.wrongGuesses === 11) {
        alert("Game over! You have guessed " + state.correctNum + " words!");
        startNewGame();
        startTimer();
      }
    }
  });

  const bootstrap = () => {
    domSelector.input.disabled = true;
    console.log("App is running");
  };

  return { bootstrap };
})(View, Model);

Controller.bootstrap();
