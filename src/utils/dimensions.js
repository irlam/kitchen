const CM_PER_INCH = 2.54;
const INCHES_PER_FOOT = 12;

export function cmToInches(cm) {
  return cm / CM_PER_INCH;
}

export function inchesToCm(inches) {
  return inches * CM_PER_INCH;
}

export function formatFeetAndInchesFromCm(cm) {
  const totalInches = cmToInches(cm);
  const feet = Math.floor(totalInches / INCHES_PER_FOOT);
  const inches = Math.round((totalInches - feet * INCHES_PER_FOOT) * 10) / 10;
  return `${feet}' ${inches}"`;
}

export function convertLength(value, fromUnit, toUnit) {
  if (fromUnit === toUnit) return value;
  const toCm = {
    cm: (v) => v,
    mm: (v) => v / 10,
    m: (v) => v * 100,
    in: inchesToCm,
  };
  const fromCm = {
    cm: (v) => v,
    mm: (v) => v * 10,
    m: (v) => v / 100,
    in: cmToInches,
  };
  if (!toCm[fromUnit] || !fromCm[toUnit]) {
    throw new Error(`Unsupported conversion: ${fromUnit} -> ${toUnit}`);
  }
  return fromCm[toUnit](toCm[fromUnit](value));
}

export function shouldShowDimensionLabel({ is3DView, isSelected, alwaysVisibleIn3D = true }) {
  if (is3DView && alwaysVisibleIn3D) return true;
  return Boolean(isSelected);
}

export function roundToTenth(value) {
  return Math.round(value * 10) / 10;
}
