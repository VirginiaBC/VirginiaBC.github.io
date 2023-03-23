const View = (() => {
    const domSelector = {
        gridContainer: document.querySelector("#mole_grid"),
        popbtn: document.querySelector("#popbutton"),
        moleHoles: () => { return document.querySelectorAll(".block") },
        startBtn : document.querySelector(".start-button"),
        scoreDom: document.querySelector("#score"),
        timeDom: document.querySelector("#time_count")
    }

    const createTemp = (data) => {
        let temp = "";
        for (var i = 0; i < data.length; i++) {
            const is_show = data[i].status;
            if (is_show == "mole") {
                temp += `<div class="block" id="hole_${i}" style="background-image: url('assets/img/mole.jpeg'); background-position: center;"></div>`;
            } else if(is_show == "none") {
                temp += `<div class="block" id= "hole_${i}"></div>`
            }else{
                temp += `<div class = "block" id = "hole_${i}" style="background-image: url('assets/img/mine.jpeg'); background-position: center;"></div>`
            }
        }
        return temp
    }

    const render = (ele, template) => {
        ele.innerHTML = template;
    };

    return {
        domSelector,
        createTemp,
        render
    };

})()

const Model = ((view) => {

    const { domSelector, createTemp, render } = view

    let data = [
        { id: 0, status: "none", popUpTime : 30}, { id: 1, status: "none" , popUpTime: 30},
        { id: 2, status: "none", popUpTime : 30 }, { id: 3, status: "none", popUpTime : 30 },
        { id: 4, status: "none", popUpTime : 30 }, { id: 5, status: "none", popUpTime : 30 },
        { id: 6, status: "none", popUpTime : 30 }, { id: 7, status: "none", popUpTime : 30 },
        { id: 8, status: "none", popUpTime : 30 }, { id: 9, status: "none", popUpTime : 30 },
        { id: 10, status: "none", popUpTime : 30 }, { id: 11, status: "none", popUpTime : 30 }
    ]

    class State {
        constructor(listener) {
            this._gameBoardStatus = data;
            const temp = createTemp(this._gameBoardStatus)
            render(domSelector.gridContainer, temp);
            this._listener = listener;
            this.renderHoles();
            this._score = 0;
            this._leftTime = 30;
        }

        clear(){
            for (let item of data){
                item.status = "none";
                item.popUpTime = 30;
            }
            this.leftTime = 30;
            this.score = 0;
        }

        get status() {
            return this._gameBoardStatus;
        }

        set status(newStatus) {
            this._gameBoardStatus = newStatus;
            this.renderHoles();
        }

        get score(){
            return this._score;
        }

        set score(newScore){
            this._score = newScore;
            const scoreDom = domSelector.scoreDom; 
            scoreDom.textContent = "Let's go, your socure is " + this._score;
        }

        get leftTime(){
            return this._leftTime;
        }

        set leftTime(newTime){
            this._leftTime = newTime;
            const timeDom = domSelector.timeDom;
            timeDom.textContent = this._leftTime + "s";
        }

        renderHoles(){
            const temp = createTemp(this._gameBoardStatus);
            render(domSelector.gridContainer, temp);
            for (let hole of domSelector.moleHoles()) {
                hole.addEventListener('click', this._listener)
            }
        }
    }

    return {
        State
    }

})(View)

const Controller = ((model, view) => {

    const { State } = model
    const { domSelector } = view

    let popMole; // Expose popupMole interval function
    let popMine; // Expose popupSnake interval function
    let countDown; // Expose countDown interval function

    const holeListener = (event) => {
        const holeId = parseInt(event.target.id.match(/\d+/)[0]);
        const status = state.status;
        if (status[holeId].status == "mole"){
            status[holeId].status = "none";
            state.score = state.score + 1;
        }else if(status[holeId].status == "mine"){
            for (let item of status){
                item.status = "mine";
            }
            state.status = status;
            clearInterval(popMole);
            clearInterval(popMine);
            clearInterval(countDown);
            domSelector.startBtn.hidden = false;
            alert("You lose! Your score is " + state.score);
            return
        }
        
        state.status = status;
    }

    const state = new State(holeListener)

    const popUpMole = () =>{
        const status = state.status;
        const emptyIndexes = [...status.filter((item) => item.status == "none")];
        const nonemptyIndexes = [...status.filter((item) => item.status == "mole")];
        for (let i in nonemptyIndexes){
            if (nonemptyIndexes[i].status == "mole" && nonemptyIndexes[i].popUpTime - state.leftTime >= 3){
                nonemptyIndexes[i].status = "none";
            }
        }

        const randomIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];
        randomIndex.status = "mole";
        randomIndex.popUpTime = state.leftTime;

        state.status = status

    }

    const popUpMine = () =>{
        const status = state.status;
        const emptyIndexes = [...status.filter((item) => item.status !== "mine")];
        // Remove previous snake
        for (let item of status) {
            if (item.status == "mine") {
                item.status = "none";
            }
        }
        const randomIndex = emptyIndexes[Math.floor(Math.random() * emptyIndexes.length)];

        randomIndex.status = "mine";
        state.status = status;

    }

    domSelector.startBtn.addEventListener('click', () =>{
        state.clear();
        domSelector.startBtn.hidden = true;
        popMole = setInterval(popUpMole, 1000);
        popMine = setInterval(popUpMine, 2000);
        countDown = setInterval(() =>{
            if (state.leftTime == 0){
                clearInterval(popMole);
                clearInterval(popMine);
                clearInterval(countDown)
                alert("Time Out! Your score is " + state.score)
                domSelector.startBtn.hidden = false;
                return

            }else{
                state.leftTime = state.leftTime - 1;
            }
        },1000)
    })

    const bootstrap = () => {
    }
    return { bootstrap }

})(Model, View);

Controller.bootstrap();