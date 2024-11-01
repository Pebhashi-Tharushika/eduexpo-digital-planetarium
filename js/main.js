let divElmPlanet = [];
let divElmPath = [];
const planetNames = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

// Create planet elements
for (let i = 0; i < 9; i++) {
    const divElm = document.createElement('div');
    divElm.classList.add('planet');
    divElm.id = planetNames[i];
    document.body.append(divElm);
    divElmPlanet.push(divElm);
}

// Create orbital path elements
for (let i = 1; i < 9; i++) {
    const divElm = document.createElement('div');
    divElm.classList.add('path');
    divElm.id = 'path' + i;
    document.body.append(divElm);
    divElmPath.push(divElm);
}

// Create tooltip element
const divElmTooltip = document.createElement('div');
divElmTooltip.classList.add('tooltip');
document.body.append(divElmTooltip);

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

// Variables to control animation state
let rotationActive = true;

// Orbit animation loop
const animationInterval = setInterval(() => {
    if (rotationActive) {
        for (let i = 0; i < 8; i++) {
            angles[i] = move(ellipses[i].rx, ellipses[i].ry, angles[i], revolutionSpeeds[i], ellipses[i].element);
        }
    }
}, 50);

// Update ellipses and reposition planets on window resize
window.addEventListener("resize", () => {
    h = window.innerWidth / 2;
    k = window.innerHeight / 2;

    // Update radii for each ellipse path
    ellipses.forEach((ellipse, index) => {
        ellipse.rx = window.innerWidth * (0.135 + (index * 0.045));
        ellipse.ry = window.innerHeight * (0.06625 + (index * 0.02625));
        // Reposition each planet immediately after resizing
        angles[index] = move(ellipse.rx, ellipse.ry, angles[index], 0, ellipse.element);
    });
});

// Apply self-rotation speeds to each planet
divElmPlanet.forEach((planet, index) => {
    if (index !== 0) {  // Exclude the Sun
        planet.style.animation = `self-rotate ${rotationSpeeds[index - 1] * 100}s linear infinite`;
    }
});

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

// Function to display planet data
function displayPlanetData(planets) {
    divElmPlanet.forEach(planet => {
        if (planet.id.toLowerCase() === 'sun') return;

        planet.addEventListener('mouseover', (event) => {
            const planetData = planets.find(p => p.isPlanet && p.englishName.toLowerCase() === planet.id);
            if (planetData) {
                divElmTooltip.innerHTML = `
                    <strong>${planetData.englishName}</strong><br>
                    Mass: ${planetData.mass.massValue} x 10<sup>${planetData.mass.massExponent}</sup> kg<br>
                    Diameter: ${(planetData.meanRadius * 2).toFixed(0)} km<br>
                    Gravity: ${planetData.gravity.toFixed(1)} m/s²<br>
                    Density: ${(planetData.density * 1e3).toFixed(1)} kg/m<sup>3</sup><br>
                    Mean Temperature: ${planetData.avgTemp} K<br>
                    Rotation Period: ${planetData.sideralRotation.toFixed(1)} hours<br>
                    Revolution Period: ${planetData.sideralOrbit.toFixed(1)} days<br>
                    Distance from the Sun: ${(planetData.semimajorAxis / 1e6).toFixed(1)} x 10<sup>6</sup> km<br>
                    Number of Moons: ${planetData.moons ? planetData.moons.length : 0} <br>
                `;

                divElmTooltip.style.visibility = 'visible';
                divElmTooltip.style.opacity = 1;

                // Position tooltip
                const rect = planet.getBoundingClientRect();
                divElmTooltip.style.left = `${rect.left + window.scrollX + rect.width / 2 - divElmTooltip.offsetWidth / 2}px`;
                divElmTooltip.style.top = `${rect.top + window.scrollY - divElmTooltip.offsetHeight - 10}px`;

                // Stop rotation of all planets
                rotationActive = false;
            }
        });

        planet.addEventListener('mouseout', () => {
            // Hide the tooltip when the mouse leaves the planet
            divElmTooltip.style.visibility = 'hidden';
            divElmTooltip.style.opacity = 0;

            // Resume rotation of all planets
            rotationActive = true;
        });
    });
}

// Fetch data when the page loads
fetchPlanetData();
