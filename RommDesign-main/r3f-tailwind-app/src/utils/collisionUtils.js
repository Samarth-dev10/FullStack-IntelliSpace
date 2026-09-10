/**
 * Collision Utilities — Box3-based collision detection.
 */
import * as THREE from 'three';

/**
 * Check if two Box3 objects intersect.
 */
export function boxesIntersect(boxA, boxB) {
  return boxA.intersectsBox(boxB);
}

/**
 * Create a Box3 from position, size.
 */
export function createBox(position, size) {
  const halfSize = new THREE.Vector3(size[0] / 2, size[1] / 2, size[2] / 2);
  const center = new THREE.Vector3(...position);
  return new THREE.Box3(
    center.clone().sub(halfSize),
    center.clone().add(halfSize)
  );
}

/**
 * Check if a position would cause collision with other furniture.
 * Returns true if there's a collision.
 */
export function checkCollision(position, size, otherBoxes) {
  const testBox = createBox(position, size);
  return otherBoxes.some((box) => testBox.intersectsBox(box));
}

/**
 * Clamp a position to stay within room boundaries.
 * Room is centered at origin.
 */
export function clampPositionToRoom(position, roomWidth, roomDepth, roomHeight = 3) {
  const halfW = roomWidth / 2;
  const halfD = roomDepth / 2;
  return [
    Math.max(-halfW, Math.min(halfW, position[0])),
    Math.max(0, Math.min(roomHeight, position[1])),
    Math.max(-halfD, Math.min(halfD, position[2])),
  ];
}
