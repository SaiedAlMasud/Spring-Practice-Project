interface ErrorAlertProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorAlert({ message, onRetry }: ErrorAlertProps) {
  return (
    <div
      role="alert"
      className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-2 font-semibold underline"
      >
        Try again
      </button>
    </div>
  );
}
