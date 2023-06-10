import Two from 'two.js';
import './index.css';

const two = new Two({
  fullscreen: true,
  autostart: true,
}).appendTo(document.getElementById('root')!);

const scale = two.height / 6;

const feta = (1 + Math.sqrt(5)) / 2;

const vertexes = [
  [-1, -1, -1], //0
  [-1, -1, 1], //1
  [-1, 1, -1], //2
  [-1, 1, 1], //3
  [1, -1, -1], //4
  [1, -1, 1], //5
  [1, 1, -1], //6
  [1, 1, 1], //7
  [0, -feta, -1 / feta], //8
  [0, -feta, 1 / feta], //9
  [0, feta, -1 / feta], //10
  [0, feta, 1 / feta], //11
  [-1 / feta, 0, -feta], //12
  [-1 / feta, 0, feta], //13
  [1 / feta, 0, -feta], //14
  [1 / feta, 0, feta], //15
  [-feta, -1 / feta, 0], //16
  [-feta, 1 / feta, 0], //17
  [feta, -1 / feta, 0], //18
  [feta, 1 / feta, 0], //19
];

function multiplyMatrices(a: number[][], b: number[][]) {
  const aNumRows = a.length,
    aNumCols = a[0].length,
    bNumRows = b.length,
    bNumCols = b[0].length,
    m = new Array<number[]>(aNumRows); // initialize array of rows
  for (let r = 0; r < aNumRows; ++r) {
    m[r] = new Array(bNumCols); // initialize the current row
    for (let c = 0; c < bNumCols; ++c) {
      m[r][c] = 0; // initialize the current cell
      for (let i = 0; i < aNumCols; ++i) {
        m[r][c] += a[r][i] * b[i][c];
      }
    }
  }
  return m;
}

function rotateCoordinateAroundCenter(x: number, y: number, z: number) {
  const rotation = (Date.now() / 1000) % 360;
  const centerPoint = [0, 1, 0];
  const uX = centerPoint[0];
  const uY = centerPoint[1];
  const uZ = centerPoint[2];
  const rotationMatrix = [
    [
      Math.cos(rotation) + uX * uX * (1 - Math.cos(rotation)),
      uX * uY * (1 - Math.cos(rotation)) - uZ * Math.sin(rotation),
      uX * uZ * (1 - Math.cos(rotation)) + uY * Math.sin(rotation),
    ],
    [
      uY * uX * (1 - Math.cos(rotation)) + uZ * Math.sin(rotation),
      Math.cos(rotation) + uY * uY * (1 - Math.cos(rotation)),
      uY * uZ * (1 - Math.cos(rotation)) - uX * Math.sin(rotation),
    ],
    [
      uZ * uX * (1 - Math.cos(rotation)) - uY * Math.sin(rotation),
      uZ * uY * (1 - Math.cos(rotation)) + uX * Math.sin(rotation),
      Math.cos(rotation) + uZ * uZ * (1 - Math.cos(rotation)),
    ],
  ];
  const coordinate = [[x], [y], [z]];
  return multiplyMatrices(rotationMatrix, coordinate).map((x) => x[0]);
}

function translateCoordinate(x: number, y: number, z: number) {
  const amount = 12;
  const dateTranslation = ((Date.now() / 1000) % amount) - amount / 2;
  let usedTranslation = dateTranslation;
  if (dateTranslation > amount / 4) {
    usedTranslation = amount / 2 - dateTranslation;
  } else if (dateTranslation < -amount / 4) {
    usedTranslation = -amount / 2 - dateTranslation;
  }
  const translationMatrix = [
    [1, 0, 0, usedTranslation],
    [0, 1, 0, 0],
    [0, 0, 1, 0],
    [0, 0, 0, 1],
  ];
  const coordinate = [[x], [y], [z], [1]];
  return multiplyMatrices(translationMatrix, coordinate).map((x) => x[0]);
}

function scaleCoordinates(x: number, y: number, z: number) {
  const amount = 12;
  const scaleFactor = 0.2;
  const scaleOffset = 0.4;
  const dateScale = (Date.now() / 1000) % amount;
  let usedScale = dateScale;
  if (dateScale > amount / 2) {
    usedScale = amount - dateScale;
  } else {
    usedScale = dateScale;
  }

  const scaleMatrix = [
    [usedScale * scaleFactor + scaleOffset, 0, 0],
    [0, usedScale * scaleFactor + scaleOffset, 0],
    [0, 0, usedScale * scaleFactor + scaleOffset],
  ];
  const coordinate = [[x], [y], [z]];
  return multiplyMatrices(scaleMatrix, coordinate).map((x) => x[0]);
}

function getDodecahedronFaceCoordinates() {
  const rotatedVertices = vertexes.map((vertex) => rotateCoordinateAroundCenter(vertex[0], vertex[1], vertex[2]));
  const translatedVertices = rotatedVertices.map((vertex) => translateCoordinate(vertex[0], vertex[1], vertex[2]));
  const finalVertices = translatedVertices.map((vertex) => scaleCoordinates(vertex[0], vertex[1], vertex[2]));

  return [
    [finalVertices[6], finalVertices[19], finalVertices[7], finalVertices[11], finalVertices[10]],
    [finalVertices[1], finalVertices[9], finalVertices[8], finalVertices[0], finalVertices[16]],
    [finalVertices[4], finalVertices[18], finalVertices[5], finalVertices[9], finalVertices[8]],
    [finalVertices[2], finalVertices[17], finalVertices[3], finalVertices[11], finalVertices[10]],
    [finalVertices[3], finalVertices[11], finalVertices[7], finalVertices[15], finalVertices[13]],
    [finalVertices[2], finalVertices[10], finalVertices[6], finalVertices[14], finalVertices[12]],
    [finalVertices[1], finalVertices[9], finalVertices[5], finalVertices[15], finalVertices[13]],
    [finalVertices[5], finalVertices[15], finalVertices[7], finalVertices[19], finalVertices[18]],
    [finalVertices[0], finalVertices[12], finalVertices[2], finalVertices[17], finalVertices[16]],
    [finalVertices[1], finalVertices[13], finalVertices[3], finalVertices[17], finalVertices[16]],
    [finalVertices[4], finalVertices[14], finalVertices[6], finalVertices[19], finalVertices[18]],
  ];
}

const camera = [two.width / 2, two.height / 2, -10];

function worldToScreen(x: number, y: number, z: number) {
  const projectionMatrix = [
    [scale, 0, 0],
    [0, scale, 0],
  ];
  const coords = multiplyMatrices(projectionMatrix, [[x], [y], [z]]);
  return [coords[0][0] + camera[0], coords[1][0] + camera[1]];
}

function drawDodecahedron() {
  const cubeFaces = getDodecahedronFaceCoordinates();
  return cubeFaces.map((face) => {
    const anchorPoints = face.map((vertex) => {
      const screenCoord = worldToScreen(vertex[0], vertex[1], vertex[2]);
      return new Two.Anchor(screenCoord[0], screenCoord[1]);
    });
    const path = two.makePath(anchorPoints);

    path.fill = 'none';
    path.stroke = 'white';

    return path;
  });
}
const items: ReturnType<typeof drawDodecahedron>[] = [];

two.bind('update', function () {
  items.forEach((item) => item.forEach((p) => p.remove()));
  items.push(drawDodecahedron());
});
