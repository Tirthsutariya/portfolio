/* ============================================================
   TIRTH SUTARIYA — PORTFOLIO AI CHATBOT
   Runs 100% in-browser (no backend/API key required).
   Answers ONLY about Tirth, from resume + portfolio content.
   Always loyal: deflects off-topic + negative questions.

   ── UPGRADE PATH ──
   When your Spring Boot RAG backend is live, set:
        CONFIG.useBackend = true
   and point CONFIG.endpoint at it. The chatbot will then POST
   { question } and expect { answer } back — UI stays identical.
   ============================================================ */
(function () {
  const CONFIG = {
    useBackend: true,                              // calls the Spring Boot backend
    endpoint: (window.API_BASE || 'http://localhost:8090/api') + '/chat',
  };
  // If the backend is down/unreachable, the chatbot automatically falls back
  // to the built-in local knowledge base — so it never looks broken.

  /* ── KNOWLEDGE BASE (resume + portfolio) ── */
  const KB = [
    { keys: ['hi','hello','hey','hii','yo','namaste','hola','greetings','good morning','good evening','good afternoon'],
      a: "Hey there! 👋 I'm **Tirth's AI assistant**. Ask me anything about his **skills**, **experience**, **projects**, or how to **get in touch**." },

    { keys: ['about tirth','who is tirth','who is he','who are you','about you','yourself','introduce','introduction','summary','profile','background','tell me about tirth','tell me about him'],
      a: "**Tirth Sutariya** is a Backend Engineer based in Surat, India. 🚀\n\nHe builds high-throughput backend systems with **Spring Boot, Kafka & Elasticsearch**, and has real **AI/ML** experience too. Currently a Software Engineer at **Kataria Automobiles**, handling 15M+ records and 100K+ messages a day.\n\nWant to hear about his experience, projects, or skills?" },

    { keys: ['experience','work experience','job','company','career','kataria','wappnet','intern','internship','employed','worked'],
      a: "**Experience** 💼\n\n**Kataria Automobiles** — Software Engineer (Jan 2026 – Present)\n• Built the KCP subscription platform end-to-end\n• RBAC with Spring Security\n• WhatsApp Campaign Platform — **100K+ messages/day** via Meta API + Kafka\n• Elasticsearch over **15M+ records** — latency cut **60%+**\n\n**Wappnet Systems** — AI/ML Intern (Jan – Jul 2025)\n• Built AI/ML pipelines & Python microservices with vector DBs\n• Worked with LangChain, LangGraph, Groq, Hugging Face, RabbitMQ" },

    { keys: ['project','projects','quiz','rag','ask me','whatsapp','rbac','campaign','portfolio project'],
      a: "**Featured Projects** 🛠️\n\n**1. AI Quiz Generator** — LLM-powered quiz system (Java, Spring Boot, PostgreSQL, Gemini)\n**2. Ask Me — RAG App** — contextual Q&A with Groq, LangGraph & pgvector\n**3. WhatsApp Campaign Platform** — 100K+ msgs/day, Kafka-driven (enterprise)\n**4. RBAC Authorization System** — hierarchical permissions with Spring Security (enterprise)\n\nExplore them on [GitHub](https://github.com/tirthsutariya). Want details on any one?" },

    { keys: ['skill','skills','tech','stack','technology','technologies','language','languages','tools','framework','frameworks','expertise','proficient'],
      a: "**Tech Toolkit** ⚙️\n\n**Languages:** Java, Python, C++\n**Backend:** Spring Boot, Spring Security, Kafka, Elasticsearch, Redis, RabbitMQ, Liquibase\n**AI/ML:** LangChain, LangGraph, RAG, Gen AI, Hugging Face, Groq\n**Databases:** PostgreSQL, MySQL, MongoDB, Pinecone, pgvector\n**Core:** DSA, System Design, DBMS, OOP\n\nBackend is his home turf — ask away! 💪" },

    { keys: ['ai','ml','machine learning','artificial','llm','gen ai','langchain','langgraph','groq','gemini','vector','embedding','deep learning'],
      a: "**AI / ML** 🤖\n\nAt Wappnet, Tirth built real AI/ML pipelines — training & deploying models in Python microservices with vector databases, using **LangChain, LangGraph, Groq & Hugging Face**.\n\nHe's built RAG apps (semantic search with **pgvector**) and LLM-powered products like the AI Quiz Generator. Backend **+** AI is a rare, strong combo!" },

    { keys: ['backend','kafka','elasticsearch','redis','microservice','microservices','api','distributed','scale','throughput','system design','postgres','sql'],
      a: "**Backend Engineering** 🏗️\n\nThis is where Tirth shines. He's built systems handling **15M+ records** (Elasticsearch, 60%+ latency reduction) and **100K+ messages/day** (Kafka async workflows) — plus Spring Boot, Spring Security RBAC, Redis caching, and Liquibase for clean schema versioning.\n\nHigh-throughput, fault-tolerant systems are his specialty." },

    { keys: ['education','college','degree','university','study','studied','btech','b.tech','ddu','dharmsinh','graduate','academic','cgpa'],
      a: "**Education** 🎓\n\n**B.Tech in Computer Engineering**\nDharmsinh Desai University, Nadiad (2021 – May 2025)\n\nStrong foundation in Data Structures, Algorithms, DBMS, OS & OOP — with a deep focus on AI/ML and distributed systems." },

    { keys: ['competitive','codeforces','leetcode','gfg','geeksforgeeks','dsa','problem','problems','rating','contest','algorithm','solved'],
      a: "**Competitive Programming** 🏆\n\n• **CodeForces:** peak rating **1075**\n• **LeetCode:** **200+** problems solved\n• **GeeksforGeeks:** **100+** problems solved\n\nStrong DSA fundamentals — the kind of problem-solving that shows up in clean, efficient backend code." },

    { keys: ['contact','email','hire','hiring','reach','connect','linkedin','github','message','available','recruit','opportunity','get in touch'],
      a: "**Let's Connect!** 📬\n\n📧 [tirth.sutariya21@gmail.com](mailto:tirth.sutariya21@gmail.com)\n💼 [linkedin.com/in/tirth-sutariya](https://linkedin.com/in/tirth-sutariya)\n💻 [github.com/tirthsutariya](https://github.com/tirthsutariya)\n📍 Surat, Gujarat, India\n\nTirth is **open to new roles & collaborations** — reach out anytime!" },

    { keys: ['why hire','why should','why tirth','strength','strengths','stand out','good fit','hire him','recruit'],
      a: "**Why Tirth?** 🌟\n\n✅ Proven at scale — 15M+ records, 100K+ msgs/day in production\n✅ Rare backend **+** AI/ML combo\n✅ Strong CS fundamentals (300+ DSA problems, CF 1075)\n✅ Ships fault-tolerant systems (Kafka, Elasticsearch, RBAC)\n✅ Directs AI tools expertly — this very website is proof!\n\nHe doesn't just write code — he builds systems that don't go down. 💪" },

    { keys: ['location','based','where is he','where does he','where is tirth','surat','relocate','remote'],
      a: "📍 Tirth is based in **Surat, Gujarat, India**, with work experience in **Ahmedabad**. Open to new opportunities — reach out via the contact section!" },

    { keys: ['resume','cv','download'],
      a: "You can explore Tirth's full background right here — the **Experience**, **Projects**, **Skills** and **Competitive Programming** sections cover it all. For a resume copy, email him at [tirth.sutariya21@gmail.com](mailto:tirth.sutariya21@gmail.com). 📄" },

    { keys: ['weakness','weaknesses','weak','flaw','flaws','con','cons','negative','drawback','not good','bad at'],
      a: "Nice try 😄 — but I'm only here to talk about what Tirth does **well**! If anything, he's a perfectionist who cares deeply about system reliability. Want to hear about his strengths, projects, or experience?" },

    { keys: ['this website','who made this','this site','frontend','who built','who created','built with ai','made this'],
      a: "Fun fact 😄 — Tirth is a **backend developer**, so this whole frontend was built **with AI**, directed entirely by his prompts. His take: *\"Frontend, I team up with AI. Backend? That's where I'm the intelligence.\"* 🧠\n\nSolid proof he knows how to direct AI tools, right?" },

    { keys: ['fun','hobby','hobbies','joke','funny','coffee','personality','free time','interest','interests'],
      a: "😄 When he's not building backend systems, Tirth is probably grinding competitive-programming problems or debugging an API with a coffee in hand. His motto: *write good prompts, ship great systems.*" },

    { keys: ['thank','thanks','thx','thankyou','appreciate','awesome','cool','great job','well done'],
      a: "You're welcome! 😊 Anything else about Tirth — his projects, skills, or how to reach him?" },
  ];

  const FALLBACK =
    "I'm **Tirth's assistant**, so I stick to questions about **Tirth** — his skills, experience, projects, education, or contact info. 😊\n\nTry: *\"What's his experience?\"*, *\"Show me his projects\"*, or *\"How do I contact him?\"*";

  /* ── intent matching ── */
  function findAnswer(q) {
    const clean  = q.toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
    const padded = ' ' + clean + ' ';
    let best = null, bestScore = 0;
    for (const t of KB) {
      let score = 0;
      for (const k of t.keys) {
        const kk = k.toLowerCase();
        const hit = kk.includes(' ')
          ? (padded.includes(' ' + kk + ' ') || padded.includes(kk))
          : padded.includes(' ' + kk + ' ');
        if (hit) score += kk.length > 4 ? 2 : 1;
      }
      if (score > bestScore) { bestScore = score; best = t; }
    }
    return bestScore > 0 ? best.a : FALLBACK;
  }

  /* ── backend-or-local answer ── */
  async function getAnswer(q) {
    if (CONFIG.useBackend) {
      try {
        const r = await fetch(CONFIG.endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: q }),
        });
        const d = await r.json();
        return d.answer || FALLBACK;
      } catch (e) {
        return findAnswer(q);   // graceful fallback if backend is down
      }
    }
    return findAnswer(q);
  }

  /* ── format: escape → links → bold → newlines ── */
  function fmt(t) {
    return t
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');
  }

  /* ── wiring ── */
  const fab   = document.getElementById('cbotFab');
  const panel = document.getElementById('cbotPanel');
  const msgs  = document.getElementById('cbotBody');
  const form  = document.getElementById('cbotForm');
  const input = document.getElementById('cbotText');
  const minBtn = document.getElementById('cbotMin');
  const sugsWrap = document.getElementById('cbotSugs');
  if (!fab || !panel) return;

  const AV = '<div class="cbot-msg-av"><img src="assets/profile.png" alt="" onerror="this.parentElement.textContent=\'TS\'"></div>';

  function addMsg(text, who) {
    const wrap = document.createElement('div');
    wrap.className = 'cbot-msg ' + who;
    if (who === 'bot') {
      wrap.innerHTML = AV + '<div class="cbot-bubble">' + fmt(text) + '</div>';
    } else {
      const b = document.createElement('div');
      b.className = 'cbot-bubble';
      b.textContent = text;            // user text never rendered as HTML (XSS-safe)
      wrap.appendChild(b);
    }
    msgs.appendChild(wrap);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function showTyping() {
    const t = document.createElement('div');
    t.className = 'cbot-msg bot';
    t.id = 'cbotTyping';
    t.innerHTML = AV + '<div class="cbot-bubble cbot-typing"><span></span><span></span><span></span></div>';
    msgs.appendChild(t);
    msgs.scrollTop = msgs.scrollHeight;
  }
  function hideTyping() {
    const t = document.getElementById('cbotTyping');
    if (t) t.remove();
  }

  /* Streams the reply token-by-token into a fresh bot bubble.
     Returns true if it handled the reply, false to let the caller fall back. */
  async function streamAnswer(q) {
    let resp;
    try {
      resp = await fetch(CONFIG.endpoint + '/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q }),
      });
    } catch (e) {
      return false;                       // backend unreachable → fall back
    }
    if (!resp.ok || !resp.body) return false;

    hideTyping();
    const wrap = document.createElement('div');
    wrap.className = 'cbot-msg bot';
    wrap.innerHTML = AV + '<div class="cbot-bubble"></div>';
    msgs.appendChild(wrap);
    const bubble = wrap.querySelector('.cbot-bubble');

    const reader = resp.body.getReader();
    const dec = new TextDecoder();
    let full = '';
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        full += dec.decode(value, { stream: true });
        bubble.innerHTML = fmt(full);
        msgs.scrollTop = msgs.scrollHeight;
      }
    } catch (e) {
      if (!full) { bubble.textContent = '(connection interrupted)'; }
    }
    bubble.innerHTML = fmt(full || FALLBACK);
    msgs.scrollTop = msgs.scrollHeight;
    return true;
  }

  let busy = false;
  async function handle(q) {
    q = (q || '').trim();
    if (!q || busy) return;
    busy = true;
    addMsg(q, 'user');
    input.value = '';
    showTyping();

    // Prefer live streaming from the backend; fall back to local/non-stream.
    if (CONFIG.useBackend) {
      const ok = await streamAnswer(q);
      if (ok) { busy = false; return; }
    }

    const ans = await getAnswer(q);
    await new Promise(r => setTimeout(r, 400));
    hideTyping();
    addMsg(ans, 'bot');
    busy = false;
  }

  let greeted = false;
  function openChat() {
    document.body.classList.add('cbot-open');
    panel.setAttribute('aria-hidden', 'false');
    if (!greeted) {
      addMsg("Hi! 👋 I'm **Tirth's AI assistant**. Ask me anything about his skills, experience, or projects — or tap a suggestion below.", 'bot');
      greeted = true;
    }
    setTimeout(() => input.focus(), 300);
  }
  function closeChat() {
    document.body.classList.remove('cbot-open');
    panel.setAttribute('aria-hidden', 'true');
  }

  fab.addEventListener('click', () => {
    document.body.classList.contains('cbot-open') ? closeChat() : openChat();
  });
  minBtn.addEventListener('click', closeChat);

  form.addEventListener('submit', e => { e.preventDefault(); handle(input.value); });

  sugsWrap.querySelectorAll('.cbot-sug').forEach(btn => {
    btn.addEventListener('click', () => handle(btn.textContent));
  });

  // Esc closes the chat
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('cbot-open')) closeChat();
  });
})();
