const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentPerson = null;
let currentRecordId = null;
let currentQuestionIndex = 0;
let saveTimer = null;
let answers = {};

const questions = [
  {
    section: "Part 1 — Relationship Direction",
    id: "q1_continue",
    title: "Do you want to continue building this relationship?",
    boundary: "I need a relationship that is moving forward, not standing still."
  },
  {
    section: "Part 1 — Relationship Direction",
    id: "q2_healthy",
    title: "What does a healthy relationship look like to you?",
    boundary: "I want us to understand whether we are aiming for the same kind of relationship."
  },
  {
    section: "Part 1 — Relationship Direction",
    id: "q3_slow",
    title: "What does “taking it slow” mean to you?",
    boundary: "I can accept slow progress, but I cannot accept no progress."
  },
  {
    section: "Part 1 — Relationship Direction",
    id: "q4_growth",
    title: "Do you see potential growth between us?",
    boundary: "I do not need certainty, but I need some hope and direction."
  },
  {
    section: "Part 2 — Needs & Boundaries",
    id: "q5_time",
    title: "How much time do you realistically want with a partner?",
    boundary: "I need quality time together, not only occasional meetings."
  },
  {
    section: "Part 2 — Needs & Boundaries",
    id: "q6_space",
    title: "How much personal space do you need?",
    boundary: "I respect your independence, but I also need to feel included."
  },
  {
    section: "Part 2 — Needs & Boundaries",
    id: "q7_reasonable",
    title: "Do you think my needs are reasonable?",
    boundary: "I need my feelings to be understood even when we disagree."
  },
  {
    section: "Part 2 — Needs & Boundaries",
    id: "q8_differently",
    title: "What are you willing to do differently for this relationship?",
    boundary: "I need action, not only explanations."
  },
  {
    section: "Part 3 — Visibility",
    id: "q9_low_profile",
    title: "What does “low profile” mean to you?",
    boundary: "I can accept privacy, but I cannot accept feeling hidden."
  },
  {
    section: "Part 3 — Visibility",
    id: "q10_people_knowing",
    title: "Why do you prefer people not knowing you have a partner?",
    boundary: "I need to understand whether this comes from privacy, fear, insecurity, or something else."
  },
  {
    section: "Part 4 — Intimacy",
    id: "q11_connected",
    title: "What makes you feel emotionally connected to someone?",
    boundary: "I need emotional intimacy in addition to physical intimacy."
  },
  {
    section: "Part 4 — Intimacy",
    id: "q12_no_sex",
    title: "If sex disappeared for one month, what would our relationship look like?",
    boundary: "I want our relationship to exist outside of sex."
  },
  {
    section: "Part 5 — Future",
    id: "q13_three_months",
    title: "Three months from now, what do you want us to look like?",
    boundary: "I do not need forever. I need direction."
  },
  {
    section: "Part 5 — Future",
    id: "q14_fear",
    title: "What are you afraid will happen if this relationship becomes more serious?",
    boundary: "I want to understand the fears behind the hesitation."
  }
];

document.addEventListener("DOMContentLoaded", () => {
  loadHomeStatus();
});

async function selectPerson(name) {
  currentPerson = name;
  currentQuestionIndex = 0;
  answers = {};
  currentRecordId = null;

  document.getElementById("home").classList.add("hidden");
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("questionnaire").classList.remove("hidden");
  document.getElementById("personTitle").textContent = `${name}'s Check-In`;

  await loadOrCreateDraft(name);
  renderQuestion();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function loadOrCreateDraft(name) {
  setSaveStatus("Loading draft...");

  const { data, error } = await supabaseClient
    .from("relationship_responses")
    .select("*")
    .eq("participant_name", name)
    .eq("status", "draft")
    .order("updated_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error(error);
    setSaveStatus("Could not load draft.");
    return;
  }

  if (data && data.length) {
    const record = data[0];
    currentRecordId = record.id;
    currentQuestionIndex = Math.max(0, Math.min((record.current_question || 1) - 1, questions.length - 1));
    answers = responsesToAnswerMap(record.responses || []);
    document.getElementById("finalThoughts").value = record.final_thoughts || "";
    setSaveStatus(`Draft restored. Last saved ${new Date(record.updated_at).toLocaleTimeString()}`);
    return;
  }

  const { data: created, error: insertError } = await supabaseClient
    .from("relationship_responses")
    .insert({
      participant_name: name,
      status: "draft",
      current_question: 1,
      responses: [],
      final_thoughts: ""
    })
    .select()
    .single();

  if (insertError) {
    console.error(insertError);
    setSaveStatus("Could not create draft.");
    return;
  }

  currentRecordId = created.id;
  setSaveStatus("New draft created.");
}

function renderQuestion() {
  const q = questions[currentQuestionIndex];
  const existing = answers[q.id] || {};

  document.getElementById("progressText").textContent = `Question ${currentQuestionIndex + 1} / ${questions.length}`;
  const percent = Math.round(((currentQuestionIndex + 1) / questions.length) * 100);
  document.getElementById("progressPercent").textContent = `${percent}%`;
  document.getElementById("progressFill").style.width = `${percent}%`;

  const card = document.getElementById("questionCard");
  card.innerHTML = `
    <span class="section-label">${escapeHtml(q.section)}</span>
    <h3>${escapeHtml(q.title)}</h3>
    <div class="boundary"><strong>My boundary:</strong> ${escapeHtml(q.boundary)}</div>

    <label>Your answer</label>
    <div class="choice-row">
      ${choiceRadio(q.id, "Agree", existing.choice)}
      ${choiceRadio(q.id, "Disagree", existing.choice)}
      ${choiceRadio(q.id, "Need Discussion", existing.choice)}
    </div>

    <label>Your thoughts</label>
    <textarea id="thoughts" placeholder="Write your honest answer...">${escapeHtml(existing.thoughts || "")}</textarea>

    <label>What are you willing to do?</label>
    <textarea id="action" placeholder="Write specific actions you are willing to try...">${escapeHtml(existing.action || "")}</textarea>

    <label>How important is this to you?</label>
    <div class="range-row">
      <input id="importance" type="range" min="1" max="5" value="${existing.importance || 3}" oninput="document.getElementById('importanceValue').textContent = this.value + '/5'; collectCurrentQuestion(); scheduleSave();" />
      <span id="importanceValue">${existing.importance || 3}/5</span>
    </div>

    <label class="pill">
      <input id="dealbreaker" type="checkbox" ${existing.dealbreaker ? "checked" : ""} />
      This is a dealbreaker for me
    </label>
  `;

  card.querySelectorAll("input, textarea").forEach(el => {
    el.addEventListener("input", () => {
      collectCurrentQuestion();
      scheduleSave();
    });
    el.addEventListener("change", () => {
      collectCurrentQuestion();
      scheduleSave();
    });
  });

  document.getElementById("finalBox").classList.toggle("hidden", currentQuestionIndex !== questions.length - 1);
}

function choiceRadio(questionId, value, currentValue) {
  return `
    <label class="pill">
      <input type="radio" name="${questionId}_choice" value="${value}" ${currentValue === value ? "checked" : ""}>
      ${value}
    </label>
  `;
}

function collectCurrentQuestion() {
  const q = questions[currentQuestionIndex];
  const choice = document.querySelector(`input[name="${q.id}_choice"]:checked`)?.value || "";
  const thoughts = document.getElementById("thoughts")?.value || "";
  const action = document.getElementById("action")?.value || "";
  const importance = Number(document.getElementById("importance")?.value || 3);
  const dealbreaker = Boolean(document.getElementById("dealbreaker")?.checked);

  answers[q.id] = {
    number: currentQuestionIndex + 1,
    id: q.id,
    section: q.section,
    title: q.title,
    boundary: q.boundary,
    choice,
    thoughts,
    action,
    importance,
    dealbreaker
  };
}

function nextQuestion() {
  collectCurrentQuestion();
  saveDraft();

  if (currentQuestionIndex < questions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
    saveDraft();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function prevQuestion() {
  collectCurrentQuestion();
  saveDraft();

  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion();
    saveDraft();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function scheduleSave() {
  setSaveStatus("Saving...");
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => saveDraft(), 600);
}

async function manualSaveDraft() {
  collectCurrentQuestion();
  await saveDraft();
}

async function saveDraft() {
  if (!currentRecordId || !currentPerson) return;

  const payload = {
    status: "draft",
    current_question: currentQuestionIndex + 1,
    responses: Object.values(answers).sort((a, b) => a.number - b.number),
    final_thoughts: document.getElementById("finalThoughts").value || "",
    updated_at: new Date().toISOString()
  };

  const { error } = await supabaseClient
    .from("relationship_responses")
    .update(payload)
    .eq("id", currentRecordId);

  if (error) {
    console.error(error);
    setSaveStatus("Save failed.");
  } else {
    setSaveStatus(`✓ Saved ${new Date().toLocaleTimeString()}`);
  }
}

async function submitAnswers() {
  collectCurrentQuestion();

  const payload = {
    status: "completed",
    current_question: questions.length,
    responses: Object.values(answers).sort((a, b) => a.number - b.number),
    final_thoughts: document.getElementById("finalThoughts").value || "",
    updated_at: new Date().toISOString()
  };

  setSaveStatus("Submitting...");

  const { error } = await supabaseClient
    .from("relationship_responses")
    .update(payload)
    .eq("id", currentRecordId);

  if (error) {
    console.error(error);
    setSaveStatus("Submit failed.");
  } else {
    setSaveStatus("Submitted.");
    setTimeout(showDashboard, 800);
  }
}

function setSaveStatus(message) {
  document.getElementById("saveStatus").textContent = message;
}

function goHome() {
  document.getElementById("questionnaire").classList.add("hidden");
  document.getElementById("dashboard").classList.add("hidden");
  document.getElementById("home").classList.remove("hidden");
  loadHomeStatus();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function loadHomeStatus() {
  const el = document.getElementById("homeStatus");
  if (!el) return;

  const { data, error } = await supabaseClient
    .from("relationship_responses")
    .select("*")
    .in("participant_name", ["Jingyi", "Rodrigo"])
    .order("updated_at", { ascending: false });

  if (error) {
    el.innerHTML = "";
    return;
  }

  const latest = {};
  for (const record of data || []) {
    if (!latest[record.participant_name]) latest[record.participant_name] = record;
  }

  el.innerHTML = ["Jingyi", "Rodrigo"].map(name => {
    const r = latest[name];
    const count = r?.responses?.length || 0;
    const status = r ? `${capitalize(r.status)} · ${count}/14 answered` : "Not started";
    const time = r ? new Date(r.updated_at).toLocaleString() : "";
    return `
      <div class="status-card">
        <h3>${name}</h3>
        <p class="${r ? "ok" : "missing"}">${status}</p>
        <p class="muted">${time}</p>
      </div>
    `;
  }).join("");
}

function showDashboard() {
  document.getElementById("home").classList.add("hidden");
  document.getElementById("questionnaire").classList.add("hidden");
  document.getElementById("dashboard").classList.remove("hidden");
  loadDashboard();
}

async function loadDashboard() {
  const status = document.getElementById("dashboardStatus");
  const summary = document.getElementById("dashboardSummary");
  const compare = document.getElementById("dashboardCompare");

  status.innerHTML = "Loading...";
  summary.innerHTML = "";
  compare.innerHTML = "";

  const { data, error } = await supabaseClient
    .from("relationship_responses")
    .select("*")
    .in("participant_name", ["Jingyi", "Rodrigo"])
    .order("updated_at", { ascending: false });

  if (error) {
    console.error(error);
    status.innerHTML = "<p class='missing'>Error loading dashboard.</p>";
    return;
  }

  const latest = {};
  for (const entry of data || []) {
    if (!latest[entry.participant_name]) latest[entry.participant_name] = entry;
  }

  status.innerHTML = `
    <div class="status-grid">
      ${["Jingyi", "Rodrigo"].map(name => {
        const r = latest[name];
        const count = r?.responses?.length || 0;
        return `
          <div class="status-card">
            <h3>${name}</h3>
            <p class="${r ? "ok" : "missing"}">${r ? `${capitalize(r.status)} · ${count}/14 answered` : "Not started"}</p>
            <p class="muted">${r ? new Date(r.updated_at).toLocaleString() : ""}</p>
          </div>
        `;
      }).join("")}
    </div>
  `;

  renderSummary(latest);
  renderComparison(latest);
}

function renderSummary(latest) {
  const summary = document.getElementById("dashboardSummary");

  if (!latest.Jingyi || !latest.Rodrigo) {
    summary.innerHTML = `
      <div class="summary-card">
        <h3>Friday Discussion Summary</h3>
        <p class="muted">Both people need to start before automatic comparison is available.</p>
      </div>
    `;
    return;
  }

  const j = mapResponses(latest.Jingyi.responses);
  const r = mapResponses(latest.Rodrigo.responses);

  const agreements = [];
  const needDiscussion = [];
  const majorDifferences = [];
  const dealbreakers = [];

  questions.forEach(q => {
    const jc = j[q.id]?.choice;
    const rc = r[q.id]?.choice;

    if (jc === "Agree" && rc === "Agree") agreements.push(q.title);
    if (jc === "Need Discussion" || rc === "Need Discussion") needDiscussion.push(q.title);
    if ((jc === "Agree" && rc === "Disagree") || (jc === "Disagree" && rc === "Agree")) majorDifferences.push(q.title);
    if (j[q.id]?.dealbreaker || r[q.id]?.dealbreaker) dealbreakers.push(q.title);
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

      <p><strong>Dealbreakers</strong></p>
      ${listOrEmpty(dealbreakers, "No dealbreakers marked.")}

      <p><strong>Suggested focus for Friday</strong></p>
      <p class="muted">${suggestFocus(needDiscussion, majorDifferences, dealbreakers)}</p>
    </div>
  `;
}

function renderComparison(latest) {
  const compare = document.getElementById("dashboardCompare");
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
          ${questions.map((q, idx) => `
            <tr>
              <td>
                <strong>Q${idx + 1}. ${escapeHtml(q.title)}</strong>
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
    <span class="badge ${badgeClass(answer.choice)}">${escapeHtml(answer.choice || "No choice")}</span>
    <p><strong>Importance:</strong> ${escapeHtml(answer.importance || "")}/5</p>
    <p><strong>Dealbreaker:</strong> ${answer.dealbreaker ? "Yes" : "No"}</p>
    <p><strong>Thoughts:</strong></p>
    <pre>${escapeHtml(answer.thoughts || "")}</pre>
    <p><strong>Willing to do:</strong></p>
    <pre>${escapeHtml(answer.action || "")}</pre>
  `;
}

function responsesToAnswerMap(responses) {
  const map = {};
  (responses || []).forEach(r => map[r.id] = r);
  return map;
}

function mapResponses(responses) {
  return responsesToAnswerMap(responses);
}

function badgeClass(choice) {
  if (choice === "Agree") return "agree";
  if (choice === "Disagree") return "disagree";
  return "discuss";
}

function listOrEmpty(items, emptyText) {
  if (!items.length) return `<p class="muted">${escapeHtml(emptyText)}</p>`;
  return `<ul>${items.map(i => `<li>${escapeHtml(i)}</li>`).join("")}</ul>`;
}

function suggestFocus(needDiscussion, majorDifferences, dealbreakers) {
  const items = [...dealbreakers, ...majorDifferences, ...needDiscussion];
  if (!items.length) return "Use Friday to confirm what is working and agree on practical next steps.";
  return `Start with: ${items.slice(0, 3).join(", ")}. Focus on concrete actions, not only explanations.`;
}

function capitalize(str) {
  if (!str) return "";
  return String(str).charAt(0).toUpperCase() + String(str).slice(1);
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
