let divElmPlanet = [];
let divElmPath = [];

// Create planet elements
for (let i = 0; i < 9; i++) {
    const divElm = document.createElement('div');
    divElm.classList.add('circle' + i);
    document.body.append(divElm);
    divElmPlanet.push(divElm);
}

// Create orbital path elements
for (let i = 1; i < 9; i++) {
    const divElm = document.createElement('div');
    divElm.classList.add('path' + i);
    document.body.append(divElm);
    divElmPath.push(divElm);
}


// Center of the screen
let h = window.innerWidth / 2;  
let k = window.innerHeight / 2; 

let angles = [0, 0, 0, 0, 0, 0, 0, 0];

const revolutionSpeeds = [
    0.05,   
    0.03,   
    0.02,   
    0.017,  
    0.012,  
    0.009,  
    0.007,  
    0.005   
];

const rotationSpeeds = [
    58.6, 
    243,  
    1,    
    1.03, 
    0.41, 
    0.45, 
    0.72, 
    0.67  
];

// Ellipse parameters for each planet's orbit
const ellipses = [
    { rx: window.innerWidth * 0.135, ry: window.innerHeight * 0.06625, element: divElmPlanet[1] },
    { rx: window.innerWidth * 0.18, ry: window.innerHeight * 0.0925, element: divElmPlanet[2] },
    { rx: window.innerWidth * 0.235, ry: window.innerHeight * 0.11875, element: divElmPlanet[3] },
    { rx: window.innerWidth * 0.285, ry: window.innerHeight * 0.145, element: divElmPlanet[4] },
    { rx: window.innerWidth * 0.335, ry: window.innerHeight * 0.17125, element: divElmPlanet[5] },
    { rx: window.innerWidth * 0.385, ry: window.innerHeight * 0.1975, element: divElmPlanet[6] },
    { rx: window.innerWidth * 0.435, ry: window.innerHeight * 0.22375, element: divElmPlanet[7] },
    { rx: window.innerWidth * 0.48, ry: window.innerHeight * 0.25, element: divElmPlanet[8] },
];

// Function to move a planet along its elliptical path
function move(rx, ry, angle, speed, element) {
    let x = h + rx * Math.cos(angle);
    let y = k + ry * Math.sin(angle);

    element.style.left = `${x - element.offsetWidth / 2}px`;
    element.style.top = `${y - element.offsetHeight / 2}px`;

    return angle + speed;
}

// Orbit animation loop
setInterval(() => {
    for(let i = 0; i < 8; i++){
        angles[i] = move(ellipses[i].rx, ellipses[i].ry, angles[i], revolutionSpeeds[i], ellipses[i].element);
    }
}, 50);

// Update ellipses and reposition planets on window resize
window.addEventListener("resize", () => {
    h = window.innerWidth / 2;
    k = window.innerHeight / 2;
    
    // Update radii for each ellipse path
    ellipses[0].rx = window.innerWidth * 0.135;
    ellipses[0].ry = window.innerHeight * 0.06625;

    ellipses[1].rx = window.innerWidth * 0.18;
    ellipses[1].ry = window.innerHeight * 0.0925;

    ellipses[2].rx = window.innerWidth * 0.235;
    ellipses[2].ry = window.innerHeight * 0.11875;

    ellipses[3].rx = window.innerWidth * 0.285;
    ellipses[3].ry = window.innerHeight * 0.145;

    ellipses[4].rx = window.innerWidth * 0.335;
    ellipses[4].ry = window.innerHeight * 0.17125;

    ellipses[5].rx = window.innerWidth * 0.385;
    ellipses[5].ry = window.innerHeight * 0.1975;

    ellipses[6].rx = window.innerWidth * 0.435;
    ellipses[6].ry = window.innerHeight * 0.22375;

    ellipses[7].rx = window.innerWidth * 0.48;
    ellipses[7].ry = window.innerHeight * 0.25;

    // Reposition each planet immediately after resizing
    angles.forEach((angle, i) => {
        angles[i] = move(ellipses[i].rx, ellipses[i].ry, angle, 0, ellipses[i].element);
    });
});

// Apply self-rotation speeds to each planet
divElmPlanet.forEach((planet, index) => {
    if (index != 0) {  // Exclude the Sun
        planet.style.animation = `self-rotate ${rotationSpeeds[index-1] * 100}s linear infinite`;
    }
});



const apiKey = 'F3w4uup6OYLk5DUcCGNXiPPDKUVZXlVjJxUmWjsD'; 
const planetId = 'Mars'; 


// Function to fetch planetary data
async function fetchPlanetData() {
    const url = `https://api.le-systeme-solaire.net/rest/bodies/`; 

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        displayPlanetData(data.bodies);
    } catch (error) {
        console.error('The problem with fetch operation:', error);
    }
}



