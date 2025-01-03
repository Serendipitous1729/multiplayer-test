import { TAU, Vector2 } from "./Vector2.js";

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");

const socket = io({
    autoConnect: false
});

const username = prompt("username");

let gameState, selfID;
let paused = true;

socket.connect();
socket.emit("join-lobby", username, "any");

socket.on("game-state-init", (game, id) => {
    gameState = game;
    selfID = id;

    window.requestAnimationFrame(update);

    socket.on("game-state-update", (newGameState) => { // only after initialize listen to updates
        gameState = newGameState;
    });
});

function update() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    let center = new Vector2(canvas.width, canvas.height).mult(0.5);
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "#0088FF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for(let player of gameState.players){

        if(selfID == player.ID) {
            ctx.fillStyle = "#00FF88";
        } else {
            ctx.fillStyle = "#FFFFFF";
        }

        ctx.fillRect(center.x + player.inputs.mouse.position.x - 5, center.y + player.inputs.mouse.position.y - 5, 10, 10);
        ctx.fillText(player.username, center.x + player.inputs.mouse.position.x, center.y + player.inputs.mouse.position.y - 10);
    }
    
    window.requestAnimationFrame(update);
}

// pointer lock, pausing, and sending input data

function requestPointerLockWithUnadjustedMovement() {
    const promise = canvas.requestPointerLock({
        unadjustedMovement: true,
    });

    if (!promise) {
        console.log("disabling mouse acceleration is not supported");
        return;
    }

    return promise
        .then(() => console.log("pointer is locked"))
        .catch((error) => {
            if (error.name === "NotSupportedError") {
                // Some platforms may not support unadjusted movement.
                // You can request again a regular pointer lock.
                return canvas.requestPointerLock();
            }
        });
}
canvas.addEventListener("click", requestPointerLockWithUnadjustedMovement);
document.addEventListener("pointerlockchange", () => {
    if(document.pointerLockElement === canvas) {
        paused = false;
    } else {
        paused = true;
    }
});

function emitInputChange(e) {
    if(paused) return;

    e.preventDefault();

    let inputChangeObject = {};
    if (e instanceof KeyboardEvent) {
        inputChangeObject[e.type] = e.key.toLowerCase();
    } else if (e instanceof MouseEvent) {
        if (e.type == "mousemove") {
            inputChangeObject["mousemove"] = new Vector2(e.movementX, e.movementY);
        } else {
            inputChangeObject[e.type] = e.button;
        }
    }
    socket.emit("input", inputChangeObject);
}
document.addEventListener("keydown", emitInputChange);
document.addEventListener("keydown", emitInputChange);
document.addEventListener("mousedown", emitInputChange);
document.addEventListener("mouseup", emitInputChange);
document.addEventListener("mousemove", emitInputChange);

let pingStart;
window.ping = function () {
    pingStart = Date.now();
    socket.emit("PING");
}
socket.on("PONG", function(serverTime) {
    console.log(Date.now() - pingStart + " milliseconds for a 2-way trip");
    console.log(Date.now() - serverTime + " ms for server-to-client");
});