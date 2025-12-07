// This is a simplified converter for the prototype. 
// In a production app, we would use a library like 'ethiopic-calendar'
// Ethiopian year lags 7-8 years behind Gregorian.

const ethMonthNames = [
  "Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir", "Yekatit",
  "Megabit", "Miyaziy", "Ginbot", "Sene", "Hamle", "Nehase", "Pagume"
];

const gregMonthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

export const toEthiopianDateString = (dateString: string): string => {
  if (dateString.toLowerCase().includes('today')) return 'Zare';
  if (dateString.toLowerCase().includes('yesterday')) return 'Tillant';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  // Constants
  const ethYearOffset = 8; // Approx
  const newYearMonth = 8; // September (0-indexed)
  const newYearDay = 11;

  let ethYear = date.getFullYear() - ethYearOffset;

  // If date is after Sep 11, it's the next Ethiopian year (e.g. Sep 12 2023 is 2016)
  // If date is before Sep 11, it's the previous Ethiopian year (e.g. Sep 10 2023 is 2015)
  // Wait, 2024 - 8 = 2016.
  // Sep 11 2024 is Meskerem 1, 2017.
  // So if after Sep 11, year is G - 7.
  if (date.getMonth() > newYearMonth || (date.getMonth() === newYearMonth && date.getDate() >= newYearDay)) {
    ethYear = date.getFullYear() - 7;
  }

  // Calculate Day of Year (approximate for visualization)
  const startOfYear = new Date(date.getFullYear(), 0, 1);
  const diff = date.getTime() - startOfYear.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  let dayOfYear = Math.floor(diff / oneDay);

  // Ethiopian New Year is usually around Day 254 (Sep 11)
  // We need to map this dayOfYear to Ethiopian Month/Day

  // Offset dayOfYear so that Sep 11 is Day 0
  let ethDayOfYear = dayOfYear - 254;
  if (ethDayOfYear < 0) ethDayOfYear += 365; // Wrap for previous year

  // Ethiopian months are 30 days each
  let ethMonthIndex = Math.floor(ethDayOfYear / 30);
  let ethDay = (ethDayOfYear % 30) + 1;

  // Handle Pagume (13th month)
  if (ethMonthIndex >= 12) {
    ethMonthIndex = 12; // Pagume
    // Pagume days are remaining
  }

  // Safety clamp
  if (ethMonthIndex < 0) ethMonthIndex = 0;
  if (ethMonthIndex > 12) ethMonthIndex = 12;

  return `${ethMonthNames[ethMonthIndex]} ${ethDay}, ${ethYear}`;
};

export const toGregorianDateString = (dateString: string): string => {
  if (dateString.toLowerCase().includes('today')) return 'Today';
  if (dateString.toLowerCase().includes('yesterday')) return 'Yesterday';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  return `${gregMonthNames[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};
