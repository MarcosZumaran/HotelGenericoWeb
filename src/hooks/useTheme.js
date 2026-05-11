import { useState, useEffect, useCallback, useRef } from 'react';

const useTheme = () => {
    const [theme, setTheme] = useState(() => {
        if (typeof window === 'undefined') return 'light';
        const stored = localStorage.getItem('theme');
        if (stored === 'light' || stored === 'dark') return stored;
        return window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light';
    });

    const isAnimating = useRef(false);

    const applyTheme = useCallback((newTheme) => {
        const root = document.documentElement;
        root.setAttribute('data-theme', newTheme);
        if (newTheme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        localStorage.setItem('theme', newTheme);
    }, []);

    useEffect(() => {
        applyTheme(theme);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleTheme = useCallback(
        (event) => {
            if (isAnimating.current) return;
            isAnimating.current = true;

            const newTheme = theme === 'light' ? 'dark' : 'light';
            const x = event?.clientX ?? window.innerWidth / 2;
            const y = event?.clientY ?? window.innerHeight / 2;

            if (document.startViewTransition) {
                const transition = document.startViewTransition(() => {
                    applyTheme(newTheme);
                    setTheme(newTheme);
                });

                transition.ready.then(() => {
                    const radius = Math.hypot(window.innerWidth, window.innerHeight);
                    document.documentElement.animate(
                        {
                            clipPath: [
                                `circle(0% at ${x}px ${y}px)`,
                                `circle(${radius}px at ${x}px ${y}px)`,
                            ],
                        },
                        {
                            duration: 500,
                            easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                            pseudoElement: '::view-transition-new(root)',
                        }
                    );
                });

                transition.finished.finally(() => {
                    isAnimating.current = false;
                });
                return;
            }

            const overlay = document.createElement('div');
            const newBg = newTheme === 'dark' ? '#0f172a' : '#ffffff';
            overlay.style.cssText = `
                position: fixed;
                inset: 0;
                z-index: 9999;
                pointer-events: none;
                background-color: ${newBg};
                clip-path: circle(0% at ${x}px ${y}px);
            `;
            document.body.appendChild(overlay);

            const radius = Math.hypot(window.innerWidth, window.innerHeight);
            const animation = overlay.animate(
                {
                    clipPath: [
                        `circle(0% at ${x}px ${y}px)`,
                        `circle(${radius}px at ${x}px ${y}px)`,
                    ],
                },
                {
                    duration: 500,
                    easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                    fill: 'forwards',
                }
            );

            // Realizamos el cambio de tema justo a la mitad de la animación
            setTimeout(() => {
                applyTheme(newTheme);
                setTheme(newTheme);
            }, 250);

            animation.onfinish = () => {
                overlay.remove();
                isAnimating.current = false;
            };

            animation.oncancel = () => {
                overlay.remove();
                isAnimating.current = false;
            };
        },
        [theme, applyTheme]
    );

    return { theme, toggleTheme };
};

export default useTheme;