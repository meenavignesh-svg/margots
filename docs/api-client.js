/**
 * Centralized API client for MARGOTS gateway.
 * Never embeds LLM secrets — those stay server-side.
 */
(function (root) {
  'use strict';

  function base() {
    var c = root.MARGOTS_CONFIG || {};
    return (c.apiBase || '').replace(/\/$/, '');
  }

  function timeoutMs() {
    return (root.MARGOTS_CONFIG && root.MARGOTS_CONFIG.requestTimeoutMs) || 60000;
  }

  function normalizeError(status, body, networkMessage) {
    if (networkMessage) {
      return {
        success: false,
        data: null,
        error: {
          code: 'NETWORK_ERROR',
          message: networkMessage,
          status: 0
        }
      };
    }
    if (body && body.error && typeof body.error === 'object') {
      return {
        success: false,
        data: null,
        error: {
          code: body.error.code || 'HTTP_' + status,
          message: body.error.message || 'Request failed',
          status: status
        }
      };
    }
    var map = {
      400: 'Bad request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not found — is the backend URL correct?',
      409: 'Conflict',
      422: 'Validation error',
      429: 'Rate limit exceeded — try again shortly',
      500: 'Server error',
      502: 'Bad gateway',
      503: 'Backend unavailable'
    };
    return {
      success: false,
      data: null,
      error: {
        code: 'HTTP_' + status,
        message: map[status] || ('HTTP ' + status),
        status: status
      }
    };
  }

  async function request(path, options) {
    options = options || {};
    var url = base() + path;
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = null;
    if (ctrl) {
      timer = setTimeout(function () {
        try {
          ctrl.abort();
        } catch (e) {}
      }, timeoutMs());
    }
    try {
      var res = await fetch(url, {
        method: options.method || 'GET',
        headers: Object.assign(
          { Accept: 'application/json' },
          options.body ? { 'Content-Type': 'application/json' } : {},
          options.headers || {}
        ),
        body: options.body ? JSON.stringify(options.body) : undefined,
        signal: ctrl ? ctrl.signal : undefined
      });
      var text = await res.text();
      var json = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch (e) {
        if (timer) clearTimeout(timer);
        return normalizeError(res.status, null, 'Malformed JSON from backend');
      }
      if (timer) clearTimeout(timer);
      if (!res.ok) {
        return normalizeError(res.status, json);
      }
      if (json && typeof json.success === 'boolean') {
        return json;
      }
      return { success: true, data: json, error: null };
    } catch (e) {
      if (timer) clearTimeout(timer);
      var msg =
        e && e.name === 'AbortError'
          ? 'Request timed out'
          : 'Cannot reach backend at ' +
            (base() || '(empty API base)') +
            '. Set API base in Settings or deploy the gateway.';
      return normalizeError(0, null, msg);
    }
  }

  var api = {
    getBase: base,
    setBase: function (url) {
      url = String(url || '').trim().replace(/\/$/, '');
      try {
        localStorage.setItem('margots_api_base', url);
      } catch (e) {}
      if (root.MARGOTS_CONFIG) root.MARGOTS_CONFIG.apiBase = url;
    },
    health: function () {
      return request('/health');
    },
    ready: function () {
      return request('/ready');
    },
    analyzeSequence: function (sequence, question, withAi) {
      return request('/v1/sequence/analyze', {
        method: 'POST',
        body: {
          sequence: sequence,
          question: question || '',
          with_ai: !!withAi
        }
      });
    },
    planPipeline: function (design, organism, dataType, constraints, withAi) {
      return request('/v1/pipeline/plan', {
        method: 'POST',
        body: {
          design: design,
          organism: organism || '',
          data_type: dataType || '',
          constraints: constraints || '',
          with_ai: withAi !== false
        }
      });
    },
    research: function (query) {
      return request('/v1/research/search', {
        method: 'POST',
        body: { query: query }
      });
    },
    query: function (query, context, withAi) {
      return request('/v1/query', {
        method: 'POST',
        body: {
          query: query,
          context: context || '',
          with_ai: !!withAi
        }
      });
    }
  };

  root.MargotsAPI = api;
})(typeof self !== 'undefined' ? self : this);
