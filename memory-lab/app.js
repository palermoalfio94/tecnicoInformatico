/* Stato, navigazione e motore del laboratorio. Script classici per funzionare anche con file://. */
"use strict";
const $ = (s) => document.querySelector(s),
  root = $("#app"),
  STORE = "memory-lab-v1";
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const shuffle = (a) => {
  a = [...a];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};
const clone = (o) => JSON.parse(JSON.stringify(o));
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const defaults = () => ({
  version: 1,
  name: "",
  avatar: 0,
  reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
  tutorial: false,
  visited: [],
  completed: [false, false, false, false, false, false],
  best: [0, 0, 0, 0, 0, 0],
  notes: [false, false, false, false, false, false],
  discovery: [0, 0, 0, 0, 0, 0],
  experiments: [false, false, false, false, false, false],
  observations: ["", "", "", "", "", ""],
  quiz: [null, null, null, null, null, null],
  sims: {
    ram: {
      open: [],
      power: true,
      saved: false,
      opened: [],
      overflow: false,
      shutdown: false,
    },
    rom: {
      sequence: [],
      pool: shuffle([0, 1, 2, 3]),
      missing: false,
      failed: false,
      booted: false,
    },
    cache: { slots: [], requests: 0, hits: 0, evictions: 0, last: "" },
    hdd: {
      files: [],
      serial: 0,
      savedKinds: [],
      reads: 0,
      deletes: 0,
      cycled: false,
      power: true,
    },
    ssd: { race: false, started: 0, scenarios: [false, false, false, false] },
    units: {
      files: [],
      serial: 0,
      kinds: [],
      overflow: false,
      conversions: [false, false, false],
    },
  },
  final: {
    clients: [false, false, false],
    current: 0,
    solution: null,
    reason: null,
    flowStep: -1,
    flowDone: false,
    complete: false,
    date: "",
  },
});
function loadState() {
  const fresh = defaults();
  try {
    const data = JSON.parse(localStorage.getItem(STORE) || "null");
    if (!data || data.version !== 1) return fresh;
    if (typeof data.name === "string") fresh.name = data.name.slice(0, 40);
    if (Number.isInteger(data.avatar)) fresh.avatar = clamp(data.avatar, 0, 3);
    fresh.reduced = Boolean(data.reduced);
    fresh.tutorial = Boolean(data.tutorial);
    for (const key of ["completed", "notes", "experiments"])
      if (Array.isArray(data[key]) && data[key].length === 6)
        fresh[key] = data[key].map((v) => v === true);
    if (Array.isArray(data.best) && data.best.length === 6)
      fresh.best = data.best.map((n) =>
        Number.isInteger(n) && n >= 0 && n <= 100 && n % 20 === 0 ? n : 0,
      );
    fresh.completed = fresh.best.map((n, i) => n >= 70 && fresh.experiments[i]);
    fresh.notes = fresh.experiments.slice();
    if (Array.isArray(data.visited))
      fresh.visited = [
        ...new Set(
          data.visited.filter((n) => Number.isInteger(n) && n >= 0 && n < 6),
        ),
      ];
    if (Array.isArray(data.discovery) && data.discovery.length === 6)
      fresh.discovery = data.discovery.map((n) =>
        Number.isInteger(n) ? clamp(n, 0, 3) : 0,
      );
    if (Array.isArray(data.observations) && data.observations.length === 6)
      fresh.observations = data.observations.map((s) =>
        typeof s === "string" ? s.slice(0, 1200) : "",
      );
    // Ogni simulazione è validata separatamente: dati danneggiati non impediscono l'accesso.
    const s = data.sims || {};
    if (
      s.ram &&
      Array.isArray(s.ram.open) &&
      s.ram.open.every((n) => Number.isInteger(n) && n >= 0 && n < 4) &&
      new Set(s.ram.open).size === s.ram.open.length &&
      s.ram.open.reduce((t, n) => t + [2, 4, 3, 1][n], 0) <= 8
    ) {
      fresh.sims.ram = {
        ...fresh.sims.ram,
        ...s.ram,
        open: s.ram.open,
        opened: Array.isArray(s.ram.opened)
          ? s.ram.opened.filter((n) => Number.isInteger(n) && n >= 0 && n < 4)
          : [],
      };
      for (const k of ["power", "saved", "overflow", "shutdown"])
        fresh.sims.ram[k] = Boolean(fresh.sims.ram[k]);
    }
    if (
      s.rom &&
      Array.isArray(s.rom.sequence) &&
      s.rom.sequence.every((n) => Number.isInteger(n) && n >= 0 && n < 4) &&
      new Set(s.rom.sequence).size === s.rom.sequence.length
    ) {
      fresh.sims.rom = {
        sequence: s.rom.sequence,
        pool:
          Array.isArray(s.rom.pool) &&
          s.rom.pool.length === 4 &&
          new Set(s.rom.pool).size === 4 &&
          s.rom.pool.every((n) => Number.isInteger(n) && n >= 0 && n < 4)
            ? s.rom.pool
            : fresh.sims.rom.pool,
        missing: !!s.rom.missing,
        failed: !!s.rom.failed,
        booted: !!s.rom.booted,
      };
    }
    if (
      s.cache &&
      Array.isArray(s.cache.slots) &&
      s.cache.slots.length <= 3 &&
      new Set(s.cache.slots).size === s.cache.slots.length &&
      s.cache.slots.every((v) => ["A", "B", "C", "D", "E"].includes(v)) &&
      ["requests", "hits", "evictions"].every(
        (k) => Number.isInteger(s.cache[k]) && s.cache[k] >= 0,
      ) &&
      s.cache.hits <= s.cache.requests
    ) {
      fresh.sims.cache = {
        ...s.cache,
        last: typeof s.cache.last === "string" ? s.cache.last : "",
      };
    }
    for (const id of ["hdd", "units"]) {
      const v = s[id];
      if (
        v &&
        Array.isArray(v.files) &&
        v.files.length <= 500 &&
        v.files.every(
          (f) =>
            f &&
            typeof f.id === "string" &&
            typeof f.name === "string" &&
            f.name.length <= 80 &&
            Number.isFinite(f.mb) &&
            f.mb > 0 &&
            f.mb <= 8000 &&
            typeof f.kind === "string",
        ) &&
        v.files.reduce((t, f) => t + f.mb, 0) <= 8000
      ) {
        fresh.sims[id].files = v.files;
        fresh.sims[id].serial =
          Number.isInteger(v.serial) && v.serial >= 0
            ? v.serial
            : v.files.length;
        const kindKey = id === "hdd" ? "savedKinds" : "kinds";
        fresh.sims[id][kindKey] = Array.isArray(v[kindKey])
          ? [...new Set(v[kindKey].filter((x) => typeof x === "string"))]
          : [];
        if (id === "hdd") {
          fresh.sims.hdd.reads =
            Number.isInteger(v.reads) && v.reads >= 0 ? v.reads : 0;
          fresh.sims.hdd.deletes =
            Number.isInteger(v.deletes) && v.deletes >= 0 ? v.deletes : 0;
          fresh.sims.hdd.cycled = !!v.cycled;
          fresh.sims.hdd.power = v.power !== false;
        } else {
          fresh.sims.units.overflow = !!v.overflow;
          fresh.sims.units.conversions =
            Array.isArray(v.conversions) && v.conversions.length === 3
              ? v.conversions.map(Boolean)
              : [false, false, false];
        }
      }
    }
    if (s.ssd) {
      fresh.sims.ssd.race = !!s.ssd.race;
      fresh.sims.ssd.started = 0;
      if (Array.isArray(s.ssd.scenarios) && s.ssd.scenarios.length === 4)
        fresh.sims.ssd.scenarios = s.ssd.scenarios.map(Boolean);
    }
    if (Array.isArray(data.quiz) && data.quiz.length === 6)
      fresh.quiz = data.quiz.map((q, i) => {
        if (
          !q ||
          !Array.isArray(q.ids) ||
          q.ids.length !== 5 ||
          new Set(q.ids).size !== 5 ||
          !q.ids.every(
            (n) =>
              Number.isInteger(n) && n >= 0 && n < CONTENT[i].questions.length,
          ) ||
          !Number.isInteger(q.index) ||
          q.index < 0 ||
          q.index > 5 ||
          !Array.isArray(q.results) ||
          q.results.length !== q.index ||
          !q.results.every((v) => typeof v === "boolean")
        )
          return null;
        return {
          ids: q.ids,
          index: q.index,
          results: q.results,
          answered: typeof q.answered === "boolean" ? q.answered : null,
          draft: null,
          orderPool: [],
        };
      });
    if (data.final && fresh.completed.every(Boolean)) {
      const f = data.final;
      if (Array.isArray(f.clients) && f.clients.length === 3)
        fresh.final.clients = f.clients.map(Boolean);
      fresh.final.current = Number.isInteger(f.current)
        ? clamp(f.current, 0, 2)
        : 0;
      fresh.final.flowDone = !!f.flowDone && fresh.final.clients.every(Boolean);
      fresh.final.complete = !!f.complete && fresh.final.flowDone;
      fresh.final.date = typeof f.date === "string" ? f.date.slice(0, 30) : "";
    }
    return fresh;
  } catch (e) {
    return fresh;
  }
}
let notebookReturn = { view: "home", station: 0, phase: "discover" };
let state = loadState(),
  view = "home",
  station = 0,
  phase = "discover",
  message = "",
  messageType = "",
  byteText = "",
  byteCollapsed = false,
  toastTimer,
  raceTimer = null,
  flowTimer = null;
function save() {
  try {
    localStorage.setItem(STORE, JSON.stringify(state));
    $("#saveState").textContent =
      "Offline · progressi salvati su questo dispositivo";
  } catch (e) {
    $("#saveState").textContent =
      "Salvataggio non disponibile: non chiudere la pagina";
  }
  header();
}
function header() {
  document.body.classList.toggle("reduced", state.reduced);
  $("#student").innerHTML = state.name
    ? '<span class="student-avatar">' +
      avatar(state.avatar) +
      "</span><span>" +
      esc(state.name) +
      " · " +
      state.completed.filter(Boolean).length +
      "/6 postazioni</span>"
    : "";
  $("#noteCount").textContent = state.notes.filter(Boolean).length + "/6";
  $("#motion").textContent = "Animazioni: " + (state.reduced ? "OFF" : "ON");
  $("#motion").setAttribute("aria-pressed", String(state.reduced));
  $("#progressBar").style.width =
    ((state.completed.filter(Boolean).length + (state.final.complete ? 1 : 0)) /
      7) *
      100 +
    "%";
}
function say(text) {
  byteText = text;
  $("#announcer").textContent = text;
  renderByte();
}
function renderByte() {
  $("#byte").className = byteCollapsed ? "collapsed" : "";
  $("#byte").innerHTML =
    `<div class="byte-bot">${robot()}</div><div class="byte-text"><span class="byte-name">BYTE / GUIDA DEL LAB</span><p>${esc(byteText)}</p><button id="rereadByte">${byteCollapsed ? "Riapri BYTE" : "Rileggi"}</button><button id="collapseByte">${byteCollapsed ? "" : "Riduci"}</button></div>`;
  $("#rereadByte").onclick = () => {
    byteCollapsed = false;
    renderByte();
    if (byteText) $("#announcer").textContent = byteText;
  };
  $("#collapseByte").hidden = byteCollapsed;
  $("#collapseByte").onclick = () => {
    byteCollapsed = true;
    renderByte();
  };
}
function feedback(text, type = "") {
  message = text;
  messageType = type;
  $("#announcer").textContent = text;
}
function feedbackHTML() {
  return `<div class="feedback ${messageType}" role="status">${esc(message || "Osserva, prova e controlla che cosa cambia. Gli errori sono parte del laboratorio.")}</div>`;
}
function toast(text) {
  $("#toast").textContent = text;
  $("#toast").hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => ($("#toast").hidden = true), 3500);
}
function dialog(title, html, buttons = [["Ho capito", () => {}]]) {
  $("#dialogTitle").textContent = title;
  $("#dialogBody").innerHTML = html;
  $("#dialogActions").innerHTML = buttons
    .map(
      (b, i) =>
        `<button data-dialog="${i}" class="${i === buttons.length - 1 ? "primary" : ""}">${esc(b[0])}</button>`,
    )
    .join("");
  $("#dialogActions")
    .querySelectorAll("button")
    .forEach(
      (b) =>
        (b.onclick = () => {
          $("#dialog").close();
          buttons[Number(b.dataset.dialog)][1]();
        }),
    );
  $("#dialog").showModal();
}
function go(next, idx = station, nextPhase = phase) {
  clearInterval(raceTimer);
  raceTimer = null;
  clearTimeout(flowTimer);
  flowTimer = null;
  view = next;
  station = idx;
  phase = nextPhase;
  message = "";
  messageType = "";
  if (view === "station") {
    if (!state.visited.includes(idx)) state.visited.push(idx);
    say(CONTENT[idx].intro);
  } else if (view === "home")
    say(
      state.name
        ? "Bentornato nel laboratorio. Le sei postazioni sono tutte esplorabili: scegli tu l’ordine. In ogni postazione scopri il concetto, completa l’esperimento e dimostra ciò che hai imparato. Il tuo quaderno raccoglie automaticamente le osservazioni. Per la missione finale servono almeno 70 punti in ciascuna verifica."
        : "Ciao, sono BYTE. Ti accompagnerò tra memorie, chip e archivi. Scegli un avatar e inserisci il tuo nome, o un nome di fantasia: non serve un account. Faremo esperimenti veri nel nostro modello virtuale. Niente fretta: puoi ripassare, riprovare e stampare il tuo quaderno.",
    );
  save();
  render();
  window.scrollTo({ top: 0, behavior: "instant" });
  const h = root.querySelector("h1");
  if (h) {
    h.tabIndex = -1;
    h.focus({ preventScroll: true });
  }
}
$("#home").onclick = () => go("home");
$("#notebook").onclick = openNotebook;
$("#motion").onclick = () => {
  state.reduced = !state.reduced;
  save();
};
$("#reset").onclick = () =>
  dialog(
    "Ricominciare da zero?",
    "<p>Questa azione cancella il nome e i progressi di Memory Lab su questo browser. Operazione PC non viene modificato.</p>",
    [
      ["Annulla", () => {}],
      [
        "Cancella questa partita",
        () => {
          state = defaults();
          byteCollapsed = false;
          go("home");
        },
      ],
    ],
  );
window.addEventListener("pagehide", save);
document.addEventListener("visibilitychange", () => {
  if (document.hidden) save();
});
// Illustrazioni SVG originali, incorporate e utilizzabili offline.
function robot() {
  return '<svg viewBox="0 0 90 85" aria-hidden="true"><path d="M45 9V2m-5 0h10" stroke="#82e7c6" stroke-width="3"/><rect x="9" y="18" width="72" height="49" rx="16" fill="#82e7c6"/><rect x="20" y="28" width="50" height="24" rx="9" fill="#153246"/><circle cx="34" cy="40" r="5" fill="#c8ffe5"/><circle cx="57" cy="40" r="5" fill="#c8ffe5"/><path d="M35 59h20M18 73l-5 8m59-8 5 8M4 33v15m82-15v15" stroke="#82e7c6" stroke-width="5" stroke-linecap="round"/></svg>';
}
function avatar(id) {
  const c = ["#82e7c6", "#b8a1ff", "#ffd071", "#ff9fba"][id];
  return `<svg viewBox="0 0 80 80" aria-hidden="true"><path d="M9 79c0-24 62-24 62 0" fill="${c}"/><circle cx="40" cy="32" r="23" fill="#eec6aa"/><path d="M17 29C14 1 69-4 64 32L52 15 21 31" fill="${["#273e57", "#553a51", "#343d54", "#4d3241"][id]}"/><circle cx="32" cy="34" r="2.4" fill="#203344"/><circle cx="49" cy="34" r="2.4" fill="#203344"/><path d="M34 46q7 6 14-1" fill="none" stroke="#926c67" stroke-width="2"/>${id === 1 ? '<path d="M20 32h17v9H20zm24 0h17v9H44zm-7 3h7" fill="none" stroke="#31465b" stroke-width="2"/>' : ""}</svg>`;
}
function hardware(id) {
  let inner = "";
  const c = CONTENT.find((s) => s.id === id)?.color || "#82e7c6";
  if (id === "ram")
    inner = `<path d="m16 69 160-28 14 55-160 27z" fill="#295847" stroke="${c}"/><path d="m30 113 142-25" stroke="#cbb76c" stroke-width="9" stroke-dasharray="7 3"/>${[0, 1, 2, 3].map((_, i) => `<path d="m${37 + i * 33} 73 22-4 5 21-22 4z" fill="#112f2d" stroke="#7abf9f"/>`).join("")}`;
  else if (id === "rom")
    inner = `<rect x="50" y="35" width="104" height="85" rx="8" fill="#4b3f70" stroke="${c}"/><path d="M40 47h-13m13 20H27m13 20H27m13 20H27m137-60h14m-14 20h14m-14 20h14m-14 20h14M65 25V12m25 13V12m25 13V12m25 13V12M65 130v13m25-13v13m25-13v13m25-13v13" stroke="${c}" stroke-width="5"/><rect x="69" y="55" width="65" height="42" rx="4" fill="#211b37"/><path d="m99 60-13 23h16l-3 17 20-26h-18l9-14z" fill="${c}"/>`;
  else if (id === "cache")
    inner = `<path d="M33 40h137v85H33z" fill="#5b492d" stroke="${c}"/><path d="M23 52H8m15 20H8m15 20H8m15 20H8m172-60h15m-15 20h15m-15 20h15m-15 20h15M51 30V16m25 14V16m25 14V16m25 14V16m25 14V16" stroke="${c}" stroke-width="4"/><rect x="61" y="58" width="80" height="50" rx="7" fill="#251e17"/><path d="m101 61-22 29h20l-4 17 25-32h-22z" fill="${c}"/>`;
  else if (id === "hdd")
    inner =
      '<rect x="20" y="12" width="160" height="138" rx="13" fill="#334e70" stroke="#82baff" stroke-width="2"/><g class="platter"><circle cx="100" cy="82" r="54" fill="#9eafc5"/><circle cx="100" cy="82" r="43" fill="none" stroke="#71869f" stroke-width="9"/><path d="M100 28v108M46 82h108" stroke="#b7c8d9"/><circle cx="100" cy="82" r="13" fill="#304866"/></g><g class="head"><path d="m170 136-40-72-13 10 40 65z" fill="#d5e4ef" stroke="#536d87" stroke-width="2"/><circle cx="168" cy="136" r="9" fill="#6a8ba4"/></g><circle cx="32" cy="25" r="3" fill="#9bb9d4"/>';
  else if (id === "ssd")
    inner = `<rect x="17" y="30" width="171" height="112" rx="10" fill="#573b50" stroke="${c}"/><rect x="33" y="47" width="137" height="74" rx="5" fill="#2d243b"/>${[0, 1, 2].map((_, i) => `<rect x="${42 + i * 41}" y="60" width="31" height="34" rx="3" fill="#84657c" stroke="${c}"/>`).join("")}<path d="M41 109h100" stroke="${c}" stroke-width="3"/><path d="M49 142v9m12-9v9m12-9v9m12-9v9m12-9v9" stroke="#ddc072" stroke-width="5"/>`;
  else if (id === "units")
    inner = `<rect x="40" y="47" width="126" height="76" rx="20" fill="#3e6347" stroke="${c}"/><path d="M165 65h29v39h-29" fill="#a4b4a0" stroke="#80987b" stroke-width="3"/><path d="M175 70v29m10-29v29" stroke="#657c65" stroke-width="4"/><text x="103" y="94" text-anchor="middle" fill="#d9ffca" font-size="24" font-family="monospace">8 GB</text><path d="M53 39v-9m20 5v-18m20 14v-9" stroke="${c}" stroke-width="3"/>`;
  else
    inner =
      '<rect x="40" y="30" width="120" height="100" rx="10" fill="#294653" stroke="#82e7c6"/><text x="100" y="88" text-anchor="middle" fill="#82e7c6" font-size="28" font-family="monospace">CPU</text>';
  return `<svg class="hardware" viewBox="0 0 210 165" aria-hidden="true" fill="none" stroke-linecap="round" stroke-linejoin="round">${inner}</svg>`;
}
function labRoom(compact = false) {
  return `<div class="lab-room"><span class="room-label">MEMORY RESEARCH FACILITY / LAB 06</span><div class="room-light"></div><div class="room-stations">${CONTENT.map((s, i) => `<button class="bench ${compact ? "compact" : ""} ${state.completed[i] ? "completed" : ""}" style="--accent:${s.color}" data-station="${i}" ${compact ? 'tabindex="-1" aria-hidden="true"' : ""}><span class="bench-status">${state.completed[i] ? "✓ " + state.best[i] + "/100" : state.experiments[i] ? "ESPERIMENTO ✓" : state.visited.includes(i) ? "IN CORSO" : "ESPLORA"}</span>${hardware(s.id)}<strong>${s.name}</strong><span>${s.label}</span>${compact ? "" : `<span class="bench-score">Verifica: ${state.best[i]}/100</span>`}</button>`).join("")}</div></div>`;
}
function render() {
  header();
  if (view === "home") home();
  else if (view === "station") stationScreen();
  else if (view === "notebook") notebook();
  else if (view === "final") finalMission();
  else if (view === "diploma") diploma();
  renderByte();
}
function home() {
  if (!state.name) {
    root.innerHTML = `<section class="welcome"><div class="welcome-copy"><div class="eyebrow">IL TUO PRIMO TURNO IN LABORATORIO</div><h1>Grandi idee.<br>Piccole <span>memorie.</span></h1><h2 style="font-size:22px">MEMORY LAB</h2><p>Diventa un tecnico delle memorie del computer. Sei postazioni da esplorare, esperimenti da vivere e un quaderno da portare con te.</p><div class="login"><form id="entryForm"><label for="name">Come ti chiami? Puoi usare un nome di fantasia.</label><input id="name" type="text" maxlength="40" required autocomplete="off" placeholder="Il tuo nome"><label>Scegli il tuo avatar</label><div class="avatars">${[0, 1, 2, 3].map((i) => `<button class="avatar ${state.avatar === i ? "selected" : ""}" type="button" data-avatar="${i}" aria-label="Avatar ${i + 1}" aria-pressed="${state.avatar === i}">${avatar(i)}</button>`).join("")}</div><button class="primary" type="submit">Entra nel laboratorio</button></form><p class="muted" style="font-size:13px;margin-top:16px">Circa 60 minuti · Nessun timer · Tutto offline</p></div></div>${labRoom(true)}</section>`;
    root.querySelectorAll("[data-avatar]").forEach(
      (b) =>
        (b.onclick = () => {
          state.avatar = Number(b.dataset.avatar);
          root.querySelectorAll("[data-avatar]").forEach((n) => {
            n.classList.toggle("selected", n === b);
            n.setAttribute("aria-pressed", String(n === b));
          });
          save();
        }),
    );
    $("#entryForm").onsubmit = (e) => {
      e.preventDefault();
      const name = $("#name").value.trim();
      if (!name) {
        toast("Inserisci un nome per entrare.");
        return;
      }
      state.name = name;
      go("home");
      tutorial();
    };
    return;
  }
  const count = state.completed.filter(Boolean).length,
    total = state.best.reduce((a, b) => a + b, 0);
  root.innerHTML = `<div class="lab-top"><div><div class="eyebrow">IL LABORATORIO È TUO. SCEGLI DOVE INIZIARE.</div><h1>Bentornato, ${esc(state.name)}.</h1><p>Ogni memoria ha un ruolo. Scoprilo mettendola alla prova.</p></div><div class="lab-stats"><div><strong>${count}/6</strong><span>POSTAZIONI SUPERATE</span></div><div><strong>${total}<small style="font-size:14px">/600</small></strong><span>MIGLIORI RISULTATI</span></div></div></div>${labRoom()}<div class="final-console"><div class="console-symbol">⌘</div><div><h3>Missione finale: ripara il computer</h3><p>${count === 6 ? "Tre clienti ti aspettano. È il momento di unire le competenze." : "Supera le sei postazioni con almeno 70/100 per aprire l’officina."}</p></div><button id="enterFinal" class="${count === 6 ? "primary" : ""}" ${count !== 6 ? "disabled" : ""}>${state.final.complete ? "Rivedi il diploma" : count === 6 ? "Entra nell’officina" : "Officina bloccata"}</button></div><div class="actions"><button id="tutorial" class="quiet small">Rileggi il tutorial</button><span class="muted" style="font-size:14px">I punteggi crescono con il miglior tentativo. Nessuna classifica.</span></div>`;
  root
    .querySelectorAll("[data-station]")
    .forEach(
      (b) =>
        (b.onclick = () =>
          go("station", Number(b.dataset.station), "discover")),
    );
  $("#enterFinal").onclick = () =>
    go(state.final.complete ? "diploma" : "final");
  $("#tutorial").onclick = tutorial;
}
function tutorial() {
  dialog(
    "Benvenuto, tecnico delle memorie",
    `<p>Le sei postazioni sono tutte accessibili. Scegli quella che ti incuriosisce: non c’è un ordine obbligatorio.</p><ol><li><b>Scopri:</b> sfoglia quattro brevi spiegazioni illustrate.</li><li><b>Sperimenta:</b> usa il modello e completa gli obiettivi. Ricevi una pagina del quaderno.</li><li><b>Dimostra:</b> rispondi a cinque esercizi. Ogni risposta vale 20 punti; servono almeno 70/100. Con cinque risposte, il primo punteggio utile è 80.</li></ol><p>Puoi consultare teoria e quaderno anche durante una verifica. I tentativi sono illimitati e conserviamo il miglior risultato. Dopo le sei postazioni, aiuta tre clienti e conquista il diploma.</p>`,
    [
      [
        "Cominciamo",
        () => {
          state.tutorial = true;
          save();
        },
      ],
    ],
  );
}
function stationScreen() {
  const s = CONTENT[station];
  document.documentElement.style.setProperty("--accent", s.color);
  root.innerHTML = `<div class="station-heading"><div><div class="eyebrow">POSTAZIONE / ${s.label}</div><h1>${s.name} <span style="font-weight:400;color:var(--muted)">· ${s.subtitle}</span></h1><p>Miglior verifica: <b>${state.best[station]}/100</b> · ${state.completed[station] ? "✓ Postazione superata" : state.experiments[station] ? "✓ Esperimento completato" : "Esperimento da completare"}</p></div>${hardware(s.id)}</div><div class="phase-tabs" role="tablist" aria-label="Fasi della postazione">${[
    ["discover", "Scopri"],
    ["experiment", "Sperimenta"],
    ["quiz", "Dimostra"],
  ]
    .map(
      ([id, label], i) =>
        `<button role="tab" aria-selected="${phase === id}" class="${phase === id ? "active" : ""}" data-phase="${id}"><span class="phase-num">${i + 1}</span>${label}</button>`,
    )
    .join(
      "",
    )}<button id="quickTheory" class="quiet">Ripasso rapido</button></div><section id="stationBody"></section>`;
  root.querySelectorAll("[data-phase]").forEach(
    (b) =>
      (b.onclick = () => {
        clearInterval(raceTimer);
        phase = b.dataset.phase;
        message = "";
        messageType = "";
        render();
        save();
      }),
  );
  $("#quickTheory").onclick = () =>
    dialog(
      s.name + " — Ripasso",
      s.slides.map((t) => `<h3>${t[0]}</h3><p>${t[1]}</p>`).join(""),
    );
  if (phase === "discover") discover();
  else if (phase === "experiment") experiment();
  else quizScreen();
}
function discover() {
  const s = CONTENT[station],
    step = state.discovery[station],
    t = s.slides[step];
  $("#stationBody").innerHTML =
    `<section class="panel discover"><div class="theory-visual">${hardware(s.id)}</div><div class="theory-content"><div class="theory-steps" aria-label="Scegli spiegazione">${s.slides.map((_, i) => `<button aria-label="Spiegazione ${i + 1}" data-slide="${i}" class="${i === step ? "active" : ""}"></button>`).join("")}</div><div class="eyebrow">SCOPRI / ${step + 1} DI 4</div><h2>${t[0]}</h2><p>${t[1]}</p><div class="example"><b>Un esempio:</b> ${t[2]}</div><div class="actions"><button id="prevTheory" ${step === 0 ? "disabled" : ""}>Precedente</button><button id="nextTheory" class="primary">${step === 3 ? "Passa all’esperimento" : "Continua"}</button></div></div></section>`;
  root.querySelectorAll("[data-slide]").forEach(
    (b) =>
      (b.onclick = () => {
        state.discovery[station] = Number(b.dataset.slide);
        save();
        discover();
      }),
  );
  $("#prevTheory").onclick = () => {
    state.discovery[station]--;
    save();
    discover();
  };
  $("#nextTheory").onclick = () => {
    if (step < 3) {
      state.discovery[station]++;
      save();
      discover();
    } else {
      phase = "experiment";
      message = "";
      stationScreen();
    }
  };
}
function goals(items) {
  return `<ul class="goals">${items.map(([label, done]) => `<li class="${done ? "done" : ""}">${done ? "✓" : "○"} ${label}</li>`).join("")}</ul>`;
}
function experiment() {
  const id = CONTENT[station].id;
  $("#stationBody").innerHTML =
    `<div id="simContent"></div><div id="experimentFeedback"></div><div class="actions"><button id="completeExperiment" class="primary">${state.experiments[station] ? "Aggiorna il quaderno con le osservazioni" : "Concludi l’esperimento e acquisisci la scheda"}</button><button id="toQuiz">Passa alla verifica</button></div>`;
  ({
    ram: renderRAM,
    rom: renderROM,
    cache: renderCache,
    hdd: renderHDD,
    ssd: renderSSD,
    units: renderUnits,
  })[id]();
  $("#experimentFeedback").innerHTML = feedbackHTML();
  $("#completeExperiment").onclick = completeExperiment;
  $("#toQuiz").onclick = () => {
    phase = "quiz";
    message = "";
    stationScreen();
  };
}
function rerenderExperiment() {
  save();
  experiment();
}
function experimentReady(i = station) {
  const s = state.sims;
  return [
    () =>
      s.ram.opened.length >= 2 &&
      s.ram.overflow &&
      s.ram.saved &&
      s.ram.shutdown,
    () => s.rom.failed && s.rom.booted,
    () => s.cache.requests >= 6 && s.cache.hits >= 1 && s.cache.evictions >= 1,
    () =>
      s.hdd.savedKinds.length >= 3 &&
      s.hdd.reads >= 1 &&
      s.hdd.deletes >= 1 &&
      s.hdd.cycled,
    () => s.ssd.race && s.ssd.scenarios.every(Boolean),
    () =>
      s.units.kinds.length >= 3 &&
      s.units.overflow &&
      s.units.conversions.every(Boolean),
  ][i]();
}
function observation(i) {
  const s = state.sims;
  return [
    () =>
      `Ho aperto ${s.ram.opened.length} tipi di applicazioni, incontrato il limite di 8 GB e spento il PC. La RAM si è svuotata; il file salvato nell’archiviazione è rimasto.`,
    () =>
      `Ho ricostruito i quattro passi dell’avvio e confrontato firmware funzionante e danneggiato. Senza firmware valido, il modello non raggiunge il sistema operativo.`,
    () =>
      `Ho fatto ${s.cache.requests} richieste: ${s.cache.hits} hit e ${s.cache.requests - s.cache.hits} miss. Ho osservato ${s.cache.evictions} sostituzioni FIFO con tre posti disponibili.`,
    () =>
      `Ho salvato tre tipi di file, recuperato ${s.hdd.reads} file e compiuto ${s.hdd.deletes} ${s.hdd.deletes === 1 ? "eliminazione" : "eliminazioni"}. Dopo lo spegnimento dell’unità, l’archivio ha conservato i file rimasti.`,
    () =>
      `Ho confrontato un caricamento HDD (6 s) e SSD (2 s), con tempi illustrativi. Ho scelto l’unità adatta a quattro esigenze, considerando accesso, costo per GB e parti mobili.`,
    () =>
      `Ho inserito almeno tre tipi di file nella chiavetta da 8 GB e tentato di superare 8000 MB. Ho verificato che 2 GB = 2000 MB e 24 bit = 3 byte, distinguendo capacità e velocità.`,
  ][i]();
}
function completeExperiment() {
  if (!experimentReady()) {
    feedback(
      "Prima completa tutti gli obiettivi indicati con il cerchio. Puoi ripetere le azioni e consultare le spiegazioni.",
      "bad",
    );
    experiment();
    return;
  }
  state.experiments[station] = true;
  state.notes[station] = true;
  state.observations[station] = observation(station);
  if (state.best[station] >= 70) state.completed[station] = true;
  save();
  feedback(
    "✓ Esperimento completato. La scheda è nel Quaderno del Tecnico: puoi aprirla in qualsiasi momento. Ora mettiti alla prova.",
    "good",
  );
  say(
    "Hai concluso l’esperimento e raccolto una nuova scheda. Nel quaderno trovi definizione, caratteristiche, esempio e ciò che hai osservato: ti servirà anche per ripassare durante le verifiche. Adesso prova a spiegare il meccanismo con parole tue, poi passa alla fase Dimostra. Puoi sempre tornare qui.",
  );
  stationScreen();
}
function renderRAM() {
  const s = state.sims.ram,
    apps = [
      ["Browser", 2],
      ["Videogioco", 4],
      ["Editor immagini", 3],
      ["Lettore musicale", 1],
    ],
    used = s.open.reduce((n, i) => n + apps[i][1], 0);
  $("#simContent").innerHTML =
    `<div class="exp-instructions"><b>Obiettivo:</b> apri almeno due tipi di applicazioni, prova a superare 8 GB, salva un documento e spegni il PC. I consumi sono illustrativi; nel modello non riserviamo RAM al sistema operativo.</div><div class="experiment"><section class="sim-scene"><h3>COMPUTER VIRTUALE / RAM 8 GB</h3><div class="computer ${s.power ? "booted" : "off"}">${s.power ? `<span>${s.open.length} applicazioni aperte<br><b>${used} GB in uso</b></span>` : "COMPUTER SPENTO<br>RAM vuota"}</div><div class="meter"><span style="width:${(used / 8) * 100}%"></span></div><div class="meter-caption"><span>${used} GB occupati</span><span>${8 - used} GB liberi</span></div><div class="app-buttons">${apps.map(([n, gb], i) => `<button data-ram-app="${i}" class="${s.open.includes(i) ? "opened" : ""}" ${!s.power ? "disabled" : ""}><b>${gb} GB</b>${s.open.includes(i) ? "Chiudi" : "Apri"} ${n}</button>`).join("")}</div><div class="actions"><button id="ramSave" ${!s.power ? "disabled" : ""}>Salva documento sul disco</button><button id="ramPower">${s.power ? "Spegni il computer" : "Accendi il computer"}</button></div></section><section class="panel"><h3>Due luoghi, due funzioni</h3><p>RAM: spazio temporaneo per lavorare.<br>Archiviazione: spazio per conservare i file.</p><div class="archive-files"><span>▤ Relazione già salvata</span>${s.saved ? "<span>▤ Documento del laboratorio</span>" : ""}</div><p class="muted" style="font-size:14px;margin-top:15px">I file nell’archivio restano visibili anche a computer spento.</p>${goals(
      [
        ["Apri almeno due tipi di applicazioni", s.opened.length >= 2],
        ["Prova ad aprire più di 8 GB", s.overflow],
        ["Salva un documento nell’archiviazione", s.saved],
        ["Spegni il PC dopo aver salvato", s.shutdown],
      ],
    )}</section></div>`;
  root.querySelectorAll("[data-ram-app]").forEach(
    (b) =>
      (b.onclick = () => {
        const i = Number(b.dataset.ramApp);
        if (!s.power) return;
        if (s.open.includes(i)) {
          s.open = s.open.filter((v) => v !== i);
          feedback(
            "Hai chiuso " +
              apps[i][0] +
              ": la RAM usata da quell’applicazione torna disponibile.",
            "good",
          );
        } else if (used + apps[i][1] > 8) {
          s.overflow = true;
          feedback(
            "Memoria insufficiente: " +
              used +
              " + " +
              apps[i][1] +
              " supera 8 GB. Nel modello l’app non si apre; nella realtà il PC può rallentare o non riuscire ad aprirla. Chiudi qualcosa.",
            "bad",
          );
        } else {
          s.open.push(i);
          if (!s.opened.includes(i)) s.opened.push(i);
          feedback(
            "Hai aperto " +
              apps[i][0] +
              ": ora sono occupati " +
              (used + apps[i][1]) +
              " GB.",
            "good",
          );
        }
        rerenderExperiment();
      }),
  );
  $("#ramSave").onclick = () => {
    s.saved = true;
    feedback(
      "Documento scritto nell’archiviazione. Ora spegni e confronta: il file salvato resta, la RAM si svuota.",
      "good",
    );
    rerenderExperiment();
  };
  $("#ramPower").onclick = () => {
    s.power = !s.power;
    if (!s.power) {
      s.open = [];
      if (s.saved) s.shutdown = true;
      feedback(
        "PC spento: la RAM si è svuotata. I file salvati nell’archiviazione restano disponibili.",
        "good",
      );
    } else
      feedback(
        "Computer acceso: la RAM del modello riparte vuota. I file salvati sono ancora nell’archivio.",
      );
    rerenderExperiment();
  };
}
const BOOT = [
  "Accensione",
  "Esecuzione del firmware",
  "Controllo iniziale dell’hardware",
  "Avvio del sistema operativo dall’archiviazione",
];
function renderROM() {
  const s = state.sims.rom;
  $("#simContent").innerHTML =
    `<div class="exp-instructions"><b>Obiettivo:</b> ricostruisci i quattro passi e avvia il computer. Poi simula un firmware danneggiato e osserva un avvio fallito. Ripristina il firmware per riprovare.</div><div class="experiment"><section class="sim-scene"><h3>CAMERA DI AVVIO / MODELLO SEMPLIFICATO</h3><div class="computer ${s.booted && !s.missing ? "booted" : "off"}">${s.missing ? "FIRMWARE NON VALIDO" : s.booted ? "✓ SISTEMA OPERATIVO PRONTO" : "IN ATTESA DELLA SEQUENZA"}</div><div class="boot-slots">${[0, 1, 2, 3].map((_, i) => `<button data-remove-step="${i}"><b>${i + 1}</b>${s.sequence[i] === undefined ? "Scegli un passaggio" : BOOT[s.sequence[i]]}</button>`).join("")}</div><div class="boot-tiles">${s.pool
      .filter((i) => !s.sequence.includes(i))
      .map(
        (i) =>
          `<button data-boot-step="${i}" draggable="true"><span>PASSAGGIO DISPONIBILE</span>${BOOT[i]}</button>`,
      )
      .join(
        "",
      )}</div><p class="muted" style="font-size:13px">Clicca le tessere nell’ordine. Clicca un passaggio inserito per rimuoverlo; puoi anche trascinare una tessera in uno spazio.</p></section><section class="panel"><h3>Metti alla prova l’avvio</h3><p>Il firmware è il software iniziale. Nei PC moderni è generalmente conservato in flash non volatile.</p><div class="actions"><button id="checkBoot" class="primary">Prova ad accendere</button><button id="firmwareToggle">${s.missing ? "Ripristina il firmware" : "Simula firmware danneggiato"}</button></div>${goals(
      [
        ["Completa un avvio con la sequenza corretta", s.booted],
        ["Osserva un avvio con firmware danneggiato", s.failed],
      ],
    )}<p class="muted" style="font-size:14px">È soltanto una simulazione: non cambia le impostazioni del tuo computer.</p></section></div>`;
  function add(i, slot) {
    if (s.sequence.includes(i)) return;
    if (slot === undefined || slot >= s.sequence.length) s.sequence.push(i);
    else s.sequence.splice(slot, 0, i);
    s.sequence = s.sequence.slice(0, 4);
    rerenderExperiment();
  }
  root.querySelectorAll("[data-boot-step]").forEach((b) => {
    b.onclick = () => add(Number(b.dataset.bootStep));
    b.ondragstart = (e) =>
      e.dataTransfer.setData("text/plain", b.dataset.bootStep);
  });
  root.querySelectorAll("[data-remove-step]").forEach((b) => {
    b.onclick = () => {
      s.sequence.splice(Number(b.dataset.removeStep), 1);
      rerenderExperiment();
    };
    b.ondragover = (e) => e.preventDefault();
    b.ondrop = (e) => {
      e.preventDefault();
      const id = Number(e.dataTransfer.getData("text/plain"));
      if (Number.isInteger(id) && id >= 0 && id < 4)
        add(id, Number(b.dataset.removeStep));
    };
  });
  $("#firmwareToggle").onclick = () => {
    s.missing = !s.missing;
    feedback(
      s.missing
        ? "Firmware danneggiato nel modello. Prova l’accensione per vedere il risultato."
        : "Firmware ripristinato. Le istruzioni iniziali sono di nuovo disponibili.",
    );
    rerenderExperiment();
  };
  $("#checkBoot").onclick = () => {
    if (s.missing) {
      s.failed = true;
      feedback(
        "Avvio interrotto: manca un firmware valido che prepari il sistema. La RAM da sola non contiene le istruzioni per partire.",
        "bad",
      );
    } else if (s.sequence.length === 4 && s.sequence.every((v, i) => v === i)) {
      s.booted = true;
      feedback(
        "✓ Avvio completato: firmware e controllo hardware precedono l’avvio del sistema operativo dall’archiviazione.",
        "good",
      );
    } else
      feedback(
        "L’ordine non è ancora corretto. Prima l’accensione, poi il firmware e il controllo hardware; il sistema operativo arriva dopo.",
        "bad",
      );
    rerenderExperiment();
  };
}
function renderCache() {
  const s = state.sims.cache;
  $("#simContent").innerHTML =
    `<div class="exp-instructions"><b>Obiettivo:</b> fai almeno sei richieste, ottieni un hit e provoca una sostituzione. La cache ha tre posti. Regola <b>FIFO</b>: esce il dato inserito da più tempo; un hit non cambia l’ordine.</div><div class="experiment"><section class="sim-scene"><h3>CPU / CACHE / RAM</h3><div class="flow"><div class="flow-block">CPU</div><span class="flow-link">↔</span><div class="flow-block" style="border-color:var(--amber)">CACHE</div><span class="flow-link">↔</span><div class="flow-block">RAM</div></div><div class="cache-slots">${[0, 1, 2].map((_, i) => `<div class="cache-slot ${s.slots[i] ? "filled" : ""}">${s.slots[i] || "–"}</div>`).join("")}</div><p class="muted" style="font-size:14px;text-align:center">Più vecchio a sinistra · più recente a destra</p><div class="counter-row"><div><b>${s.requests}</b><span>RICHIESTE</span></div><div><b>${s.hits}</b><span>HIT</span></div><div><b>${s.requests - s.hits}</b><span>MISS</span></div></div></section><section class="panel"><h3>Quale dato serve alla CPU?</h3><div class="data-buttons">${["A", "B", "C", "D", "E"].map((d) => `<button data-request="${d}">${d}</button>`).join("")}</div><p class="muted" style="margin-top:17px">Tempo simbolico: hit = 1 unità; miss = 5 unità. Non sono tempi reali né un benchmark.</p>${goals(
      [
        ["Esegui almeno sei richieste", s.requests >= 6],
        ["Trova almeno una volta il dato in cache", s.hits >= 1],
        ["Inserisci un dato quando i tre posti sono pieni", s.evictions >= 1],
      ],
    )}<button class="small quiet" id="clearCache">Svuota la cache</button></section></div>`;
  root.querySelectorAll("[data-request]").forEach(
    (b) =>
      (b.onclick = () => {
        const d = b.dataset.request;
        s.requests++;
        if (s.slots.includes(d)) {
          s.hits++;
          s.last =
            "HIT: " + d + " è già nella cache. Recupero in 1 unità simbolica.";
          feedback(s.last, "good");
        } else {
          let evicted = "";
          if (s.slots.length === 3) {
            evicted = s.slots.shift();
            s.evictions++;
          }
          s.slots.push(d);
          s.last =
            "MISS: " +
            d +
            " viene recuperato dalla RAM in 5 unità simboliche." +
            (evicted
              ? " Esce " + evicted + ", il dato entrato da più tempo."
              : " Una copia entra nella cache.");
          feedback(s.last);
        }
        rerenderExperiment();
      }),
  );
  $("#clearCache").onclick = () => {
    s.slots = [];
    feedback(
      "Cache svuotata: la prossima richiesta sarà un miss. I contatori del tuo esperimento restano registrati.",
    );
    rerenderExperiment();
  };
}
function sumFiles(files) {
  return files.reduce((t, f) => t + f.mb, 0);
}
function fileRows(files, read = false) {
  return files.length
    ? `<ul class="file-list">${files.map((f) => `<li><span>${esc(f.name)}<small>${f.mb.toLocaleString("it-IT")} MB</small></span>${read ? `<button data-read-file="${esc(f.id)}">Recupera</button>` : ""}<button data-delete-file="${esc(f.id)}" aria-label="Elimina ${esc(f.name)}">Elimina</button></li>`).join("")}</ul>`
    : '<p class="muted" style="margin-top:20px">Archivio vuoto: aggiungi il primo file.</p>';
}
function renderHDD() {
  const s = state.sims.hdd,
    used = sumFiles(s.files),
    kinds = [
      ["doc", "Documento", 200],
      ["photo", "Fotografia", 800],
      ["video", "Video", 3000],
    ];
  $("#simContent").innerHTML =
    `<div class="exp-instructions"><b>Obiettivo:</b> salva tre tipi di file, recuperane uno, eliminane uno e spegni/riaccendi l’unità. Capacità didattica: 8000 MB; le dimensioni sono illustrative.</div><div class="experiment"><section class="sim-scene"><h3>ARCHIVIO MAGNETICO / ${s.power ? "ONLINE" : "SPENTO"}</h3><div class="disk-wrap" id="diskMotion">${hardware("hdd")}</div><div class="meter"><span style="width:${used / 80}%"></span></div><div class="meter-caption"><span>${used} MB usati</span><span>${8000 - used} MB liberi</span></div><div class="actions">${kinds.map(([id, name, mb]) => `<button data-hdd-add="${id}" class="small" ${!s.power ? "disabled" : ""}>Salva ${name}<br>${mb} MB</button>`).join("")}</div><button id="hddPower" class="small quiet" style="margin-top:12px">${s.power ? "Spegni l’unità" : "Riaccendi l’unità"}</button></section><section class="panel"><h3>File nell’archivio</h3>${fileRows(s.files, s.power)}${!s.power ? '<p class="muted">Elenco conservato: per leggere o eliminare, riaccendi l’unità.</p>' : ""}${goals(
      [
        ["Salva documento, fotografia e video", s.savedKinds.length >= 3],
        ["Recupera almeno un file", s.reads >= 1],
        ["Elimina almeno un file", s.deletes >= 1],
        ["Spegni l’unità con almeno un file salvato", s.cycled],
      ],
    )}</section></div>`;
  root.querySelectorAll("[data-hdd-add]").forEach(
    (b) =>
      (b.onclick = () => {
        if (!s.power) return;
        const [kind, name, mb] = kinds.find((k) => k[0] === b.dataset.hddAdd);
        if (used + mb > 8000) {
          feedback(
            "Spazio insufficiente: il file non viene salvato. Elimina un file oppure scegli un file più piccolo.",
            "bad",
          );
        } else if (s.files.length >= 100) {
          feedback(
            "Hai raggiunto il limite didattico di 100 file. Elimina un file prima di continuare.",
            "bad",
          );
        } else {
          s.files.push({
            id: "h" + ++s.serial,
            kind,
            name: name + " " + s.serial,
            mb,
          });
          if (!s.savedKinds.includes(kind)) s.savedKinds.push(kind);
          feedback(
            "File salvato: lo spazio occupato aumenta di " +
              mb +
              " MB. Il file è nell’archiviazione non volatile.",
            "good",
          );
        }
        rerenderExperiment();
      }),
  );
  root.querySelectorAll("[data-read-file]").forEach(
    (b) =>
      (b.onclick = () => {
        if (!s.power) return;
        const file = s.files.find((f) => f.id === b.dataset.readFile);
        if (!file) return;
        s.reads++;
        feedback(
          "Recuperato " +
            file.name +
            ": la testina cerca i dati. Leggere non elimina il file e non cambia lo spazio occupato.",
          "good",
        );
        rerenderExperiment();
        $("#diskMotion")?.classList.add("busy");
        setTimeout(() => {
          if (view === "station" && station === 3)
            $("#diskMotion")?.classList.remove("busy");
        }, 1600);
      }),
  );
  root.querySelectorAll("[data-delete-file]").forEach((b) => {
    b.disabled = !s.power;
    b.onclick = () => {
      if (!s.power) return;
      const f = s.files.find((f) => f.id === b.dataset.deleteFile);
      if (!f) return;
      s.files = s.files.filter((v) => v.id !== f.id);
      s.deletes++;
      feedback(
        "Eliminato " +
          f.name +
          ": liberati " +
          f.mb +
          " MB nell’archivio virtuale.",
        "good",
      );
      rerenderExperiment();
    };
  });
  $("#hddPower").onclick = () => {
    s.power = !s.power;
    if (!s.power && s.files.length) s.cycled = true;
    feedback(
      s.power
        ? "Unità riaccesa: i file salvati sono ancora presenti."
        : "Unità spenta: i file conservati non scompaiono. L’HDD è non volatile.",
      "good",
    );
    rerenderExperiment();
  };
}
function renderSSD() {
  const s = state.sims.ssd;
  $("#simContent").innerHTML =
    `<div class="exp-instructions"><b>Obiettivo:</b> avvia un confronto e scegli l’unità adatta a tutte le quattro situazioni. Computer uguali, cambia soltanto l’archiviazione. <b>Tempi illustrativi, non benchmark reali.</b></div><div class="experiment"><section class="sim-scene"><h3>DUE COMPUTER / UN CARICAMENTO</h3><div class="race-lane"><h3>Computer con HDD <span>6 s illustrativi</span></h3><div class="meter"><span id="hddRace" style="width:${s.race ? "100" : "0"}%"></span></div><span id="hddRaceText">${s.race ? "✓ Caricamento completato" : "In attesa"}</span></div><div class="race-lane ssd"><h3>Computer con SSD <span>2 s illustrativi</span></h3><div class="meter"><span id="ssdRace" style="width:${s.race ? "100" : "0"}%"></span></div><span id="ssdRaceText">${s.race ? "✓ Caricamento completato" : "In attesa"}</span></div><button id="startRace" class="primary">${s.race ? "Ripeti il confronto" : "Avvia il caricamento"}</button><p class="muted" style="font-size:14px;margin-top:16px">L’SSD accede ai chip senza movimenti di testine. Le prestazioni reali variano con prodotto e carico.</p></section><section class="panel"><h3>Quale unità sceglieresti?</h3>${SCENARIOS.map((sc, i) => `<div class="scenario"><p>${sc.text}</p>${s.scenarios[i] ? `<span class="done-label">✓ ${sc.answer.toUpperCase()}: ${sc.why}</span>` : `<button data-scenario="${i}" data-device="hdd" class="small">HDD</button> <button data-scenario="${i}" data-device="ssd" class="small">SSD</button>`}</div>`).join("")}${goals(
      [
        ["Osserva entrambi i caricamenti conclusi", s.race],
        ["Completa le quattro scelte ragionate", s.scenarios.every(Boolean)],
      ],
    )}</section></div>`;
  $("#startRace").onclick = () => {
    s.started = Date.now();
    startRaceTimer();
    save();
  };
  root.querySelectorAll("[data-scenario]").forEach(
    (b) =>
      (b.onclick = () => {
        const i = Number(b.dataset.scenario),
          correct = b.dataset.device === SCENARIOS[i].answer;
        if (correct) s.scenarios[i] = true;
        feedback(
          (correct ? "✓ Scelta adatta. " : "Rifletti ancora. ") +
            SCENARIOS[i].why,
          correct ? "good" : "bad",
        );
        rerenderExperiment();
      }),
  );
  if (s.started) startRaceTimer();
}
function startRaceTimer() {
  clearInterval(raceTimer);
  const s = state.sims.ssd;
  function tick() {
    const elapsed = Date.now() - s.started;
    if (view !== "station" || station !== 4 || phase !== "experiment") {
      clearInterval(raceTimer);
      return;
    }
    const h = clamp((elapsed / 6000) * 100, 0, 100),
      d = clamp((elapsed / 2000) * 100, 0, 100);
    $("#hddRace").style.width = h + "%";
    $("#ssdRace").style.width = d + "%";
    $("#hddRaceText").textContent =
      h === 100 ? "✓ Caricamento completato" : Math.round(h) + "%";
    $("#ssdRaceText").textContent =
      d === 100 ? "✓ Caricamento completato" : Math.round(d) + "%";
    $("#startRace").disabled = true;
    if (h === 100) {
      clearInterval(raceTimer);
      s.race = true;
      s.started = 0;
      feedback(
        "✓ Confronto concluso. Il modello rende visibile un accesso più rapido dell’SSD. I tempi non sono una promessa sulle prestazioni reali.",
        "good",
      );
      rerenderExperiment();
    }
  }
  tick();
  if (s.started) raceTimer = setInterval(tick, 100);
}
function renderUnits() {
  const s = state.sims.units,
    used = sumFiles(s.files);
  $("#simContent").innerHTML =
    `<div class="exp-instructions"><b>Obiettivo:</b> inserisci almeno tre tipi di file, prova a superare la capacità e risolvi i tre piccoli esercizi. 8 GB = 8000 MB, usando multipli decimali. Tutte le dimensioni dei file sono esempi.</div><div class="experiment"><section class="sim-scene"><h3>CHIAVETTA USB / 8 GB</h3><div class="usb-visual">${(used / 1000).toLocaleString("it-IT")} / 8 GB</div><div class="meter"><span style="width:${used / 80}%"></span></div><div class="meter-caption"><span>${used} MB usati</span><span>${8000 - used} MB liberi</span></div><div class="actions">${FILES.map((f) => `<button class="small" data-usb-add="${f.id}">${f.icon} ${f.name}<br>${f.mb} MB</button>`).join("")}</div>${fileRows(s.files)}<p class="muted" style="font-size:13px">Puoi aggiungere più copie dello stesso tipo di file ed eliminarle singolarmente.</p></section><section class="panel"><h3>Traduci le quantità</h3><div class="calc-field"><label for="convert0">2 GB = quanti MB?</label><div class="calc-row"><input id="convert0" type="number" min="0" placeholder="MB" ${s.conversions[0] ? 'disabled value="2000"' : ""}><button data-conversion="0" ${s.conversions[0] ? "disabled" : ""}>${s.conversions[0] ? "✓" : "Verifica"}</button></div></div><div class="calc-field"><label for="convert1">24 bit = quanti byte?</label><div class="calc-row"><input id="convert1" type="number" min="0" placeholder="byte" ${s.conversions[1] ? 'disabled value="3"' : ""}><button data-conversion="1" ${s.conversions[1] ? "disabled" : ""}>${s.conversions[1] ? "✓" : "Verifica"}</button></div></div><div class="calc-field"><p style="font-size:14px">Quale unità è ragionevole per una fotografia digitale?</p><button data-photo-unit="yes" class="small">MB</button> <button data-photo-unit="no" class="small">TB</button></div><div class="calc-field"><p style="font-size:14px">Quale misura indica una capacità?</p><button data-capacity="yes" class="small" ${s.conversions[2] ? "disabled" : ""}>8 GB</button> <button data-capacity="no" class="small" ${s.conversions[2] ? "disabled" : ""}>100 MB/s</button>${s.conversions[2] ? "<span> ✓</span>" : ""}</div>${goals(
      [
        ["Inserisci almeno tre tipi di file", s.kinds.length >= 3],
        ["Prova a superare 8000 MB", s.overflow],
        ["Completa i tre esercizi", s.conversions.every(Boolean)],
      ],
    )}<p class="muted" style="font-size:14px">Scala decimale: byte · KB · MB · GB · TB. Ogni gradino vale 1000. Un byte contiene 8 bit.</p></section></div>`;
  root.querySelectorAll("[data-usb-add]").forEach(
    (b) =>
      (b.onclick = () => {
        const f = FILES.find((f) => f.id === b.dataset.usbAdd);
        if (used + f.mb > 8000) {
          s.overflow = true;
          feedback(
            "Capacità superata: " +
              used +
              " + " +
              f.mb +
              " = " +
              (used + f.mb) +
              " MB, più di 8000. Il file non è stato copiato.",
            "bad",
          );
        } else if (s.files.length >= 100) {
          feedback(
            "Limite didattico di 100 file: elimina qualche elemento prima di continuare.",
            "bad",
          );
        } else {
          s.files.push({
            id: "u" + ++s.serial,
            kind: f.id,
            name: f.name + " " + s.serial,
            mb: f.mb,
          });
          if (!s.kinds.includes(f.id)) s.kinds.push(f.id);
          feedback(
            "Aggiunto " +
              f.name +
              ": " +
              f.mb +
              " MB in più. Rimangono " +
              (8000 - used - f.mb) +
              " MB.",
            "good",
          );
        }
        rerenderExperiment();
      }),
  );
  root.querySelectorAll("[data-delete-file]").forEach(
    (b) =>
      (b.onclick = () => {
        s.files = s.files.filter((f) => f.id !== b.dataset.deleteFile);
        feedback(
          "File eliminato: lo spazio della chiavetta torna disponibile.",
          "good",
        );
        rerenderExperiment();
      }),
  );
  root.querySelectorAll("[data-conversion]").forEach(
    (b) =>
      (b.onclick = () => {
        const i = Number(b.dataset.conversion),
          input = $("#convert" + i),
          valid =
            input.value.trim() !== "" && Number(input.value) === [2000, 3][i];
        if (valid) s.conversions[i] = true;
        feedback(
          valid
            ? "✓ Corretto. " +
                (i === 0 ? "2 × 1000 = 2000 MB." : "24 ÷ 8 = 3 byte.")
            : i === 0
              ? "Da GB a MB moltiplichi per 1000. Riprova."
              : "Ogni byte contiene 8 bit. Dividi 24 per 8.",
          valid ? "good" : "bad",
        );
        rerenderExperiment();
      }),
  );
  root.querySelectorAll("[data-photo-unit]").forEach(
    (b) =>
      (b.onclick = () => {
        const correct = b.dataset.photoUnit === "yes";
        feedback(
          correct
            ? "✓ Una foto può occupare alcuni MB: la dimensione varia con qualità e formato. I TB sono più adatti a descrivere grandi archivi."
            : "TB indica una quantità molto grande: confronta una singola foto con un intero archivio. Riprova.",
          correct ? "good" : "bad",
        );
        rerenderExperiment();
      }),
  );
  root.querySelectorAll("[data-capacity]").forEach(
    (b) =>
      (b.onclick = () => {
        const correct = b.dataset.capacity === "yes";
        if (correct) s.conversions[2] = true;
        feedback(
          correct
            ? "✓ 8 GB indica quanti dati entrano. 100 MB/s indica quanti dati passano in un secondo."
            : "MB/s indica una velocità: contiene il tempo, in secondi. Cerca una quantità di spazio.",
          correct ? "good" : "bad",
        );
        rerenderExperiment();
      }),
  );
}
// Verifiche: un tentativo ha 5 domande; almeno un esercizio pratico è sempre incluso.
function newQuiz() {
  const pool = CONTENT[station].questions,
    interactive = shuffle(
      pool
        .map((q, i) => (q.type !== "choice" ? i : null))
        .filter((i) => i !== null),
    )[0],
    others = shuffle(
      pool.map((_, i) => i).filter((i) => i !== interactive),
    ).slice(0, 4);
  state.quiz[station] = {
    ids: shuffle([interactive, ...others]),
    index: 0,
    results: [],
    answered: null,
    draft: null,
    orderPool: [],
  };
  save();
}
function quizScreen() {
  const body = $("#stationBody");
  if (!state.experiments[station]) {
    body.innerHTML = `<div class="panel"><h2>Prima le mani in pasta.</h2><p>La verifica usa ciò che hai osservato nell’esperimento. Completa gli obiettivi e acquisisci la scheda del quaderno, poi torna qui.</p><button class="primary" id="backExperiment">Apri l’esperimento</button></div>`;
    $("#backExperiment").onclick = () => {
      phase = "experiment";
      stationScreen();
    };
    return;
  }
  let quiz = state.quiz[station];
  if (!quiz) {
    body.innerHTML = `<div class="panel question-shell"><div class="eyebrow">DIMOSTRA / ${CONTENT[station].name}</div><h2>Ora tocca a te spiegare.</h2><p>Cinque esercizi casuali da una banca di ${CONTENT[station].questions.length} domande. Ogni risposta corretta vale 20 punti. Servono almeno 70/100: con cinque esercizi significa almeno quattro risposte corrette (80/100).</p><p>Puoi aprire il Quaderno del Tecnico o il Ripasso rapido, e tornare alle altre fasi. Il tentativo resta salvato. Il miglior punteggio non diminuisce.</p><button id="startQuiz" class="primary">Inizia la verifica</button></div>`;
    $("#startQuiz").onclick = () => {
      newQuiz();
      quizScreen();
    };
    return;
  }
  if (quiz.index === 5) {
    const score = quiz.results.filter(Boolean).length * 20;
    body.innerHTML = `<div class="panel quiz-result"><div class="eyebrow">VERIFICA CONCLUSA</div><h2>${score >= 70 ? "Postazione superata!" : "Ogni tentativo ti insegna qualcosa."}</h2><div class="big-score">${score}<span style="font-size:25px">/100</span></div><p>${score >= 70 ? "Hai dimostrato di aver capito il meccanismo. Puoi esplorare un’altra postazione o migliorare il risultato." : "Per superare servono almeno quattro risposte corrette. Ripassa le spiegazioni e prova una nuova selezione di esercizi."}</p><p class="muted">Miglior risultato conservato: ${state.best[station]}/100.</p><div class="actions" style="justify-content:center"><button id="retryQuiz" class="primary">Nuovo tentativo</button><button id="returnLab">Torna al laboratorio</button></div></div>`;
    $("#retryQuiz").onclick = () => {
      newQuiz();
      quizScreen();
    };
    $("#returnLab").onclick = () => go("home");
    return;
  }
  const q = CONTENT[station].questions[quiz.ids[quiz.index]],
    answered = quiz.answered !== null;
  let input = "";
  if (q.type === "choice")
    input = `<div class="question-options">${q.options.map((o, i) => `<button data-choice="${i}" class="${quiz.draft === i ? "selected" : ""} ${answered && i === q.correct ? "correct" : ""} ${answered && quiz.draft === i && !quiz.answered ? "incorrect" : ""}" ${answered ? "disabled" : ""}>${esc(o)}</button>`).join("")}</div>`;
  if (q.type === "number")
    input = `<label for="quizNumber">Risposta in ${q.unit}</label><div class="calc-row" style="margin-top:12px"><input id="quizNumber" type="number" step="any" min="0" placeholder="Scrivi il numero" ${answered ? "disabled" : ""} value="${quiz.draft ?? ""}"><span style="align-self:center">${q.unit}</span></div>`;
  if (q.type === "match") {
    const opts = shuffle(q.pairs.map((p) => p[1]));
    input = q.pairs
      .map(
        ([left], i) =>
          `<div class="match-row"><label for="match${i}">${left}</label><select id="match${i}" data-match="${i}" ${answered ? "disabled" : ""}><option value="">Scegli…</option>${opts.map((o) => `<option ${quiz.draft?.[i] === o ? "selected" : ""} value="${esc(o)}">${esc(o)}</option>`).join("")}</select></div>`,
      )
      .join("");
  }
  if (q.type === "order") {
    if (!Array.isArray(quiz.draft)) quiz.draft = [];
    if (!quiz.orderPool?.length)
      quiz.orderPool = shuffle(q.items.map((_, i) => i));
    input = `<p class="muted" style="font-size:14px">Clicca le tessere nell’ordine richiesto. Clicca una tessera inserita per rimuoverla.</p><div class="answer-order">${quiz.draft.map((id, pos) => `<button data-unorder="${pos}" ${answered ? "disabled" : ""}>${pos + 1}. ${esc(q.items[id])}</button>`).join("") || '<span class="muted">La tua sequenza apparirà qui.</span>'}</div><div class="order-pool">${quiz.orderPool
      .filter((id) => !quiz.draft.includes(id))
      .map(
        (id) =>
          `<button data-order="${id}" ${answered ? "disabled" : ""}>${esc(q.items[id])}</button>`,
      )
      .join("")}</div>`;
  }
  body.innerHTML = `<div class="panel question-shell"><div class="quiz-top"><span>ESERCIZIO ${quiz.index + 1} / 5</span><span>${quiz.results.filter(Boolean).length * 20} punti finora</span></div><h2>${esc(q.prompt)}</h2>${input}${answered ? `<div class="feedback ${quiz.answered ? "good" : "bad"}" role="status"><b>${quiz.answered ? "✓ Corretto." : "✕ Da rivedere."}</b> ${esc(q.why)}${q.type === "number" ? " Risposta: " + q.answer + " " + q.unit + "." : ""}${q.type === "match" ? " " + q.pairs.map((p) => p.join(": ")).join("; ") + "." : ""}${q.type === "order" ? " Ordine: " + q.items.join(" → ") + "." : ""}</div>` : ""}<div class="actions"><button id="submitQuiz" class="primary">${answered ? "Prossimo esercizio" : "Conferma risposta"}</button></div><p class="muted" style="font-size:13px;margin-top:20px">Un errore non blocca il percorso. Potrai riprovare la verifica e mantenere il risultato migliore.</p></div>`;
  root.querySelectorAll("[data-choice]").forEach(
    (b) =>
      (b.onclick = () => {
        quiz.draft = Number(b.dataset.choice);
        save();
        quizScreen();
      }),
  );
  if ($("#quizNumber"))
    $("#quizNumber").oninput = (e) => {
      quiz.draft = e.target.value;
    };
  root.querySelectorAll("[data-match]").forEach(
    (select) =>
      (select.onchange = () => {
        if (!Array.isArray(quiz.draft)) quiz.draft = [];
        quiz.draft[Number(select.dataset.match)] = select.value;
        save();
      }),
  );
  root.querySelectorAll("[data-order]").forEach(
    (b) =>
      (b.onclick = () => {
        quiz.draft.push(Number(b.dataset.order));
        save();
        quizScreen();
      }),
  );
  root.querySelectorAll("[data-unorder]").forEach(
    (b) =>
      (b.onclick = () => {
        quiz.draft.splice(Number(b.dataset.unorder), 1);
        save();
        quizScreen();
      }),
  );
  $("#submitQuiz").onclick = () => {
    if (answered) {
      quiz.results.push(quiz.answered);
      quiz.index++;
      quiz.answered = null;
      quiz.draft = null;
      quiz.orderPool = [];
      if (quiz.index === 5) {
        const score = quiz.results.filter(Boolean).length * 20;
        state.best[station] = Math.max(state.best[station], score);
        state.completed[station] = state.best[station] >= 70;
        toast(
          score >= 70
            ? "Postazione superata: " + score + "/100"
            : "Tentativo concluso: ripassa e riprova.",
        );
      }
      save();
      stationScreen();
      return;
    }
    let valid = false,
      correct = false;
    if (q.type === "choice") {
      valid = Number.isInteger(quiz.draft);
      correct = quiz.draft === q.correct;
    } else if (q.type === "number") {
      valid = quiz.draft !== null && String(quiz.draft).trim() !== "";
      correct = Number(quiz.draft) === q.answer;
    } else if (q.type === "match") {
      valid =
        Array.isArray(quiz.draft) && q.pairs.every((p, i) => !!quiz.draft[i]);
      correct = valid && q.pairs.every((p, i) => quiz.draft[i] === p[1]);
    } else if (q.type === "order") {
      valid = quiz.draft.length === q.items.length;
      correct = valid && quiz.draft.every((n, i) => n === i);
    }
    if (!valid) {
      toast("Completa la risposta prima di confermare.");
      return;
    }
    quiz.answered = correct;
    save();
    quizScreen();
  };
}
function tableHTML() {
  return `<div class="table-scroll"><table><caption>Le memorie a confronto</caption><thead><tr>${["Memoria", "Funzione", "Volatilità", "Velocità relativa", "Capacità indicativa", "Esempio"].map((s) => `<th>${s}</th>`).join("")}</tr></thead><tbody>${COMPARISON.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div><p style="font-size:12px">Confronto qualitativo e semplificato. Capacità e prestazioni variano con i dispositivi. La velocità della memoria del firmware non è il criterio principale per confrontarla con la memoria di lavoro.</p>`;
}
function notesHTML() {
  const acquired = state.notes.filter(Boolean).length;
  return `<article class="notebook"><div class="notebook-title"><div class="eyebrow" style="color:#3d6e5d">MEMORY LAB / APPUNTI DI LABORATORIO</div><h1>Il Quaderno del Tecnico</h1><p><b>${esc(state.name || "Tecnico in formazione")}</b> · ${acquired}/6 schede acquisite · Migliori risultati: ${state.best.reduce((a, b) => a + b, 0)}/600</p></div>${acquired ? `<div class="note-grid">${CONTENT.map((s, i) => (state.notes[i] ? `<section class="note-card">${hardware(s.id)}<h2>${s.name} · ${s.subtitle}</h2><p><b>Definizione.</b> ${s.note.definition}</p><ul>${s.note.features.map((f) => `<li>${f}</li>`).join("")}</ul><p><b>Esempio.</b> ${s.note.example}</p><div class="observation"><b>Ho osservato:</b> ${esc(state.observations[i])}</div><p class="note-score">Miglior verifica: ${state.best[i]}/100 ${state.completed[i] ? "· ✓ Superata" : "· Da superare"}</p></section>` : "")).join("")}</div>` : '<div class="empty-note"><h2>Le pagine aspettano i tuoi esperimenti.</h2><p>Completa gli obiettivi di una postazione e premi “Concludi l’esperimento”. La prima scheda apparirà qui.</p></div>'}${state.completed.every(Boolean) ? tableHTML() : '<p style="margin-top:24px;font-size:14px">La tabella comparativa si sblocca dopo aver superato tutte le sei postazioni.</p>'}</article>`;
}
function openNotebook() {
  notebookReturn = { view, station, phase };
  go("notebook");
}
function notebook() {
  root.innerHTML = `<div class="actions" style="margin:0 0 20px"><button id="printNotes" class="primary">Stampa / Salva come PDF</button><button id="closeNotes">${notebookReturn.view === "station" ? "Torna alla postazione" : notebookReturn.view === "final" ? "Torna all’officina" : "Torna al laboratorio"}</button></div>${notesHTML()}`;
  $("#printNotes").onclick = () => printDocument("notes");
  $("#closeNotes").onclick = () =>
    go(notebookReturn.view, notebookReturn.station, notebookReturn.phase);
  say(
    "Questo è il tuo Quaderno del Tecnico. Ogni scheda contiene una definizione, le caratteristiche, un esempio e le osservazioni dell’esperimento che hai svolto. Puoi consultarlo durante le verifiche. Quando vuoi, stampalo o scegli Salva come PDF nella finestra di stampa del browser. La tabella finale apparirà dopo tutte le postazioni superate.",
  );
}
function finalMission() {
  if (!state.completed.every(Boolean)) {
    go("home");
    return;
  }
  const f = state.final;
  if (f.clients.every(Boolean)) {
    renderFinalFlow();
    return;
  }
  const i = f.current,
    c = CLIENTS[i];
  if (f.clients[i]) {
    f.current = f.clients.findIndex((v) => !v);
    finalMission();
    return;
  }
  root.innerHTML = `<div class="station-heading"><div><div class="eyebrow">OFFICINA / CLIENTE ${i + 1} DI 3</div><h1>Ripara il computer</h1><p>Prima scegli un intervento, poi spiega il motivo. Puoi sempre riprovare.</p></div><span class="pill">${f.clients.filter(Boolean).length}/3 clienti aiutati</span></div><section class="panel client-card"><div class="client-avatar">${avatar(i)}</div><div><div class="eyebrow">${c.name} / ${c.role}</div><blockquote>“${c.text}”</blockquote><h3>Quale intervento proponi?</h3><div class="question-options">${c.solutions.map((s, n) => `<button data-solution="${n}" class="${f.solution === n ? "selected" : ""}">${s}</button>`).join("")}</div><h3>Per quale motivo?</h3><div class="question-options">${c.reasons.map((s, n) => `<button data-reason="${n}" class="${f.reason === n ? "selected" : ""}">${s}</button>`).join("")}</div><button id="checkClient" class="primary">Proponi l’intervento</button>${feedbackHTML()}</div></section>`;
  root.querySelectorAll("[data-solution]").forEach(
    (b) =>
      (b.onclick = () => {
        f.solution = Number(b.dataset.solution);
        save();
        finalMission();
      }),
  );
  root.querySelectorAll("[data-reason]").forEach(
    (b) =>
      (b.onclick = () => {
        f.reason = Number(b.dataset.reason);
        save();
        finalMission();
      }),
  );
  $("#checkClient").onclick = () => {
    if (f.solution === null || f.reason === null) {
      toast("Scegli sia l’intervento sia la motivazione.");
      return;
    }
    if (f.solution === c.answer && f.reason === c.reason) {
      f.clients[i] = true;
      f.solution = null;
      f.reason = null;
      save();
      dialog("✓ Cliente aiutato: " + c.name, `<p>${c.why}</p>`, [
        [
          "Continua",
          () => {
            f.current = f.clients.findIndex((v) => !v);
            if (f.current < 0) f.current = 0;
            save();
            finalMission();
          },
        ],
      ]);
    } else {
      feedback("Intervento da rivedere. " + c.why, "bad");
      finalMission();
    }
  };
  say(
    "Nell’officina non basta scegliere un componente: serve spiegare perché può aiutare quella persona. Considera il problema concreto, controlla le caratteristiche del computer e ricorda che una singola modifica non risolve ogni possibile lentezza. Scegli un intervento e una motivazione: se serve, il quaderno è sempre a disposizione.",
  );
}
const FLOWSTEPS = [
  [
    "HDD / SSD",
    "Il programma e i suoi file sono conservati nell’archiviazione non volatile. Aprendolo, il sistema legge i dati necessari.",
    "hdd",
  ],
  [
    "RAM",
    "Dati e istruzioni necessari vengono caricati nella memoria di lavoro. Il programma in esecuzione usa la RAM.",
    "ram",
  ],
  [
    "CACHE",
    "La cache conserva copie di alcuni dati e istruzioni utili, per ridurre alcune attese del processore.",
    "cache",
  ],
  [
    "CPU",
    "La CPU esegue le istruzioni e lavora sui dati. Questo schema è un modello semplificato: il funzionamento reale comprende altri passaggi.",
    "cpu",
  ],
];
function renderFinalFlow() {
  const f = state.final;
  root.innerHTML = `<div class="eyebrow">OFFICINA / TUTTI I CLIENTI AIUTATI</div><h1>Segui il viaggio dei dati.</h1><p class="muted">Apri un programma e osserva le memorie che collaborano. Modello semplificato: non descrive ogni trasferimento reale.</p><div class="panel"><div class="final-flow">${FLOWSTEPS.map(([name, desc, id], i) => `<div class="flow-block ${f.flowStep === i ? "active" : ""}">${hardware(id)}${name}</div>`).join("")}</div><div class="feedback" id="flowExplanation">${f.flowStep >= 0 ? FLOWSTEPS[f.flowStep][1] : "Il programma è nell’archiviazione. Premi Apri programma per cominciare."}</div><div class="actions"><button id="startFlow" class="primary">${f.flowStep < 0 ? "Apri programma" : "Ripeti il percorso"}</button><button id="stepFlow" ${f.flowStep < 0 || f.flowStep >= 3 ? "disabled" : ""}>Passaggio successivo</button>${f.flowDone ? '<button id="claimDiploma" class="primary">Ritira il diploma</button>' : ""}</div><p class="muted" style="font-size:14px;margin:18px 0 0">La ROM o flash del firmware interviene prima, all’avvio del computer. Il percorso qui rappresenta l’apertura di un programma a PC già avviato.</p></div>`;
  $("#startFlow").onclick = () => {
    f.flowStep = 0;
    save();
    renderFinalFlow();
  };
  $("#stepFlow").onclick = () => {
    f.flowStep = clamp(f.flowStep + 1, 0, 3);
    if (f.flowStep === 3) f.flowDone = true;
    save();
    renderFinalFlow();
  };
  if ($("#claimDiploma"))
    $("#claimDiploma").onclick = () => {
      f.complete = true;
      f.date = new Date().toLocaleDateString("it-IT");
      save();
      go("diploma");
    };
  say(
    "Hai aiutato tutti i clienti. Ora segui il percorso semplificato di un programma: archiviazione, RAM, cache e CPU. Avvia l’apertura e fai avanzare i passaggi con calma. Ogni componente svolge un compito diverso. La memoria del firmware non è un archivio per i tuoi documenti: serve soprattutto a preparare l’avvio.",
  );
}
function diplomaHTML(print = false) {
  return `<article class="diploma"><div class="medal">✦</div><div class="eyebrow">MEMORY LAB / IL LABORATORIO DELLE MEMORIE</div><h1>DIPLOMA DI TECNICO<br>DELLA MEMORIA</h1><p>Conferito a</p><div class="student-name">${esc(state.name)}</div><p>per aver esplorato sei postazioni, completato gli esperimenti<br>e aiutato i tre clienti dell’officina.</p><div class="score-total">${state.best.reduce((a, b) => a + b, 0)} <span style="font-size:24px">/ 600</span></div><small>Punteggio complessivo dei migliori tentativi</small><div class="diploma-grid">${CONTENT.map((s, i) => `<div>${s.name}<b>${state.best[i]}/100</b></div>`).join("")}</div><p>Hai imparato a scegliere le memorie in base al loro compito.<br>Continua a osservare, provare e fare domande.</p><p><b>${esc(state.final.date)}</b></p><small>Attestato didattico · Nessun valore di certificazione professionale</small>${print ? "" : `<div class="actions" style="justify-content:center"><button id="printDiploma" class="primary">Stampa / Salva diploma in PDF</button><button id="openFinalNotes">Apri il tuo quaderno</button><button id="labAgain" class="quiet">Torna al laboratorio</button></div>`}</article>`;
}
function diploma() {
  if (!state.final.complete) {
    go("home");
    return;
  }
  root.innerHTML = diplomaHTML();
  $("#printDiploma").onclick = () => printDocument("diploma");
  $("#openFinalNotes").onclick = openNotebook;
  $("#labAgain").onclick = () => go("home");
  say(
    "Complimenti: sei arrivato al diploma. Hai sperimentato il lavoro della RAM, l’avvio del firmware, gli hit della cache e l’archiviazione di HDD e SSD. Sai anche leggere le capacità e scegliere un intervento motivato. Il quaderno rimane tuo per ripassare: stampalo insieme al diploma o salvalo come PDF.",
  );
}
let printKind = "notes";
function printDocument(kind) {
  printKind = kind;
  $("#printArea").innerHTML =
    kind === "diploma" ? diplomaHTML(true) : notesHTML();
  window.print();
}
window.addEventListener("beforeprint", () => {
  $("#printArea").innerHTML =
    printKind === "diploma" && state.final.complete
      ? diplomaHTML(true)
      : notesHTML();
});
say(CONTENT[0].intro);
go("home");
