"use client";

/**
 * Lapisan dekoratif 3D (fixed, non-interaktif). Tidak memengaruhi fitur atau alur aplikasi.
 */
export default function Scene3DDecor() {
  return (
    <div
      className="scene-3d-layer pointer-events-none fixed inset-0 z-0 overflow-hidden max-sm:opacity-50"
      aria-hidden
    >
      <div className="scene-3d-stage absolute inset-0">
        <div className="orb-3d orb-3d-a" />
        <div className="orb-3d orb-3d-b" />
        <div className="orb-3d orb-3d-c" />
        <div className="shape-3d shape-3d-cube" />
        <div className="shape-3d shape-3d-ring" />
      </div>
    </div>
  );
}
