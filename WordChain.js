let sets = [];
let currentSetIndex = 0;
let currentRevealIndex = 1;    // index of the next word to reveal
let letterRevealCount = 1;     // how many letters of that word to show
let showLettersActive = false; // state of the Show Letters toggle

async function loadGameData() {
  const resp = await fetch("game.json");
  const data = await resp.json();
  sets = data.sets;
  renderSet();
  setupButtons();
}

function renderSet() {
  const words = sets[currentSetIndex];
  const list = document.getElementById("word-list");
  list.innerHTML = "";
  // reset pointers and toggle
  currentRevealIndex = 1;
  letterRevealCount = 1;
  showLettersActive = false;

  // Reset Next‐button label
  document.getElementById("next-button").textContent = "Next";

  // Build the list: first word shown, rest as first letter + 4 blanks
  words.forEach((w, i) => {
    const li = document.createElement("li");
    if (i === 0) {
      li.textContent = w;
    } else {
      const blanks = Array(4).fill("_").join(" ");
      li.textContent = w[0] + " " + blanks;
    }
    list.appendChild(li);
  });
}

function setupButtons() {
  document.getElementById("next-button")
    .addEventListener("click", revealNext);

  document.getElementById("back-button")
    .addEventListener("click", goBack);

  document.getElementById("show-letters-button")
    .addEventListener("click", toggleShowLetters);

  document.getElementById("show-next-letter")
    .addEventListener("click", showNextLetter);

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      revealNext();
    }
  });
}

function revealNext() {
  const words = sets[currentSetIndex];
  const items = document.querySelectorAll("#word-list li");

  if (currentRevealIndex < words.length) {
    // fully reveal this word
    items[currentRevealIndex].textContent = words[currentRevealIndex];
    currentRevealIndex++;
    // reset hint state for the next word
    letterRevealCount = 1;
    showLettersActive = false;

    // if that was the last word, switch to "Next Set"
    if (currentRevealIndex === words.length) {
      document.getElementById("next-button").textContent = "Next Set";
    }
  } else {
    // advance to the next set (loop around)
    currentSetIndex = (currentSetIndex + 1) % sets.length;
    renderSet();
  }
}

function goBack() {
  const words = sets[currentSetIndex];
  // only if we've already revealed at least one word
  if (currentRevealIndex > 1) {
    currentRevealIndex--;
    const items = document.querySelectorAll("#word-list li");
    const w = words[currentRevealIndex];
    const li = items[currentRevealIndex];

    // hide it back to first letter + 4 blanks
    const blanks = Array(4).fill("_").join(" ");
    li.textContent = w[0] + " " + blanks;

    // reset hint state
    letterRevealCount = 1;
    showLettersActive = false;

    // ensure Next‐button says "Next"
    document.getElementById("next-button").textContent = "Next";
  }
}

function toggleShowLetters() {
  const words = sets[currentSetIndex];
  if (currentRevealIndex >= words.length) return; // nothing left to hint
  const w = words[currentRevealIndex];
  const items = document.querySelectorAll("#word-list li");
  const li = items[currentRevealIndex];

  if (!showLettersActive) {
    // turn ON → first letter + full-length blanks
    const fullBlanks = Array(w.length - 1).fill("_").join(" ");
    li.textContent = w[0] + " " + fullBlanks;
    showLettersActive = true;
  } else {
    // turn OFF → revert to first letter + 4 blanks
    const fourBlanks = Array(4).fill("_").join(" ");
    li.textContent = w[0] + " " + fourBlanks;
    showLettersActive = false;
  }
}

function showNextLetter() {
  const words = sets[currentSetIndex];
  if (currentRevealIndex >= words.length) return;
  const w = words[currentRevealIndex];
  const items = document.querySelectorAll("#word-list li");
  const li = items[currentRevealIndex];

  // only reveal up to the full word
  if (letterRevealCount < w.length) {
    letterRevealCount++;
    const revealed = w.slice(0, letterRevealCount).split("").join(" ");
    const blanks = Array(w.length - letterRevealCount).fill("_").join(" ");
    li.textContent = revealed + (blanks ? " " + blanks : "");
  }
}

// initialize
loadGameData();
