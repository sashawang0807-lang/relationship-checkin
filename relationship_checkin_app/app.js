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
  },
  {
    id: "low_profile",
    title: "Low profile or hidden?",
    text: "When you say you want our relationship to be low profile, what does that mean? Is it privacy, shyness, or not wanting people to know you have a partner?",
    boundary: "I can accept privacy, but I cannot accept feeling hidden or like I am something to be ashamed of."
  },
  {
    id: "sex_connection",
    title: "Sex and emotional connection",
    text: "What makes you feel emotionally connected to someone? Is sex one part of that for you, or the main way?",
    boundary: "I enjoy being close to you, but sex cannot be the only way we connect."
  },
  {
    id: "practical_effort",
    title: "Practical effort",
    text: "Now that you know what I need, what are you willing to do differently?",
    boundary: "I need action, not only explanations. Small changes are okay, but there has to be some change."
  },
  {
    id: "three_months",
    title: "The next three months",
    text: "Three months from now, what do you want us to look like?",
    boundary: "I do not need a promise about forever, but I need some direction for the present."
  },
  {
    id: "meet_halfway",
    title: "Can we meet halfway?",
    text: "Do you still want to keep trying with me and meet me halfway?",
    boundary: "I do not want to force you, and I do not want to ignore myself. I need both of us to participate."
  }
];

function startForm() {
  const name = document.getElementById("name").value.trim();
  const code = document.getElementById("code").value.trim();

  if (!name || !code) {
    alert("Please enter your name and access code.");
    return;
  }

  document.getElementById("intro").classList.add("hidden");
  document.getElementById("form").classList.remove("hidden");
  renderQuestions();
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

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const accessCode = document.getElementById("code").value.trim();
  const formData = new FormData(e.target);

  const responses = questions.map(q => ({
    id: q.id,
    question: q.text,
    boundary: q.boundary,
    choice: formData.get(`${q.id}_choice`),
    opinion: formData.get(`${q.id}_opinion`),
    action: formData.get(`${q.id}_action`)
  }));

  const payload = {
    participant_name: name,
    access_code: accessCode,
    responses,
    final_thoughts: document.getElementById("finalThoughts").value.trim()
  };

  const status = document.getElementById("status");
  status.textContent = "Submitting...";

  const { error } = await supabaseClient.from("relationship_responses").insert(payload);

  if (error) {
    console.error(error);
    status.textContent = "Error submitting. Check Supabase settings.";
  } else {
    status.textContent = "Submitted. Thank you.";
    e.target.reset();
  }
});

function showAdmin() {
  document.getElementById("admin").classList.remove("hidden");
  document.getElementById("admin").scrollIntoView({ behavior: "smooth" });
}

async function loadAnswers() {
  const code = document.getElementById("viewCode").value.trim();
  const answers = document.getElementById("answers");

  if (!code) {
    alert("Enter access code.");
    return;
  }

  answers.innerHTML = "Loading...";

  const { data, error } = await supabaseClient
    .from("relationship_responses")
    .select("*")
    .eq("access_code", code)
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    answers.innerHTML = "Error loading answers.";
    return;
  }

  if (!data.length) {
    answers.innerHTML = "No answers found for this code.";
    return;
  }

  answers.innerHTML = data.map(entry => `
    <div class="answer-card">
      <h3>${escapeHtml(entry.participant_name)}</h3>
      <p><span class="badge">${new Date(entry.created_at).toLocaleString()}</span></p>
      ${entry.responses.map(r => `
        <hr>
        <p><strong>Question:</strong> ${escapeHtml(r.question)}</p>
        <p><strong>My boundary:</strong> ${escapeHtml(r.boundary)}</p>
        <p><strong>Answer:</strong> <span class="badge">${escapeHtml(r.choice)}</span></p>
        <p><strong>Opinion:</strong></p>
        <pre>${escapeHtml(r.opinion || "")}</pre>
        <p><strong>Practical action:</strong></p>
        <pre>${escapeHtml(r.action || "")}</pre>
      `).join("")}
      <hr>
      <p><strong>Final thoughts:</strong></p>
      <pre>${escapeHtml(entry.final_thoughts || "")}</pre>
    </div>
  `).join("");
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, s => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[s]));
}
