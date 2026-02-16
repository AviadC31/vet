export interface ReviewItem {
  id: string; // ID of the item being reviewed
  interval: number; // in days
  repetition: number;
  efactor: number;
  nextReviewDate: string; // ISO date string
}

export function calculateNextReview(
  rating: "hard" | "good" | "easy",
  previousItem?: ReviewItem,
): ReviewItem {
  // Defaults for new items
  let interval = 1;
  let repetition = 0;
  let efactor = 2.5;

  if (previousItem) {
    interval = previousItem.interval;
    repetition = previousItem.repetition;
    efactor = previousItem.efactor;
  }

  // Map rating to grade (0-5 scale in SM-2)
  // Hard: 3, Good: 4, Easy: 5
  let grade = 0;
  switch (rating) {
    case "hard":
      grade = 3;
      break;
    case "good":
      grade = 4;
      break;
    case "easy":
      grade = 5;
      break;
  }

  // Calculate new E-Factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  efactor = efactor + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
  if (efactor < 1.3) efactor = 1.3;

  // Calculate new Repetition and Interval
  if (repetition === 0) {
    interval = 1;
  } else if (repetition === 1) {
    interval = 6;
  } else {
    interval = Math.round(interval * efactor);
  }

  repetition++;

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + interval);

  return {
    id: previousItem?.id || "", // ID maintenance
    interval,
    repetition,
    efactor,
    nextReviewDate: nextReviewDate.toISOString(),
  };
}
