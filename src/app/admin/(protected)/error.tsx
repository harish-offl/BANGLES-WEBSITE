"use client";

export default function AdminError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  const message =
    error.message ||
    "Something went wrong while loading the admin page. Please try again.";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background">
      <div className="w-full max-w-md px-4 py-12 text-center">
        <div className="bg-card p-6 rounded-xl border border-border shadow-lg">
          <h1 className="font-display text-2xl font-semibold text-foreground mb-2">
            Something went wrong
          </h1>
          <p className="text-sm text-muted-foreground mb-6">{message}</p>
          <button
            onClick={() => {
              reset();
            }}
            className="px-4 py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
          >
            Try again
          </button>
          <button
            onClick={() => {
              window.location.href = "/admin/login";
            }}
            className="mt-3 px-4 py-2 rounded-lg border border-border text-muted-foreground hover:bg-accent transition-colors"
          >
            Back to login
          </button>
        </div>
      </div>
    </div>
  );
}
