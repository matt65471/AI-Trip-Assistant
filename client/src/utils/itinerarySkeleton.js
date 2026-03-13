/**
 * Build an itinerary skeleton from trip requirements.
 * Creates one day per date in range, assigns locations from destinations, empty slots for building.
 */
export function buildItinerarySkeleton(requirements) {
  const { startDate, endDate, destinations } = requirements;
  if (!startDate || !endDate || !destinations?.length) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const days = [];
  const current = new Date(start);
  let dayNum = 1;

  while (current <= end) {
    const dateStr = current.toISOString().slice(0, 10);
    const locationIndex = (dayNum - 1) % destinations.length;
    const location = destinations[locationIndex];

    days.push({
      day: dayNum,
      date: dateStr,
      location,
      accommodation: null,
      activities: [null, null, null],
      meals: [null, null, null],
      transportation: null
    });

    current.setDate(current.getDate() + 1);
    dayNum++;
  }

  return {
    summary: '',
    totalEstimatedCost: null,
    days,
    tips: [],
    packingList: []
  };
}

/**
 * Get ordered list of "steps" (slots) for the builder UI.
 * Each step: { dayIndex, day, date, location, slotType, slotIndex, label }
 */
export function getBuilderSteps(itinerary) {
  if (!itinerary?.days?.length) return [];
  const steps = [];
  const slotLabels = {
    accommodation: 'Where to stay',
    activity: ['Morning activity', 'Midday activity', 'Afternoon activity'],
    meal: ['Breakfast', 'Lunch', 'Dinner'],
    transportation: 'Getting around'
  };

  itinerary.days.forEach((day, dayIndex) => {
    steps.push({
      dayIndex,
      day: day.day,
      date: day.date,
      location: day.location,
      slotType: 'accommodation',
      slotIndex: 0,
      label: slotLabels.accommodation
    });
    for (let i = 0; i < 3; i++) {
      steps.push({
        dayIndex,
        day: day.day,
        date: day.date,
        location: day.location,
        slotType: 'activity',
        slotIndex: i,
        label: slotLabels.activity[i]
      });
    }
    for (let i = 0; i < 3; i++) {
      steps.push({
        dayIndex,
        day: day.day,
        date: day.date,
        location: day.location,
        slotType: 'meal',
        slotIndex: i,
        label: slotLabels.meal[i]
      });
    }
    steps.push({
      dayIndex,
      day: day.day,
      date: day.date,
      location: day.location,
      slotType: 'transportation',
      slotIndex: 0,
      label: slotLabels.transportation
    });
  });

  return steps;
}

export function isSlotFilled(itinerary, dayIndex, slotType, slotIndex) {
  const day = itinerary?.days?.[dayIndex];
  if (!day) return false;
  if (slotType === 'accommodation') return day.accommodation != null;
  if (slotType === 'transportation') return day.transportation != null;
  if (slotType === 'activity') return (day.activities?.[slotIndex] ?? null) != null;
  if (slotType === 'meal') return (day.meals?.[slotIndex] ?? null) != null;
  return false;
}

export function getSlotValue(itinerary, dayIndex, slotType, slotIndex) {
  const day = itinerary?.days?.[dayIndex];
  if (!day) return null;
  if (slotType === 'accommodation') return day.accommodation;
  if (slotType === 'transportation') return day.transportation;
  if (slotType === 'activity') return day.activities?.[slotIndex] ?? null;
  if (slotType === 'meal') return day.meals?.[slotIndex] ?? null;
  return null;
}
