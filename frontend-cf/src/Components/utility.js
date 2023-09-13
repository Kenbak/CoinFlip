
// utils.js
export function truncateAddress(address) {
  // ... your truncate logic here ...
  if (!address) return "";
  const start = address.substring(0, 6); // first 6 characters
  const end = address.substring(address.length - 4); // last 4 characters
  return `${start}...${end}`;
}


export function timeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

  if (diffInSeconds < 60) return diffInSeconds === 1 ? '1 second ago' : `${diffInSeconds} seconds ago`;

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return diffInMinutes === 1 ? '1 min ago' : `${diffInMinutes} mins ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return diffInDays === 1 ? '1 day ago' : `${diffInDays} days ago`;
}
