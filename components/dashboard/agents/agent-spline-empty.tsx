'use client';

import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline'), {
  ssr: false,
});

export default function AgentSplineEmpty() {
  return (
    <div className="relative hidden h-32 w-48 shrink-0 overflow-hidden rounded-lg md:block">
      <Spline
        scene="https://prod.spline.design/xLYKrm6x94VBn8Z6/scene.splinecode"
        className="size-full scale-125"
      />
    </div>
  );
}
