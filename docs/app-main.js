/**
 * MARGOTS production frontend controller.
 * Wires UI → MargotsAPI → gateway → core.
 */
(function () {
  'use strict';

  var $ = function (id) {
    return document.getElementById(id);
  };
  var chat = $('chat');
  var input = $('input');
  var statusEl = $('status');
  var drawer = $('drawer');
  var panel = $('panel');
  var fileInput = $('hiddenFile');
  var mode = 'auto'; // auto | sequence | pipeline | research

  function setStatus(t, kind) {
    if (!statusEl) return;
    statusEl.textContent = t;
    statusEl.dataset.kind = kind || 'ok';
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function msg(text, isUser, meta) {
    var welcome = $('welcome');
    if (welcome) welcome.remove();
    var d = document.createElement('div');
    d.className = 'msg ' + (isUser ? 'user' : 'assistant');
    var who = isUser ? '' : '<span class="who">' + esc(meta || 'MARGOTS') + '</span>';
    d.innerHTML = '<div class="bubble">' + who + esc(text) + '</div>';
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
  }

  function msgHtml(safeInner, meta) {
    var welcome = $('welcome');
    if (welcome) welcome.remove();
    var d = document.createElement('div');
    d.className = 'msg assistant';
    d.innerHTML =
      '<div class="bubble"><span class="who">' +
      esc(meta || 'MARGOTS') +
      '</span>' +
      safeInner +
      '</div>';
    chat.appendChild(d);
    chat.scrollTop = chat.scrollHeight;
  }

  function openDrawer(title, html) {
    panel.innerHTML =
      '<h2>' +
      esc(title) +
      '</h2>' +
      html +
      '<p style="margin-top:16px"><button type="button" class="secondary" id="closeDrawerBtn">Close</button></p>';
    drawer.classList.add('open');
    var btn = $('closeDrawerBtn');
    if (btn) btn.onclick = function () {
      drawer.classList.remove('open');
    };
  }

  drawer.addEventListener('click', function (e) {
    if (e.target === drawer) drawer.classList.remove('open');
  });

  function findSequence(text) {
    var m = String(text).match(/\b[ACGTUN]{16,}\b/i);
    return m ? m[0] : null;
  }

  function looksLikePipeline(q) {
    return /pipeline|rna-seq|rnaseq|chip-seq|variant call|single-cell|scrna|workflow|nextflow|snakemake|fastq/i.test(
      q
    );
  }

  function looksLikeResearch(q) {
    return /paper|pubmed|literature|study|journal|doi|citation|review|research/i.test(q);
  }

  async function checkHealth() {
    if (!window.MargotsAPI || !MargotsAPI.getBase()) {
      setStatus('LOCAL / NO API', 'warn');
      return false;
    }
    setStatus('CHECKING…', 'warn');
    var r = await MargotsAPI.health();
    if (r.success) {
      setStatus('BACKEND ONLINE', 'ok');
      return true;
    }
    setStatus('BACKEND OFFLINE', 'err');
    return false;
  }

  function formatFacts(facts) {
    return '<pre class="facts">' + esc(JSON.stringify(facts, null, 2)) + '</pre>';
  }

  function formatOutputs(outputs) {
    if (!outputs || !Object.keys(outputs).length) return '';
    var parts = [];
    Object.keys(outputs).forEach(function (k) {
      parts.push(
        '<div class="agent-block"><strong>' +
          esc(k.toUpperCase()) +
          '</strong><pre>' +
          esc(outputs[k]) +
          '</pre></div>'
      );
    });
    return parts.join('');
  }

  async function runSequence(seq, question, withAi) {
    setStatus('ANALYZING…', 'warn');
    // Prefer server when configured; else local bio-core
    if (MargotsAPI.getBase()) {
      var r = await MargotsAPI.analyzeSequence(seq, question, withAi);
      if (!r.success) {
        msg('Backend error: ' + (r.error && r.error.message), false, 'ERROR');
        // local fallback
        if (window.MargotsBio && MargotsBio.analyze) {
          msgHtml(formatFacts(MargotsBio.analyze(seq)), 'DETERMINISTIC (LOCAL FALLBACK)');
        }
        setStatus('BACKEND OFFLINE', 'err');
        return;
      }
      var d = r.data || {};
      msgHtml(formatFacts(d.facts), 'DETERMINISTIC FACTS');
      if (d.outputs && Object.keys(d.outputs).length) {
        msgHtml(formatOutputs(d.outputs), 'AI INTERPRETATION');
      } else if (withAi) {
        msg('No AI agents responded (keys may be unset on server). Deterministic facts are above.', false, 'SYSTEM');
      }
      setStatus('BACKEND ONLINE', 'ok');
      return;
    }
    if (window.MargotsBio && MargotsBio.analyze) {
      msgHtml(formatFacts(MargotsBio.analyze(seq)), 'DETERMINISTIC (LOCAL)');
      msg('Configure API base in Settings to enable server AI agents.', false, 'SYSTEM');
    } else {
      msg('No local bio engine and no API base configured.', false, 'ERROR');
    }
    setStatus('LOCAL / NO API', 'warn');
  }

  async function runPipeline(design) {
    setStatus('PLANNING…', 'warn');
    if (!MargotsAPI.getBase()) {
      msg('Set API base URL in Settings to generate server-side pipeline plans.', false, 'ERROR');
      setStatus('LOCAL / NO API', 'warn');
      return;
    }
    var r = await MargotsAPI.planPipeline(design, '', '', '', true);
    if (!r.success) {
      msg('Pipeline error: ' + (r.error && r.error.message), false, 'ERROR');
      setStatus('BACKEND OFFLINE', 'err');
      return;
    }
    var d = r.data || {};
    msgHtml(formatFacts(d.facts), 'PIPELINE SKELETON');
    if (d.outputs && Object.keys(d.outputs).length) {
      msgHtml(formatOutputs(d.outputs), 'PIPELINE AGENTS');
    }
    setStatus('BACKEND ONLINE', 'ok');
  }

  async function runResearch(q) {
    setStatus('SEARCHING…', 'warn');
    if (MargotsAPI.getBase()) {
      var r = await MargotsAPI.research(q);
      if (!r.success) {
        msg('Research error: ' + (r.error && r.error.message), false, 'ERROR');
        // try browser-side literature
        if (window.MargotsLiterature) {
          try {
            var lit = await MargotsLiterature.searchAll(q);
            if (lit.papers && lit.papers.length) {
              msg(MargotsLiterature.formatContext(lit), false, 'PUBLIC LITERATURE (BROWSER)');
            }
          } catch (e) {}
        }
        setStatus('BACKEND OFFLINE', 'err');
        return;
      }
      var evidence = (r.data && r.data.evidence) || [];
      if (!evidence.length) {
        msg('No literature hits returned.', false, 'RESEARCH');
      } else {
        var lines = evidence.slice(0, 10).map(function (e, i) {
          return (
            i +
            1 +
            '. [' +
            (e.source || '') +
            '] ' +
            (e.title || '') +
            '\n   ' +
            (e.url || '')
          );
        });
        msg(lines.join('\n\n'), false, 'RESEARCH');
      }
      setStatus('BACKEND ONLINE', 'ok');
      return;
    }
    if (window.MargotsLiterature) {
      try {
        var lit2 = await MargotsLiterature.searchAll(q);
        msg(MargotsLiterature.formatContext(lit2), false, 'PUBLIC LITERATURE (BROWSER)');
      } catch (e) {
        msg('Literature lookup failed: ' + e.message, false, 'ERROR');
      }
    } else {
      msg('No API base and no local literature module.', false, 'ERROR');
    }
    setStatus('LOCAL / NO API', 'warn');
  }

  async function ask(q) {
    q = String(q || '').trim();
    if (!q) return;
    msg(q, true);
    input.value = '';
    var seq = findSequence(q);

    if (mode === 'sequence' || (mode === 'auto' && seq)) {
      await runSequence(seq || q, q, true);
      return;
    }
    if (mode === 'pipeline' || (mode === 'auto' && looksLikePipeline(q))) {
      await runPipeline(q);
      return;
    }
    if (mode === 'research' || (mode === 'auto' && looksLikeResearch(q))) {
      await runResearch(q);
      return;
    }
    // default: try unified query on server, else research
    if (MargotsAPI.getBase()) {
      setStatus('THINKING…', 'warn');
      var r = await MargotsAPI.query(q, '', true);
      if (r.success) {
        var d = r.data || {};
        if (d.research && d.research.evidence && d.research.evidence.length) {
          var lines = d.research.evidence.slice(0, 6).map(function (e, i) {
            return i + 1 + '. ' + (e.title || '') + '\n   ' + (e.url || '');
          });
          msg(lines.join('\n\n'), false, 'RESEARCH');
        }
        if (d.outputs && Object.keys(d.outputs).length) {
          msgHtml(formatOutputs(d.outputs), 'AI');
        } else {
          msg('Query completed. Configure server LLM keys for multi-agent answers.', false, 'SYSTEM');
        }
        setStatus('BACKEND ONLINE', 'ok');
        return;
      }
      msg('Backend error: ' + (r.error && r.error.message), false, 'ERROR');
      setStatus('BACKEND OFFLINE', 'err');
      return;
    }
    msg('Describe a DNA/RNA sequence, a pipeline experiment, or a research question. Or set API base in Settings.', false, 'SYSTEM');
  }

  // --- UI bindings ---
  $('form').onsubmit = function (e) {
    e.preventDefault();
    ask(input.value);
  };
  input.onkeydown = function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      $('form').requestSubmit();
    }
  };
  $('newChat').onclick = function () {
    location.reload();
  };

  $('aboutBtn').onclick = function () {
    openDrawer(
      'About Margots',
      '<p><b>AI-native genomic workflow automation.</b></p>' +
        '<p>Deterministic sequence analysis runs first. AI interpretation is optional and server-side when configured.</p>' +
        '<p>Not a clinical diagnostic device.</p>'
    );
  };

  $('historyBtn').onclick = function () {
    openDrawer(
      'Workflow history',
      '<p>Conversation history for this session is shown in the chat panel. Persistent server-side history is not enabled in this build.</p>'
    );
  };

  $('settingsBtn').onclick = function () {
    var current = (window.MargotsAPI && MargotsAPI.getBase()) || '';
    openDrawer(
      'Providers & settings',
      '<p>Backend API base URL (no trailing slash). Example: <code>http://127.0.0.1:8080</code> or your Render/Railway URL.</p>' +
        '<p><input id="apiBaseInput" type="url" style="width:100%;padding:10px;border:1px solid #e5e7eb;border-radius:8px" value="' +
        esc(current) +
        '" placeholder="https://your-gateway.example.com"></p>' +
        '<p><button type="button" class="primary" id="saveApiBase">Save & check health</button></p>' +
        '<p style="color:#667085;font-size:13px">LLM API keys belong on the <b>server</b> environment only. They are never stored in this browser for the production gateway path.</p>'
    );
    $('saveApiBase').onclick = async function () {
      var v = $('apiBaseInput').value.trim();
      MargotsAPI.setBase(v);
      drawer.classList.remove('open');
      msg('API base set to: ' + (v || '(empty)'), false, 'SYSTEM');
      await checkHealth();
    };
  };

  $('attach').onclick = function () {
    fileInput.click();
  };
  fileInput.onchange = function () {
    var files = Array.prototype.slice.call(fileInput.files || []);
    files.forEach(function (f) {
      if (f.size > 8 * 1024 * 1024) {
        msg(f.name + ': exceeds 8 MB browser limit.', false, 'SYSTEM');
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        var text = String(reader.result || '');
        msg('Uploaded: ' + f.name, true);
        if (window.MargotsBio && MargotsBio.parseFasta && />/.test(text)) {
          var recs = MargotsBio.parseFasta(text).slice(0, 3);
          recs.forEach(function (rec) {
            ask('Analyze this DNA sequence: ' + rec.sequence.slice(0, 5000));
          });
        } else {
          var seq = findSequence(text);
          if (seq) ask('Analyze this DNA sequence: ' + seq.slice(0, 5000));
          else msg('No sequence detected in file.', false, 'SYSTEM');
        }
      };
      reader.readAsText(f);
    });
    fileInput.value = '';
  };

  document.querySelectorAll('.chip').forEach(function (b) {
    b.onclick = function () {
      input.value = b.textContent;
      input.focus();
    };
  });

  // Mode chips in hero if present
  var modeBar = $('modeBar');
  if (modeBar) {
    modeBar.querySelectorAll('[data-mode]').forEach(function (btn) {
      btn.onclick = function () {
        mode = btn.getAttribute('data-mode') || 'auto';
        modeBar.querySelectorAll('[data-mode]').forEach(function (x) {
          x.classList.toggle('active', x === btn);
        });
        setStatus('MODE: ' + mode.toUpperCase(), 'ok');
      };
    });
  }

  // Boot
  checkHealth();
})();
