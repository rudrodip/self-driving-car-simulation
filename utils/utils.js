function lerp(A, B, t) {
  // Linearly interpolates between points A and B based on parameter t
  return A + (B - A) * t;
}

function getIntersection(A, B, C, D) {
  // Calculates the intersection point between line segment AB and line segment CD
  const tTop = (D.x - C.x) * (A.y - C.y) - (D.y - C.y) * (A.x - C.x);
  const uTop = (C.y - A.y) * (A.x - B.x) - (C.x - A.x) * (A.y - B.y);
  const bottom = (D.y - C.y) * (B.x - A.x) - (D.x - C.x) * (B.y - A.y);

  if (bottom != 0) {
    // Check if the lines are not parallel
    const t = tTop / bottom;
    const u = uTop / bottom;
    if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
      // Check if the intersection point is within the line segments
      return {
        x: lerp(A.x, B.x, t),
        y: lerp(A.y, B.y, t),
        offset: t
      };
    }
  }

  // Return null if there is no intersection or the lines are parallel
  return null;
}

function polysIntersect(poly1, poly2) {
  // Checks if two polygons intersect by checking the intersections of their edges
  for (let i = 0; i < poly1.length; i++) {
    for (let j = 0; j < poly2.length; j++) {
      const touch = getIntersection(
        poly1[i],
        poly1[(i + 1) % poly1.length],
        poly2[j],
        poly2[(j + 1) % poly2.length]
      );
      if (touch) {
        // If an intersection is found, return true
        return true;
      }
    }
  }
  // Return false if no intersections are found
  return false;
}

function getRGBA(value) {
  // Converts a numerical value to an RGBA color string
  const alpha = Math.abs(value);
  const R = value < 0 ? 0 : 255;
  const G = 100;
  const B = value > 0 ? 0 : 255;
  return "rgba(" + R + "," + G + "," + B + "," + alpha + ")";
}

function getRandomColor() {
  // Generates a random HSL color string
  const hue = 290 + Math.random() * 260;
  return "hsl(" + hue + ", 100%, 60%)";
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomNNarch(inputNodes, outputNodes = 4){ // by default the output node is 4, [left, right, forward, reverse]
  let numOfHiddenLayers = getRandomNumber(1, 3)
  let maxNodes = 16

  let nnArch = [inputNodes]
  for (let i = 0; i < numOfHiddenLayers; i++) {
    let numOfNodes = getRandomNumber(2, maxNodes) // minimum 2 nodes
    nnArch.push(numOfNodes)
  }
  nnArch.push(outputNodes)
  return nnArch
}

export { lerp, getIntersection, polysIntersect, getRGBA, getRandomColor, getRandomNumber, getRandomNNarch }