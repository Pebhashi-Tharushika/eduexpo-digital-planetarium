import * as THREE from "https://cdn.skypack.dev/three@0.136.0";
import { OrbitControls } from "https://cdn.skypack.dev/three@0.136.0/examples/jsm/controls/OrbitControls";

/* ------------ create a galaxy ------------ */

const canvas = document.getElementById("canvas");

const scene = new THREE.Scene(); // Create a 3D scene

const guiChange = {};
guiChange.count = 1000000;
guiChange.size = 0.01;
guiChange.radius = 5;
guiChange.branch = 4;
guiChange.spin = 1;
guiChange.randomness = 0.2;
guiChange.power = 3;
guiChange.inside = "#ff6030";
guiChange.outside = "#1b3984";

let particleGeometry = null;
let particleMaterial = null;
let particle = null;


// Add title text to the canvas
function addTitleToGalaxy() {
    const textDiv = document.createElement('div');
    textDiv.id = 'galaxy-title';
    textDiv.textContent = 'Milky Way Galaxy';

    document.body.appendChild(textDiv);
}


/* ------------------ for testing - test cube --------------- */

// const cube = new THREE.Mesh(
//   new THREE.BoxGeometry(1, 1, 1),
//   new THREE.MeshBasicMaterial()
// );
// scene.add(cube);

/* ------------ create the galaxy ------------ */
const galaxy = () => {
    if (particle !== null) {
        particleGeometry.dispose();
        particleMaterial.dispose();
        scene.remove(particle);
    }

    particleGeometry = new THREE.BufferGeometry();
    const position = new Float32Array(guiChange.count * 3);
    const color = new Float32Array(guiChange.count * 3);

    for (let i = 0; i < guiChange.count; i++) {
        const radius = Math.random() * guiChange.radius;
        const branch = ((i % guiChange.branch) / guiChange.branch) * Math.PI * 2;
        const spin = radius * guiChange.spin;
        const randomX = Math.pow(Math.random(), guiChange.power) * (Math.random() < 0.5 ? 1 : -1);
        const randomY = Math.pow(Math.random(), guiChange.power) * (Math.random() < 0.5 ? 1 : -1);
        const randomZ = Math.pow(Math.random(), guiChange.power) * (Math.random() < 0.5 ? 1 : -1);

        position[i * 3] = Math.cos(branch + spin) * radius + randomX;
        position[i * 3 + 1] = randomY;
        position[i * 3 + 2] = Math.sin(branch + spin) * radius + randomZ;

        const insideColor = new THREE.Color(guiChange.inside);
        const outsideColor = new THREE.Color(guiChange.outside);

        const mixed = insideColor.clone();
        mixed.lerp(outsideColor, radius / guiChange.radius);

        color[i * 3] = mixed.r;
        color[i * 3 + 1] = mixed.g;
        color[i * 3 + 2] = mixed.b;
    }

    particleGeometry.setAttribute("position", new THREE.BufferAttribute(position, 3));
    particleGeometry.setAttribute("color", new THREE.BufferAttribute(color, 3));

    particleMaterial = new THREE.PointsMaterial({
        size: guiChange.size,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        vertexColors: true,
        opacity: 1,
        transparent: true
    });

    particle = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particle);
};



/* ------------ Window resize event handler ------------ */

const sizes = {
    width: window.innerWidth,
    height: window.innerHeight,
};

window.addEventListener("resize", () => {

    // Update camera
    sizes.width = window.innerWidth;
    sizes.height = window.innerHeight;

    camera.aspect = sizes.width / sizes.height;
    camera.updateProjectionMatrix();

    // Update renderer
    renderer.setSize(sizes.width, sizes.height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Setup camera

const camera = new THREE.PerspectiveCamera(
    75,
    sizes.width / sizes.height,
    0.1,
    100
);
camera.position.x = 3;
camera.position.y = 3;
camera.position.z = 3;
scene.add(camera);

// Controls
const controls = new OrbitControls(camera, canvas);
controls.enableDamping = true;

/* ------------ Renderer ------------ */

const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));


/* ------------ Animation of the galaxy ------------ */

const clock = new THREE.Clock();
let gatherSpeed = 0.005;
let opacityDecreaseSpeed = 0.001;

let animationFrameId;

const tick = () => {
    const elapsedTime = clock.getElapsedTime();

    particle.rotation.y = elapsedTime / 8; // Rotate the galaxy on its Y-axis

    const positions = particleGeometry.attributes.position.array;

    // Gather particles towards the center
    for (let i = 0; i < guiChange.count; i++) {
        const x = positions[i * 3];
        const y = positions[i * 3 + 1];
        const z = positions[i * 3 + 2];

        if (Math.abs(x) > 0.01 || Math.abs(y) > 0.01 || Math.abs(z) > 0.01) {
            positions[i * 3] = x * (1 - gatherSpeed); // Move towards 0
            positions[i * 3 + 1] = y * (1 - gatherSpeed);
            positions[i * 3 + 2] = z * (1 - gatherSpeed);
        }
    }

    // Gradually reduce opacity
    if (particleMaterial.opacity > 0) {
        particleMaterial.opacity -= opacityDecreaseSpeed;
    }

    particleGeometry.attributes.position.needsUpdate = true;

    // Update controls
    controls.update();

    // Render
    renderer.render(scene, camera);

    // Check if opacity has reduced enough to remove the canvas
    const universeDiv = document.getElementById("universe");
    if (universeDiv && canvas && universeDiv.contains(canvas)) {
        // Remove canvas when opacity is 0
        if (particleMaterial.opacity <= 0) {
            universeDiv.removeChild(canvas);
            cancelAnimationFrame(animationFrameId);  // Stop the animation loop
            document.body.removeChild(document.getElementById('galaxy-title'));
            fetchPlanetData(); // Start the planet motion 
            return;  // Stop executing further frames
        }
    } else {
        cancelAnimationFrame(animationFrameId);  // Stop the animation if canvas is no longer in the DOM
        return;
    }

    // Call tick again on the next frame
    animationFrameId = requestAnimationFrame(tick);
};




/* ------------ create background stars ------------ */


const universe = document.getElementById('universe');
const numStars = 1500;
let starFieldWidth;
let starFieldHeight;
let stars = []; // Store star elements for reuse



function setUniverseBackground() {
    const divStars = universe.querySelectorAll(".stars");  // Select all children with class "stars" inside the universe
    divStars.forEach(star => star.remove()); // Remove each "stars" element
    stars = []; // Reset stars array

    starFieldWidth = window.innerWidth;
    starFieldHeight = window.innerHeight;

    for (let i = 0; i < numStars; i++) {
        let starDivElm = document.createElement('div');

        // Random size between 1 and 3
        let size = Math.ceil(Math.random() * 2.2);
        starDivElm.style.width = `${size}px`;
        starDivElm.style.height = `${size}px`;

        // Random position for each star
        let x = Math.floor(Math.random() * starFieldWidth);
        let y = Math.floor(Math.random() * starFieldHeight);

        // Apply position and opacity
        starDivElm.style.top = `${y}px`;
        starDivElm.style.left = `${x}px`;
        starDivElm.style.opacity = (Math.random() * 0.9 + 0.1).toFixed(1);

        starDivElm.classList.add('stars');
        stars.push(starDivElm); // Store reference to star for reuse
        universe.append(starDivElm);
    }


}




/* --------------- display loader at the begining -------------------------  */



// Loader visibility
function toggleLoader(show) {
    document.getElementById('loader').style.display = show ? 'block' : 'none';
}


toggleLoader(true); // Show the loader initially


// Wait for 1 second and then start the animation
setTimeout(() => {
    toggleLoader(false);
    galaxy();
    addTitleToGalaxy();
    setUniverseBackground();
    animationFrameId = requestAnimationFrame(tick); // Start galaxy animation
}, 500);


/* -------------- create palanetarium --------------------- */


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

let cometDivElm;


/* ------------------------ fetch planet data ------------------- */

// Fetch planetary data
async function fetchPlanetData() {

    const url = `https://api.le-systeme-solaire.net/rest/bodies/`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();

        initializeSystem(data);
        setTimeout(moveComets, 3000); // Start the comet movement with an initial delay of 3 seconds

    } catch (error) {
        console.error('Fetch operation error:', error);
    }
}


// Initialize planet animations after data is loaded
function initializeSystem(data) {
    createObjects();

    displayPlanetData(data.bodies);

    // Smoothly fade in the planets and orbits
    setTimeout(() => {
        document.querySelectorAll('.planet, .path, h2').forEach((element) => {
            element.style.opacity = 1; // Gradually fade in
        });
    }, 100); // Small delay to ensure elements are in the DOM before applying styles

    // Orbit animation loop
    setInterval(() => {
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

        if (index == 0) {
            divElm.setAttribute('title', 'Sun'); // Set the title attribute for the tooltip
        }
        if (index > 0) { // Exclude the Sun
            const pathElm = document.createElement('div');
            pathElm.classList.add('path');
            pathElm.id = 'path' + index;
            document.body.append(pathElm);
            divElmPath.push(pathElm);
        }
    });

    ellipses = createEllipses();
    createComet();
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

// Create a single comet element
function createComet() {
    cometDivElm = document.createElement('div');
    cometDivElm.classList.add('comets');
    cometDivElm.style.visibility = 'hidden'; // Start with comet hidden
    universe.append(cometDivElm);
    cometDivElm.setAttribute('title', 'Comet'); // Set the title attribute for the tooltip
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
                        padding: 1.5vh 1vw; 
                        border-radius: 0.5vw; 
                        box-shadow: 0 0 0.75vw 0.1vw #e9e9e9; 
                        position: relative;
                        max-width: 75vw; 
                        
                    ">
                        <!-- Arrow -->
                        <div id="tooltipArrow" style="
                            width: 0;
                            height: 0;
                            border-left: 0.5vw solid transparent;
                            border-right: 0.5vw solid transparent;
                            border-top: 0.5vw solid #f9f9f9; 
                            position: absolute;
                            bottom: -0.5vw;
                            left: 50%;
                            transform: translateX(-50%);
                        "></div>

                        <!-- Tooltip content -->
                        <h1 style="font-size: 2.5vh; font-weight: bold; text-align: center; color: #333; margin-bottom: 1vh;">${planetData.englishName}</h1>
                        <table style="width: 100%; border-collapse: collapse; font-size: 2vh; line-height: 1;">
                            <tr style="background-color: #e9e9e9;">
                                <td style="font-weight: bold; padding: 1vh;">Mass</td>
                                <td style="padding: 1vh;">${planetData.mass.massValue} x 10<sup>${planetData.mass.massExponent}</sup> kg</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold; padding: 1vh;">Diameter</td>
                                <td style="padding: 1vh;">${(planetData.meanRadius * 2).toFixed(0)} km</td>
                            </tr>
                            <tr style="background-color: #e9e9e9;">
                                <td style="font-weight: bold; padding: 1vh;">Gravity</td>
                                <td style="padding: 1vh;">${planetData.gravity.toFixed(1)} m/s<sup>2</sup></td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold; padding: 1vh;">Density</td>
                                <td style="padding: 1vh;">${(planetData.density * 1e3).toFixed(1)} kg/m<sup>3</sup></td>
                            </tr>
                            <tr style="background-color: #e9e9e9;">
                                <td style="font-weight: bold; padding: 1vh;">Mean Temperature</td>
                                <td style="padding: 1vh;">${planetData.avgTemp} K</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold; padding: 1vh;">Rotation Period</td>
                                <td style="padding: 1vh;">${planetData.sideralRotation.toFixed(1)} hours</td>
                            </tr>
                            <tr style="background-color: #e9e9e9;">
                                <td style="font-weight: bold; padding: 1vh;">Revolution Period</td>
                                <td style="padding: 1vh;">${planetData.sideralOrbit.toFixed(1)} days</td>
                            </tr>
                            <tr>
                                <td style="font-weight: bold; padding: 1vh;">Distance from the Sun</td>
                                <td style="padding: 1vh;">${(planetData.semimajorAxis / 1e6).toFixed(1)} x 10<sup>${planetData.semimajorAxisExponent}</sup> km</td>
                            </tr>
                            <tr style="background-color: #e9e9e9;">
                                <td style="font-weight: bold; padding: 1vh;">Number of Moons</td>
                                <td style="padding: 1vh;">${planetData.moons ? planetData.moons.length : 0}</td>
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
                    arrow.style.borderTop = '0.5vw solid #f9f9f9';
                    arrow.style.borderBottom = 'none';
                    arrow.style.top = '100%';
                } else {
                    // Position tooltip below if there's enough space
                    divElmTooltip.style.top = `${planetRect.bottom + window.scrollY + 10}px`;
                    arrow.style.borderBottom = '0.5vw solid #f9f9f9';
                    arrow.style.borderTop = 'none';
                    arrow.style.top = '-0.5vw';
                }

                // Adjust the horizontal position of the tooltip
                if (planetCenterX - tooltipRect.width / 2 < 10) {
                    // Too close to the left edge
                    divElmTooltip.style.left = '1vw';
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
        setUniverseBackground();
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
    document.querySelector("h2").style.visibility = "visible";
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

/* ------------------- crete motion of comets -----------------------*/
function moveComets() {
    let x = Math.random();
    let y = Math.random();

    let angle;
    let endX, endY;

    // Generate random offsets (up to 10% of the width/height)
    let offsetX = Math.random() * 0.2 * starFieldWidth;
    let offsetY = Math.random() * 0.2 * starFieldHeight;

    // Reset comet position properties
    cometDivElm.style.top = '';
    cometDivElm.style.left = '';
    cometDivElm.style.bottom = '';
    cometDivElm.style.right = '';

    // Determine starting edge, random offset, and angle based on random x and y
    if (x < 0.5 && y < 0.5) { // Top-left
        cometDivElm.style.top = `0px`;
        offsetY = 0;
        cometDivElm.style.left = `${offsetX}px`;
        angle = 135;
        endX = starFieldWidth - offsetX;
        endY = starFieldHeight - offsetY;
    } else if (x < 0.5 && y >= 0.5) { // Bottom-left
        cometDivElm.style.bottom = `${offsetY}px`;
        cometDivElm.style.left = `0px`;
        offsetX = 0;
        angle = 45;
        endX = starFieldWidth - offsetX;
        endY = -starFieldHeight + offsetY;
    } else if (x >= 0.5 && y < 0.5) { // Top-right
        cometDivElm.style.top = `${offsetY}px`;
        cometDivElm.style.right = `0px`;
        offsetX = 0;
        angle = -135;
        endX = -starFieldWidth + offsetX;
        endY = starFieldHeight - offsetY;
    } else { // Bottom-right
        cometDivElm.style.bottom = `0px`;
        offsetY = 0;
        cometDivElm.style.right = `${offsetX}px`;
        angle = -45;
        endX = -starFieldWidth + offsetX;
        endY = -starFieldHeight + offsetY;
    }

    // Show the comet before the animation starts
    cometDivElm.style.visibility = 'visible';

    // Temporarily remove and reapply the animation
    cometDivElm.style.animation = 'none';
    cometDivElm.offsetHeight; // Trigger reflow to reset the animation
    cometDivElm.style.animation = 'cometMove 5s linear'; // Animation lasts 10 seconds

    cometDivElm.style.setProperty('--comet-start-x', `${offsetX}px`);
    cometDivElm.style.setProperty('--comet-start-y', `${offsetY}px`);
    cometDivElm.style.setProperty('--comet-angle', `${angle}deg`);
    cometDivElm.style.setProperty('--comet-end-x', `${endX}px`);
    cometDivElm.style.setProperty('--comet-end-y', `${endY}px`);


    // Hide the comet after 10s (animation duration), then delay the next movement by 5s
    setTimeout(() => {
        cometDivElm.style.visibility = 'hidden';
        setTimeout(moveComets, 10000); // 10s delay before the next movement
    }, 5000); // 5s animation duration


    // Pause and resume on hover
    cometDivElm.addEventListener('mouseover', () => {
        cometDivElm.style.animationPlayState = 'paused';
    });

    cometDivElm.addEventListener('mouseout', () => {
        cometDivElm.style.animationPlayState = 'running';
    });
}





