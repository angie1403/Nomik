import { useEffect, useState, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  
  // Desktop simulation state stored in localStorage
  const [isDesktopSimulated, setIsDesktopSimulated] = useState(() => {
    try {
      return localStorage.getItem('impresos_el_dia_desktop_simulated') === 'true';
    } catch {
      return false;
    }
  });

  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    // Check if running in real standalone PWA mode
    const checkStandalone = () => {
      const standalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(standalone);
    };

    checkStandalone();

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(ua));

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setIsDesktopSimulated(true);
      localStorage.setItem('impresos_el_dia_desktop_simulated', 'true');
      setDeferredPrompt(null);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const install = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsStandalone(true);
        setIsDesktopSimulated(true);
        localStorage.setItem('impresos_el_dia_desktop_simulated', 'true');
        setDeferredPrompt(null);
        return true;
      }
      return false;
    } else {
      // If browser doesn't offer prompt or user is in iframe/unsupported browser, activate Desktop Simulation
      setIsDesktopSimulated(true);
      localStorage.setItem('impresos_el_dia_desktop_simulated', 'true');
      return true;
    }
  };

  const uninstallApp = () => {
    setIsDesktopSimulated(false);
    localStorage.removeItem('impresos_el_dia_desktop_simulated');
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  };

  const toggleDesktopMode = () => {
    const next = !isDesktopSimulated;
    setIsDesktopSimulated(next);
    if (next) {
      localStorage.setItem('impresos_el_dia_desktop_simulated', 'true');
    } else {
      localStorage.removeItem('impresos_el_dia_desktop_simulated');
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return {
    isInstallable: !!deferredPrompt,
    isInstalled: isStandalone || isDesktopSimulated,
    isRealPWA: isStandalone,
    isDesktopSimulated,
    isIOS,
    isFullscreen,
    install,
    uninstallApp,
    toggleDesktopMode,
    toggleFullscreen,
  };
}
