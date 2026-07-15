export type TshirtPoints = {
  path: string;
  headCircle: { cx: number; cy: number; r: number };
  torsoRegion: { x: number; y: number; w: number; h: number };
  centerLine: { x: number; y1: number; y2: number };
};

export function getTshirtGeometry(width: number, height: number): TshirtPoints {
  const centerX = width / 2;

  // Proportional dimensions (percentage of viewport)
  const headRadius = height * 0.055;
  const headCenterY = height * 0.15;
  const neckY = headCenterY + headRadius;
  const shoulderY = neckY + height * 0.02;
  const shoulderWidth = width * 0.52;
  const shoulderSlope = height * 0.025;
  const sleeveLength = width * 0.14;
  const sleeveWidth = height * 0.08;
  const torsoBottomY = height * 0.72;
  const torsoWidth = width * 0.4;
  const collarWidth = width * 0.14;
  const collarDepth = height * 0.025;

  const halfCollar = collarWidth / 2;
  const halfShoulder = shoulderWidth / 2;
  const halfTorso = torsoWidth / 2;

  // Key points
  const p1 = { x: centerX - halfCollar, y: shoulderY - shoulderSlope + height * 0.005 };
  const p2 = { x: centerX + halfCollar, y: shoulderY - shoulderSlope + height * 0.005 };
  const p3 = { x: centerX + halfShoulder, y: shoulderY };
  const p4 = { x: centerX + halfShoulder + sleeveLength, y: shoulderY + shoulderSlope * 1.2 };
  const p5 = { x: p4.x - width * 0.02, y: p4.y + sleeveWidth };
  const p6 = { x: centerX + halfTorso, y: shoulderY + sleeveWidth - height * 0.005 };
  const p7 = { x: centerX + halfTorso, y: torsoBottomY };
  const p8 = { x: centerX - halfTorso, y: torsoBottomY };
  const p9 = { x: centerX - halfTorso, y: p6.y };
  const p10 = { x: centerX - halfShoulder - sleeveLength + width * 0.02, y: p5.y };
  const p11 = { x: p10.x - width * 0.02, y: p4.y };
  const p12 = { x: centerX - halfShoulder, y: shoulderY };

  // Control points for organic curves
  const neckCP = { x: centerX, y: p1.y + collarDepth };
  const rightArmpitCP = { x: centerX + halfTorso + width * 0.025, y: p6.y + height * 0.02 };
  const leftArmpitCP = { x: centerX - halfTorso - width * 0.025, y: p9.y + height * 0.02 };

  const path = `
    M ${p1.x} ${p1.y}
    Q ${neckCP.x} ${neckCP.y} ${p2.x} ${p2.y}
    L ${p3.x} ${p3.y}
    L ${p4.x} ${p4.y}
    L ${p5.x} ${p5.y}
    Q ${rightArmpitCP.x} ${rightArmpitCP.y} ${p6.x} ${p6.y}
    L ${p7.x} ${p7.y}
    L ${p8.x} ${p8.y}
    L ${p9.x} ${p9.y}
    Q ${leftArmpitCP.x} ${leftArmpitCP.y} ${p10.x} ${p10.y}
    L ${p11.x} ${p11.y}
    L ${p12.x} ${p12.y}
    Z
  `;

  return {
    path,
    headCircle: { cx: centerX, cy: headCenterY, r: headRadius },
    torsoRegion: {
      x: centerX - halfTorso,
      y: shoulderY + sleeveWidth,
      w: torsoWidth,
      h: torsoBottomY - shoulderY - sleeveWidth,
    },
    centerLine: { x: centerX, y1: neckY, y2: torsoBottomY },
  };
}
