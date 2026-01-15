/**
 * Utility helpers for ride matching logic
 */

// Calculate time difference in minutes between two time strings or dates
// Accepting flexible inputs: Date objects, ISO strings, or time strings like "09:00 AM" if we assume Today
const parseTime = (t) => {
    if (t instanceof Date) return t;
    // Handle "HH:MM AM/PM" format relative to Today
    if (typeof t === 'string' && t.match(/\d{1,2}:\d{2}\s*(AM|PM)/i)) {
        const d = new Date();
        const [time, modifier] = t.split(' ');
        let [hours, minutes] = time.split(':');
        if (hours === '12') {
            hours = '00';
        }
        if (modifier.toUpperCase() === 'PM') {
            hours = parseInt(hours, 10) + 12;
        }
        d.setHours(hours, minutes, 0, 0);
        return d;
    }
    return new Date(t);
};

export const timeDifferenceInMinutes = (t1, t2) => {
    const date1 = parseTime(t1);
    const date2 = parseTime(t2);
    return Math.abs(date1 - date2) / 60000;
};

// Distance score: Higher is better (closer)
// Max score 10, drops as difference increases
export const distanceScore = (d1, d2) => {
    return Math.max(0, 10 - Math.abs(d1 - d2));
};

// Main matching function
export const matchRides = (riderRequest, availableRides) => {
    if (!availableRides) return [];

    return availableRides
        .filter(ride => {
            // Assume rides with defined seats available or logic to determine it
            // If seatsAvailable is not explicitly on ride, derive it? 
            // For MVP based on user prompt: "ride.seatsAvailable > 0"
            // Let's ensure we handle the property name mapping if needed.
            // In Home.jsx we have 'filledSeats' and 'totalSeats'.
            // So seatsAvailable = totalSeats - filledSeats.
            const seatsAvailable = (ride.seatsAvailable !== undefined)
                ? ride.seatsAvailable
                : (ride.totalSeats - ride.filledSeats);

            return seatsAvailable > 0;
        })
        .map(ride => {
            // Parse time strings to comparable objects
            const timeDiff = timeDifferenceInMinutes(
                riderRequest.time,
                ride.time
            );

            // Scoring logic as defined
            const timeScore =
                timeDiff <= 10 ? 30 :
                    timeDiff <= 20 ? 20 :
                        timeDiff <= 30 ? 10 : 0;

            const routeScore = distanceScore(
                riderRequest.distance,
                ride.distance
            ) * 5;

            const seatsAvailable = (ride.seatsAvailable !== undefined)
                ? ride.seatsAvailable
                : (ride.totalSeats - ride.filledSeats);

            const seatScore = seatsAvailable * 5;

            const totalScore = timeScore + routeScore + seatScore;

            return {
                ...ride,
                matchScore: totalScore,
                // Optional: return debug info
                _debug: { timeDiff, timeScore, routeScore, seatScore }
            };
        })
        .filter(ride => ride.matchScore > 0)
        .sort((a, b) => b.matchScore - a.matchScore);
};
