"use client";
import { PixelatedCanvas } from "./pixelated-canvas";

export default function PixelatedCanvasDemo() {
  return (
    <div className="mx-auto mt-8 flex w-full items-center justify-center">
      <PixelatedCanvas
        src="https://images.unsplash.com/photo-1630487656049-6db93a53a7e9?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        width={800}
        height={600}
        cellSize={4}
        dotScale={0.9}
        shape="square"
        backgroundColor="#000000"
        dropoutStrength={0.1}
        interactive
        distortionStrength={0.1}
        distortionRadius={200}
        distortionMode="repel"
        followSpeed={0.2}
        jitterStrength={4}
        jitterSpeed={1}
        sampleAverage
        className="rounded-xl shadow-lg"
      />
    </div>
  );
}