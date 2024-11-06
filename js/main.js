let divElmPlanet = [];
let divElmPath = [];
let ellipses = [];
const planetNames = ['sun', 'mercury', 'venus', 'earth', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune'];

let rotationActive = true;

// Center of the screen
let h = window.innerWidth / 2;
let k = window.innerHeight / 2;

// Movement parameters
let angles = Array(8).fill(0);
const revolutionSpeeds = [0.05, 0.03, 0.02, 0.017, 0.012, 0.009, 0.007, 0.005];
const rotationSpeeds = [58.6, 243, 1, 1.03, 0.41, 0.45, 0.72, 0.67];

// keep cursor current position
let cursorX;
let cursorY;

let isCursorOnPlanet = false;


/* ------------------------ loader and fetch planet data ------------------- */

// Loader visibility
function toggleLoader(show) {
    document.getElementById('loader').style.display = show ? 'block' : 'none';
    document.getElementById('wrapper').style.display = show ? 'block' : 'none';
}

// Fetch planetary data
async function fetchPlanetData() {
    toggleLoader(true);
    const url = `https://api.le-systeme-solaire.net/rest/bodies/`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        // Delay for 2 seconds after success before calling the functions
        setTimeout(() => {
            toggleLoader(false);
            setBackground();
            initializeSystem(data);
        }, 5000); // 5s 
    } catch (error) {
        console.error('Fetch operation error:', error);
        toggleLoader(false);
    }
}

// Set background image to the body
function setBackground() {
    document.body.style.backgroundImage = "url('./images/background.jpg')";
    document.body.style.backgroundSize = "cover";
    document.body.style.backgroundRepeat = "no-repeat";
    document.body.style.backgroundPosition = "center";
}

// Initialize planet animations after data is loaded
function initializeSystem(data) {
    createObjects();

    displayPlanetData(data.bodies);

    // Orbit animation loop
    const animationInterval = setInterval(() => {
        if (rotationActive) {
            for (let i = 0; i < 8; i++) {
                angles[i] = move(ellipses[i].rx, ellipses[i].ry, angles[i], revolutionSpeeds[i], ellipses[i].element);
            }
        }
    }, 50);

    // Apply self-rotation speeds to each planet
    applyRotationSpeeds();

    // Handle resizing
    onResize();
    // window.addEventListener("resize", onResize);

    // Cursor tracking and tooltip
    setupCursorTracking(document.getElementById("follower"));

    // Start the typing effect of the title
    type();
}


/* ----------------------------- create elements -------------------------- */

// Create planet and path elements
function createObjects() {
    // Create planet elements
    planetNames.forEach((name, index) => {
        const divElm = document.createElement('div');
        divElm.classList.add('planet');
        divElm.id = name;
        document.body.append(divElm);
        divElmPlanet.push(divElm);

        if (index > 0) { // Exclude the Sun
            const pathElm = document.createElement('div');
            pathElm.classList.add('path');
            pathElm.id = 'path' + index;
            document.body.append(pathElm);
            divElmPath.push(pathElm);
        }
    });

    ellipses = createEllipses();
    createTooltip();
    createCursorFollower();
}

function createEllipses() {
    return [
        { rx: window.innerWidth * 0.135, ry: window.innerHeight * 0.06625, element: divElmPlanet[1] },
        { rx: window.innerWidth * 0.18, ry: window.innerHeight * 0.0925, element: divElmPlanet[2] },
        { rx: window.innerWidth * 0.235, ry: window.innerHeight * 0.11875, element: divElmPlanet[3] },
        { rx: window.innerWidth * 0.285, ry: window.innerHeight * 0.145, element: divElmPlanet[4] },
        { rx: window.innerWidth * 0.335, ry: window.innerHeight * 0.17125, element: divElmPlanet[5] },
        { rx: window.innerWidth * 0.385, ry: window.innerHeight * 0.1975, element: divElmPlanet[6] },
        { rx: window.innerWidth * 0.435, ry: window.innerHeight * 0.22375, element: divElmPlanet[7] },
        { rx: window.innerWidth * 0.48, ry: window.innerHeight * 0.25, element: divElmPlanet[8] },
    ];
}

function createTooltip() {
    const divElmTooltip = document.createElement('div');
    divElmTooltip.id = 'tooltip';
    document.body.append(divElmTooltip);
}

function createCursorFollower() {
    const divElmfollower = document.createElement('div');
    divElmfollower.id = 'follower';
    document.body.append(divElmfollower);
}



/* -------------- planet rotation and display planet details ------------- */

// Move a planet along its elliptical path
function move(rx, ry, angle, speed, element) {
    const x = h + rx * Math.cos(angle);
    const y = k + ry * Math.sin(angle);

    element.style.left = `${x - element.offsetWidth / 2}px`;
    element.style.top = `${y - element.offsetHeight / 2}px`;

    return angle + speed;
}

// Apply self-rotation speeds
function applyRotationSpeeds() {
    divElmPlanet.forEach((planet, index) => {
        if (index !== 0) {  // Exclude the Sun
            planet.style.animation = `self-rotate ${rotationSpeeds[index - 1] * 100}s linear infinite`;
        }
    });
}

// Display planet data
function displayPlanetData(planets) {
    divElmPlanet.forEach(planet => {
        if (planet.id.toLowerCase() === 'sun') return;

        let divElmTooltip = document.getElementById("tooltip");
        planet.addEventListener('mouseover', (event) => {
            const planetData = planets.find(p => p.isPlanet && p.englishName.toLowerCase() === planet.id);
            if (planetData) {

                isCursorOnPlanet = true;

                stopSelfRotation();

                // Tooltip content setup with styles and arrow
                divElmTooltip.innerHTML = `
                    <div style="
                        font-family: Arial, sans-serif;
                        background-color: #f9f9f9;
                        padding: 15px;
                        border-radius: 8px;
                        box-shadow: 0px 0px 12px 3px #e9e9e9;
                        position: relative;
                        max-width: 400px;">
                        
                        <!-- Arrow as a pseudo-element -->
                        <div id="tooltipArrow" style="
                            width: 0;
                            height: 0;
                            border-left: 8px solid transparent;
                            border-right: 8px solid transparent;
                            border-top: 8px solid transparent;
                            border-bottom: 8px solid transparent;
                            position: absolute;">
                        </div>

                        <!-- Tooltip content -->
                        <h1 style="font-size: 24px; font-weight: bold; text-align: center; color: #333; margin: 0 0 10px 0;">${planetData.englishName}</h1>
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px; line-height: 1.3; color: #555;">
                            <tr style="background-color: #e9e9e9;">
                                <td style="font-weight: bold; padding: 8px;  white-space: nowrap;">Mass</td>
                                <td style="padding: 8px;  white-space: nowrap;">${planetData.mass.massValue} x 10<sup style="vertical-align: super; font-size: 10px">${planetData.mass.massExponent}</sup> kg</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold; padding: 8px;  white-space: nowrap;">Diameter</td>
                                <td style="padding: 8px; white-space: nowrap;">${(planetData.meanRadius * 2).toFixed(0)} km</td>
                            </tr>
                            <tr style="background-color: #e9e9e9;">
                                <td style="font-weight: bold; padding: 8px; white-space: nowrap;">Gravity</td>
                                <td style="padding: 8px; white-space: nowrap;">${planetData.gravity.toFixed(1)} m/s<sup style="vertical-align: super; font-size: 10px">2</sup></td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold; padding: 8px; white-space: nowrap;">Density</td>
                                <td style="padding: 8px; white-space: nowrap;">${(planetData.density * 1e3).toFixed(1)} kg/m<sup style="vertical-align: super; font-size: 10px">3</sup></td>
                            </tr>
                            <tr style="background-color: #e9e9e9;">
                                <td style="font-weight: bold; padding: 8px; white-space: nowrap;">Mean Temperature</td>
                                <td style="padding: 8px; white-space: nowrap;">${planetData.avgTemp} K</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold; padding: 8px; white-space: nowrap;">Rotation Period</td>
                                <td style="padding: 8px; white-space: nowrap;">${planetData.sideralRotation.toFixed(1)} hours</td>
                            </tr>
                            <tr style="background-color: #e9e9e9;">
                                <td style="font-weight: bold; padding: 8px; white-space: nowrap;">Revolution Period</td>
                                <td style="padding: 8px; white-space: nowrap;">${planetData.sideralOrbit.toFixed(1)} days</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold; padding: 8px; white-space: nowrap;">Distance from the Sun</td>
                                <td style="padding: 8px; white-space: nowrap;">${(planetData.semimajorAxis / 1e6).toFixed(1)} x 10<sup style="vertical-align: super; font-size: 10px">6</sup> km</td>
                            </tr>
                            <tr style="background-color: #e9e9e9;">
                                <td style="font-weight: bold; padding: 8px; white-space: nowrap;">Number of Moons</td>
                                <td style="padding: 8px; white-space: nowrap;">${planetData.moons ? planetData.moons.length : 0}</td>
                            </tr>
                        </table>
                    </div>
                    `;

                divElmTooltip.style.visibility = 'visible';
                divElmTooltip.style.opacity = 1;


                const tooltipRect = divElmTooltip.getBoundingClientRect(); // Get dimensions and position of the tooltip relative to the viewport.
                const arrow = document.getElementById('tooltipArrow');

                const screenHeight = window.innerHeight;
                const screenWidth = window.innerWidth;

                const planetRect = planet.getBoundingClientRect();

                const planetCenterX = planetRect.left + window.scrollX + planetRect.width / 2;
                const planetCenterY = planetRect.top + window.scrollY + planetRect.height / 2;

                // Position the tooltip based on available screen space
                if (planetCenterY + planetRect.height / 2 + tooltipRect.height + 16 > screenHeight) {
                    // Position tooltip above if there's no space below
                    divElmTooltip.style.top = `${planetRect.top + window.scrollY - tooltipRect.height - 10}px`;
                    arrow.style.borderTop = '8px solid #f9f9f9';
                    arrow.style.borderBottom = 'none';
                    arrow.style.top = '100%';
                } else {
                    // Position tooltip below if there's enough space
                    divElmTooltip.style.top = `${planetRect.bottom + window.scrollY + 10}px`;
                    arrow.style.borderBottom = '8px solid #f9f9f9';
                    arrow.style.borderTop = 'none';
                    arrow.style.top = '-8px';
                }

                // Adjust the horizontal position of the tooltip
                if (planetCenterX - tooltipRect.width / 2 < 10) {
                    // Too close to the left edge
                    divElmTooltip.style.left = '10px';
                    arrow.style.left = `${planetCenterX - 10}px`;
                } else if (planetCenterX + tooltipRect.width / 2 > screenWidth - 10) {
                    // Too close to the right edge
                    divElmTooltip.style.left = `${screenWidth - tooltipRect.width - 10}px`;
                    arrow.style.left = `${planetCenterX - (screenWidth - tooltipRect.width - 10)}px`;
                } else {
                    // Centered horizontally
                    divElmTooltip.style.left = `${planetCenterX - tooltipRect.width / 2}px`;
                    arrow.style.left = '50%';
                    arrow.style.transform = 'translateX(-50%)';
                }

                // Stop rotation of all planets
                rotationActive = false;
            }
        });

        planet.addEventListener('mouseout', () => {
            // Hide the tooltip when the mouse leaves the planet
            divElmTooltip.style.visibility = 'hidden';
            divElmTooltip.style.opacity = 0;

            restartSelfRotation();

            isCursorOnPlanet = false;

            // Resume rotation of all planets
            rotationActive = true;
        });
    });
}

// Stop Stop self-rotation by removing the animation
function stopSelfRotation() {
    divElmPlanet.forEach((planet, index) => {
        planet.style.animation = 'none';
        rotationActive = false;
    });
}

// Restart self-rotation when the mouse leaves
function restartSelfRotation() {
    divElmPlanet.forEach((planet, index) => {
        planet.style.animation = `self-rotate ${rotationSpeeds[index - 1] * 100}s linear infinite`;
        rotationActive = true;
    });
}


/* ------------------------- reponsive design ---------------------------*/

// Update ellipses and reposition planets on window resize
function onResize() {
    window.addEventListener("resize", () => {
        h = window.innerWidth / 2;
        k = window.innerHeight / 2;
    
        // Update radii for each ellipse path
        ellipses.forEach((ellipse, index) => {
            ellipse.rx = window.innerWidth * [0.135, 0.18, 0.235, 0.285, 0.335, 0.385, 0.435, 0.48][index];
            ellipse.ry = window.innerHeight * [0.06625, 0.0925, 0.11875, 0.145, 0.17125, 0.1975, 0.22375, 0.25][index];
            // Reposition each planet immediately after resizing
            angles[index] = move(ellipse.rx, ellipse.ry, angles[index], 0, ellipse.element);
        });
    });
    
}



/* ---------------------------- cursor follower ---------------------------*/

// Setup cursor tracking
function setupCursorTracking(follower) {
    let inactivityTimeout;
    document.addEventListener("mousemove", (event) => {
        cursorX = event.clientX;
        cursorY = event.clientY;

        follower.style.opacity = 1;

        clearTimeout(inactivityTimeout);
        if (isCursorOnPlanet) {
            follower.style.opacity = 0; // Hide follower
        } else {
            inactivityTimeout = setTimeout(() => {
                follower.style.opacity = 0; // Hide follower

            }, 2000); // 1s delay before hiding
        }
    });

    document.addEventListener("mouseleave", () => {
        follower.style.opacity = 0;
    });

    document.addEventListener("mouseenter", () => {
        follower.style.opacity = 1;
    });

    // Start the animation
    animateFollower(follower);
}

// Animate the follower to move towards the cursor
function animateFollower(follower) {

    const followerX = parseFloat(follower.style.left) || 0;
    const followerY = parseFloat(follower.style.top) || 0;
    const dx = cursorX - followerX - 5;
    const dy = cursorY - followerY - 5;
    const speed = 0.1;

    // Update follower's position smoothly
    follower.style.left = followerX + dx * speed + "px";
    follower.style.top = followerY + dy * speed + "px";

    // Continuously call animateFollower for smooth movement
    requestAnimationFrame(() => animateFollower(follower));
}


/* --------------------------------- title ----------------------------- */

const text = "EduExpo-Digital-Planetarium";
const typingSpeed = 150; // speed of typing in milliseconds
const erasingSpeed = 100; // speed of erasing in milliseconds
const delayBetweenCycles = 1000; // delay before starting to type again after erasing

let index = 0;
let isErasing = false;
const h2 = document.getElementById("typing-text");

function type() {
    if (!isErasing) {
        // Typing effect
        h2.textContent = text.slice(0, index + 1);
        index++;
        if (index === text.length) {
            isErasing = true; // start erasing after typing is complete
            setTimeout(type, delayBetweenCycles);
        } else {
            setTimeout(type, typingSpeed);
        }
    } else {
        // Erasing effect
        h2.textContent = text.slice(0, index - 1);
        index--;
        if (index === 0) {
            isErasing = false; // start typing again after erasing is complete
            setTimeout(type, delayBetweenCycles);
        } else {
            setTimeout(type, erasingSpeed);
        }
    }
}




/* -------------------- Start the application ---------------------*/
fetchPlanetData();
