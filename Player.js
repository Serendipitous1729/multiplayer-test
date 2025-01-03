import { Vector2 } from "./Vector2.js";

class Player {
    username;
    constructor(username) {
        this.username = username;
    }

    inputs = {
        mouse: {
            buttons: [],
            position: new Vector2(0, 0),
            delta: new Vector2(0, 0)
        },
        keys: {}
    }
    updateInput(event) {
        const type = Object.keys(event)[0];
        const value = event[type];
        switch (type) {
            case "keydown":
                this.inputs.keys[value] = true;
                break;
            case "keyup":
                this.inputs.keys[value] = false;
                break;
            case "mousemove":
                this.inputs.mouse.delta.set(value);
                this.inputs.mouse.position.add(value);
                break;
            case "mousedown":
                this.inputs.mouse.buttons[value] = true;
                break;
            case "mouseup":
                this.inputs.mouse.buttons[value] = false;
                break;
        }
    }
}

export { Player };