import Car from "@components/Car/Car";

/**
 * Generate an array of dummy traffic cars for the road.
 * @param {number} n - The number of dummy traffic cars to generate.
 * @param {number} carWidth - The width of the traffic cars.
 * @param {number} carHeight - The height of the traffic cars.
 * @param {object} road - The road object containing the lane information.
 * @param {number} laneCount - The number of lanes on the road.
 * @returns {Array} - The array of generated dummy traffic cars.
 */
const generateTraffic = (n, carWidth, carHeight, road, laneCount = 3) => {
  const traffic = [
    new Car(road.current.getLaneCenter(1), -100, carWidth, carHeight, 'DUMMY', 2),
    new Car(road.current.getLaneCenter(0), -300, carWidth, carHeight, 'DUMMY', 2),
    new Car(road.current.getLaneCenter(2), -300, carWidth, carHeight, 'DUMMY', 2),
    new Car(road.current.getLaneCenter(0), -550, carWidth, carHeight, 'DUMMY', 2),
    new Car(road.current.getLaneCenter(1), -550, carWidth, carHeight, 'DUMMY', 2),
    new Car(road.current.getLaneCenter(1), -850, carWidth, carHeight, 'DUMMY', 2),
    new Car(road.current.getLaneCenter(2), -850, carWidth, carHeight, 'DUMMY', 2),
  ];
  return traffic;
};

export default generateTraffic;
