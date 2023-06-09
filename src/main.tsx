import Two from 'two.js';
import './index.css';

const two = new Two({
  fullscreen: true,
  autostart: true,
}).appendTo(document.getElementById('root')!);

const focalLength = 2500 as const;
const scale = 25 as const;

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

function rotateCoordinateAroundCenter(x: number, y: number, z: number, rotation: number) {
  const centerPoint = [two.width / 2, two.height / 2, 0];
  // rotate coordinate around center y axis
  const x1 = centerPoint[0] + (x - centerPoint[0]) * Math.cos(rotation) - (z - centerPoint[2]) * Math.sin(rotation);
  const z1 = centerPoint[2] + (x - centerPoint[0]) * Math.sin(rotation) + (z - centerPoint[2]) * Math.cos(rotation);
  return [x1, y, z1];
}

function getDodecahedronFaceCoordinates() {
  const rotation = (Date.now() / 1000) % 360;

  const rotatedVertices = vertexes.map((vertex) => rotateCoordinateAroundCenter(vertex[0], vertex[1], vertex[2], 0));

  const finalVertices = rotatedVertices.map((vertex) => [
    vertex[0] * scale + two.width / 2,
    vertex[1] * scale + two.height / 2,
    vertex[2] * scale,
  ]);

  return [
    [finalVertices[6], finalVertices[19], finalVertices[7], finalVertices[11], finalVertices[10]],
    [finalVertices[1], finalVertices[9], finalVertices[8], finalVertices[0], finalVertices[16]],
    [finalVertices[4], finalVertices[18], finalVertices[5], finalVertices[9], finalVertices[8]],
    [finalVertices[2], finalVertices[17], finalVertices[3], finalVertices[11], finalVertices[10]],
    [finalVertices[3], finalVertices[11], finalVertices[7], finalVertices[15], finalVertices[13]],
    [finalVertices[7], finalVertices[8], finalVertices[4], finalVertices[14], finalVertices[12]],
    [finalVertices[2], finalVertices[10], finalVertices[6], finalVertices[14], finalVertices[12]],
    [finalVertices[1], finalVertices[9], finalVertices[5], finalVertices[15], finalVertices[13]],
    [finalVertices[5], finalVertices[15], finalVertices[7], finalVertices[19], finalVertices[18]],
    [finalVertices[0], finalVertices[12], finalVertices[2], finalVertices[17], finalVertices[16]],
    [finalVertices[1], finalVertices[13], finalVertices[3], finalVertices[17], finalVertices[16]],
    [finalVertices[4], finalVertices[14], finalVertices[6], finalVertices[19], finalVertices[18]],
  ];
}
function worldToScreen(x: number, y: number, z: number) {
  return [(focalLength * x) / (z + focalLength), (focalLength * y) / (z + focalLength)];
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

console.log('initial finished');
two.bind('update', function () {
  const rotation = (Date.now() / 1000) % 360;
  items.forEach((item) => item.forEach((p) => p.remove()));
  items.push(drawDodecahedron());
});
