const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const questions = [
  {
    id: "continue_relationship",
    title: "Do you want to continue building this relationship?",
    text: "Do you actually want to keep building a relationship with me, not just stay because we are attached to each other?",
    boundary: "I need a relationship that is being built, not something that stays in the same place indefinitely."
  },
  {
    id: "taking_it_slow",
    title: "What does taking it slow mean?",
    text: "When you say you want to take things slowly, what exactly does slow mean — emotionally, socially, physically, or future planning?",
    boundary: "I can accept slow progress, but I cannot accept no progress."
  },
  {
    id: "space_vs_closeness",
    title: "Personal space vs closeness",
    text: "You need more time for yourself. I need more closeness and shared time. Do you think both needs can exist in the same relationship?",
    boundary: "I respect your personal space, but I also need to feel included in your life."
  }
];

function startForm() {
  const name = document.getElementById("name").value.trim();
  const code = document.getElementById("code").value.trim();

  if (!name || !code) {
    alert("Please enter your name and access code.");
    return;
  }

  renderQuestions();
  document.getElementById("intro").classList.add("hidden");
  document.getElementById("form").classList.remove("hidden");
}

function renderQuestions() {
  const container = document.getElementById("questions");
  container.innerHTML = "";

  questions.forEach((q, index) => {
    const div = document.createElement("div");
    div.className = "question";
    div.innerHTML = `
      <h3>${index + 1}. ${q.title}</h3>
      <p>${q.text}</p>
      <div class="boundary"><strong>My boundary:</strong> ${q.boundary}</div>

      <label>Your answer</label>
      <div class="choice-row">
        <label class="pill"><input type="radio" name="${q.id}_choice" value="Agree" required> Agree</label>
        <label class="pill"><input type="radio" name="${q.id}_choice" value="Disagree"> Disagree</label>
        <label class="pill"><input type="radio" name="${q.id}_choice" value="Need discussion"> Need discussion</label>
      </div>

      <label>Your opinion</label>
      <textarea name="${q.id}_opinion" placeholder="Write your honest opinion..." required></textarea>

      <label>What are you willing to do in practice?</label>
      <textarea name="${q.id}_action" placeholder="Write specific actions you are willing to try..."></textarea>
    `;
    container.appendChild(div);
  });
}
