// Welcome page animation and setup script
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

  // Handle "START YOUR QUEST" button click
  const startButton = document.querySelector('.start-btn');
  if (startButton) {
    startButton.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent default link behavior

      // Open setup page in a popup window
      chrome.windows.create({
        url: chrome.runtime.getURL('setup/setup.html'),
        type: 'popup',
        width: 500,
        height: 700
      });
    });
  }
});
