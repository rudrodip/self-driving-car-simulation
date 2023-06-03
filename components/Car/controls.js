/**
 * Controls class handles user input for controlling the car.
 */
class Controls {
  /**
   * Create a new Controls instance.
   * @param {string} type - The type of control. Possible values are "KEYS" and "DUMMY".
   */
  constructor(type) {
    this.forward = false;
    this.left = false;
    this.right = false;
    this.reverse = false;

    switch (type) {
      case "KEYS":
        this.#addKeyboardListeners();
        break;
      case "DUMMY":
        this.forward = true;
        break;
    }
  }

  /**
   * Add event listeners for keyboard input.
   * Private method.
   */
  #addKeyboardListeners() {
    document.onkeydown = (event) => {
      switch (event.key) {
        case "a":
          this.left = true;
          break;
        case "d":
          this.right = true;
          break;
        case "w":
          this.forward = true;
          break;
        case "s":
          this.reverse = true;
          break;
      }
    }
    document.onkeyup = (event) => {
      switch (event.key) {
        case "a":
          this.left = false;
          break;
        case "d":
          this.right = false;
          break;
        case "w":
          this.forward = false;
          break;
        case "s":
          this.reverse = false;
          break;
      }
    }
  }
}

export default Controls;
