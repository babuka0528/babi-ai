
const API_BASE = "https://babi-ai.onrender.com";

const form = document.querySelector("#chat-form");
const input = document.querySelector("#prompt");
const chat = document.querySelector("#chat");
const welcome = document.querySelector("#welcome");
const send = document.querySelector("#send");

const history = [];

function addMessage(role, content) {
  if (welcome) welcome.hidden = true;

  const el = document.createElement("div");
  el.className = `message ${role}`;
  el.textContent = content;

  chat.appendChild(el);
  el.scrollIntoView({ behavior: "smooth", block: "end" });

  return el;
}

async function submit(text) {
  const message = text.trim();

  if (!message || send.disabled) return;

  addMessage("user", message);
  history.push({ role: "user", content: message });

  input.value = "";
  send.disabled = true;

  const pending = addMessage("assistant", "Бодож байна...");

  try {
    console.log("Sending request to Babi AI");

    const response = await fetch(`${API_BASE}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ messages: history })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || data.error || `HTTP ${response.status}`);
    }

    pending.textContent = data.reply || "Хариулт ирсэнгүй.";

    history.push({
      role: "assistant",
      content: pending.textContent
    });

  } catch (err) {
    console.error("Babi AI error:", err);

    pending.textContent =
      "Алдаа: " + err.message;

  } finally {
    send.disabled = false;
    input.focus();
  }
}

if (form) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    submit(input.value);
  });
}

if (input) {
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      form.requestSubmit();
    }
  });
}

document.querySelectorAll(".suggestion").forEach((btn) => {
  btn.addEventListener("click", () => submit(btn.textContent));
});
