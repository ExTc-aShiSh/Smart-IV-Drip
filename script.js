const host = "1c1c1007901b4873961419a9a7e88252.s1.eu.hivemq.cloud";
const username = "Ashish";
const password = "12345678";

const client = mqtt.connect(

    'wss://1c1c1007901b4873961419a9a7e88252.s1.eu.hivemq.cloud:8884/mqtt',

    {

        username: username,

        password: password

    }

);

const weight = document.getElementById("weight");

const status = document.getElementById("status");

const fluidLevel = document.getElementById("fluid-level");
const alarmStatus = document.getElementById("alarm-status");
const bottleCard = document.getElementById("bottle-card");

// Assuming a full IV bag is 5.0 Kg.
const MAX_WEIGHT_KG = 5.0; 

let audioCtx = null;
let beepInterval = null;

function playBeep() {
    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (audioCtx.state === 'suspended') {
            audioCtx.resume();
        }
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime); 
        
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.5);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.5);
    } catch (e) {
        console.log("Audio play blocked by browser. User interaction needed.");
    }
}

function updateLevelStatus(percentage) {
    const bottle = document.querySelector('.bottle');
    
    // Stop beep if we're not in <10% alarm range
    if (percentage >= 10 && beepInterval) {
        clearInterval(beepInterval);
        beepInterval = null;
    }

    if (percentage < 10) {
        alarmStatus.classList.remove("hidden");
        alarmStatus.innerHTML = "⚠️ CRITICAL: Low Fluid Alarm!";
        alarmStatus.style.backgroundColor = "#fee2e2";
        alarmStatus.style.color = "#dc2626";
        alarmStatus.style.borderColor = "#ef4444";
        
        bottle.style.borderColor = "#ef4444"; // Red ring
        bottle.style.boxShadow = "0 0 25px rgba(239, 68, 68, 0.6), inset 0 0 20px rgba(0,0,0,0.05)";
        bottleCard.style.borderColor = "#ef4444";
        
        if (!beepInterval) {
            playBeep();
            beepInterval = setInterval(playBeep, 1000);
        }
    } else if (percentage < 25) {
        alarmStatus.classList.remove("hidden");
        alarmStatus.innerHTML = "⚠️ WARNING: Fluid below 25%";
        alarmStatus.style.backgroundColor = "#ffedd5";
        alarmStatus.style.color = "#c2410c";
        alarmStatus.style.borderColor = "#f97316";
        
        bottle.style.borderColor = "#f97316"; // Orange ring
        bottle.style.boxShadow = "0 0 25px rgba(249, 115, 22, 0.5), inset 0 0 20px rgba(0,0,0,0.05)";
        bottleCard.style.borderColor = "rgba(255, 255, 255, 0.5)";
    } else if (percentage < 50) {
        alarmStatus.classList.remove("hidden");
        alarmStatus.innerHTML = "ℹ️ NOTICE: Fluid below 50%";
        alarmStatus.style.backgroundColor = "#fef9c3";
        alarmStatus.style.color = "#a16207";
        alarmStatus.style.borderColor = "#eab308";
        
        bottle.style.borderColor = "#eab308"; // Yellow ring
        bottle.style.boxShadow = "0 0 25px rgba(234, 179, 8, 0.4), inset 0 0 20px rgba(0,0,0,0.05)";
        bottleCard.style.borderColor = "rgba(255, 255, 255, 0.5)";
    } else {
        alarmStatus.classList.add("hidden");
        bottle.style.borderColor = "rgba(255, 255, 255, 0.9)"; // Default white ring
        bottle.style.boxShadow = "inset 0 0 20px rgba(0,0,0,0.05), 0 15px 30px rgba(0,0,0,0.1)";
        bottleCard.style.borderColor = "rgba(255, 255, 255, 0.5)";
    }
}

client.on('connect', () => {

    status.innerHTML = "🟢 Connected";

    client.subscribe("smartscale/weight");

});

client.on('message', (topic, message) => {

    const valueStr = message.toString();
    const currentWeight = parseFloat(valueStr);

    weight.innerHTML = valueStr + " Kg";

    // Calculate fluid percentage
    let percentage = (currentWeight / MAX_WEIGHT_KG) * 100;
    
    // Clamp between 0 and 100
    if (percentage > 100) percentage = 100;
    if (percentage < 0) percentage = 0;

    // Update bottle fluid visual
    fluidLevel.style.height = percentage + "%";

    // Change fluid color based on level
    if (percentage < 10) {
        fluidLevel.style.backgroundColor = "#ef4444"; // Red
    } else if (percentage < 25) {
        fluidLevel.style.backgroundColor = "#f97316"; // Orange
    } else if (percentage < 50) {
        fluidLevel.style.backgroundColor = "#eab308"; // Yellow
    } else {
        fluidLevel.style.backgroundColor = "var(--medical-teal)"; // Green/Teal
    }

    // Trigger status updates
    updateLevelStatus(percentage);

});

client.on('error', () => {

    status.innerHTML = "🔴 Offline";

});