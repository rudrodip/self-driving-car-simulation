import Car from "@components/Car/Car";

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
  return traffic
};

export default generateTraffic