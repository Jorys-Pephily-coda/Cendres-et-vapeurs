import { useSteampunkTransition } from './transition';

function TransitionDemo() {
    const { TransitionOverlay, triggerTransition } = useSteampunkTransition();

    return (
        <>
            <TransitionOverlay />
            <button onClick={() => triggerTransition()}>⚙ Trigger Transition ⚙</button>
        </>
    );
}

export default TransitionDemo;
            