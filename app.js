import express from "express";
import { Server } from "socket.io";
import { createServer } from "node:http";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { Player } from "./Player.js";
import { Game } from "./Game.js";
const game = new Game();

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(express.static("public"));

// no __dirname in es5 module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.get("/", (req, res) => {
    res.sendFile(join(__dirname, "public", "game.html"));
});

io.on("connect", (socket) => {
    socket.on("join-lobby", (username, lobby) => {
        console.log("a user connected");

        const player = new Player(username);
        game.addPlayer(player);
        socket.emit("game-state-init", game, player.ID);

        socket.on("input", (inputEvent) => {
            player.updateInput(inputEvent);
        });
        
        socket.on("disconnect", () => {
            game.removePlayer(player);
            console.log("user disconnected");
        });

        socket.on("PING", () => {
            socket.emit("PONG", Date.now());
        });
    });
});

setInterval(() => {
    io.emit("game-state-update", game);
}, 33);

server.listen(3000, () => {
    console.log("server running at http://localhost:3000");
});