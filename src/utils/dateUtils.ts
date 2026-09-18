/**
 * Date and Time utilities for LQMarket
 * Guarantees standard Vietnam Timezone (GMT+7 - Asia/Ho_Chi_Minh) across all views and formats.
 */

const TIMEZONE = 'Asia/Ho_Chi_Minh';

export const parseSafeDate = (dateVal: any): Date | null => {
  if (!dateVal) return null;
  try {
    const d = typeof dateVal === 'string' || typeof dateVal === 'number' ? new Date(dateVal) : dateVal;
    if (d instanceof Date && !isNaN(d.getTime())) {
      return d;
    }
  } catch {
    // fallback
  }
  return null;
};

/**
 * Format: 14:30 18/09/2025
 */
export const formatVietnamDateTime = (dateVal: any, fallback = 'Vừa xong'): string => {
  const d = parseSafeDate(dateVal);
  if (!d) return fallback;

  try {
    const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
      timeZone: TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return `${timeFormatter.format(d)} ${dateFormatter.format(d)}`;
  } catch {
    return fallback;
  }
};

/**
 * Format: 18/09/2025
 */
export const formatVietnamDate = (dateVal: any, fallback = ''): string => {
  const d = parseSafeDate(dateVal);
  if (!d) return fallback;

  try {
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(d);
  } catch {
    return fallback;
  }
};

/**
 * Format: 14:30
 */
export const formatVietnamTime = (dateVal: any, fallback = ''): string => {
  const d = parseSafeDate(dateVal);
  if (!d) return fallback;

  try {
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(d);
  } catch {
    return fallback;
  }
};

/**
 * Format with seconds: 14:30:45 18/09/2025
 */
export const formatVietnamDateTimeWithSec = (dateVal: any, fallback = 'Vừa xong'): string => {
  const d = parseSafeDate(dateVal);
  if (!d) return fallback;

  try {
    const timeFormatter = new Intl.DateTimeFormat('vi-VN', {
      timeZone: TIMEZONE,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
    const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
      timeZone: TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    return `${timeFormatter.format(d)} ${dateFormatter.format(d)}`;
  } catch {
    return fallback;
  }
};

/**
 * Format relative: "Vừa xong", "5 phút trước", "14:30 hôm nay", etc.
 */
export const formatVietnamRelative = (dateVal: any): string => {
  const d = parseSafeDate(dateVal);
  if (!d) return 'Vừa xong';

  try {
    const now = Date.now();
    const diffMs = now - d.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSec < 60) return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHours < 24) return `${diffHours} giờ trước`;
    if (diffDays < 7) return `${diffDays} ngày trước`;

    return formatVietnamDateTime(d);
  } catch {
    return 'Vừa xong';
  }
};
