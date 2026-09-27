/**
 * VFSTR Transport PWA Service Worker Registration
 */

export const registerPwaServiceWorker = () => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      const swUrl = `${import.meta.env.BASE_URL}sw.js`;
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          console.debug('VFSTR Transport ServiceWorker registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.debug('ServiceWorker registration skipped or failed:', error);
        });
    });
  }
};
