import { useCallback, useRef } from 'react';
import './transition.css';

/**
 * Hook pour la transition steampunk à rouages.
 *
 * Utilisation :
 *   const { TransitionOverlay, triggerTransition } = useSteampunkTransition();
 *
 *   // Dans le JSX :
 *   <TransitionOverlay />
 *
 *   // Déclencher :
 *   triggerTransition()                   — joue simplement l'animation
 *   triggerTransition(callback)           — appelle le callback au point médian
 *   triggerTransition().then(...)         — Promise résolue à la fin de l'animation
 */

const GEAR_COUNT = 5;

export const transition = () => {
    const isTransitioning = useRef(false);

    const triggerTransition = useCallback((onMidpoint?: () => void): Promise<void> => {
        if (isTransitioning.current) return Promise.resolve();
        isTransitioning.current = true;

        return new Promise<void>((resolve) => {
            const transition = document.getElementById('cascadeTransition');
            if (!transition) {
                isTransitioning.current = false;
                resolve();
                return;
            }

            const gears = transition.querySelectorAll<HTMLDivElement>('.cascade-gear');

            transition.classList.add('active');

            const spinSpeeds: { speed: string; direction: string }[] = [];
            gears.forEach((gear, i) => {
                const speed = (Math.random() * 5 + 2).toFixed(2);
                const direction = Math.random() > 0.5 ? 'gearSpin' : 'gearSpinCCW';
                spinSpeeds.push({ speed, direction });
                gear.style.animation =
                    `cascadeGear${i + 1} 2s ${i * 0.15}s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards, ` +
                    `${direction} ${speed}s linear infinite`;
                gear.classList.add('animate');
            });

            setTimeout(() => {
                transition.classList.add('show-bg');
            }, 300);

            setTimeout(() => {
                onMidpoint?.();
            }, 2000);

            setTimeout(() => {
                gears.forEach((gear, index) => {
                    const cs = window.getComputedStyle(gear);
                    gear.style.transform = cs.transform;
                    gear.style.opacity = cs.opacity;

                    gear.classList.remove('animate');
                    gear.classList.add('exit');
                    gear.style.animation =
                        `exitGear${index + 1} 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards, ` +
                        `${spinSpeeds[index].direction} ${spinSpeeds[index].speed}s linear infinite`;
                });
                transition.classList.remove('show-bg');
            }, 2600);

            setTimeout(() => {
                transition.classList.remove('active');
                gears.forEach((gear) => {
                    gear.classList.remove('exit');
                    gear.style.transform = '';
                    gear.style.opacity = '';
                    gear.style.animation = '';
                });
                isTransitioning.current = false;
                resolve();
            }, 4100);
        });
    }, []);

    const TransitionOverlay = useCallback(() => (
        <div className="cascade-transition" id="cascadeTransition">
            {Array.from({ length: GEAR_COUNT }, (_, i) => (
                <div key={i} className={`cascade-gear cascade-gear-${i + 1}`} />
            ))}
        </div>
    ), []);

    return { TransitionOverlay, triggerTransition };
}
