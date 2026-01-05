// PWA Optimization Service
// Handles service worker registration and PWA features

interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

declare global {
    interface Window {
        onbeforeinstallprompt: ((this: Window, ev: BeforeInstallPromptEvent) => any) | null
    }
}

class PWAService {
    private serviceWorkerRegistered = false

    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/sw.js', {
                    scope: '/'
                })

                console.log('✅ Service Worker registered successfully:', registration.scope)

                // Handle updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing
                    if (newWorker) {
                        newWorker.addEventListener('statechange', () => {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                console.log('🔄 New content is available, please refresh.')
                                // You could show a toast here
                            }
                        })
                    }
                })

                this.serviceWorkerRegistered = true
                return true
            } catch (error) {
                console.error('❌ Service Worker registration failed:', error)
                return false
            }
        }
        return false
    }

    async checkForUpdates() {
        if ('serviceWorker' in navigator && this.serviceWorkerRegistered) {
            const registration = await navigator.serviceWorker.getRegistration()
            if (registration) {
                registration.update()
            }
        }
    }

    async promptInstall() {
        // Check if PWA can be installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return { canInstall: false, message: 'Already installed' }
        }

        // Check for beforeinstallprompt event
        if ('onbeforeinstallprompt' in window) {
            return { canInstall: true, message: 'Ready to install' }
        }

        return { canInstall: false, message: 'Install not supported' }
    }

    async getInstallPrompt() {
        return new Promise<BeforeInstallPromptEvent | null>((resolve) => {
            window.addEventListener('beforeinstallprompt', (event) => {
                event.preventDefault()
                resolve(event as BeforeInstallPromptEvent)
            })
        })
    }

    async installPWA(promptEvent: BeforeInstallPromptEvent | null) {
        if (promptEvent) {
            const result = await promptEvent.prompt()
            console.log('PWA install result:', result.outcome)
            return result.outcome === 'accepted'
        }
        return false
    }

    getManifest() {
        return fetch('/manifest.json')
            .then(response => response.json())
            .catch(() => null)
    }

    async checkPWAFeatures() {
        const features = {
            serviceWorker: 'serviceWorker' in navigator,
            manifest: await this.getManifest() !== null,
            notifications: 'Notification' in window,
            push: 'PushManager' in window,
            backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype,
            installPrompt: 'onbeforeinstallprompt' in window
        }

        console.log('📱 PWA Features:', features)
        return features
    }
}

export const pwaService = new PWAService()

// Auto-register service worker on app start
if (typeof window !== 'undefined') {
    pwaService.registerServiceWorker().then(success => {
        if (success) {
            console.log('✅ PWA Service Worker ready')
        } else {
            console.log('❌ PWA Service Worker failed')
        }
    })
}