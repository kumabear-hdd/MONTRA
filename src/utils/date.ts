import type { DateFilterPreset } from '../types/finance';

/**
 * Get current date string formatted as YYYY-MM-DD in Asia/Jakarta timezone
 */
export function getTodayJakarta(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get current month string formatted as YYYY-MM
 */
export function getCurrentMonthJakarta(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Calculate [startDate, endDate] YYYY-MM-DD strings based on filter preset
 */
export function getDateRangeForPreset(preset: DateFilterPreset, customStart?: string, customEnd?: string): { start: string; end: string } {
  const today = new Date();
  const todayStr = getTodayJakarta();

  if (preset === 'today') {
    return { start: todayStr, end: todayStr };
  }

  if (preset === 'this_week') {
    // Week starting Monday
    const dayOfWeek = today.getDay(); // 0 is Sunday
    const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const monday = new Date(today);
    monday.setDate(today.getDate() - distanceToMonday);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const start = monday.toISOString().split('T')[0];
    const end = sunday.toISOString().split('T')[0];
    return { start, end };
  }

  if (preset === 'this_month') {
    const year = today.getFullYear();
    const month = today.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const start = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const end = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay.getDate()).padStart(2, '0')}`;
    return { start, end };
  }

  if (preset === 'this_year') {
    const year = today.getFullYear();
    return { start: `${year}-01-01`, end: `${year}-12-31` };
  }

  if (preset === 'custom' && customStart && customEnd) {
    return { start: customStart, end: customEnd };
  }

  // 'all'
  return { start: '1970-01-01', end: '2099-12-31' };
}

/**
 * Format YYYY-MM-DD to human friendly string (e.g. 13 Okt 2026 or Today)
 */
export function formatFriendlyDate(dateStr: string): string {
  if (!dateStr) return '';
  const todayStr = getTodayJakarta();
  if (dateStr === todayStr) return 'Hari ini (Today)';

  const d = new Date(dateStr + 'T00:00:00');
  if (isNaN(d.getTime())) return dateStr;

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

/**
 * Format Month YYYY-MM to human friendly label (e.g. Oktober 2026)
 */
export function formatMonthName(monthStr: string): string {
  if (!monthStr) return '';
  const [year, month] = monthStr.split('-').map(Number);
  if (!year || !month) return monthStr;
  const d = new Date(year, month - 1, 1);
  return new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(d);
}
