import Car from "@components/Car/Car";

const generateGenes = (n, road, carWidth, carHeight, controlType, maxSpeed, acceleration, friction, angularVel, rayCount, rayLength, raySpread, nnArch, activationFunction) => {
  // initializing genes
  const genes = [];
  // let nnArch = getRandomNNarch(rayCount)
  for (let i = 1; i <= n; i++) {
    genes.push(new Car(road.getLaneCenter(1), 100, carWidth, carHeight, controlType, maxSpeed, acceleration, friction, angularVel, rayCount, raySpread, rayLength, nnArch, activationFunction));
  }
  return genes;
}

export default generateGenes