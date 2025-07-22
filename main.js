// ======================
// INKLINE - REFINED ENGINE
// ======================

// ----- Game State -----
let currentSceneId = "start";
const gameStats = { 
  

    currentScene: "start",
    stats: { 
    hasKey: false, 
    trust: 0, 
    timeLeft: 100, },
    relationships: {
        mysteriousFigure: 50,
        houseSpirit: 50
    },
    timeRemaining: 100,
    inventory: {
        items: [],
        hasItem(item) {
            return this.items.includes(item);
        
    }
}
};

// ----- DOM Elements -----
const textDisplay = document.getElementById("text-display");
const choicesContainer = document.getElementById("choices-container");
const statsDisplay = document.getElementById("stats-display");

// ----- Story Data -----
const story = {
    "start": {
        "text": "You wake up in a dimly lit room. A note on the table reads: 'Escape before midnight.'",
        "choices": [
            { "text": "Search the room", "next": "search" },
            { "text": "Leave immediately", "next": "leave" }
        ]
    },
    "search": {
        "text": "You find a key under the bed. A distant clock chimes... time is running out.",
        "choices": [
            { "text": "Take the key", "next": "take_key", "statChange": { "hasKey": true } },
            { "text": "Ignore it", "next": "ignore_key" }
        ]
    },
    "take_key": {
        "text": "You pocket the key. It feels cold against your skin as you hear footsteps approaching...",
        "choices": [
            { "text": "Hide in the closet", "next": "ending_safe" },
            { "text": "Confront the sound", "next": "ending_risk" }
        ]
    },
    "ignore_key": {
        "text": "You leave the key behind. The door locks behind you with an ominous click.",
        "choices": [
            { "text": "Try to break back in", "next": "ending_trapped" },
            { "text": "Continue forward", "next": "leave" }
        ]
    },
    "leave": {
        "text": "You step into a hallway. Two doors: one red, one blue.",
        "choices": [
            { "text": "Red door", "next": "ending_fire" },
            { "text": "Blue door", "next": "ending_ice" }
        ]
    },
    "ending_safe": {
        "text": "You remain hidden until morning light filters through the cracks. (Safe Ending)",
        "isEnding": true
    },
    "ending_risk": {
        "text": "You confront the shadowy figure... and wake up in your bed. Was it all a dream? (Mystery Ending)",
        "isEnding": true
    },
    "ending_trapped": {
        "text": "The door won't budge. As the clock strikes midnight, the walls begin to close in... (Bad Ending)",
        "isEnding": true
    },
    "ending_fire": {
        "text": "The red door leads to a roaring inferno. (Fiery Ending)",
        "isEnding": true
    },
    "ending_ice": {
        "text": "The blue door opens to an endless frozen wasteland. (Frozen Ending)",
        "isEnding": true
    },

     "deciphered_message": {
        "text": "The key's markings match symbols on the note - it's a map to the attic!",
        "choices": [
            {
                "text": "Follow the map",
                "next": "attic_discovery",
                "effects": {
                    "timeCost": 20
                }
            }
        ]
    },
    "midnight_ending": {
        "text": "The clock strikes twelve. The house dissolves around you as everything fades to black...",
        "isEnding": true,
        "unlockId": "time_ran_out"
    }
};

// ----- Initialize Game -----
function initGame() {
    loadScene(currentSceneId);
    updateStatsDisplay();
}

// ----- Scene Loader -----
function loadScene(sceneId) {
    // Validate scene exists
    const scene = story[sceneId];
    if (!scene) {
        showError(`Scene "${sceneId}" not found!`);
        return;
    }

      if (scene.requiredItem && !gameStats.inventory.hasItem(scene.requiredItem)) {
        return loadScene("missing_item_fallback");
    }
    if (scene.relationshipEffects) {
        Object.entries(scene.relationshipEffects).forEach(([character, change]) => {
            gameStats.relationships[character] += change;
        });
    }

    // Clear previous choices
    choicesContainer.innerHTML = "";

    // Display scene text (with typewriter effect)
    displayText(scene.text, () => {
        // After text finishes displaying, show choices
        if (!scene.isEnding) {
            scene.choices.forEach(choice => {
                createChoiceButton(choice);
            });
        } else {
            createRestartButton();
        }
    });

    updateStatsDisplay();
}

// ----- Text Display with Typewriter Effect -----
function displayText(text, onComplete) {
    textDisplay.textContent = "";
    let i = 0;
    const speed = 30; // ms per character

    function type() {
        if (i < text.length) {
            textDisplay.textContent += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else if (onComplete) {
            onComplete();
        }
    }

    type();
}

// ----- Choice Button Creation -----
function createChoiceButton(choice) {
    const button = document.createElement("button");
    button.className = "choice-btn";
    button.textContent = choice.text;
    
    button.addEventListener("click", () => {
        // Update stats if needed
        if (choice.statChange) {
            Object.assign(gameStats, choice.statChange);
        }
        
        // Load next scene
        currentSceneId = choice.next;
        loadScene(currentSceneId);
    });

  if (choice.requiredItem && !gameStats.inventory.hasItem(choice.requiredItem)) {
        button.disabled = true;
        button.textContent = `${choice.text} (Missing Item)`;
    } else {
        button.textContent = choice.text;
    }

    choicesContainer.appendChild(button);
}

// ----- Restart Button -----
function createRestartButton() {
    const button = document.createElement("button");
    button.className = "choice-btn";
    button.textContent = "Play Again";
    
    button.addEventListener("click", () => {
        resetGame();
    });

    choicesContainer.appendChild(button);
}

// ----- Stats Display -----
function updateStatsDisplay() {
    statsDisplay.innerHTML = `
        <p>Key: ${gameStats.hasKey ? "✔️" : "❌"}</p>
        <p>Time: ${gameStats.timeLeft}</p>
    `;
}

// ----- Reset Game -----
function resetGame() {
    // Reset game state
    currentSceneId = "start";
    Object.assign(gameStats, { 
        hasKey: false, 
        trust: 0, 
        timeLeft: 100 
    });
    
    // Reload initial scene
    loadScene(currentSceneId);
}

// ----- Error Handling -----
function showError(message) {
    textDisplay.textContent = `ERROR: ${message}`;
    console.error(message);
    
    const button = document.createElement("button");
    button.className = "choice-btn";
    button.textContent = "Restart Game";
    button.addEventListener("click", resetGame);
    
    choicesContainer.innerHTML = "";
    choicesContainer.appendChild(button);
}

// ----- Start the Game -----
initGame();