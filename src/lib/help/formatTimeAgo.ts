export default function formatTimeAgo(date: Date): string {
  const now = new Date();

  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000); // 👈 convert to seconds

  if (diffSeconds < 60) return "JUST NOW";
  if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}M AGO`;
  if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)} HR AGO`;
  if (diffSeconds < 172800) return "YESTERDAY";

  return `${Math.floor(diffSeconds / 86400)} DAYS AGO`;
}
