const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentPerson = null;

const questions = [
  {
    section: "Part 1 — Relationship Direction",
    id: "q1_continue",
    title: "Do you want to continue building this relationship?",
    text: "Do you want to continue building this relationship?",
    boundary: "I need a relationship that is moving forward, not standing still."
  },
  {
    section: "Part 1 — Relationship Direction",
    id: "q2_healthy",
    title: "What does a healthy relationship look like to you?",
    text: "What does a healthy relationship look like to you?",
    boundary: "I want us to understand whether we are aiming for the same kind of relationship."
  },
  {
    section: "Part 1 — Relationship Direction",
    id: "q3_slow",
    title: "What does taking it slow mean to you?",
    text: "What does “taking it slow” mean to you?",
    boundary: "I can accept slow progress, but I cannot accept no progress."
  },
  {
    section: "Part 1 — Relationship Direction",
    id: "q4_growth",
    title: "Do you see potential growth between us?",
    text: "Do you see potential growth between us?",
    boundary: "I do not need certainty, but I need some hope and direction."
  },
  {
    section: "Part 2 — Needs & Boundaries",
    id: "q5_time",
    title: "How much time do you realistically want with a partner?",
    text: "How much time do you realistically want with a partner?",
    boundary: "I need quality time together, not only occasional meetings."
  },
  {
    section: "Part 2 — Needs & Boundaries",
    id: "q6_space",
    title: "How much personal space do you need?",
    text: "How much personal space do you need?",
    boundary: "I respect your independence, but I also need to feel included."
  },
  {
    section: "Part 2 — Needs & Boundaries",
    id: "q7_reasonable",
    title: "Do you think my needs are reasonable?",
    text: "Do you think my needs are reasonable?",
    boundary: "I need my feelings to be understood even when we disagree."
  },
  {
    section: "Part 2 — Needs & Boundaries",
    id: "q8_differently",
    title: "What are you willing to do differently for this relationship?",
    text: "What are you willing to do differently for this relationship?",
    boundary: "I need action, not only explanations."
  },
  {
    section: "Part 3 — Visibility",
    id: "q9_low_profile",
    title: "What does low profile mean to you?",
    text: "What does “low profile” mean to you?",
    boundary: "I can accept privacy, but I cannot accept feeling hidden."
  },
  {
    section: "Part 3 — Visibility",
    id: "q10_people_knowing",
    title: "Why do you prefer people not knowing you have a partner?",
    text: "Why do you prefer people not knowing you have a partner?",
    boundary: "I need to understand whether this comes from privacy, fear, insecurity, or something else."
  },
  {
    section: "Part 4 — Intimacy",
    id: "q11_connected",
    title: "What makes you feel emotionally connected to someone?",
    text: "What makes you feel emotionally connected to someone?",
    boundary: "I need emotional intimacy in addition to physical intimacy."
  },
  {
    section: "Part 4 — Intimacy",
    id: "q12_no_sex",
    title: "If sex disappeared for one month, what would our relationship look like?",
    text: "If sex disappeared for one month, what would our relationship look like?",
    boundary: "I want our relationship to exist outside of sex."
  },
  {
    section: "Part 5 — Future",
    id: "q13_three_months",
    title: "Three months from now, what do you want us to look like?",
    text: "Three months from now, what do you want us to look like?",
    boundary: "I do not need forever. I need direction."
  },
  {
    section: "Part 5 — Future",
    id: "q14_fear",
    title: "What are you afraid will happen if this relationship becomes more serious?",
    text: "What are you afraid will happen if this relationship becomes more serious?",
    boundary: "I want to understand the fears behind the hesitation."
  }
];

function selectPerson(name) {
  currentPerson = name;
  document.getElementById("home").classList.add("hidden");
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("form").classList.remove("hidden");
  document.getElementById("formTitle").textContent = `${name}'s Answers`;
  renderQuestions();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function goHome() {
  document.getElementById("form").classList.add("hidden");
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("home").classList.remove("hidden");
  document.getElementById("status").textContent = "";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function showDashboard() {
  document.getElementById("home").classList.add("hidden");
  document.getElementById("form").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  loadDashboard();
}

function renderQuestions() {
  const container = document.getElementById("questions");
  container.innerHTML = "";
  let lastSection = "";

  questions.forEach((q, index) => {
    if (q.section !== lastSection) {
      const heading = document.createElement("h2");
      heading.className = "section-title";
      heading.textContent = q.section;
      container.appendChild(heading);
      lastSection = q.section;
    }

    const div = document.createElement("section");
    div.className = "question";
    div.innerHTML = `
      <h3>Q${index + 1}. ${escapeHtml(q.title)}</h3>
      <p>${escapeHtml(q.text)}</p>
      <div class="boundary"><strong>My boundary:</strong> ${escapeHtml(q.boundary)}</div>

      <label>Your answer</label>
      <div class="choice-row">
        <label class="pill"><input type="radio" name="${q.id}_choice" value="Agree" required> Agree</label>
        <label class="pill"><input type="radio" name="${q.id}_choice" value="Disagree"> Disagree</label>
        <label class="pill"><input type="radio" name="${q.id}_choice" value="Need Discussion"> Need Discussion</label>
      </div>

      <label>Your thoughts</label>
      <textarea name="${q.id}_thoughts" placeholder="Write your honest answer..." required></textarea>

      <label>What are you willing to do?</label>
      <textarea name="${q.id}_action" placeholder="Write specific actions you are willing to try..."></textarea>
    `;
    container.appendChild(div);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderQuestions();

  document.getElementById("form").addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!currentPerson) {
      alert("Please choose Jingyi or Rodrigo first.");
      return;
    }

    const formData = new FormData(e.target);

    const responses = questions.map((q, index) => ({
      number: index + 1,
      id: q.id,
      section: q.section,
      title: q.title,
      question: q.text,
      boundary: q.boundary,
      choice: formData.get(`${q.id}_choice`),
      thoughts: formData.get(`${q.id}_thoughts`),
      action: formData.get(`${q.id}_action`)
    }));

    const payload = {
      participant_name: currentPerson,
      responses,
      final_thoughts: document.getElementById("finalThoughts").value.trim()
    };

    const status = document.getElementById("status");
    status.textContent = "Submitting...";

    const { error } = await supabaseClient
      .from("relationship_responses")
      .insert(payload);

    if (error) {
      console.error(error);
      status.textContent = "Error submitting. Check Supabase table/settings.";
    } else {
      status.textContent = "Submitted. Thank you.";
      e.target.reset();
      setTimeout(showDashboard, 800);
    }
  });
});

async function loadDashboard() {
  const completion = document.getElementById("completion");
  const summary = document.getElementById("summary");
  const compare = document.getElementById("compare");

  completion.innerHTML = "Loading...";
  summary.innerHTML = "";
  compare.innerHTML = "";

  const { data, error } = await supabaseClient
    .from("relationship_responses")
    .select("*")
    .in("participant_name", ["Jingyi", "Rodrigo"])
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error);
    completion.innerHTML = "<p class='missing'>Error loading dashboard. Check Supabase settings.</p>";
    return;
  }

  const latest = {};
  for (const entry of data) {
    if (!latest[entry.participant_name]) latest[entry.participant_name] = entry;
  }

  completion.innerHTML = `
    <div class="status-grid">
      <div class="status-card">
        <h3>Jingyi</h3>
        <p class="${latest.Jingyi ? "ok" : "missing"}">${latest.Jingyi ? "Completed ✓" : "Not completed"}</p>
        <p class="muted">${latest.Jingyi ? new Date(latest.Jingyi.created_at).toLocaleString() : ""}</p>
      </div>
      <div class="status-card">
        <h3>Rodrigo</h3>
        <p class="${latest.Rodrigo ? "ok" : "missing"}">${latest.Rodrigo ? "Completed ✓" : "Not completed"}</p>
        <p class="muted">${latest.Rodrigo ? new Date(latest.Rodrigo.created_at).toLocaleString() : ""}</p>
      </div>
    </div>
  `;

  if (!latest.Jingyi && !latest.Rodrigo) {
    compare.innerHTML = "<p>No submitted answers yet.</p>";
    return;
  }

  renderSummary(latest);
  renderComparison(latest);
}

function renderSummary(latest) {
  const summary = document.getElementById("summary");

  if (!latest.Jingyi || !latest.Rodrigo) {
    summary.innerHTML = `
      <div class="summary-card">
        <h3>Friday Discussion Summary</h3>
        <p class="muted">Both people need to submit before automatic comparison is available.</p>
      </div>
    `;
    return;
  }

  const j = mapResponses(latest.Jingyi.responses);
  const r = mapResponses(latest.Rodrigo.responses);

  const agreements = [];
  const needDiscussion = [];
  const majorDifferences = [];

  questions.forEach(q => {
    const jc = j[q.id]?.choice;
    const rc = r[q.id]?.choice;

    if (jc === "Agree" && rc === "Agree") agreements.push(q.title);
    if (jc === "Need Discussion" || rc === "Need Discussion") needDiscussion.push(q.title);
    if ((jc === "Agree" && rc === "Disagree") || (jc === "Disagree" && rc === "Agree")) {
      majorDifferences.push(q.title);
    }
  });

  summary.innerHTML = `
    <div class="summary-card">
      <h3>Friday Discussion Summary</h3>

      <p><strong>Agreements</strong></p>
      ${listOrEmpty(agreements, "No strong agreements yet.")}

      <p><strong>Need Discussion</strong></p>
      ${listOrEmpty(needDiscussion, "No items marked Need Discussion.")}

      <p><strong>Major Differences</strong></p>
      ${listOrEmpty(majorDifferences, "No direct Agree/Disagree conflicts.")}

      <p><strong>Suggested focus for Friday</strong></p>
      <p class="muted">${suggestFocus(needDiscussion, majorDifferences)}</p>
    </div>
  `;
}

function renderComparison(latest) {
  const compare = document.getElementById("compare");
  const jingyi = latest.Jingyi ? mapResponses(latest.Jingyi.responses) : {};
  const rodrigo = latest.Rodrigo ? mapResponses(latest.Rodrigo.responses) : {};

  compare.innerHTML = `
    <div class="compare-card">
      <h3>Answer Comparison</h3>
      <table class="compare-table">
        <thead>
          <tr>
            <th>Question</th>
            <th>Jingyi</th>
            <th>Rodrigo</th>
          </tr>
        </thead>
        <tbody>
          ${questions.map(q => `
            <tr>
              <td>
                <strong>Q${questions.indexOf(q)+1}. ${escapeHtml(q.title)}</strong>
                <p class="muted">${escapeHtml(q.boundary)}</p>
              </td>
              <td>${renderPersonAnswer(jingyi[q.id])}</td>
              <td>${renderPersonAnswer(rodrigo[q.id])}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

function renderPersonAnswer(answer) {
  if (!answer) return "<span class='missing'>No answer</span>";
  return `
    <span class="badge ${badgeClass(answer.choice)}">${escapeHtml(answer.choice || "")}</span>
    <p><strong>Thoughts:</strong></p>
    <pre>${escapeHtml(answer.thoughts || "")}</pre>
    <p><strong>Willing to do:</strong></p>
    <pre>${escapeHtml(answer.action || "")}</pre>
  `;
}

function mapResponses(responses) {
  const map = {};
  (responses || []).forEach(r => map[r.id] = r);
  return map;
}

function badgeClass(choice) {
  if (choice === "Agree") return "agree";
  if (choice === "Disagree") return "disagree";
  return "discuss";
}

function listOrEmpty(items, emptyText) {
  if (!items.length) return `<p class="muted">${emptyText}</p>`;
  return `<ul>${items.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
}

function suggestFocus(needDiscussion, majorDifferences) {
  const items = [...majorDifferences, ...needDiscussion];
  if (!items.length) return "Use Friday to confirm what is already working and agree on practical next steps.";
  return `Start with: ${items.slice(0, 3).join(", ")}. Focus on concrete actions, not only explanations.`;
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, s => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[s]));
}
