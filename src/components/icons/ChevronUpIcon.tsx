type IconProps = {
  className?: string;
  size?: number;
  'aria-hidden'?: boolean;
};

export function ChevronUpIcon({
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
      <title>Chevron up</title>
      <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" />
    </svg>
  );
}
