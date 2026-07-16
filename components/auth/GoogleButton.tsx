type GoogleButtonProps = {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
};

export default function GoogleButton({ label, onClick, disabled = false }: GoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="auth-neu-ghost-button flex w-full items-center justify-center gap-3 py-3.5 text-base"
    >
      <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20.5H24v7h11.3C33.7 32 29.3 35 24 35c-6.1 0-11-4.9-11-11s4.9-11 11-11c2.8 0 5.3 1 7.3 2.7l5.2-5.2C33.4 7.6 28.9 6 24 6 13.5 6 5 14.5 5 25s8.5 19 19 19 19-8.5 19-19c0-1.2-.1-2.4-.4-3.5z"
        />
        <path
          fill="#FF3D00"
          d="M6.3 14.7l5.8 4.2C13.6 15.4 18.4 12.5 24 12.5c2.8 0 5.3 1 7.3 2.7l5.2-5.2C33.4 7.6 28.9 6 24 6c-7.4 0-13.9 4.2-17.1 10.4z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.4-4.5 2.2-7.2 2.2-5.2 0-9.6-3.5-11.2-8.3l-6.3 4.9C9.9 39.6 16.4 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20.5H24v7h11.3c-.8 2.3-2.3 4.3-4.2 5.6l6.2 5.2C40.6 35.9 44 30.9 44 25c0-1.5-.1-2.4-.4-3.5z"
        />
      </svg>
      {label}
    </button>
  );
}
