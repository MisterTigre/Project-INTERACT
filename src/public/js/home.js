const modal = document.getElementById('answer-instructions');

const THRESHOLD = 120;

function distanceToRect(x, y, rect) {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return Math.hypot(dx, dy);
}

let savedRect

function onMove(e) {
  if (!modal.classList.contains('is-open')) return;

  let rect
  if (savedRect) {
    rect = savedRect
  }
  else {
    rect = modal.getBoundingClientRect();
  }
  const d = distanceToRect(e.clientX, e.clientY, rect);

  if (d < THRESHOLD) {
    // mouse close -> move modal to bottom
    if (!modal.classList.contains('move-bottom')) {
      modal.classList.add('move-bottom');

      // Save bounding box
      savedRect = rect
    }
  } else if (modal.classList.contains('move-bottom')) {
    modal.classList.remove('move-bottom');
    savedRect = undefined
  }
}

document.addEventListener('mousemove', onMove);
