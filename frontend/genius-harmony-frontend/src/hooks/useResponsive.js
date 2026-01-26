import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour gérer la responsivité
 * Retourne des informations sur la taille de l'écran
 */
export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    window.addEventListener('resize', handleResize);
    handleResize(); // Appel initial

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowSize.width <= 480;
  const isTablet = windowSize.width > 480 && windowSize.width <= 768;
  const isDesktop = windowSize.width > 768;
  const isSmallScreen = windowSize.width <= 768;

  return {
    windowSize,
    isMobile,
    isTablet,
    isDesktop,
    isSmallScreen,
    width: windowSize.width,
    height: windowSize.height,
  };
}

/**
 * Helper function pour obtenir des styles responsifs
 */
export function getResponsiveValue(mobile, tablet, desktop, currentWidth) {
  if (currentWidth <= 480) return mobile;
  if (currentWidth <= 768) return tablet;
  return desktop;
}

/**
 * Helper pour obtenir une grille responsive
 */
export function getResponsiveGrid(isMobile, isTablet) {
  if (isMobile) return '1fr';
  if (isTablet) return 'repeat(2, 1fr)';
  return 'repeat(3, 1fr)';
}

/**
 * Helper pour obtenir un padding responsive
 */
export function getResponsivePadding(isMobile, isTablet) {
  if (isMobile) return '1rem';
  if (isTablet) return '1.25rem';
  return '1.5rem';
}

/**
 * Helper pour obtenir une taille de police responsive
 */
export function getResponsiveFontSize(baseMobile, baseTablet, baseDesktop, isMobile, isTablet) {
  if (isMobile) return baseMobile;
  if (isTablet) return baseTablet;
  return baseDesktop;
}

/**
 * Helper pour obtenir un gap responsive
 */
export function getResponsiveGap(isMobile, isTablet) {
  if (isMobile) return '1rem';
  if (isTablet) return '1.25rem';
  return '1.5rem';
}
