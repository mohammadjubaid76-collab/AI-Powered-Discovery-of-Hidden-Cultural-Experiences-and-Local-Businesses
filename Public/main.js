/**
 * Team Venator - Interactive UI Handler
 * AI Synergy Hackathon 2026
 */

document.addEventListener('DOMContentLoaded', () => {
  const timeSlider = document.getElementById('timeBudgetSlider');
  const sliderDisplay = document.getElementById('sliderDisplay');
  const queryInput = document.getElementById('queryInput');
  const chips = document.querySelectorAll('.chip');

  // 1. Time Budget Slider Live Binding
  if (timeSlider && sliderDisplay) {
    const updateSliderDisplay = () => {
      const hours = parseFloat(timeSlider.value).toFixed(1);
      const minutes = Math.round(hours * 60);
      sliderDisplay.textContent = `${hours} Hours (${minutes} min)`;
    };

    timeSlider.addEventListener('input', updateSliderDisplay);
    updateSliderDisplay();
  }

  // 2. Category Quick Chips auto-fill
  if (chips.length > 0 && queryInput) {
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const text = chip.getAttribute('data-query');
        if (text) {
          queryInput.value = text;
          queryInput.focus();
        }
      });
    });
  }
});
