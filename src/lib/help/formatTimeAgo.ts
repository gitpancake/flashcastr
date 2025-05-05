export default function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diff = (now.getTime() - date.getTime()) / 1000;
  if (diff < 60) return "JUST NOW";
  if (diff < 3600) return `${Math.floor(diff / 60)}M AGO`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} HR AGO`;
  if (diff < 172800) return "YESTERDAY";
  return `${Math.floor(diff / 86400)} DAYS AGO`;
}
