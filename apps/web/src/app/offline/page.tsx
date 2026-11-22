export default function OfflinePage() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center py-12 text-center">
      <h1 className="text-3xl font-semibold">You're offline</h1>
      <p className="mt-2 text-muted-foreground">
        Reconnect to continue browsing. Your shortlist will reappear when you're back online.
      </p>
    </div>
  );
}
