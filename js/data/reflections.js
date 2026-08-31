// ==========================================
// DATA: DAILY MINDFUL REFLECTION QUESTIONS
// ==========================================
// A collection of thought-provoking, grounding reflection questions
// presented during daily habit check-ins to foster mindfulness and self-awareness.

const REFLECTION_QUESTIONS = [
  "What assumption did you make today that might be wrong?",
  "If today was a chapter in your book, what would its title be?",
  "What habit today will your future self thank you for?",
  "Are you reacting to your day, or actively shaping it?",
  "What is something you learned today that shifted your perspective?",
  "What's one thing you did today purely for your own joy?",
  "What unspoken rule are you following that you never agreed to?",
  "If you had 1 extra hour with zero obligations, how would you spend it?",
  "What's the smallest change that would give you the biggest peace of mind?",
  "Are you spending your energy on what truly matters to you?",
  "What's one belief you held last year that you've outgrown?",
  "What would you attempt today if failure was impossible?",
  "What hard truth did you embrace recently that made you stronger?",
  "What's one noise in your life you need to turn down?",
  "What made you feel genuinely grateful or smile today?",
  "What is one thing you can forgive yourself for today?",
  "What energizes you the most when you start your morning?",
  "If your daily routine was a work of art, what would it look like?",
  "What friction point in your life can you simplify or remove this week?",
  "Who in your life deserves a quick thank you or appreciation note today?",
  "What important task have you been postponing that takes less than 5 minutes?",
  "What did you say 'yes' to today that you should have said 'no' to?",
  "How would you live today differently if you knew tomorrow was a new beginning?",
  "What is one boundary you can set today to protect your peace?",
  "What victory, no matter how small, are you proud of today?"
];

/**
 * Returns a random reflection question from the collection.
 * @returns {string}
 */
function getRandomReflectionQuestion() {
  if (!Array.isArray(REFLECTION_QUESTIONS) || REFLECTION_QUESTIONS.length === 0) {
    return "What habit today will your future self thank you for?";
  }
  const index = Math.floor(Math.random() * REFLECTION_QUESTIONS.length);
  return REFLECTION_QUESTIONS[index];
}
