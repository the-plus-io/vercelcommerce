'use client';

import { useEffect } from 'react';
import { toast } from 'sonner';

export function WelcomeToast() {
  useEffect(() => {
    // ignore if screen height is too small
    if (window.innerHeight < 650) return;
    if (!document.cookie.includes('welcome-toast=2')) {
      toast('☀️ Willkommen bei unserer Solarplanung!', {
        id: 'welcome-toast',
        duration: Infinity,
        onDismiss: () => {
          document.cookie = 'welcome-toast=2; max-age=31536000; path=/';
        },
        description: (
          <>
            Entdecken Sie die Vorteile der Solarenergie für Ihr Zuhause. Unser Team hilft Ihnen bei der optimalen Planung Ihrer Solaranlage.{' '}
            <a
              href="#"
              className="text-blue-600 hover:underline"
              target="_blank"
            >
              Jetzt Beratung anfordern
            </a>
            .
          </>
        )
      });
    }
  }, []);

  return null;
}
