export function MagnMark({ size = 28 }: { size?: number }) {
  return (
    <div
      className="grid place-items-center rounded-lg bg-magn-green2"
      style={{ width: size, height: size }}
      aria-label="Magn"
      title="Magn"
    >
      <span className="select-none font-serif text-white" style={{ fontSize: size * 0.7 }}>
        m
      </span>
    </div>
  );
}
