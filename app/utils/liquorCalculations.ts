// Constants
export const BOTTLE_ML = 750;

/**
 * Converts bottles and milliliters to total milliliters
 */
export function calculateTotalML(bottles: number, milliliters: number): number {
  return (bottles * BOTTLE_ML) + milliliters;
}

/**
 * Converts total milliliters to bottles and additional milliliters
 */
export function mlToBottlesAndML(totalML: number): { bottles: number; milliliters: number } {
  const bottles = Math.floor(totalML / BOTTLE_ML);
  const milliliters = totalML % BOTTLE_ML;
  return { bottles, milliliters };
}

/**
 * Formats the liquor quantity for display
 */
export function formatLiquorQuantity(bottles: number, milliliters: number): string {
  if (bottles === 0 && milliliters === 0) return '0';
  
  let result = '';
  if (bottles > 0) {
    result += `${bottles} bottle${bottles !== 1 ? 's' : ''}`;
  }
  
  if (milliliters > 0) {
    if (result) result += ' and ';
    result += `${milliliters}ML`;
  }
  
  return result;
}

/**
 * Converts a fraction to milliliters
 */
export function fractionToML(fraction: number): number {
  return fraction * BOTTLE_ML;
}

/**
 * Standard bottle fractions to milliliters
 */
export const standardFractions = {
  '0.25': 187.5,  // Quarter bottle
  '0.5': 375,     // Half bottle
  '0.75': 562.5,  // Three quarters of a bottle
  '1': 750        // Full bottle
}; 