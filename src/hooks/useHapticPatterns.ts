/**
 * Comprehensive Haptic Feedback Patterns for Liq Finance
 * Follows iOS HapticFeedback patterns for familiar feel
 */

export const useHapticPatterns = () => {
  // Check if Vibration API is supported
  const isSupported = () => {
    return 'vibrate' in navigator || 'webkitVibrate' in navigator;
  };

  const vibrate = (pattern: number | number[]) => {
    if (!isSupported()) return;
    try {
      navigator.vibrate(pattern);
    } catch (e) {
      console.debug('Vibration not available');
    }
  };

  return {
    // Light Impact - 10ms light tap
    light: () => vibrate(10),

    // Medium Impact - 20ms medium tap
    medium: () => vibrate(20),

    // Heavy Impact - 30ms heavy tap
    heavy: () => vibrate(30),

    // Selection Changed - Double tap pattern
    selection: () => vibrate([10, 20, 10]),

    // Success - Rising tone
    success: () => vibrate([20, 30, 40]),

    // Warning - Double pulse
    warning: () => vibrate([30, 50, 30]),

    // Error - Triple strong pulse
    error: () => vibrate([40, 50, 40, 50, 40]),

    // Button Press - Spring-like feel
    buttonPress: () => vibrate([10, 15, 10]),

    // Card Swipe - Smooth glide
    swipe: () => vibrate([15, 10, 15]),

    // Transaction Complete - Celebration
    transactionComplete: () => vibrate([20, 10, 30, 10, 20]),

    // Goal Achieved - Triumphant
    goalAchieved: () => vibrate([30, 20, 50, 20, 30]),

    // Loading Start
    loadingStart: () => vibrate([10]),

    // Loading Complete
    loadingComplete: () => vibrate([20, 30]),

    // Notification - Two quick taps
    notification: () => vibrate([20, 15, 20]),

    // Contribution Received (for Iqub/Iddir)
    contributionReceived: () => vibrate([25, 15, 25, 15, 25]),

    // Fund Alert
    fundAlert: () => vibrate([15, 30, 15]),

    // Long Press Detection
    longPress: () => vibrate([50]),

    // Double Tap Confirmation
    doubleTapConfirm: () => vibrate([10, 20, 10, 20, 10]),
  };
};
