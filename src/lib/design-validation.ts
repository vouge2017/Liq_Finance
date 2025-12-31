/**
 * Design System Validation Utilities
 * Runtime checks to ensure design consistency
 */

import { BORDER_RADIUS, SPACING, BUTTON_HEIGHTS, TOUCH_TARGET } from './design-tokens';

/**
 * Validates border radius is from approved list
 */
export const validateBorderRadius = (radius: string): boolean => {
  return Object.values(BORDER_RADIUS).includes(radius as any);
};

/**
 * Validates spacing is from 8px scale
 */
export const validateSpacing = (space: string): boolean => {
  return Object.values(SPACING).includes(space as any);
};

/**
 * Validates button height meets minimum accessibility standard
 */
export const validateButtonHeight = (height: string): boolean => {
  const heightPx = parseInt(height);
  return heightPx >= parseInt(BUTTON_HEIGHTS.tertiary);
};

/**
 * Validates touch target meets 44x44px minimum
 */
export const validateTouchTarget = (width: string, height: string): boolean => {
  const w = parseInt(width);
  const h = parseInt(height);
  const minTarget = parseInt(TOUCH_TARGET.min);
  return w >= minTarget && h >= minTarget;
};

/**
 * Dev-only warning for design token misuse
 */
export const warnDesignTokenMismatch = (
  component: string,
  property: string,
  value: string,
  expected: string[]
) => {
  if (process.env.NODE_ENV === 'development') {
    console.warn(
      `[Design System] ${component}: ${property} "${value}" not in approved tokens.\n` +
      `Approved values: ${expected.join(', ')}\n` +
      `Consider using one of the standard values to maintain consistency.`
    );
  }
};

/**
 * Check if element meets minimum button height
 */
export const meetsButtonHeightStandard = (element: HTMLElement): boolean => {
  const height = element.offsetHeight;
  const minHeight = parseInt(BUTTON_HEIGHTS.tertiary);
  return height >= minHeight;
};

/**
 * Check if element meets touch target size
 */
export const meetsTouchTargetStandard = (element: HTMLElement): boolean => {
  const width = element.offsetWidth;
  const height = element.offsetHeight;
  const minSize = parseInt(TOUCH_TARGET.min);
  return width >= minSize && height >= minSize;
};

/**
 * Accessibility check - verify all interactive elements are properly sized
 */
export const validateInteractiveElementSize = (selector: string): {
  valid: boolean;
  invalid: HTMLElement[];
} => {
  const elements = document.querySelectorAll(selector);
  const invalid: HTMLElement[] = [];

  elements.forEach((el) => {
    if (!meetsTouchTargetStandard(el as HTMLElement)) {
      invalid.push(el as HTMLElement);
    }
  });

  return {
    valid: invalid.length === 0,
    invalid,
  };
};
