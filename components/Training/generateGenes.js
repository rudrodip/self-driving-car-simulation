import Car from "@components/Car/Car";

/**
 * Generate an array of genes (Car instances) for the genetic algorithm.
 * @param {number} n - The number of genes to generate.
 * @param {object} road - The road object providing lane information.
 * @param {number} carWidth - The width of the car.
 * @param {number} carHeight - The height of the car.
 * @param {string} controlType - The type of control for the car.
 * @param {number} maxSpeed - The maximum speed of the car.
 * @param {number} acceleration - The acceleration of the car.
 * @param {number} friction - The friction of the car.
 * @param {number} angularVel - The angular velocity of the car.
 * @param {number} rayCount - The number of sensor rays for the car.
 * @param {number} rayLength - The length of the sensor rays.
 * @param {number} raySpread - The spread angle of the sensor rays.
 * @param {Array} nnArch - The architecture of the neural network for AI-controlled cars.
 * @param {string} activationFunction - The activation function for the neural network.
 * @returns {Array} - The array of generated genes (Car instances).
 */
const generateGenes = (
  n,
  road,
  carWidth,
  carHeight,
  controlType,
  maxSpeed,
  acceleration,
  friction,
  angularVel,
  rayCount,
  rayLength,
  raySpread,
  nnArch,
  activationFunction
) => {
  const genes = [];
  
  for (let i = 1; i <= n; i++) {
    genes.push(
      new Car(
        road.getLaneCenter(1),
        100,
        carWidth,
        carHeight,
        controlType,
        maxSpeed,
        acceleration,
        friction,
        angularVel,
        rayCount,
        raySpread,
        rayLength,
        nnArch,
        activationFunction
      )
    );
  }
  
  return genes;
};

export default generateGenes;
