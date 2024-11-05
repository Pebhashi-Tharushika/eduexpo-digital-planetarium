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

const divElmfollower = document.createElement('div');
divElmfollower.id = 'follower';
document.body.append(divElmfollower);


// Center of the screen
let h = window.innerWidth / 2;
let k = window.innerHeight / 2;

let angles = [0, 0, 0, 0, 0, 0, 0, 0];

const revolutionSpeeds = [0.05, 0.03, 0.02, 0.017, 0.012, 0.009, 0.007, 0.005];

const rotationSpeeds = [58.6, 243, 1, 1.03, 0.41, 0.45, 0.72, 0.67];

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

// Move a planet along its elliptical path
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


/* ---------------------- tooltip ---------------------- */

// Fetch planetary data
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

// Display planet data
function displayPlanetData(planets) {
    divElmPlanet.forEach(planet => {
        if (planet.id.toLowerCase() === 'sun') return;

        planet.addEventListener('mouseover', (event) => {
            const planetData = planets.find(p => p.isPlanet && p.englishName.toLowerCase() === planet.id);
            if (planetData) {

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

            // Resume rotation of all planets
            rotationActive = true;
        });
    });
}

// Fetch data when the page loads
fetchPlanetData();



/* ----------------- follower ------------------- */

const follower = document.getElementById("follower");
  let cursorX = window.innerWidth / 2;
  let cursorY = window.innerHeight / 2;
  let isCursorMoving = false;
  let inactivityTimeout;

  // Update cursor position variables on mouse move
  document.addEventListener("mousemove", (event) => {
    cursorX = event.clientX;
    cursorY = event.clientY;
    isCursorMoving = true;

    // Show the follower and reset inactivity timer
    follower.style.opacity = 1;
    resetInactivityTimer();
  });

  // Function to hide follower if no cursor movement is detected
  function resetInactivityTimer() {
    clearTimeout(inactivityTimeout);
    inactivityTimeout = setTimeout(() => {
      follower.style.opacity = 0; // Hide follower
      isCursorMoving = false;
    }, 500); // 1-second delay before hiding
  }

  // Animate the follower to move towards the cursor
  function animateFollower() {
    // If the cursor has moved recently, update the follower position
    if (isCursorMoving) {
      const followerX = parseFloat(follower.style.left) || 0;
      const followerY = parseFloat(follower.style.top) || 0;
      const dx = cursorX - followerX;
      const dy = cursorY - followerY;
      const speed = 0.1;
      
      // Update follower's position smoothly
      follower.style.left = followerX + dx * speed + "px";
      follower.style.top = followerY + dy * speed + "px";
    }
    requestAnimationFrame(animateFollower);
  }

  // Hide the follower on mouse leave
  document.addEventListener("mouseleave", () => {
    follower.style.opacity = 0;
  });

  // Show the follower again when the cursor re-enters
  document.addEventListener("mouseenter", () => {
    follower.style.opacity = 1;
  });

  // Initialize the follower position and start the animation
  follower.style.left = cursorX + "px";
  follower.style.top = cursorY + "px";
  animateFollower();


  /* ---------- title ---------- */

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

    // Start the typing effect
    type();
