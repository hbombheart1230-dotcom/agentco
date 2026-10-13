// Test-only loopback mock Responses / chat-completions servers: record destination, auth presence (boolean), model and tool inventory. Never a provider proxy.
import { createServer } from 'node:http';

function listen(handler) {
  return new Promise(resolve => {
    const requests = [];
    const server = createServer((req, res) => {
      const chunks = [];
      req.on('data', c => chunks.push(c));
      req.on('end', () => {
        let body = {};
        try { body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); } catch { /* non-JSON probe */ }
        const tools = Array.isArray(body.tools) ? body.tools.map(t => t.name || t.function?.name || t.type) : [];
        requests.push({ method: req.method, path: req.url, authPresent: Boolean(req.headers.authorization), model: body.model ?? null, tools });
        handler(req, res, body, requests);
      });
    });
    server.listen(0, '127.0.0.1', () => resolve({ server, requests, port: server.address().port, close: () => new Promise(r => server.close(r)) }));
  });
}
const sse = (res, ev, data) => res.write(`event: ${ev}\ndata: ${JSON.stringify(data)}\n\n`);

export function mockResponses({ text = 'ADD42=42', fail = 0, calls = [] } = {}) {
  return listen((req, res, body, requests) => {
    if (fail) { res.writeHead(fail, { 'content-type': 'application/json' }); res.end('{"error":{"message":"mock failure"}}'); return; }
    res.writeHead(200, { 'content-type': 'text/event-stream' });
    const base = { id: 'r', object: 'response', model: body.model };
    sse(res, 'response.created', { type: 'response.created', response: { ...base, status: 'in_progress', output: [] } });
    const first = requests.filter(r => r.method === 'POST').length === 1;
    if (calls.length && first) {
      const outs = calls.map((c, k) => ({ id: `fc_${k}`, type: 'function_call', call_id: `call_${k}`, name: c.name, arguments: JSON.stringify(c.args), status: 'completed' }));
      outs.forEach((it, k) => { sse(res, 'response.output_item.added', { type: 'response.output_item.added', output_index: k, item: it }); sse(res, 'response.output_item.done', { type: 'response.output_item.done', output_index: k, item: it }); });
      sse(res, 'response.completed', { type: 'response.completed', response: { ...base, status: 'completed', output: outs, usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 } } });
      res.end(); return;
    }
    const item = { id: 'm', type: 'message', role: 'assistant', status: 'in_progress', content: [] };
    sse(res, 'response.output_item.added', { type: 'response.output_item.added', output_index: 0, item });
    sse(res, 'response.content_part.added', { type: 'response.content_part.added', item_id: 'm', output_index: 0, content_index: 0, part: { type: 'output_text', text: '' } });
    sse(res, 'response.output_text.delta', { type: 'response.output_text.delta', item_id: 'm', output_index: 0, content_index: 0, delta: text });
    const done = { id: 'm', type: 'message', role: 'assistant', status: 'completed', content: [{ type: 'output_text', text }] };
    sse(res, 'response.output_item.done', { type: 'response.output_item.done', output_index: 0, item: done });
    sse(res, 'response.completed', { type: 'response.completed', response: { ...base, status: 'completed', output: [done], usage: { input_tokens: 1, output_tokens: 1, total_tokens: 2 } } });
    res.end();
  });
}

export function mockChat({ text = 'ADD42=42', fail = 0 } = {}) {
  return listen((req, res, body) => {
    if (req.method === 'GET') { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify({ data: [{ id: 'nvidia/nemotron-3-super-120b-a12b:free' }] })); return; }
    if (!/chat\/completions$/.test(req.url)) { res.writeHead(404); res.end(); return; }
    if (fail) { res.writeHead(fail, { 'content-type': 'application/json' }); res.end('{"error":{"message":"mock failure"}}'); return; }
    if (body.stream) {
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      const chunk = (delta, fin = null) => res.write(`data: ${JSON.stringify({ id: 'c', object: 'chat.completion.chunk', created: 1, model: body.model, choices: [{ index: 0, delta, finish_reason: fin }] })}\n\n`);
      chunk({ role: 'assistant', content: '' }); chunk({ content: text }); chunk({}, 'stop'); res.end('data: [DONE]\n\n'); return;
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ id: 'c', object: 'chat.completion', created: 1, model: body.model, choices: [{ index: 0, message: { role: 'assistant', content: text }, finish_reason: 'stop' }], usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 } }));
  });
}
