export function LoadingSpinner({ size = 18 }: { size?: number }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-aegis-primary/20 border-t-aegis-primary"
      style={{ width: size, height: size }}
      aria-hidden="true"
    />
  );
}
