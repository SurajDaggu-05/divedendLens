/**
 * Formats monetary numbers into Indian Rupee currency format (e.g. ₹1,450.00)
 */
export function formatINR(amount: string | number | undefined | null): string {
  if (amount === undefined || amount === null || amount === '') {
    return '₹0.00';
  }
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) {
    return '₹0.00';
  }
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

/**
 * Formats ISO YYYY-MM-DD calendar date strings cleanly into e.g. "10 Oct 2026"
 * WITHOUT applying local timezone offsets that cause day shifts.
 */
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'Not available';
  
  // Extract YYYY, MM, DD directly to prevent timezone shift
  const parts = dateStr.split('T')[0].split('-');
  if (parts.length !== 3) return dateStr;
  
  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);
  
  if (isNaN(year) || isNaN(monthIdx) || isNaN(day)) return dateStr;
  
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthName = months[monthIdx] || '';
  
  return `${day} ${monthName} ${year}`;
}

/**
 * Formats ISO timestamp string into readable time (e.g., "10:30:15 AM")
 */
export function formatTime(tsStr?: string | null): string {
  if (!tsStr) return '';
  try {
    const d = new Date(tsStr);
    return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return tsStr;
  }
}

/**
 * Formats relative time string e.g. "10 seconds ago"
 */
export function formatRelativeTime(tsStr?: string | null): string {
  if (!tsStr) return 'Just now';
  try {
    const d = new Date(tsStr);
    const diffSec = Math.floor((Date.now() - d.getTime()) / 1000);
    if (diffSec < 10) return 'Just now';
    if (diffSec < 60) return `${diffSec} seconds ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} minutes ago`;
    return `${Math.floor(diffSec / 3600)} hours ago`;
  } catch {
    return 'Recently';
  }
}
