
const API_BASE = "https://babi-ai.onrender.com";

const form = document.querySelector("#chat-form");
const input = document.querySelector("#prompt");
const chat = document.querySelector("#chat");
const welcome = document.querySelector("#welcome");
const send = document.querySelector("#send");

const history = [];

function addMessage(role, content) {
  if (!chat) {
    throw new Error("Чатны хэсэг олдсонгүй");
  }

  if (welcome) welcome.hidden = true;

  const el = document.createElement("div");
  el.className = `message ${role}`;
  el.textContent = content;
  chat.appendChild(el);

  return el;
}

async function submit(text) {
  const message = text.trim();

  if (!message) return;

  if (!send || !input || !chat) {
    alert("Аппын HTML элемент олдсонгүй.");
    return;
  }

  if (send.disabled) return;

  addMessage("user", message);
  history.push({ role: "user", content: message });

  input.value = "";
  send.disabled = true;

  const pending = addMessage("assistant", "Сервертэй холбогдож байна...");

  try {
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

  } catch (error) {
    console.error("Babi AI:", error);
    pending.textContent = "Холболтын алдаа: " + error.message;
  } finally {
    send.disabled = false;
    input.focus();
  }
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submit(input.value);
  });
} else {
  alert("chat-form олдсонгүй");
}

if (input && form) {
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      form.requestSubmit();
    }
  });
}

document.querySelectorAll(".suggestion").forEach((button) => {
  button.addEventListener("click", () => {
    submit(button.textContent);
  });
});

