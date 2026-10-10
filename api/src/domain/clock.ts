// Injectable clock interface for handling time and time zone cut-offs (e.g., Kigali UTC+2 14:00)

let mockedNow: Date | null = null;

export const Clock = {
  now(): Date {
    return mockedNow ? new Date(mockedNow.getTime()) : new Date();
  },

  setMockedTime(date: Date | string | null) {
    if (date === null) {
      mockedNow = null;
    } else {
      mockedNow = new Date(date);
    }
  },

  getKigaliHour(): number {
    const d = this.now();
    // Kigali is UTC+2
    // Calculate hour in UTC+2
    const utcHour = d.getUTCHours();
    const kigaliHour = (utcHour + 2) % 24;
    return kigaliHour;
  }
};
