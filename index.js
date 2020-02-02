// This function make a random number betveen the minimum  and maximum (include both). If max array, max = max.length - 1
const randNumber = (min, max) => {
    if (typeof max === "object") {
        max = max.length - 1;
    }
    return Math.floor(Math.random() * (max + 1 - min)) + min;
};

// shuffle the elements in an array
function randomArray(array) {
    array.sort(function(a, b) {
        return 0.5 - Math.random();
    });
}

// Remove duplicated values from an array:
const uniqueArray = dirtyArray => dirtyArray.filter((value, index, array) => array.indexOf(value) === index);

// Typewriter effect: arguments: string, DOM element
const typeWriter = function(content, DOMElement) {
    let i = 0;
    DOMElement.textContent = "";
    let action  = setInterval(function() {
        if (i >= content .length) {
            clearInterval(action);
        } else {
            DOMElement.textContent += content[i];
        }
        i ++;
    }, 50);
};

// download the given content(arg: text) to  the browser folder:
const download = function(filename, text) {
    let element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(text));
    element.setAttribute("download", filename);
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

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
