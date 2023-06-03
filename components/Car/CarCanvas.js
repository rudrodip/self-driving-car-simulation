'use client'

import { useRef, useEffect, useState } from "react";
import Road from "@components/Road/Road";
import Visualizer from "@components/NN/NNvisualizer";
import RangeSlider from '@components/form/rangeSlider'
import Modal from "@components/Modal";

import generateTraffic from "@components/Training/generateTraffic";
import generateGenes from "@components/Training/generateGenes";
import generateGenomes from "@components/Training/generateGenomes";
import NeuralNetwork from "@components/NN/NeuralNetwork";

const CarCanvas = ({ width, height }) => {
  const carCanvasRef = useRef(null);
  const nnCanvasRef = useRef(null);
  const carCtx = useRef(null);
  const nnCtx = useRef(null);

  // variables
  const [modalOpen, setModalOpen] = useState(false)
  const [mode, setMode] = useState('Self Control')
  const [run, setRun] = useState(false)
  const [showSensor, setShowSensor] = useState(true)
  const [showNN, setShowNN] = useState(true)
  const [activationFunction, setActivationFunction] = useState('Tanh')
  const activationFunctions = ['Binary Activation', 'Tanh', 'ReLU', 'Sigmoid']

  let genomeExtinct = false
  let fitnessThreshold = 200
  let frameCounterThreshold = 100
  let gotMaxFitness = false
  let trainingRunning = false

  // training parameters
  const [gen, setGen] = useState(1)
  const [genomeCount, setGenomeCount] = useState(5)
  const [populationCount, setPopulationCount] = useState(5)
  const [geneCount, setGeneCount] = useState(2500)
  const [varianceFactor, setVarianceFactor] = useState(20)
  const [currentGenome, setCurrentGenome] = useState(0)
  const [currentPopulation, setCurrentPopulation] = useState(0)

  const [score, setScore] = useState(0);
  const [maxFitness, setMaxFitness] = useState(-Infinity)

  const CAR_WIDTH = 50;
  const CAR_HEIGHT = 100;

  const road = useRef(null);
  const cars = useRef([]);
  const bestCar = useRef(null);
  const traffic = useRef([]);

  const [carConfig, setCarConfig] = useState({
    rayCount: 10,
    raySpread: Math.PI / 2,
    rayLength: 220,
    maxSpeed: 5,
    acceleration: 0.2,
    friction: 0.05,
    angularVel: 0.02,
    brain: null
  });

  const handleSaveCarConfig = () => {
    localStorage.setItem("carConfig",
      JSON.stringify(carConfig));
  }

  const handleRemoveCarConfig = () => {
    localStorage.removeItem("carConfig");
  }

  const handleSaveTrainingConfig = () => {
    let trainingConfig = {
      populationCount: populationCount,
      genomeCount: genomeCount,
      geneCount: geneCount,
      varianceFactor: varianceFactor
    }
    localStorage.setItem("trainingConfig", JSON.stringify(trainingConfig))
  }

  const handleRemoveTrainingConfig = () => {
    localStorage.removeItem("trainingConfig");
  }

  const initializeCanvas = (mode) => {
    const nnCanvas = nnCanvasRef.current;
    nnCanvas.width = 500;
    nnCanvas.height = height;

    const carCanvas = carCanvasRef.current;
    carCanvas.width = width;
    carCanvas.height = height;

    road.current = new Road(carCanvas.width / 2, carCanvas.width * 0.9);

    if (mode !== 'Training') {
      let controlType;
      let N;
      if (mode === 'Self Control') {
        controlType = 'KEYS';
        N = 1;
      } else if (mode === 'Evaluation') {
        controlType = 'AI';
        N = 500;
      }

      let nnArch = [carConfig.rayCount, 6, 4];
      let savedGenome = localStorage.getItem('bestGenome');
      if (savedGenome) {
        savedGenome = JSON.parse(savedGenome)
        nnArch = savedGenome['arch']
      }

      cars.current = generateGenes(
        N,
        road.current,
        CAR_WIDTH,
        CAR_HEIGHT,
        controlType,
        carConfig.maxSpeed,
        carConfig.acceleration,
        carConfig.friction,
        carConfig.angularVel,
        carConfig.rayCount,
        carConfig.rayLength,
        carConfig.raySpread,
        nnArch,
        activationFunction
      )

      bestCar.current = cars.current[0];
      // savedGenome ? bestCar.current.brain = savedGenome : ''
      if (savedGenome) {
        for (let i = 0; i < cars.current.length; i++) {
          cars.current[i].brain = JSON.parse(JSON.stringify(savedGenome));
          if (i != 0) {
            NeuralNetwork.mutate(cars.current[i].brain, varianceFactor / 100);
          }
        }
      }
    }

    traffic.current = generateTraffic(5, CAR_WIDTH, CAR_HEIGHT, road);
  };

  const getFitness = (traffic, gene) => {
    let deltaY = Math.min(...traffic.map((car) => car.y - gene.y));
    return deltaY
  }

  let prev = 0;
  let equalFramesCounter = 0;
  let animationFrameId;
  const render = (time) => {
    for (let i = 0; i < traffic.current.length; i++) {
      traffic.current[i].update(road.current.borders, []);
    }

    for (let i = 0; i < cars.current.length; i++) {
      cars.current[i].update(road.current.borders, traffic.current);
    }

    cars.current.map(c => !c.damaged ? c.fitness = getFitness(traffic.current, c) : '') // if not damanged update the fitness functions and move on
    cars.current = cars.current.sort((a, b) => (a.fitness < b.fitness) ? 1 : -1)
    // bestCar.current = getBestGene(cars.current)
    bestCar.current = cars.current[0]
    let deltaY = bestCar.current.fitness

    carCanvasRef.current.height = window.innerHeight;
    nnCanvasRef.current.height = window.innerHeight;

    carCtx.current.save();
    carCtx.current.translate(0, -bestCar.current.y + carCanvasRef.current.height * 0.7);

    road.current.draw(carCtx.current);

    for (let i = 0; i < traffic.current.length; i++) {
      traffic.current[i].draw(carCtx.current);
    }

    carCtx.current.globalAlpha = 0.2;

    for (let i = 0; i < cars.current.length; i++) {
      cars.current[i].draw(carCtx.current);
    }

    carCtx.current.globalAlpha = 1;
    bestCar.current.draw(carCtx.current, showSensor);

    carCtx.current.restore();
    nnCtx.current.lineDashOffset = -time / 50;

    showNN ? Visualizer.drawNetwork(nnCtx.current, bestCar.current.brain) : '';

    setScore(parseInt(deltaY));

    if (prev > fitnessThreshold) gotMaxFitness = true
    if (prev === deltaY) {
      equalFramesCounter++;
      if (equalFramesCounter === frameCounterThreshold) {
        genomeExtinct = true
      }
    } else {
      equalFramesCounter = 0; // Reset the counter if prev and deltaY are not equal
    }

    prev = deltaY

    if (run || trainingRunning) {
      animationFrameId = window.requestAnimationFrame(render);
    }

  };

  const startAnimation = () => {
    animationFrameId = window.requestAnimationFrame(render);
  };

  const stopAnimation = () => {
    window.cancelAnimationFrame(animationFrameId);
  };

  const training = () => {
    // Initializing genomes
    let genomes = generateGenomes(genomeCount, carConfig.rayCount);
    let currentIndex = 0;
    const bestGenes = [];
    trainingRunning = true;
    let generationCount = 0; // Track the number of generations
    setCurrentPopulation(0)
    const maxGenerationCount = populationCount; // Maximum number of generations

    const runGeneration = () => {
      const runPopulation = () => {
        if (currentIndex < genomes.length) {
          const currentGenome = genomes[currentIndex];
          let bestGene = bestGenes.sort((a, b) =>
            a.fitness < b.fitness ? 1 : -1
          )[0];
          let genes = generateGenes(
            geneCount,
            road.current,
            CAR_WIDTH,
            CAR_HEIGHT,
            "AI",
            carConfig.maxSpeed,
            carConfig.acceleration,
            carConfig.friction,
            carConfig.angularVel,
            carConfig.rayCount,
            carConfig.rayLength,
            carConfig.raySpread,
            generationCount > 0 ? bestGene.brain.arch : currentGenome.arch,
            activationFunction
          );

          if (generationCount > 0) {
            for (let i = 0; i < genes.length; i++) {
              genes[i].brain = JSON.parse(JSON.stringify(bestGene.brain));
              if (i != 0) {
                NeuralNetwork.mutate(genes[i].brain, varianceFactor / 100);
              }
            }
          }

          initializeCanvas('Training');
          cars.current = genes;
          bestCar.current = cars.current[0];

          if (generationCount > 0) bestCar.current = bestGene

          startAnimation();

          const checkExtinct = () => {
            if (genomeExtinct || gotMaxFitness) {
              stopAnimation();
              currentIndex++;
              genomeExtinct = false;
              bestGenes.push(bestCar.current);
              runPopulation();
            } else {
              setTimeout(checkExtinct, 100);
            }
          };

          checkExtinct();
          setCurrentGenome(currentIndex + 1);
        } else {
          console.log("Population completed");
          generationCount++;
          setCurrentPopulation(generationCount + 1);

          if (generationCount < maxGenerationCount) {
            // Continue to the next generation
            currentIndex = 0;
            runGeneration(); // Recursive call to run the next generation
          } else {
            console.log("Training completed");
            trainingRunning = false;
            setModalOpen(true);
            let bestGene = bestGenes.sort((a, b) =>
              a.fitness < b.fitness ? 1 : -1
            )[0];
            setMaxFitness(bestGene.fitness);
            localStorage.setItem("bestGenome", JSON.stringify(bestGene.brain));
          }
        }
      };

      runPopulation();
    };

    runGeneration();
  }

  const handleChange = (e) => {
    if (e.target.name == 'rayCount') {
      setCarConfig({ ...carConfig, rayCount: parseInt(e.target.value) })
    }
    else if (e.target.name == 'rayLength') {
      setCarConfig({ ...carConfig, rayLength: parseInt(e.target.value) })
    }
    else if (e.target.name == 'raySpread') {
      setCarConfig({ ...carConfig, raySpread: (parseInt(e.target.value) * Math.PI) / 180 })
    }
    else if (e.target.name == "maxSpeed") {
      setCarConfig({ ...carConfig, maxSpeed: parseInt(e.target.value) })
    }
    else if (e.target.name == "acceleration") {
      setCarConfig({ ...carConfig, acceleration: parseFloat(e.target.value) })
    }
    else if (e.target.name == "friction") {
      setCarConfig({ ...carConfig, friction: parseFloat(e.target.value) })
    }
    else if (e.target.name == "angularVel") {
      setCarConfig({ ...carConfig, angularVel: parseFloat(e.target.value) })
    }
    else if (e.target.name == "populationCount") {
      setPopulationCount(parseInt(e.target.value))
    }
    else if (e.target.name == "genomeCount") {
      setGenomeCount(parseInt(e.target.value))
    }
    else if (e.target.name == "geneCount") {
      setGeneCount(parseInt(e.target.value))
    }
    else if (e.target.name == "activationFunction") {
      setActivationFunction(e.target.value)
    }
    else if (e.target.name == "varianceFactor") {
      setVarianceFactor(parseFloat(e.target.value))
    }
  }

  const handleModeChange = (event) => {
    setMode(event.target.value);
  };

  useEffect(() => {
    const carCanvas = carCanvasRef.current;
    carCtx.current = carCanvas.getContext('2d');

    const nnCanvas = nnCanvasRef.current;
    nnCtx.current = nnCanvas.getContext('2d');

    let savedCarConfig = localStorage.getItem('carConfig')
    let trainingConfig = localStorage.getItem('trainingConfig')
    if (savedCarConfig) setCarConfig(JSON.parse(savedCarConfig))
    if (trainingConfig) {
      trainingConfig = JSON.parse(trainingConfig)
      setPopulationCount(trainingConfig['populationCount'])
      setGeneCount(trainingConfig['geneCount'])
      setGenomeCount(trainingConfig['genomeCount'])
      setVarianceFactor(trainingConfig['varianceFactor'])
    }

    initializeCanvas(mode);
    startAnimation()

    return () => {
      stopAnimation();
    };
  }, [mode, run]);

  const trainingLog =
    `Generation: ${gen}
    Population count: ${populationCount}
    Genome count: ${genomeCount * populationCount}
    Gene count: ${geneCount * genomeCount * populationCount}
    Max fitness: ${maxFitness}
    Activation function: ${activationFunction}

     -- Genome saved --
    `

  return (
    <div className="flex justify-evenly flex-wrap">
      <Modal isOpen={modalOpen} closeModal={() => setModalOpen(false)} logs={trainingLog} />
      <div className="">
        <div className="w-full border-2 border-gray-300 shadow-lg bg-gray-200 rounded-lg mt-16 mb-4 p-5">
          <h3 className="mb-4 font-semibold text-gray-900">Mode: {mode}</h3>
          <ul className="items-center w-full text-sm font-medium text-gray-900 bg-white border border-gray-200 rounded-lg sm:flex">
            <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r">
              <div className="flex items-center pl-3">
                <input
                  type="radio"
                  name="mode"
                  value="Training"
                  checked={mode === 'Training'}
                  onChange={handleModeChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <label className="w-full py-3 ml-2 text-sm font-medium text-gray-900">Training</label>
              </div>
            </li>
            <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r">
              <div className="flex items-center pl-3">
                <input
                  type="radio"
                  name="mode"
                  value="Evaluation"
                  checked={mode === 'Evaluation'}
                  onChange={handleModeChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <label className="w-full py-3 ml-2 text-sm font-medium text-gray-900">Evaluation</label>
              </div>
            </li>
            <li className="w-full border-b border-gray-200 sm:border-b-0 sm:border-r">
              <div className="flex items-center pl-3">
                <input
                  type="radio"
                  name="mode"
                  value="Self Control"
                  checked={mode === 'Self Control'}
                  onChange={handleModeChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500"
                />
                <label className="w-full py-3 ml-2 text-sm font-medium text-gray-900">Self Control</label>
              </div>
            </li>
          </ul>
          <div className="mt-3 flex flex-wrap justify-evenly">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showSensor}
                onChange={() => setShowSensor(!showSensor)}
                className="form-checkbox text-indigo-600 h-5 w-5"
              />
              <span className="text-gray-700 mx-2">Show Sensor</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={showNN}
                onChange={() => setShowNN(!showNN)}
                className="form-checkbox text-indigo-600 h-5 w-5"
              />
              <span className="text-gray-700 mx-2">Show NN</span>
            </label>
          </div>
          <button className={`${!run ? 'bg-blue-500' : 'bg-red-500'} text-white font-bold py-2 px-4 border rounded m-2`} onClick={() => setRun(!run)}>
            {run ? 'Stop' : 'Start'}
          </button>

          <button className={`bg-blue-500 text-white font-bold py-2 px-4 border rounded m-2`} onClick={() => setModalOpen(true)}>
            Show Logs
          </button>
          <div>
            <label className="text-black mx-2">Activation Function</label>
            <select
              name="activationFunction"
              className="block w-full px-4 py-2 mt-2 rounded-md bg-white text-gray-700"
              onChange={handleChange}
              value={activationFunction}
            >
              {
                activationFunctions.map((option, index) => {
                  return (
                    <option key={index}>{option}</option>
                  )
                })
              }
            </select>
          </div>

        </div>
        <div className="w-full border-2 border-gray-300 shadow-lg bg-gray-200 rounded-lg mt-16 mb-4 p-5">
          <p className="blue_gradient text-xl">Stats</p>
          <div className="grid grid-cols-1 gap-6 mt-4 sm:grid-cols-3 my-5">
            <p>Gen: {gen}</p>
            <p>Population Count: {populationCount}</p>
            <p>Genomes: {genomeCount}</p>
            <p>Gene Count: {geneCount}</p>
            <p>Fitness: {score}</p>
          </div>
          <p>Current Population simulating: {currentPopulation}</p>
          <p>Current Genome simulating: {currentGenome}</p>
        </div>
        <div className="w-full border-2 border-gray-300 shadow-lg bg-gray-200 rounded-lg mt-16 mb-4 p-5">
          <p className="blue_gradient text-xl">Training settings</p>
          <div className="flex flex-wrap m-2 p-2 justify-between">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border rounded" onClick={handleSaveTrainingConfig}>
              Save config
            </button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 border rounded" onClick={handleRemoveTrainingConfig}>
              Remove
            </button>
            <button className={`bg-blue-500 text-white font-bold py-2 px-4 border rounded`} onClick={training}>
              Train
            </button>
          </div>
          <div className='grid grid-cols-1 gap-6 mt-4 sm:grid-cols-3 my-5'>
            <RangeSlider
              label="Population Count"
              name="populationCount"
              handleChange={handleChange}
              value={populationCount}
              min={1}
              max={20}
              step={1}
            />
            <RangeSlider
              label="Genome Count"
              name="genomeCount"
              handleChange={handleChange}
              value={genomeCount}
              min={1}
              max={20}
              step={1}
            />
            <RangeSlider
              label="Gene Count"
              name="geneCount"
              handleChange={handleChange}
              value={geneCount}
              min={1}
              max={20000}
              step={100}
            />
            <RangeSlider
              label="Mutation Variance"
              name="varianceFactor"
              handleChange={handleChange}
              value={varianceFactor}
              min={1}
              max={100}
              step={1}
            />
          </div>
        </div>
        <div className="w-full border-2 border-gray-300 shadow-lg bg-gray-200 rounded-lg mt-16 mb-4 p-5">
          <p className="blue_gradient text-xl">Car configuration settings</p>
          <div className="flex flex-wrap m-2 p-2 justify-between">
            <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 border rounded" onClick={handleSaveCarConfig}>
              Save config
            </button>
            <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 border rounded" onClick={handleRemoveCarConfig}>
              Remove
            </button>
          </div>
          <div className='grid grid-cols-1 gap-6 mt-4 sm:grid-cols-3 my-5'>
            <RangeSlider
              label="Ray Count"
              name="rayCount"
              handleChange={handleChange}
              value={carConfig.rayCount}
              min={1}
              max={100}
              step={1}
            />
            <RangeSlider
              label="Ray Length"
              name="rayLength"
              handleChange={handleChange}
              value={carConfig.rayLength}
              min={10}
              max={400}
              step={10}
            />
            <RangeSlider
              label="Ray Spread"
              name="raySpread"
              handleChange={handleChange}
              value={parseInt((carConfig.raySpread * 180) / Math.PI)}
              min={1}
              max={360}
              step={1}
            />
            <RangeSlider
              label="Max Speed"
              name="maxSpeed"
              handleChange={handleChange}
              value={carConfig.maxSpeed}
              min={1}
              max={5}
              step={0.1}
            />
            <RangeSlider
              label="Acceleration"
              name="acceleration"
              handleChange={handleChange}
              value={carConfig.acceleration}
              min={0.1}
              max={0.5}
              step={0.01}
            />
            <RangeSlider
              label="Friction"
              name="friction"
              handleChange={handleChange}
              value={carConfig.friction}
              min={0.01}
              max={0.1}
              step={0.01}
            />
            <RangeSlider
              label="Angular Velocity"
              name="angularVel"
              handleChange={handleChange}
              value={carConfig.angularVel}
              min={0.01}
              max={0.1}
              step={0.01}
            />
          </div>
        </div>
      </div>
      <div className="flex justify-center flex-wrap">
        <div>
          <canvas
            id="carCanvas"
            ref={carCanvasRef}
            className="mx-4 mt-16"
          />
        </div>
        <div>
          <canvas
            id="nnCanvas"
            ref={nnCanvasRef}
            className="mx-4 mt-16"
          />
        </div>
      </div>
    </div>
  )
}

export default CarCanvas