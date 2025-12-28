// Welcome page animation script
document.addEventListener('DOMContentLoaded', () => {
  // Animate skill bars on load
  setTimeout(() => {
    const bars = document.querySelectorAll('.skill-bar-fill');
    const widths = ['30%', '20%', '50%', '40%', '10%'];
    bars.forEach((bar, i) => {
      setTimeout(() => {
        bar.style.width = widths[i];
      }, i * 200);
    });
  }, 500);
});
