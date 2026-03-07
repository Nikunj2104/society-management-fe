export interface Festival {
    _id?: string;
    name: string;
    date: string; // format: MM-DD
    startTime?: string; // format: HH:mm (24-hour)
    endTime?: string; // format: HH:mm (24-hour)
    theme: string;
    message: string;
    emojis: string[];
    alwaysActive?: boolean;
    notificationType?: 'auto-dismiss' | 'dismissible' | 'persistent';
}

export const getCurrentFestival = (festivalsList: Festival[]): Festival | null => {
    if (!festivalsList || festivalsList.length === 0) return null;

    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const todayStr = `${month}-${day}`;

    const currentHour = String(today.getHours()).padStart(2, '0');
    const currentMin = String(today.getMinutes()).padStart(2, '0');
    const currentTime = `${currentHour}:${currentMin}`;

    // Find any festival that matches today's date
    const todaysFestivals = festivalsList.filter(f => f.date === todayStr);

    if (todaysFestivals.length > 0) {
        // Check if there are time constraints
        for (const fest of todaysFestivals) {
            if (!fest.startTime || !fest.endTime) {
                return fest; // No time bounds, active all day
            }
            if (currentTime >= fest.startTime && currentTime <= fest.endTime) {
                return fest;
            }
        }

        // Default to the first all-day festival
        const allDayFest = todaysFestivals.find(f => !f.startTime);
        if (allDayFest) return allDayFest;
    }

    // If no festival is active today, return the fallback alwaysActive notification if it exists
    const alwaysActiveFest = festivalsList.find(f => f.alwaysActive);
    return alwaysActiveFest || null;
};
