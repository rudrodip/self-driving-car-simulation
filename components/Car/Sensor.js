import { lerp, getIntersection } from "@utils/utils";

/**
 * Sensor class represents the sensor system of the car.
 */
class Sensor {
  /**
   * Create a new Sensor instance.
   * @param {Car} car - The car object associated with the sensor.
   * @param {number} rayCount - The number of rays to cast.
   * @param {number} rayLength - The length of each ray.
   * @param {number} raySpread - The angular spread of the rays.
   */
  constructor(car, rayCount, rayLength, raySpread) {
    this.car = car;
    this.rayCount = rayCount;
    this.rayLength = rayLength;
    this.raySpread = raySpread;

    this.rays = [];
    this.readings = [];
  }

  /**
   * Update the sensor readings based on the car's position and environment.
   * @param {Array} roadBorders - An array of road border polygons.
   * @param {Array} traffic - An array of traffic car objects.
   */
  update(roadBorders, traffic) {
    this.#castRays();
    this.readings = [];
    for (let i = 0; i < this.rays.length; i++) {
      this.readings.push(
        this.#getReading(
          this.rays[i],
          roadBorders,
          traffic
        )
      );
    }
  }

  /**
   * Get the closest reading from a ray intersection with road borders and traffic cars.
   * @param {Array} ray - The ray represented by two points (start and end).
   * @param {Array} roadBorders - An array of road border polygons.
   * @param {Array} traffic - An array of traffic car objects.
   * @returns {Object|null} - The closest reading object or null if no intersection.
   */
  #getReading(ray, roadBorders, traffic) {
    let touches = [];

    for (let i = 0; i < roadBorders.length; i++) {
      const touch = getIntersection(
        ray[0],
        ray[1],
        roadBorders[i][0],
        roadBorders[i][1]
      );
      if (touch) {
        touches.push(touch);
      }
    }

    for (let i = 0; i < traffic.length; i++) {
      const poly = traffic[i].polygon;
      for (let j = 0; j < poly.length; j++) {
        const value = getIntersection(
          ray[0],
          ray[1],
          poly[j],
          poly[(j + 1) % poly.length]
        );
        if (value) {
          touches.push(value);
        }
      }
    }

    if (touches.length === 0) {
      return null;
    } else {
      const offsets = touches.map(e => e.offset);
      const minOffset = Math.min(...offsets);
      return touches.find(e => e.offset === minOffset);
    }
  }

  /**
   * Cast rays from the car's position to detect intersections with the environment.
   * Private method.
   */
  #castRays() {
    this.rays = [];
    for (let i = 0; i < this.rayCount; i++) {
      const rayAngle =
        lerp(
          this.raySpread / 2,
          -this.raySpread / 2,
          this.rayCount === 1 ? 0.5 : i / (this.rayCount - 1)
        ) + this.car.angle;

      const start = { x: this.car.x, y: this.car.y };
      const end = {
        x: this.car.x -
          Math.sin(rayAngle) * this.rayLength,
        y: this.car.y -
          Math.cos(rayAngle) * this.rayLength
      };
      this.rays.push([start, end]);
    }
  }

  /**
   * Draw the sensor rays and their readings on a canvas context.
   * @param {CanvasRenderingContext2D} ctx - The canvas context to draw on.
   */
  draw(ctx) {
    for (let i = 0; i < this.rayCount; i++) {
      let end = this.rays[i][1];
      if (this.readings[i]) {
        end = this.readings[i];
      }

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "blue";
      ctx.moveTo(this.rays[i][0].x, this.rays[i][0].y);
      ctx.lineTo(end.x, end.y);
      ctx.shadowColor = "rgba(0, 0, 255, 0.8)";
      ctx.shadowBlur = 10;
      ctx.stroke();

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "red";
      ctx.moveTo(this.rays[i][1].x, this.rays[i][1].y);
      ctx.lineTo(end.x, end.y);
      ctx.shadowColor = "rgba(255, 0, 0, 0.8)";
      ctx.shadowBlur = 10;
      ctx.stroke();
    }
  }
}

export default Sensor;
