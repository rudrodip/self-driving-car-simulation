import { getRandomNNarch } from '@utils/utils'
import NeuralNetwork from '@components/NN/NeuralNetwork'

const generateGenomes = (n, rayCount) => {
  let genomes = []
    for (let i = 0; i < n; i++) {
      let nnArch = getRandomNNarch(rayCount)
      let nn = new NeuralNetwork(nnArch)

      genomes.push(nn)
    }
    return genomes
}

export default generateGenomes