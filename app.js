// Set this to your deployed backend URL for production.
const API_BASE = "https://babi-ai.onrender.com";
const form = document.querySelector("#chat-form");
const input = document.querySelector("#prompt");
const chat = document.querySelector("#chat");
const welcome = document.querySelector("#welcome");
const send = document.querySelector("#send");
const history = [];

function addMessage(role, content) {
  welcome.hidden = true;
  const el = document.createElement("div");
  el.className = `message ${role}`;
  el.textContent = content;
  chat.appendChild(el);
  el.scrollIntoView({behavior:"smooth", block:"end"});
  return el;
}
async function submit(text) {
  const message = text.trim();
  if (!message || send.disabled) return;
  addMessage("user", message);
  history.push({role:"user", content:message});
  input.value = "";
  send.disabled = true;
  const pending = addMessage("assistant", "Бодож байна...");
  try {
    const response = await fetch(`${API_BASE}/api/chat`, {
      method:"POST", headers:{"Content-Type":"application/json"},
      body:JSON.stringify({messages:history})
    });
    if (!response.ok) throw new Error(`Серверийн алдаа: ${response.status}`);
    const data = await response.json();
    pending.textContent = data.reply || "Хариулт ирсэнгүй.";
    history.push({role:"assistant", content:pending.textContent});
  } catch (err) {
    pending.textContent = "Одоогоор AI серверт холбогдож чадсангүй. Backend-ээ асааж, API тохиргоогоо шалгана уу. (" + err.message + ")";
  } finally { send.disabled = false; input.focus(); }
}
form.addEventListener("submit", e => {e.preventDefault(); submit(input.value);});
input.addEventListener("keydown", e => {if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();form.requestSubmit();}});
document.querySelectorAll(".suggestion").forEach(btn => btn.addEventListener("click",()=>submit(btn.textContent)));
