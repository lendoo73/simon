"use strict";
const dom = {
    headDiff: document.querySelector("#headDiff"),
    headStrict: document.querySelector("#headStrict"),
    turn: document.querySelector("#turn"),
    headTurn: document.querySelector("#headTurn"),
    headRestart: document.querySelector("#headRestart"),
    front: document.querySelector("[alt='start']"),
    leftEye: document.querySelector("[alt='left-eye']"),
    rightEye: document.querySelector("[alt='right-eye']"),
    mouth: document.querySelector("[alt='mouth']"),
    menu: document.querySelector("#menu h1"),
    ufoContainer: document.querySelector(".ufo-container"),
    moon: document.querySelector(".moon-container"),
    moonImg: document.querySelector(".moon-container img")
};

class Location {
    constructor() {
        this.coordinates = {
            long: null,
            lat: null
        };
        this.time = null;
        this.error = null;
    };
    
    get long() {
        return this.coordinates.long;
    }
    
    get lat() {
        return this.coordinates.lat;
    }
}

// create the myLocation class:
const getLocation = () => {
    return new Promise(waitForLocation => {
        const myLocation = new Location();
        const showPosition = (position) => {    
            myLocation.coordinates.lat = position.coords.latitude;
            myLocation.coordinates.long = position.coords.longitude;
            myLocation.time = position.timestamp;
            waitForLocation(myLocation);
        };

        const showError = error => {
            myLocation.error = error;
            waitForLocation(myLocation);
        };

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(showPosition, showError);
        } else {
            myLocation.error = "Geolocation is not supported by this browser.";
            waitForLocation(myLocation);
        }
    });
};

headRestart.addEventListener("click", () => {
    location.reload();
});

// -------------------- Setup the game options: --------------------
const menuContent = {
    simon: `Simon<sup>&reg;</sup>`,
    start: `Start`,
    strict: "off",
    difficulty: `Simon<sup>&reg;</sup>`,
    hall: `Hall of Fame`,
    hallOfFame: null
};
menuContent.mouth = `Strict mode: ${menuContent.strict}`;
menuContent["left-eye"] = `Difficulty: ${menuContent.difficulty}`;
menuContent["right-eye"] = `Difficulty: ${menuContent.difficulty}`;

// -------------------- mouseenter-mouseout events: --------------------
const hoverAlien = function() {
    event.preventDefault();
    if (event.type === "mouseout") {
        dom.menu.innerHTML = menuContent.simon;
    } else {
        dom.menu.innerHTML = menuContent[event.target.alt || "hall"];
    }
};


// -------------------- Click events: --------------------
// raise difficulty:
const rightEye = function() {
    event.preventDefault();
    if (menuContent.difficulty === "Alien-intelligence") return;
    if (menuContent.difficulty === menuContent.simon) {
        menuContent.difficulty = "Super-human";
        mySimon.difficulty = "human";
        dom.leftEye.style.cursor = "pointer";
        dom.rightEye.style.cursor = "pointer";
    } else {
        menuContent.difficulty = "Alien-intelligence";
        mySimon.difficulty = "alien";
        dom.rightEye.style.cursor = "not-allowed";
    }
    changeDifficulty();
};

// lover difficulty:
const leftEye = function() {
    event.preventDefault();
    if (menuContent.difficulty === menuContent.simon) return;
    if (menuContent.difficulty === "Super-human") {
        mySimon.difficulty = "simon";
        menuContent.difficulty = menuContent.simon;
        dom.leftEye.style.cursor = "not-allowed";
    } else {
        menuContent.difficulty = "Super-human"
        mySimon.difficulty = "human";
        dom.leftEye.style.cursor = "pointer";
        dom.rightEye.style.cursor = "pointer";
    }
    changeDifficulty();
};

const changeDifficulty = () => {
    menuContent["left-eye"] = menuContent["right-eye"] = `Difficulty: ${menuContent.difficulty}`;
    dom.headDiff.innerHTML = menuContent.difficulty;
    dom.menu.innerHTML = menuContent["left-eye"];
};

const mouth = function() {
    event.preventDefault();
    menuContent.strict === "off" 
        ? menuContent.strict = "on"
        : menuContent.strict = "off"
    ;
    menuContent.mouth = `Strict mode: ${menuContent.strict}`;
    dom.headStrict.innerHTML = menuContent.strict;
    dom.menu.innerHTML = menuContent.mouth;
};

const callAJAX = (props) => {
    const url = props.url,
          method = props.method || "GET",
          type = props.type || "JSON",
          header = props.header
    ;
    return new Promise(waitForResult => {
        const xhttp = new XMLHttpRequest();
        if (method === "GET") {
            xhttp.open("GET", url, true);
            for (const key in header) {
                xhttp.setRequestHeader(key, header[key]);
            }
            xhttp.send();
        } else {
            xhttp.open("POST", url, true);
            for (const key in header) {
                xhttp.setRequestHeader(key, header[key]);
            }
            xhttp.send(props.data);
        }
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
//                console.log(this.response);
                type === "text"
                    ? waitForResult(this.response)
                    : waitForResult(JSON.parse(this.response))
                ;
            }
        };
    });
};

const openHallOfFameModal = () => {
    const hallOfFameModal = document.querySelector("#hallOfFameModal");
    const closeModal = document.querySelector(".close");
    const modalBody = document.querySelector(".modalBody");
    document.querySelector(".modalHeader h2").innerHTML = menuContent.difficulty;
    let body = "<p>Be the first to set a record!</p>";
    hallOfFameModal.style.display = "block";
    closeModal.onclick = () => hallOfFameModal.style.display = "none";
    window.onclick = function(event) {
        if (event.target.id === "hallOfFameModal") hallOfFameModal.style.display = "none";
    };
    
    // This function display the Hall of Fame if not born new record:
    const displayHallOfFame = () => {
        if (mySimon.data[mySimon.difficulty] && mySimon.data[mySimon.difficulty][0].turn === "0") {
            // the game just start now
            // the hall of fame still empty:
            modalBody.innerHTML = body;
        } else {
            body = `
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Date</th>
                        <th>Turn</th>
                    </tr>
            `;
            mySimon.data[mySimon.difficulty].forEach((row, i) => {
                body += `
                    <tr>
                        <td>${i + 1}. ${row.name} 
                            <img src="https://www.countryflags.io/${row.countryCode}/shiny/32.png" title="Kidnapped from ${row.countryCode}" />
                        </td>
                        <td>${row.date}</td>
                        <td>${row.turn}</td>
                    </tr>
                `;
            });
            body += `</table>`;
            modalBody.innerHTML = body;
        }
    }
    
    if (!(mySimon.turn)) {
        // game over:
        document.querySelector(".modalHeader h3").innerHTML = `Survived turns: ${mySimon.counter}`;
        const recordLength = mySimon.data[mySimon.difficulty].length;
        dom.ufoContainer.removeEventListener("click", jumpOver); // remove the jump over animations clik event
        if (mySimon.counter && 
            (mySimon.counter > mySimon.data[mySimon.difficulty][recordLength - 1].turn ||  
             mySimon.data[mySimon.difficulty].length < 10)) {
            // New Record!
            //get location:
            const myCountry = getLocation();
            myCountry.then(myLocation => {
                const longitude = myLocation.long,
                      latitude = myLocation.lat
                ;
                // get country-code:
                const AJAXProps = {
                    url: `https://secure.geonames.org/countryCode?lat=${latitude}&lng=${longitude}&username=lendoo`,
                    type: "text"
                };
                callAJAX(AJAXProps).then(countryCode => {
                    mySimon.countryCode = countryCode.substring(0, 2); // the country code consist of white-space characters...
                    document.getElementById("save").style.color = "white";
                    document.getElementById("save").style.cursor = "pointer";
                    document.getElementById("save").addEventListener("click", sendDataToServer);
                });
            });
            
            document.querySelector(".modalHeader h1").innerHTML = `New Record!`;
            body = `
                <h2>Enter your name:</h2>
                <form id="sendRecord">
                    <p id="inputContainer"><input type="text" class="center" name="name" placeholder="my name" autofocus="autofocus" pattern="[a-zA-Z_0-9]{1,15}" title="Letters or numbers" /></p>
            `;
            document.querySelector(".modalFooter").innerHTML = `
                    <input id="save" type="button" value="Save">
                </form>
            `;
            modalBody.innerHTML = body;
            const nameInput = document.querySelector("input");
            const validateUserInput = function() {
                const regex = /[^ öÖüÜóÓőŐúÚéÉáÁíÍ\w]/g;
                const name = event.target.value;
                const result = name.match(regex);
                // validate user input
                if (result) {
                    document.querySelector(".modalBody h2").innerHTML = `Forbidden character: ${[...result]}`;
                    document.querySelector("#save").setAttribute("disabled", "disabled");
                    nameInput.style.color = "red";
                    document.getElementById("save").style.color = "grey";
                    document.getElementById("save").style.cursor = "not-allowed";
                } else if (name.length > 20) {
                    document.querySelector(".modalBody h2").innerHTML = `too long...`; 
                    document.querySelector("#save").setAttribute("disabled", "disabled");
                    nameInput.style.color = "red";
                    document.getElementById("save").style.color = "grey";
                    document.getElementById("save").style.cursor = "not-allowed";
                } else if (name.length < 1) {
                    document.querySelector(".modalBody h2").innerHTML = `Enter your name:`;
                    document.querySelector("#save").setAttribute("disabled", "disabled");
                    nameInput.style.color = "white";
                    document.getElementById("save").style.color = "grey";
                    document.getElementById("save").style.cursor = "not-allowed";
                }else {
                    document.querySelector(".modalBody h2").innerHTML = `Enter your name:`;
                    document.querySelector("#save").removeAttribute("disabled", "disabled");
                    nameInput.style.color = "white";
                    document.getElementById("save").style.color = "white";
                    document.getElementById("save").style.cursor = "pointer";
                }
                if (!(mySimon.countryCode)) {
                    // wait for country code:
                    document.getElementById("save").style.color = "grey";
                    document.getElementById("save").style.cursor = "wait";
                }
            };
            nameInput.addEventListener("keyup", validateUserInput);

            // send the new record to the server:
            const sendDataToServer = () => {
                event.preventDefault();
                document.querySelector(".modalFooter").innerHTML = "<h3>Record can save in strict mode only.</h3>";
                const data = {
                    name: nameInput.value.trim(),
                    countryCode: mySimon.countryCode,
                    turn: mySimon.counter,
                    difficulty: mySimon.difficulty
                };
                const AJAXProps = {
                    url: `php/record.php`,
                    header: {
                        "Content-type": "application/x-www-form-urlencoded"
                    },
                    method: "POST",
                    data: `data=${JSON.stringify(data)}`
                };
                callAJAX(AJAXProps).then(response => {
                    mySimon.data[mySimon.difficulty] = response; // return back the modified data -> refresh mySimon.data
                    mySimon.turn = "saved";
                    openHallOfFameModal();
                });
            };
        } else {
            // dont't have new record: display the Hall of Fame:
            displayHallOfFame();
        }
    } else {
        displayHallOfFame();
    }
};

const downloadData = () => {
    return new Promise(waitForData => {
        if (mySimon.data[mySimon.difficulty]) return waitForData(mySimon.data[mySimon.difficulty]); // no download required
        const AJAXProps = {
            url: `php/getdata.php?difficulty=${mySimon.difficulty}`
        };
        callAJAX(AJAXProps).then(data => {
            mySimon.data[mySimon.difficulty] = data;
            waitForData(data);
        });
    });
};

let starWarsMusic;
const starWarsEffect = () => {
    const dateBefore = timeStamp => {
        const now = Math.round(Date.now() / 1000);
        timeStamp = timeStamp / 1000;
        const min = 60;
        const hour = min * 60;
        const day = hour * 24;
        const week = day * 7;
        const month = day * 30;
        const year = month * 12;
        if (now - timeStamp - year > 0) {
            const years = Math.round((now - timeStamp - year) / year);
            return `${years > 1 ? years + " years " : "a year"} ago.`;
        }
        if (now - timeStamp - month > 0) {
            const months = Math.round((now - timeStamp - month) / month);
            return `${months > 1 ? months + " months " : "a month"} ago.`;
        }
        if (now - timeStamp - week > 0) {
            const weeks = Math.round((now - timeStamp - week) / week);
            return `${weeks > 1 ? weeks + " weeks " : "a week"} ago.`;
        }
        if (now - timeStamp - day > 0) {
            const days = Math.round((now - timeStamp - day) / day);
            return `${days > 1 ? days + " days " : "a day"} ago.`;
        }
        if (now - timeStamp - hour > 0) {
            const hours = Math.round((now - timeStamp - hour) / hour);
            return `${hours > 1 ? hours + " hours " : "a hour"} ago.`;
        }
        if (now - timeStamp - min > 0) {
            const mins = Math.round((now - timeStamp - min) / min);
            return `${mins > 1 ? mins + " mins " : "a minute"} ago.`;
        }
        return "right now.";
    }; 
    
    downloadData().then(data => {
        crawl.style.animationPlayState = "running";
        starWars.style.opacity = 1;
        // show the best three? record:
        const best = document.getElementById("best");
        for (let i = 0; /*i < 3 &&*/ i < data.length; i ++) {
            const timeStamp = Date.parse(data[i].date);
            const time = dateBefore(timeStamp);
            best.innerHTML += `
                <p>${i + 1}. ${data[i].name}: Kidnapped from ${data[i].countryCode} ${time}</p>
            `;
        }
        
    });
    
    const alienImg = document.querySelector("#alien img"),
          fade = document.querySelector(".fade"),
          starWars = document.querySelector(".star-wars"),
          crawl = document.querySelector(".crawl"),
          difficulty = document.getElementById("difficulty"),
          strict = document.getElementById("strict")
    ;
    starWarsMusic = new Audio(`https://ia801203.us.archive.org/13/items/13BinarySunsetAlternate/01%20Star%20Wars%20Main%20Title%20And%20The%20Arrival%20At%20Naboo.ogg`);
    starWarsMusic.play();
    fade.style.display = "block";
    alienImg.style.width = 0;
    dom.menu.style.display = "none";
    difficulty.innerHTML = menuContent.difficulty;
    strict.innerHTML = menuContent.strict;
    crawl.addEventListener("click", ufoLanding);
    crawl.addEventListener("animationend", ufoLanding);
};

// add mouseenter event:
dom.front.addEventListener("mouseenter", hoverAlien);
dom.leftEye.addEventListener("mouseenter", hoverAlien);
dom.rightEye.addEventListener("mouseenter", hoverAlien);
dom.mouth.addEventListener("mouseenter", hoverAlien);
dom.menu.addEventListener("mouseenter", hoverAlien);

// add mouseout effect:
dom.front.addEventListener("mouseout", hoverAlien);
dom.leftEye.addEventListener("mouseout", hoverAlien);
dom.rightEye.addEventListener("mouseout", hoverAlien);
dom.mouth.addEventListener("mouseout", hoverAlien);
dom.menu.addEventListener("mouseout", hoverAlien);

// add click event to start:
dom.front.addEventListener("click", starWarsEffect);
dom.leftEye.addEventListener("click", leftEye);
dom.rightEye.addEventListener("click", rightEye);
dom.mouth.addEventListener("click", mouth);
document.querySelector("#menu").addEventListener("click", () => {
    downloadData().then(() => {
        openHallOfFameModal();
    });
});

const ufoLanding = () => {
    event.preventDefault();
    for (let i = 0; i < 10; i ++) {
        setTimeout(() => {
            starWarsMusic.volume = 1 - i * 0.1;
            if (i === 9) starWarsMusic.pause();
        }, i * 200);
    }
    const container = document.querySelector(".container"),
          fade = document.querySelector(".fade"),
          ufo = document.querySelectorAll(".ufo"),
          startContainer = document.querySelector(".start-container"),
          ufoRed = document.getElementById("ufoRed"),
          redReflector = document.getElementById("redReflector")
    ;
    
    const endLanding = () => {
        ufoRed.removeEventListener("animationend", endLanding);
        redReflector.classList.remove("reflectorOn");
        redReflector.classList.add("reflectorOff");
        for (let i = 0; i < ufo.length; i ++) {
            ufo[i].classList.add("shadeOn");
            ufo[i].classList.remove("shadeOff");
        }
        setTimeout(() => {
            startGame();
        }, 1000);
    };
    
    // set the background-image on mobile:
    const width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
    if (width < 576) {
        container.style.backgroundSize = "cover";
    }
    container.style.backgroundPosition = "0% 100%";
    fade.style.display = "none";
    startContainer.style.display = "none";
    dom.ufoContainer.style.display = "block";
    ufoRed.addEventListener("animationend", endLanding);  
};

// -------------------- Start the game: --------------------
class Simon {
    constructor() {
        this.sequence = [];
        this.color = {
            r: {
                sound: null
            },
            y: {
                sound: null
            },
            g: {
                sound: null
            },
            b: {
                sound: null
            }
        };
        this.turn = "ufo";
        this.counter = 0;
        this.strict = false;
        this.difficulty = "simon";
        this.data = {
            simon: null,
            human: null,
            alien: null
        };
        this.countryCode = null;
    }
    
    nextColor() {
        this.counter ++;
        const color = {
            "1": "r",
            "2": "y",
            "3": "g",
            "4": "b"
        };
        const random = this.randNumber(1, 4);
        this.sequence.push(color[random]);
        return color[random];
    }
    
    * playSequence() {
        for (let i = 0; i < this.sequence.length; i ++) {
            yield this.sequence[i];
        }
    }
    
    // This function make a random number betveen the minimum  and maximum (include both).
    randNumber(min, max) {
        return Math.floor(Math.random() * (max + 1 - min)) + min;
    }
    
    // shuffle the elements in an array
    randomArray(array) {
        array.sort((a, b) => 0.5 - Math.random());
    }
}

const mySimon = new Simon();
mySimon.nextColor(); // generate the first color
dom.headTurn.innerHTML = mySimon.counter;
let sequence = mySimon.playSequence();
const ufo = {
    r: document.getElementById("ufoRed"),
    y: document.getElementById("ufoYellow"),
    g: document.getElementById("ufoGreen"),
    b: document.getElementById("ufoBlue"),
};
const startGame = () => {
    // setup the sound files:
    dom.turn.style.display = "block";
    dom.moon.style.opacity = 1;
    if (menuContent.strict === "on") mySimon.strict = true;
    dom.moonImg.style.opacity = 1;
    for (let key in mySimon.color) {
        mySimon.color[key].sound = `${key}.wav`;
    }
    let color = sequence.next();
    playSound(color.value);
    activateUfo(color);
};

const playSound = color => {
    const audio = new Audio(`sounds/${mySimon.color[color].sound}`);
    audio.play();
};

const activateUfo = color => {
    ufo[color.value].classList.add("shadeOff");
    ufo[color.value].classList.remove("shadeOn");
    if (color.value === "r") {
        redReflector.classList.add("reflectorOn");
        redReflector.classList.remove("reflectorOff");
    } else {
        redReflector.classList.add("reflectorOff");
        redReflector.classList.remove("reflectorOn");
    }
    setTimeout(() => {
        ufo[color.value].classList.add("shadeOn");
        ufo[color.value].classList.remove("shadeOff");
        if (color.value === "r") {
            redReflector.classList.add("reflectorOff");
            redReflector.classList.remove("reflectorOn");
        }
        setTimeout(() => {
            color = sequence.next();
            if (!(color.done)) {
                // play the next sound:
                playSound(color.value);
                activateUfo(color);
            } else {
                // start human turn:
                humanTurn();
            }
        } , 100);
    } , 1000);
};

const setBrightness = function() {
    if (event.type === "mouseenter" && event.target.classList[0] === "ufo") {
        for (let key in ufo) {
            ufo[key].classList.add("shadeOn");
            ufo[key].classList.remove("shadeOff");
            redReflector.classList.add("reflectorOff");
            redReflector.classList.remove("reflectorOn");
        }
        document.getElementById(event.target.id).classList.add("shadeOff");
        document.getElementById(event.target.id).classList.remove("shadeOn");
        if (event.target.id === "ufoRed") {
            redReflector.classList.add("reflectorOn");
            redReflector.classList.remove("reflectorOff");
        }
        return;
    }
    if (event.type === "mouseout" 
        && (!(event.toElement) || event.toElement.className === "ufo-container")) {
        removeLight();
        // search ufo id:
        const id = getUfoID(event.target);
//        document.getElementById(id).classList.add("shadeOn");
        if (id === "ufoRed") {
            redReflector.classList.add("reflectorOff");
            redReflector.classList.remove("reflectorOn");
        }
    } 
};

const removeLight = () => {
    for (let key in ufo) {
            ufo[key].classList.add("shadeOn");
            ufo[key].classList.remove("shadeOff");
        }
};

const getUfoID = target => {
    let id;
        if (event.target.id) {
            id = event.target.id;
        } else {
            let target  = event.target.parentElement;
            while (!(target.id)) {
                target = target.parentElement;
            }
            id = target.id;
        }
    return id;
};

let replay, color;
const humanTurn = ()  => {
    mySimon.turn = "human";
    changeMoon();
    // add events to all ufo:
    addToUfo("mouseenter", setBrightness);
    addToUfo("mouseout", setBrightness);
    addToUfo("click", answer);
    window.addEventListener("keyup", keyEvent);
    checkDifficulty();
    replay = mySimon.playSequence(); // refresh the replay list
    color = replay.next();
};

const ufoTurn = () => {
    removeFromUfo("mouseenter", setBrightness);
    removeFromUfo("mouseout", setBrightness);
    removeFromUfo("click", answer);
    removeLight();
    mySimon.turn = "ufo";
    changeMoon();
    sequence = mySimon.playSequence();
    color = sequence.next();
    // show counter:
    document.querySelector("#counter").innerHTML = `Turn: ${mySimon.counter}`;
    document.querySelector("#counter").style.opacity = 1;
    setTimeout(() => {
        document.querySelector("#counter").style.opacity = 0;
        playSound(color.value);
        activateUfo(color);
    }, 2000);
};

let positionNow = ["r", "y", "g", "b"];
const checkDifficulty = () => {
    if (mySimon.difficulty === "simon") return;
    
    const changePosition = (ufoArray) => {
        const width = (window.innerWidth > 0) ? window.innerWidth : screen.width;
        
        const position = width < 576 
            ? [
                  ["50%", "1%"],
                  ["20%", "30%"],
                  ["50%", "55%"],
                  ["80%", "30%"]
              ]
            : [
                  ["60%", "5%"],
                  ["25%", "35%"],
                  ["50%", "65%"],
                  ["400px", "35%"]
              ]
        ;
        ufoArray.forEach((color, index) => {
            ufo[color].style.top = position[index][0];
            ufo[color].style.left = position[index][1];
        });
    };
    
    if (mySimon.difficulty === "human") {
        // turn UFOs:
        let twist = mySimon.randNumber(0, 1);
        if (!(twist)) twist = 3;
        const positionAfter = Array.from(positionNow);
        while (twist) {
            positionAfter.unshift(positionAfter.pop());
            twist --;
        }
        changePosition(positionAfter);
        positionNow = positionAfter;
    }
    if (mySimon.difficulty ===  "alien") {
        // shuffle UFOs:
        mySimon.randomArray(positionNow);
        changePosition(positionNow);
    }
};

const answer = function() {
    let id = getUfoID(event.target);
    if (id === "redReflector") id = "ufoRed";
    id = id[3].toLocaleLowerCase();
    playSound(id);
    if (id === color.value) {
        // good answer
        color = replay.next();
        if (color.done) {
            // start ufo turn
            window.removeEventListener("keyup", keyEvent);
            mySimon.nextColor(); // generate next color by UFOs
            dom.headTurn.innerHTML = mySimon.counter; // display the turn counter
            ufoTurn();
        } else {
            // continue human turn
            window.addEventListener("keyup", keyEvent); // add keyup event again
        }
    } else {
        // wrong answer
        // remove click event:
        removeFromUfo("click", answer);
        window.removeEventListener("keyup", keyEvent);
        wrongAnswer();
    }
};

const wrongAnswer = () => {
    if (mySimon.strict) {
        gameOver();
    } else {
        ufoTurn();
    }
};


const addToUfo = (event, call) => {
    document.getElementById("ufoRed").addEventListener(event, call);
    document.querySelector("#ufoYellow").addEventListener(event, call);
    document.querySelector("#ufoBlue").addEventListener(event, call);
    document.querySelector("#ufoGreen").addEventListener(event, call);
};

const removeFromUfo = (event, call) => {
    document.getElementById("ufoRed").removeEventListener(event, call);
    document.querySelector("#ufoYellow").removeEventListener(event, call);
    document.querySelector("#ufoBlue").removeEventListener(event, call);
    document.querySelector("#ufoGreen").removeEventListener(event, call);
};

const keyEvent = function () {
    const pressedKey = event.key.toLowerCase();
    if (pressedKey === "r" ||
        pressedKey === "y" ||
        pressedKey === "g" ||
        pressedKey === "b") {
        window.removeEventListener("keyup", keyEvent);
        ufo[pressedKey].click();
        ufo[pressedKey].classList.add("shadeOff");
        ufo[pressedKey].classList.remove("shadeOn");
        if (pressedKey === "r") {
            redReflector.classList.add("reflectorOn");
            redReflector.classList.remove("reflectorOff");
        }
        setTimeout(() => {
            ufo[pressedKey].classList.add("shadeOn");
            ufo[pressedKey].classList.remove("shadeOff");
            if (pressedKey === "r") {
                redReflector.classList.add("reflectorOff");
                redReflector.classList.remove("reflectorOn");
            }
        }, 1000);
    }
};

const changeMoon = () => {
    if (mySimon.turn === "human") { 
        // human turn
        
        dom.moon.style.left = "0%";
        if (mySimon.difficulty === "simon") {
            dom.moon.style.backgroundSize = "0%";
            dom.moonImg.setAttribute("src", "image/moon-cow.png");
        }
        if (mySimon.difficulty === "human") {
            dom.moonImg.setAttribute("src", "image/einstein.png");
        }
        if (mySimon.difficulty === "alien") {
            dom.moonImg.setAttribute("src", "image/alien-head2.png");
        }
    } else {
        // ufo turn
        dom.moon.style.left = "80%";
        dom.moon.style.backgroundSize = "contain";
        dom.moonImg.setAttribute("src", "image/alien.png");
    }
};

let gameOverAnimationsJumpOver = false;
const gameOver = () => {
    mySimon.counter --;  // last turn not completed
    mySimon.turn = null;
    // send UFOs away:
    removeFromUfo("mouseenter", setBrightness);
    removeFromUfo("mouseout", setBrightness);
    for (let key in ufo) {
        ufo[key].children[0].style.transition = "0.2s";
        ufo[key].children[0].style.transform = "scale(0)";
        ufo[key].classList.remove("shadeOn");
        ufo[key].classList.remove("shadeOff");
    }
    
    dom.moon.style.opacity = 0;
    
    // change yellow ufo to the player when the transition complete:
    setTimeout(() => {
        ufo.y.children[0].setAttribute("src", `image/victim-${mySimon.difficulty}.png`); 
    }, 200);
    
    setTimeout(() => {  
        
        // add click event to jump over animations:
        dom.ufoContainer.addEventListener("click", jumpOver);
        ufo.y.style.top = "75%";
        ufo.y.style.left = "40%";
        ufo.y.children[0].style.transform = "scale(1)";
        ufo.y.children[0].style.transition = "0.5s";

        // lightning effect:
        const lightningOn = () => {
            dom.ufoContainer.style.backgroundColor = "rgba(0, 0, 0, 0)";
            dom.ufoContainer.style.backgroundPosition = `${mySimon.randNumber(10, 90)}% 0%`;
            dom.ufoContainer.style.backgroundImage = "url(image/lightning.png)";
            gameOverAnim(thunderWav, 50);
        };

        const lightningOff = () => {
            dom.ufoContainer.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
            dom.ufoContainer.style.backgroundImage = "none";
        };
        
        const thunderWav = () => {
            const audio = new Audio(`sounds/onethunder.wav`);
            audio.play();
        };
        lightningOn();
        dom.ufoContainer.style.backgroundSize = "contain";
        dom.ufoContainer.style.backgroundRepeat = "no-repeat";
        gameOverAnim(lightningOff, 50);
        gameOverAnim(lightningOn, 200);
        gameOverAnim(lightningOff, 300);
        
        // call the UFO in:
        const callUfoIn = () => {
            const audio = new Audio(`sounds/alien-spaceship.wav`);
            audio.play();
            dom.ufoContainer.style.backgroundColor = "rgba(0, 0, 0, 0)";
            ufo.r.children[0].style.transform = "scale(1)";
            ufo.r.children[0].style.transition = "4s";
            ufo.r.style.transform = "scale(2)";
            ufo.r.style.left = "40%";
            ufo.r.style.top = "40%";
            redReflector.style.opacity = 0;
            redReflector.style.transition = "3s";
            gameOverAnim(() => {
                redReflector.style.opacity = 0.5;
            }, 4000);
        };
        
        const sendAway = () => {
            const audio = new Audio(`sounds/victim-${mySimon.difficulty}.wav`);
            audio.play();
            ufo.y.style.transform = "rotate(180deg)";
            ufo.y.children[0].style.transform = "scale(0)";
            ufo.y.children[0].style.transition = "2s";
            ufo.y.style.transition = "2s";
            ufo.y.style.top = "20%";
            ufo.y.style.left = "33%";
        };
        
        gameOverAnim(callUfoIn, 600);
        gameOverAnim(sendAway, 6000);
        gameOverAnim(() => {
            if (gameOverAnimationsJumpOver) return; // modal already opened
            openHallOfFameModal();
        }, 8500);
    }, 2000);
};

const gameOverAnim = (func, time) => {
    if (gameOverAnimationsJumpOver) return;
    setTimeout(() => {
        func();
    }, time);
};

// jump over the end animations:
const jumpOver = () => {
    openHallOfFameModal();
    gameOverAnimationsJumpOver = true;
};

// ----------------------------- footer: -----------------------------
const developed = document.getElementById("developed");
const presentYear = document.getElementById("presentYear");
const present = new Date;
const year = present.getFullYear();
if (year > developed.innerHTML) {
    presentYear.innerHTML = `-${year}.`;
}

