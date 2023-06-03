import { getRandomNNarch } from '@utils/utils';
import NeuralNetwork from '@components/NN/NeuralNetwork';

/**
 * Generate an array of genomes (NeuralNetwork instances) for the genetic algorithm.
 * @param {number} n - The number of genomes to generate.
 * @param {number} rayCount - The number of sensor rays for the cars.
 * @returns {Array} - The array of generated genomes (NeuralNetwork instances).
 */
const generateGenomes = (n, rayCount) => {
  let genomes = [];

  for (let i = 0; i < n; i++) {
    let nnArch = getRandomNNarch(rayCount);
    let nn = new NeuralNetwork(nnArch);

    genomes.push(nn);
  }

  return genomes;
};

export default generateGenomes;
