type IconProps = {
  className?: string;
  size?: number;
  'aria-hidden'?: boolean;
};

export function StopIcon({
  className,
  size = 16,
  'aria-hidden': ariaHidden = true,
}: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      aria-hidden={ariaHidden}
    >
      <title>Stop</title>
      <path d="M6 6h12v12H6z" />
    </svg>
  );
}
