const container = document.querySelector(".container");
const searchInput = container.querySelector("input");
const sound = document.getElementById("sound");
const infoText = container.querySelector(".info-text");
const removeIcon = container.querySelector(".search span");
let audio = null;

function data(result, word) {
  // API returns an object with `title` on errors
  if (result && result.title) {
    infoText.innerHTML = `Oops ;) we can't find <span>"${word}"</span>.`;
    container.classList.remove("active");
    return;
  }

  // Expecting an array of entries
  const entry = Array.isArray(result) && result.length ? result[0] : null;
  if (!entry) {
    infoText.innerHTML = `Oops ;) we can't find <span>"${word}"</span>.`;
    container.classList.remove("active");
    return;
  }

  container.classList.add("active");

  // Find a meaning that has at least one definition
  const meaning = (entry.meanings || []).find((m) => m.definitions && m.definitions.length) || (entry.meanings || [])[0];
  const definitionText = meaning && meaning.definitions && meaning.definitions[0] && meaning.definitions[0].definition ? meaning.definitions[0].definition : "Definition not available.";
  const partOfSpeech = meaning && meaning.partOfSpeech ? meaning.partOfSpeech : "";

  // Phonetic text may be on `entry.phonetic` or inside phonetics array
  let phoneticText = entry.phonetic || "";
  if (!phoneticText && Array.isArray(entry.phonetics)) {
    const withText = entry.phonetics.find((p) => p && p.text);
    if (withText) phoneticText = withText.text;
  }

  // Find available audio (some entries have empty audio strings)
  let audioSrc = null;
  if (Array.isArray(entry.phonetics)) {
    const withAudio = entry.phonetics.find((p) => p && p.audio);
    if (withAudio && withAudio.audio) audioSrc = withAudio.audio;
  }

  document.querySelector(".word p").innerText = entry.word || word;
  document.querySelector(".word span").innerText = `${partOfSpeech} ${phoneticText ? ' /' + phoneticText + '/' : ''}`.trim();
  document.querySelector(".meaning span").innerText = definitionText;

  if (audioSrc) {
    audio = new Audio(audioSrc);
    if (sound) sound.style.display = "inline-block";
  } else {
    audio = null;
    if (sound) sound.style.display = "none";
  }
}

function playSound() {
  if (audio && typeof audio.play === "function") {
    audio.play().catch(() => {});
  }
}

function search(word) {
  fetchApi(word);
  searchInput.value = word;
}

function fetchApi(word) {
  container.classList.remove("active");
  infoText.style.color = "#000";
  infoText.innerHTML = `Searching :) `;

  const cleaned = String(word).trim().toLowerCase();
  if (!cleaned) {
    infoText.innerHTML = "Please enter a word to search.";
    return;
  }

  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleaned)}`;
  fetch(url)
    .then((response) => response.json())
    .then((result) => data(result, cleaned))
    .catch(() => {
      infoText.innerHTML = `Oops ;) we can't find <span>"${cleaned}"</span>.`;
      container.classList.remove("active");
    });
}

searchInput.addEventListener("keyup", (e) => {
  let word = e.target.value.replace(/\s+/g, " ").trim();
  if (e.key === "Enter" && word) {
    fetchApi(word);
  }
});

removeIcon.addEventListener("click", () => {
  searchInput.value = "";
  searchInput.focus();
  container.classList.remove("active");
  infoText.style.color = "#9A9A9A";
  infoText.innerHTML = "Type a word and press Enter to search";
});