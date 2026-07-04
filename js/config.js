/* ============================================================
   API CONFIG — one place to point the frontend at the backend.
   Auto-switches: localhost during dev, your live URL in production.
   ============================================================ */
(function () {
  const isLocal = ['localhost', '127.0.0.1', ''].includes(location.hostname);
  window.API_BASE = isLocal
    ? 'http://localhost:8090/api'
    : 'https://portfolio-c0nl.onrender.com/api';   // ← replace with your Render URL after deploying the backend
})();
