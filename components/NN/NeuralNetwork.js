import { lerp } from "@utils/utils";

class NeuralNetwork {
  constructor(neuronCounts) {
    this.levels = [];
    this.arch = neuronCounts;
    for (let i = 0; i < neuronCounts.length - 1; i++) {
      this.levels.push(new Level(
        neuronCounts[i], neuronCounts[i + 1]
      ));
    }
  }

  static feedForward(givenInputs, network, activationFunction) {
    let outputs = Level.feedForward(
      givenInputs, network.levels[0], false, activationFunction);
    for (let i = 1; i < network.levels.length; i++) {
      let isOutputLayer = (i === network.levels.length - 1)
      outputs = Level.feedForward(
        outputs, network.levels[i], isOutputLayer, activationFunction);
    }
    return outputs;
  }

  static mutate(network, amount = 1) {
    network.levels.forEach(level => {
      for (let i = 0; i < level.biases.length; i++) {
        level.biases[i] = lerp(
          level.biases[i],
          Math.random() * 2 - 1,
          amount
        )
      }
      for (let i = 0; i < level.weights.length; i++) {
        for (let j = 0; j < level.weights[i].length; j++) {
          level.weights[i][j] = lerp(
            level.weights[i][j],
            Math.random() * 2 - 1,
            amount
          )
        }
      }
    });
  }
}

class Level {
  constructor(inputCount, outputCount) {
    this.inputs = new Array(inputCount);
    this.outputs = new Array(outputCount);
    this.biases = new Array(outputCount);

    this.weights = [];
    for (let i = 0; i < inputCount; i++) {
      this.weights[i] = new Array(outputCount);
    }

    Level.#randomize(this);
  }

  static #randomize(level) {
    for (let i = 0; i < level.inputs.length; i++) {
      for (let j = 0; j < level.outputs.length; j++) {
        level.weights[i][j] = Math.random() * 2 - 1;
      }
    }

    for (let i = 0; i < level.biases.length; i++) {
      level.biases[i] = Math.random() * 2 - 1;
    }
  }

  static sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  static tanh(x) {
    return Math.tanh(x);
  }

  static relu(x) {
    return Math.max(0, x);
  }

  static binaryActivation(sum, bias) {
    return sum > bias ? 1 : 0;
  }

  static feedForward(givenInputs, level, isOutputLayer, activationFunction) {
    for (let i = 0; i < level.inputs.length; i++) {
      level.inputs[i] = givenInputs[i];
    }

    for (let i = 0; i < level.outputs.length; i++) {
      let sum = 0
      for (let j = 0; j < level.inputs.length; j++) {
        sum += level.inputs[j] * level.weights[j][i];
      }

      if (isOutputLayer) {
        level.outputs[i] = this.binaryActivation(sum, level.biases[i])
      } else {
        // level.outputs[i] = this.tanh(sum + level.biases[i])
        switch (activationFunction) {
          case 'Sigmoid':
            level.outputs[i] = this.sigmoid(sum + level.biases[i]);
            break;
          case 'Tanh':
            level.outputs[i] = this.tanh(sum + level.biases[i]);
            break;
          case 'ReLU':
            level.outputs[i] = this.relu(sum + level.biases[i]);
            break;
          default:
            // Default to binary activation if no valid activation function specified
            level.outputs[i] = this.binaryActivation(sum, level.biases[i]);
            break;
        }
      }

      // if (sum > level.biases[i]) {
      //   level.outputs[i] = 1;
      // } else {
      //   level.outputs[i] = 0;
      // }
    }

    return level.outputs;
  }
}

export default NeuralNetwork