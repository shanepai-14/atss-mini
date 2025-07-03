import { useState, useEffect } from 'react';

export const usePWAInstall = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstallStatus = () => {
      const isStandalone = window.navigator.standalone === true || 
                          window.matchMedia('(display-mode: standalone)').matches ||
                          window.matchMedia('(display-mode: minimal-ui)').matches;
      setIsInstalled(isStandalone);
    };

    // Check if iOS
    const checkIOS = () => {
      const iosCheck = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
      setIsIOS(iosCheck);
    };

    checkInstallStatus();
    checkIOS();

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      console.log('beforeinstallprompt event fired for ATSS');
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    // Listen for app installed event
    const handleAppInstalled = (e) => {
      console.log('ATSS PWA was installed');
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!deferredPrompt) {
      return { outcome: 'no-prompt' };
    }

    try {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      
      if (result.outcome === 'accepted') {
        setIsInstallable(false);
        setDeferredPrompt(null);
      }
      
      return result;
    } catch (error) {
      console.error('Error prompting for install:', error);
      return { outcome: 'error' };
    }
  };

  return {
    isInstallable: isInstallable || isIOS,
    isInstalled,
    isIOS,
    promptInstall
  };
};