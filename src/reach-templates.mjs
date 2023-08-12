// TODO: Update ruler position

const MOD_NAME = "reach-templates";

function MeasuredTemplate_getCircleShape(wrapped, distance) {
  const width = this?.document?.width || 0;
  if(distance == 0) {
    return wrapped(distance);
  }

  const pixels_per_unit = canvas.dimensions.size / canvas.dimensions.distance;
  const rect_width = distance * 2 + width * pixels_per_unit;
  console.log(`${MOD_NAME} | Creating rrect radius: ${distance} width: ${width} rwidth: ${rect_width}`);

  const shape = new PIXI.RoundedRectangle(
    -(rect_width / 2),
    -(rect_width / 2),
    rect_width,
    rect_width,
    distance,
  );
  return shape;
}

function MeasuredTemplate_getGridHighlightPositions(wrapped) {
  if(this.document.t === "circle" && this.document.width) {
    return _getGridHighlightPositionsReach(this)
  } else {
    return wrapped();
  }
}

function _getGridHighlightPositionsReach(template) {
  console.log(`${MOD_NAME} | _getGridHighlightPositionsReach`);
  console.debug(template)

  const grid = canvas.grid.grid;
  const d = canvas.dimensions;
  const {x, y, distance} = template.document;

  // Get number of rows and columns
  const [maxRow, maxCol] = grid.getGridPositionFromPixels(d.width, d.height);
  let nRows = Math.ceil(((distance * 1.5) / d.distance) / (d.size / grid.h));
  let nCols = Math.ceil(((distance * 1.5) / d.distance) / (d.size / grid.w));
  [nRows, nCols] = [Math.min(nRows, maxRow), Math.min(nCols, maxCol)];

  // Get the offset of the template origin relative to the top-left grid space
  const [tx, ty] = grid.getTopLeft(x, y);
  const [row0, col0] = grid.getGridPositionFromPixels(tx, ty);
  const [hx, hy] = [Math.ceil(grid.w / 2), Math.ceil(grid.h / 2)];
  const isCenter = (x - tx === hx) && (y - ty === hy);

  // Identify grid coordinates covered by the template Graphics
  const positions = [];
  for ( let r = -nRows; r <= nRows; r++ ) {
    for ( let c = -nCols; c <= nCols; c++ ) {
      const [gx, gy] = grid.getPixelsFromGridPosition(row0 + r, col0 + c);
      const [testX, testY] = [(gx + hx) - x, (gy + hy) - y];
      console.debug(`${MOD_NAME} | testing grid: [${row0 + r}, ${col0 + c}] pixel: [${gx}, ${gy}] relative: [${testX}, ${testY}]`)
      const contains = ((r === 0) && (c === 0) && isCenter ) || template.shape.contains(testX, testY);
      if ( !contains ) continue;
      positions.push({x: gx, y: gy});
    }
  }
  return positions;
}

Hooks.once("init", function() {
  console.log(`${MOD_NAME} | Initializing module`);
});

Hooks.once("setup", function() {
  console.log(`${MOD_NAME} | Setting up module`);

  libWrapper.register(
    MOD_NAME,
    "CONFIG.MeasuredTemplate.objectClass.prototype._getCircleShape",
    MeasuredTemplate_getCircleShape,
    libWrapper.MIXED,
  );
  libWrapper.register(
    MOD_NAME,
    "CONFIG.MeasuredTemplate.objectClass.prototype._getGridHighlightPositions",
    MeasuredTemplate_getGridHighlightPositions,
    libWrapper.MIXED,
  );
});
