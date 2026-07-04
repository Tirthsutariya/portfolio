/* ============================================================
   TIRTH SUTARIYA — LIVE STATS + CONTACT FORM
   Talks to the Spring Boot backend. Degrades gracefully offline.
   ============================================================ */
(function () {
  const API = window.API_BASE || 'http://localhost:8090/api';

  /* ── LIVE VISITOR STATS ── */
  (function () {
    const elVisits = document.getElementById('stVisits');
    const elUnique = document.getElementById('stUnique');
    const elOnline = document.getElementById('stOnline');
    const elStatus = document.getElementById('stStatus');
    const elDot    = document.getElementById('stDot');
    const note     = document.getElementById('liveNote');
    if (!elVisits) return;

    function fmtUptime(s) {
      if (s < 60)   return s + 's';
      if (s < 3600) return Math.floor(s / 60) + 'm';
      return Math.floor(s / 3600) + 'h ' + Math.floor((s % 3600) / 60) + 'm';
    }

    async function refresh(recordVisit) {
      try {
        const t0 = performance.now();
        const s = await fetch(API + (recordVisit ? '/visits' : '/stats'),
                              recordVisit ? { method: 'POST' } : {}).then(r => r.json());
        const latency = Math.round(performance.now() - t0);
        const st = await fetch(API + '/status').then(r => r.json());

        elVisits.textContent = s.total;
        elUnique.textContent = s.unique;
        elOnline.textContent = s.online;
        elStatus.textContent = 'UP';
        if (elDot) elDot.style.background = '';
        note.textContent = `API latency ${latency}ms · uptime ${fmtUptime(st.uptimeSeconds)} · Backend online`;
      } catch (e) {
        elVisits.textContent = '—';
        elUnique.textContent = '—';
        elOnline.textContent = '—';
        elStatus.textContent = 'OFFLINE';
        if (elDot) elDot.style.background = 'var(--txt3)';
        note.textContent = 'Backend offline · waking up (free tier sleeps after 15 min idle)';
      }
    }

    refresh(true);                       // record this visit on load
    setInterval(() => refresh(false), 20000);   // refresh "online now" every 20s
  })();

  /* ── CONTACT FORM → backend + WhatsApp prefill ── */
  (function () {
    const form = document.getElementById('contactForm');
    if (!form) return;
    const name = document.getElementById('cfName');
    const email = document.getElementById('cfEmail');
    const msg = document.getElementById('cfMsg');
    const status = document.getElementById('cfStatus');
    const wa = document.getElementById('cfWhatsapp');
    const sendBtn = form.querySelector('.cf-send');
    const NUM = '919484560622';

    function updateWa() {
      const text = `Hi Tirth! I'm ${name.value || '(name)'}.\n\n${msg.value || ''}`;
      wa.href = `https://wa.me/${NUM}?text=` + encodeURIComponent(text);
    }
    name.addEventListener('input', updateWa);
    msg.addEventListener('input', updateWa);
    updateWa();

    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!name.value.trim() || !msg.value.trim()) {
        status.classList.remove('ok');
        status.textContent = 'Please add your name and a message.';
        return;
      }

      // 1) WhatsApp — open immediately (this counts as a user gesture, avoids popup blocking)
      const waText = `Hi Tirth! I'm ${name.value}.\n\n${msg.value}`;
      window.open(`https://wa.me/${NUM}?text=` + encodeURIComponent(waText), '_blank');

      // 2) Email — via the backend (sent, not stored)
      sendBtn.disabled = true;
      status.classList.remove('ok');
      status.textContent = 'Opening WhatsApp & emailing…';
      try {
        const r = await fetch(API + '/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.value, email: email.value, message: msg.value }),
        }).then(x => x.json());
        status.classList.add('ok');
        status.textContent = r.emailed
          ? '✅ Sent to WhatsApp + emailed to Tirth!'
          : '✅ Opened WhatsApp! (email not configured yet)';
        form.reset();
        updateWa();
      } catch (err) {
        status.classList.add('ok');
        status.textContent = '✅ Opened WhatsApp! (email backend offline)';
      } finally {
        sendBtn.disabled = false;
      }
    });
  })();
})();
