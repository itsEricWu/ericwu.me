import { TopoCanvas } from "./topo-canvas";

/**
 * Fixed page background: soft light pools plus Rainier's contour lines. Sized to
 * the large viewport so it never comes up short when mobile toolbars collapse.
 */
export function Backdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-0 h-lvh overflow-hidden"
    >
      <div className="absolute -top-[40vmax] -left-[30vmax] size-[95vmax] rounded-full [background:radial-gradient(closest-side,var(--aurora-a),transparent)]" />
      <div className="absolute top-[30%] -right-[25vmax] size-[70vmax] rounded-full [background:radial-gradient(closest-side,var(--aurora-c),transparent)]" />
      <div className="absolute -right-[35vmax] -bottom-[45vmax] size-[95vmax] rounded-full [background:radial-gradient(closest-side,var(--aurora-b),transparent)]" />
      <TopoCanvas />
    </div>
  );
}
