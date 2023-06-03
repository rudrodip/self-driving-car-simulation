import Controls from "./controls";
import Sensor from "./Sensor";
import NeuralNetwork from "@components/NN/NeuralNetwork";
import { polysIntersect } from '@utils/utils';

class Car {
  /**
   * Constructs a car object.
   * @param {number} x - The x-coordinate of the car's position.
   * @param {number} y - The y-coordinate of the car's position.
   * @param {number} width - The width of the car.
   * @param {number} height - The height of the car.
   * @param {string} controlType - The control type of the car: "AI", "DUMMY", etc.
   * @param {number} maxSpeed - The maximum speed of the car (default: 3).
   * @param {number} acceleration - The acceleration of the car (default: 0.2).
   * @param {number} friction - The friction of the car (default: 0.05).
   * @param {number} angularVel - The angular velocity of the car (default: 0.03).
   * @param {number} rayCount - The number of rays for the car's sensor (default: 5).
   * @param {number} raySpread - The spread angle of the car's sensor rays (default: Math.PI / 2).
   * @param {number} rayLength - The length of the car's sensor rays (default: 150).
   * @param {number[]} nnArch - The neural network architecture (default: [rayCount, 6, 4]).
   * @param {Function} activationFunction - The activation function for the neural network.
   */
  constructor(
    x,
    y,
    width,
    height,
    controlType,
    maxSpeed = 3,
    acceleration = 0.2,
    friction = 0.05,
    angularVel = 0.03,
    rayCount = 5,
    raySpread = Math.PI / 2,
    rayLength = 150,
    nnArch = [rayCount, 6, 4],
    activationFunction
  ) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.speed = 0;
    this.acceleration = acceleration;
    this.maxSpeed = maxSpeed;
    this.friction = friction;
    this.angle = 0;
    this.angularVel = angularVel;
    this.damaged = false;
    this.fitness = 0;
    this.activationFunction = activationFunction;

    this.useBrain = controlType == "AI";

    if (controlType != "DUMMY") {
      this.sensor = new Sensor(this, rayCount, rayLength, raySpread);
      this.brain = new NeuralNetwork(nnArch);
    }
    this.controls = new Controls(controlType);

    this.img = new Image();
    if (controlType == "DUMMY") {
      this.img.src = "dummy.png";
    } else {
      this.img.src = "tesla.png";
    }
  }

  /**
   * Update the car's state.
   * @param {Array} roadBorders - The array of road borders for collision detection.
   * @param {Array} traffic - The array of other cars for collision detection.
   */
  update(roadBorders, traffic) {
    if (!this.damaged) {
      this.#move();
      this.polygon = this.#createPolygon();
      this.damaged = this.#assessDamage(roadBorders, traffic);
    }
    if (this.sensor) {
      this.sensor.update(roadBorders, traffic);

      const offsets = this.sensor.readings.map(
        s => (s == null ? 0 : 1 - s.offset)
      );
      const outputs = NeuralNetwork.feedForward(
        offsets,
        this.brain,
        this.activationFunction
      );

      if (this.useBrain) {
        this.controls.forward = outputs[0];
        this.controls.left = outputs[1];
        this.controls.right = outputs[2];
        this.controls.reverse = outputs[3];
      }
    }
  }/**

Assess damage by checking for collisions with road borders and other cars.
@param {Array} roadBorders - The array of road borders for collision detection.
@param {Array} traffic - The array of other cars for collision detection.
@returns {boolean} - True if the car is damaged, false otherwise.
*/
  #assessDamage(roadBorders, traffic) {
    for (let i = 0; i < roadBorders.length; i++) {
      if (polysIntersect(this.polygon, roadBorders[i])) {
        return true;
      }
    }
    for (let i = 0; i < traffic.length; i++) {
      if (polysIntersect(this.polygon, traffic[i].polygon)) {
        return true;
      }
    }
    return false;
  }
  /**
  
  Create the polygon representing the car's shape.
  @returns {Array} - Array of points representing the car's polygon.
  */
  #createPolygon() {
    const points = [];
    const rad = Math.hypot(this.width, this.height) / 2;
    const alpha = Math.atan2(this.width, this.height);
    points.push({
      x: this.x - Math.sin(this.angle - alpha) * rad,
      y: this.y - Math.cos(this.angle - alpha) * rad
    });
    points.push({
      x: this.x - Math.sin(this.angle + alpha) * rad,
      y: this.y - Math.cos(this.angle + alpha) * rad
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
    });
    points.push({
      x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
      y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
    });
    return points;
  }
  /**
  
  Move the car based on its speed and controls.
  */
  #move() {
    if (this.controls.forward) {
      this.speed += this.acceleration;
    }
    if (this.controls.reverse) {
      this.speed -= this.acceleration;
    }
    if (this.speed > this.maxSpeed) {
      this.speed = this.maxSpeed;
    }
    if (this.speed < -this.maxSpeed / 2) {
      this.speed = -this.maxSpeed / 2;
    }

    if (this.speed > 0) {
      this.speed -= this.friction;
    }
    if (this.speed < 0) {
      this.speed += this.friction;
    }
    if (Math.abs(this.speed) < this.friction) {
      this.speed = 0;
    }

    if (this.speed !== 0) {
      const flip = this.speed > 0 ? 1 : -1;
      if (this.controls.left) {
        this.angle += this.angularVel * flip;
      }
      if (this.controls.right) {
        this.angle -= this.angularVel * flip;
      }
    }

    this.x -= Math.sin(this.angle) * this.speed;
    this.y -= Math.cos(this.angle) * this.speed;
  }

  /**
  
  Draw the car on the canvas.
  @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
  @param {boolean} drawSensor - Whether to draw the car's sensor.
  */
  draw(ctx, drawSensor = false) {
    if (this.sensor && drawSensor) {
      this.sensor.draw(ctx);
    }
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(-this.angle);
    if (this.damaged) {
      ctx.globalAlpha = 0.2;
    }
    ctx.drawImage(
      this.img,
      -this.width / 2,
      -this.height / 2,
      this.width,
      this.height
    );
    ctx.globalAlpha = 1;
    ctx.restore();
  }
}

export default Car;  