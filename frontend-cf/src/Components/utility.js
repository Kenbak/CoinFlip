
// utils.js
export function truncateAddress(address) {
  // ... your truncate logic here ...
  if (!address) return "";
  const start = address.substring(0, 6); // first 6 characters
  const end = address.substring(address.length - 4); // last 4 characters
  return `${start}...${end}`;
}
