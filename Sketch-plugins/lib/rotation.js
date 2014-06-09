/**
 * Get the difference between the page coordinates
 * and the ruler coordinates for a given object
 * to be able to transform page corodinates to ruler
 * coordinates.
 * ruler.x = page.x + ruleroffset.x;
 *
 * @param {CGPoint|object} obj   The given point
 * @return {object}   The x and y difference
 */
var getRulerOffset = function(obj) {
  var x, y,
    rx, ry,
    dx, dy;

  x = obj.absoluteRect().x();
  y = obj.absoluteRect().y();
  rx = obj.absoluteRect().rulerX();
  ry = obj.absoluteRect().rulerY();
  dx = rx - x;
  dy = ry - y;

  return {
    x: dx,
    y: dy
  };
};

/**
 * Calculate the distance between 2 points.
 *
 * @param {CGPoint|object} p1   The first point
 * @param {CGPoint|object} p2   The second point
 * @return {int}   The distance between the points
 */
var getDistance = function(p1, p2) {
  return Math.sqrt((p2.x - p1.x) * (p2.x - p1.x) +
    (p2.y - p1.y) * (p2.y - p1.y));
};

/**
 * Get the center of the given object
 *
 * @param {MSLayer} obj   The given object
 * @param {Bool} rulerCoords   Transform the center to the ruler space
 * @return {GPoint}   The object center
 */
var getCenter = function(obj, rulerCoords) {
  var ruler = rulerCoords || false,
    center = obj.frame().mid(),
    ruleroffset;

  if (ruler) {
    ruleroffset = getRulerOffset(obj);
    center.x += ruleroffset.x;
    center.y += ruleroffset.y;
  }

  return center;
};


/**
 * Rotate the obj around the center object with the angle given in degrees.
 *
 * x' = x * cos(Theta) - y * sin(Theta);
 * y' = x * sin(Theta) + y * cos(Theta);
 * So, all that you need is to translate the point of rotation to one of
 * the points that you have. Lets write it in a more simplified way:
 *
 * (x1,y1) = (14,446) and (x2,y2) = (226,496). You are trying to
 * "rotate" (x2,y2) around (x1,y1). Calculate (dx2,dy2) in a new
 * coordinate system with the origin at (x1,y1).
 * (dx2,dy2) = (x2-x1,y2-y1);
 *
 * Now rotate (positive angles are counterclockwise):
 * dx2' = dx2 * cos(165 Degrees) - dy2 * sin(165 Degrees);
 * dy2' = dx2 * sin(165 Degrees) + dy2 * cos(165 Degrees);
 *
 * The last step is to translate coordinates of the point from the origin
 * at (x1,y1) back to the original (0,0);
 *
 * x2' = dx2' + x1;
 * y2' = dy2' + y1;
 *
 * @param  {MSLayer} centerObj   The center object
 * @param  {MSLayer} obj   The rotated object
 * @param  {int} angle   The rotation angle in degree
 */
var rotateToAngle = function(centerObj, obj, angle) {
  var rad,
    centerPoint = getCenter(centerObj),
    objCenter = getCenter(obj),
    newCenter = CGPointMake(0, 0),
    centerOffset = {
      x: objCenter.x - obj.absoluteRect().x(),
      y: objCenter.y - obj.absoluteRect().y()
    };

  if (angle < 0) {
    angle = 360 + (angle % 360);
  }

  // Calculate the radians for the given angle plus the object's rotation angle
  rad = (angle - Math.abs(obj.rotation())) * Math.PI / 180;

  // Calcualte the x and y values for the rotation
  newCenter.x = (objCenter.x - centerPoint.x) * Math.cos(rad) -
    (objCenter.y - centerPoint.y) * Math.sin(rad) + centerPoint.x;

  newCenter.y = (objCenter.x - centerPoint.x) * Math.sin(rad) +
    (objCenter.y - centerPoint.y) * Math.cos(rad) + centerPoint.y;

  // The center of an object can't be set - so calculate the x/y position
  // by subtracting the x/y offset the object center has
  // from the object position and set the position.
  // Then rotate the object.
  obj.absoluteRect().setX(newCenter.x - centerOffset.x);
  obj.absoluteRect().setY(newCenter.y - centerOffset.y);
  obj.setRotation(-angle);
};


/**
 * Calculate the absolute rotation angle based on the object rotation value
 * and the given angle and call rotateToAngle.
 *
 * @param  {MSLayer} centerObj   The center object
 * @param  {MSLayer} obj   The rotated object
 * @param  {int} angle   The rotation angle in degree
 */
var rotateWithAngle = function(centerObj, obj, angle) {
  angle = Math.abs(obj.rotation()) + (angle % 360);
  rotateToAngle(centerObj, obj, angle);
};


/**
 * Rotate a duplicate of the selected layer, name the duplicate with the
 * given name.
 *
 * @param {MSLayer} centerLayer   The object used as the rotation center
 * @param {MSLayer} objectLayer   The object to duplicate and rotate
 * @param {int} angle   The rotation angle in degree
 * @param {string} newname   The name for the duplicated object
 * @return {MSLayer}   The duplicated and rotated layer
 */
var duplicateAndRotate = function(centerLayer, objectLayer, angle, newname) {
  var duplicateLayer = objectLayer.duplicate();

  duplicateLayer.setName(newname);
  rotateWithAngle(centerLayer, duplicateLayer, angle);

  return duplicateLayer;
};
