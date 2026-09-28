'use client';

import { useEffect, useRef } from 'react';
import { useAgent } from '@livekit/components-react';
import { useRive, useStateMachineInput } from '@rive-app/react-webgl2';

const ARTBOARD = 'ball';
const STATE_MACHINE = 'State Machine 1';

const AWAKE_STATES = new Set(['listening', 'thinking', 'speaking']);

export function JarvisCore({ className }: { className?: string }) {
  const agent = useAgent();
  const prevState = useRef(agent.state);

  const { rive, RiveComponent } = useRive({
    src: '/jarvis-core.riv',
    artboard: ARTBOARD,
    stateMachine: STATE_MACHINE,
    autoplay: true,
  });

  const openTrig = useStateMachineInput(rive, STATE_MACHINE, 'open_trig');
  const closeTrig = useStateMachineInput(rive, STATE_MACHINE, 'close_trig');
  const bingTrig = useStateMachineInput(rive, STATE_MACHINE, 'bing_trig');

  useEffect(() => {
    const prev = prevState.current;
    if (prev === agent.state) return;

    const wasAwake = AWAKE_STATES.has(prev);
    const isAwake = AWAKE_STATES.has(agent.state);

    if (!wasAwake && isAwake) openTrig?.fire();
    if (wasAwake && !isAwake) closeTrig?.fire();
    if (agent.state === 'speaking' && prev !== 'speaking') bingTrig?.fire();

    prevState.current = agent.state;
  }, [agent.state, openTrig, closeTrig, bingTrig]);

  return <RiveComponent className={className} aria-hidden="true" />;
}
