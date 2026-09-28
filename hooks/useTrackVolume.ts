'use client';

import { useEffect, useState } from 'react';
import { createAudioAnalyser } from 'livekit-client';
import type { LocalAudioTrack, RemoteAudioTrack } from 'livekit-client';
import type { TrackReference } from '@livekit/components-core';

/** Live 0..1 volume reading off a track, polled once per animation frame. */
export function useTrackVolume(trackRef?: TrackReference) {
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    const track = trackRef?.publication?.track as LocalAudioTrack | RemoteAudioTrack | undefined;
    if (!track || track.kind !== 'audio') {
      setVolume(0);
      return;
    }

    const { calculateVolume, cleanup } = createAudioAnalyser(track, {
      smoothingTimeConstant: 0.75,
      fftSize: 256,
    });

    let raf: number;
    const tick = () => {
      setVolume(calculateVolume());
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      void cleanup();
    };
  }, [trackRef?.publication?.track]);

  return volume;
}
