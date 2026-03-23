'use client';

export const dynamic = 'force-dynamic';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900">Something went wrong!</h2>
        <p className="mt-2 text-gray-600">We're sorry for the inconvenience.</p>
        <button
          onClick={() => reset()}
          className="mt-4 rounded-lg bg-primary px-4 py-2 text-white hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
