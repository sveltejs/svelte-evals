#!/usr/bin/env node

/**
 * JSONL Transcript Visualizer
 *
 * Generates an HTML visualization from a JSONL transcript file.
 * Usage: node visualize-transcript.js <input.jsonl> [output.html]
 */

import * as fs from 'fs';
import * as path from 'path';
import { exec } from 'child_process';

interface TranscriptEvent {
	type: string;
	timestamp: number;
	part?: {
		id?: string;
		messageID?: string;
		tool?: string;
		text?: string;
		state?: {
			input?: Record<string, unknown>;
			output?: unknown;
			status?: string;
		};
		cost?: number;
		tokens?: {
			input?: number;
			output?: number;
		};
		reason?: string;
	};
}

interface Step {
	id: string;
	timestamp: number;
	message_id: string | undefined;
	events: TranscriptEvent[];
}

function format_timestamp(ts: number) {
	const date = new Date(ts);
	return date.toLocaleTimeString();
}

function escape_html(str: string) {
	if (!str) return '';
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

function sanitize_json(str: string) {
	// Remove control characters (0x00-0x1F except tab, newline, carriage return)
	return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
}

function parse_jsonl(file_path: string) {
	const content = fs.readFileSync(file_path, 'utf-8');
	const lines = content.trim().split('\n');
	const events: TranscriptEvent[] = [];

	for (const line of lines) {
		let json_str = line;

		// Check for line number prefix format (e.g., "00004| {"type":...}")
		const match = line.match(/^(\d+)\|\s*(.+)$/);
		if (match) {
			json_str = match[2];
		}

		// Sanitize the JSON string to remove control characters
		json_str = sanitize_json(json_str);

		// Try to parse the JSON
		try {
			const event = JSON.parse(json_str);
			events.push(event);
		} catch (e) {
			console.warn('Failed to parse line:', line.substring(0, 100));
		}
	}

	return events;
}

function group_by_step(events: TranscriptEvent[]) {
	const steps: Step[] = [];
	let current_step: Step | null = null;

	for (const event of events) {
		if (event.type === 'step_start') {
			current_step = {
				id: event.part?.id || `step_${steps.length}`,
				timestamp: event.timestamp,
				message_id: event.part?.messageID,
				events: [],
			};
			steps.push(current_step);
		}

		if (current_step) {
			current_step.events.push(event);
		}

		if (event.type === 'step_finish') {
			current_step = null;
		}
	}

	return steps;
}

function render_tool_input(input: Record<string, unknown>, tool_name: string) {
	if (!input || typeof input !== 'object') return '';

	let html = '<div class="tool-input">';

	// Handle different tool types
	if (tool_name === 'task' && input.description) {
		html += `<div class="tool-input-line"><strong>Task:</strong> ${escape_html(String(input.description))}</div>`;
		if (input.subagent_type) {
			html += `<div class="tool-input-line"><strong>Agent:</strong> ${escape_html(String(input.subagent_type))}</div>`;
		}
		if (input.prompt) {
			const prompt = String(input.prompt);
			html += `<div class="tool-input-line"><strong>Prompt:</strong></div>
				<pre class="code-block">${escape_html(prompt.substring(0, 800))}${prompt.length > 800 ? '...' : ''}</pre>`;
		}
	} else if (tool_name === 'todowrite' && input.todos) {
		html += `<div class="tool-input-line"><strong>Todos:</strong></div>
			<pre class="code-block">${escape_html(JSON.stringify(input.todos, null, 2))}</pre>`;
	} else {
		// Generic input handling
		for (const [key, value] of Object.entries(input)) {
			if (value === undefined || value === null) continue;

			if (key === 'command') {
				html += `<div class="tool-input-line"><strong>Command:</strong> <code>${escape_html(String(value))}</code></div>`;
			} else if (key === 'filePath') {
				html += `<div class="tool-input-line"><strong>File:</strong> ${escape_html(String(value))}</div>`;
			} else if (key === 'pattern') {
				html += `<div class="tool-input-line"><strong>Pattern:</strong> <code>${escape_html(String(value))}</code></div>`;
			} else if (key === 'content' && typeof value === 'string') {
				html += `<div class="tool-input-line"><strong>Content:</strong></div>
					<pre class="code-block">${escape_html(value.substring(0, 800))}${value.length > 800 ? '...' : ''}</pre>`;
			} else if (key === 'oldString' && typeof value === 'string') {
				html += `<div class="tool-input-line"><strong>Old:</strong></div>
					<pre class="code-block diff-old">${escape_html(value.substring(0, 500))}${value.length > 500 ? '...' : ''}</pre>`;
			} else if (key === 'newString' && typeof value === 'string') {
				html += `<div class="tool-input-line"><strong>New:</strong></div>
					<pre class="code-block diff-new">${escape_html(value.substring(0, 500))}${value.length > 500 ? '...' : ''}</pre>`;
			} else if (key === 'section' && Array.isArray(value)) {
				html += `<div class="tool-input-line"><strong>Sections:</strong> ${escape_html(value.join(', '))}</div>`;
			} else if (key === 'description') {
				html += `<div class="tool-input-line"><strong>Description:</strong> ${escape_html(String(value))}</div>`;
			} else if (typeof value === 'object') {
				html += `<div class="tool-input-line"><strong>${escape_html(key)}:</strong></div>
					<pre class="code-block">${escape_html(JSON.stringify(value, null, 2).substring(0, 500))}</pre>`;
			} else {
				html += `<div class="tool-input-line"><strong>${escape_html(key)}:</strong> ${escape_html(String(value))}</div>`;
			}
		}
	}

	html += '</div>';
	return html;
}

function render_tool_output(output: unknown) {
	if (!output) return '';

	let output_str;
	if (typeof output === 'string') {
		output_str = output;
	} else if (Array.isArray(output)) {
		output_str = JSON.stringify(output, null, 2);
	} else if (typeof output === 'object') {
		output_str = JSON.stringify(output, null, 2);
	} else {
		output_str = String(output);
	}

	return `<pre class="code-block output">${escape_html(output_str.substring(0, 1000))}${output_str.length > 1000 ? '\n... (truncated)' : ''}</pre>`;
}

function get_tool_icon(tool_name: string) {
	const icons: Record<string, string> = {
		task: '\u25B6',
		todowrite: '\u2611',
		edit: '\u270E',
		write: '\u2710',
		read: '\u25CE',
		glob: '\u2735',
		bash: '\u276F',
		grep: '\u2315',
		skill: '\u2726',
		webfetch: '\u21C5',
		question: '\u003F',
		plan_enter: '\u2690',
		google_search: '\u2315',
	};
	return icons[tool_name] || '\u25A0';
}

function render_tool(tool_event: TranscriptEvent) {
	const part = tool_event.part || {};
	const state = part.state || {};
	const tool = part.tool || 'unknown';
	const input = (state.input || {}) as Record<string, unknown>;
	const output = state.output;

	const status = state.status || 'pending';
	const status_class =
		status === 'completed'
			? 'success'
			: status === 'error'
				? 'error'
				: 'pending';
	const status_label =
		status === 'completed' ? 'OK' : status === 'error' ? 'ERR' : 'RUN';

	let title = tool;
	if (input.filePath) {
		title += `: ${path.basename(String(input.filePath))}`;
	} else if (input.command) {
		const cmd = String(input.command);
		title += `: ${cmd.substring(0, 60)}${cmd.length > 60 ? '...' : ''}`;
	} else if (input.description) {
		const desc = String(input.description);
		title += `: ${desc.substring(0, 60)}${desc.length > 60 ? '...' : ''}`;
	}

	const icon = get_tool_icon(tool);
	const input_html = render_tool_input(input, tool);
	const output_html = output !== undefined ? render_tool_output(output) : '';

	return `
		<div class="tool-call ${tool}">
			<div class="tool-header">
				<span class="tool-icon">${icon}</span>
				<span class="tool-name">${escape_html(title)}</span>
				<span class="tool-status ${status_class}">${status_label}</span>
			</div>
			<details class="tool-details">
				<summary class="tool-details-toggle">Expand details</summary>
				<div class="tool-details-inner">
					${input_html}
					${output_html ? `<div class="tool-output-section"><span class="output-label">OUTPUT</span>${output_html}</div>` : ''}
				</div>
			</details>
		</div>
	`;
}

function render_step(step: Step, index: number) {
	const step_events = step.events;
	const start_event = step_events.find((e) => e.type === 'step_start');
	const finish_event = step_events.find((e) => e.type === 'step_finish');

	let content_html = '';
	let tool_count = 0;
	let text_count = 0;

	for (const event of step_events) {
		if (event.type === 'text') {
			content_html += `<div class="text-message"><span class="text-prefix">\u25B8</span>${escape_html(event.part?.text || '')}</div>`;
			text_count++;
		} else if (event.type === 'tool_use') {
			content_html += render_tool(event);
			tool_count++;
		}
	}

	const duration =
		start_event && finish_event
			? ((finish_event.timestamp - start_event.timestamp) / 1000).toFixed(
					1,
				)
			: null;

	let stats_items: string[] = [];
	if (finish_event?.part) {
		const part = finish_event.part;
		if (part.cost) {
			stats_items.push(
				`<span class="stat stat-cost"><span class="stat-icon">\u25C8</span> $${part.cost.toFixed(4)}</span>`,
			);
		}
		if (part.tokens) {
			stats_items.push(
				`<span class="stat stat-tokens"><span class="stat-icon">\u2191</span>${part.tokens.input || 0} <span class="stat-icon">\u2193</span>${part.tokens.output || 0}</span>`,
			);
		}
		if (part.reason) {
			stats_items.push(
				`<span class="stat stat-reason stat-reason-${part.reason}">${part.reason}</span>`,
			);
		}
	}
	if (duration) {
		stats_items.push(
			`<span class="stat stat-duration">${duration}s</span>`,
		);
	}

	const step_num = String(index + 1).padStart(2, '0');

	return `
		<div class="step" id="step-${index}" style="--step-index: ${index}">
			<div class="step-marker">
				<div class="step-marker-dot"></div>
				<div class="step-marker-line"></div>
			</div>
			<div class="step-body">
				<div class="step-header">
					<div class="step-header-left">
						<span class="step-number">${step_num}</span>
						<span class="step-time">${format_timestamp(step.timestamp)}</span>
						<span class="step-badge step-badge-tools">${tool_count} tool${tool_count !== 1 ? 's' : ''}</span>
						${text_count > 0 ? `<span class="step-badge step-badge-text">${text_count} msg${text_count !== 1 ? 's' : ''}</span>` : ''}
					</div>
					<div class="step-header-right">
						${stats_items.join('')}
					</div>
				</div>
				<div class="step-content">
					${content_html}
				</div>
			</div>
		</div>
	`;
}

function generate_html(steps: Step[]) {
	const total_tools = steps.reduce(
		(acc, s) => acc + s.events.filter((e) => e.type === 'tool_use').length,
		0,
	);
	const total_text = steps.reduce(
		(acc, s) => acc + s.events.filter((e) => e.type === 'text').length,
		0,
	);
	const total_cost = steps.reduce((acc, s) => {
		const finish = s.events.find((e) => e.type === 'step_finish');
		return acc + (finish?.part?.cost || 0);
	}, 0);
	const total_input_tokens = steps.reduce((acc, s) => {
		const finish = s.events.find((e) => e.type === 'step_finish');
		return acc + (finish?.part?.tokens?.input || 0);
	}, 0);
	const total_output_tokens = steps.reduce((acc, s) => {
		const finish = s.events.find((e) => e.type === 'step_finish');
		return acc + (finish?.part?.tokens?.output || 0);
	}, 0);

	// Compute tool type breakdown
	const tool_types: Record<string, number> = {};
	for (const step of steps) {
		for (const event of step.events) {
			if (event.type === 'tool_use') {
				const name = event.part?.tool || 'unknown';
				tool_types[name] = (tool_types[name] || 0) + 1;
			}
		}
	}
	const tool_breakdown_html = Object.entries(tool_types)
		.sort((a, b) => b[1] - a[1])
		.map(
			([name, count]) =>
				`<div class="breakdown-item"><span class="breakdown-icon">${get_tool_icon(name)}</span><span class="breakdown-name">${escape_html(name)}</span><span class="breakdown-count">${count}</span></div>`,
		)
		.join('');

	// Build mini-map for sidebar
	const minimap_html = steps
		.map((step, i) => {
			const tool_count = step.events.filter(
				(e) => e.type === 'tool_use',
			).length;
			const bar_height = Math.max(4, Math.min(24, tool_count * 6));
			return `<a href="#step-${i}" class="minimap-bar" style="--bar-h: ${bar_height}px" title="Step ${i + 1}: ${tool_count} tools"><span class="minimap-label">${String(i + 1).padStart(2, '0')}</span></a>`;
		})
		.join('');

	const steps_html = steps.map((step, i) => render_step(step, i)).join('');

	return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>Mission Log // Transcript</title>
	<link rel="preconnect" href="https://fonts.googleapis.com">
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
	<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
	<style>
		:root {
			--bg-deep: #0a0c10;
			--bg-base: #0f1218;
			--bg-surface: #161b24;
			--bg-elevated: #1c222e;
			--bg-hover: #232a38;

			--border-dim: #1e2534;
			--border-base: #2a3244;
			--border-bright: #3a4560;

			--text-muted: #4a5568;
			--text-dim: #718096;
			--text-base: #a0aec0;
			--text-bright: #cbd5e0;
			--text-white: #e2e8f0;

			--accent-green: #39d98a;
			--accent-green-dim: #1a3a2a;
			--accent-amber: #f0b429;
			--accent-amber-dim: #3a2e1a;
			--accent-blue: #4dabf7;
			--accent-blue-dim: #1a2a3a;
			--accent-red: #fc5c65;
			--accent-red-dim: #3a1a1a;
			--accent-purple: #a78bfa;
			--accent-purple-dim: #2a1a3a;
			--accent-cyan: #22d3ee;
			--accent-cyan-dim: #1a2a33;
			--accent-orange: #fb923c;

			--font-display: 'Outfit', system-ui, sans-serif;
			--font-mono: 'JetBrains Mono', 'Fira Code', monospace;

			--radius-sm: 4px;
			--radius-md: 8px;
			--radius-lg: 12px;
			--radius-xl: 16px;
		}

		*, *::before, *::after {
			box-sizing: border-box;
			margin: 0;
			padding: 0;
		}

		html {
			scroll-behavior: smooth;
		}

		body {
			font-family: var(--font-mono);
			background: var(--bg-deep);
			color: var(--text-base);
			line-height: 1.6;
			min-height: 100vh;
			overflow-x: hidden;
		}

		/* ── Scanline overlay ── */
		body::after {
			content: '';
			position: fixed;
			inset: 0;
			pointer-events: none;
			z-index: 9999;
			background: repeating-linear-gradient(
				0deg,
				transparent,
				transparent 2px,
				rgba(0, 0, 0, 0.03) 2px,
				rgba(0, 0, 0, 0.03) 4px
			);
		}

		/* ── Background noise texture ── */
		body::before {
			content: '';
			position: fixed;
			inset: 0;
			pointer-events: none;
			z-index: 9998;
			opacity: 0.015;
			background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
			background-size: 256px 256px;
		}

		/* ── Layout ── */
		.layout {
			display: grid;
			grid-template-columns: 56px 1fr;
			min-height: 100vh;
		}

		/* ── Sidebar minimap ── */
		.sidebar {
			position: fixed;
			top: 0;
			left: 0;
			width: 56px;
			height: 100vh;
			background: var(--bg-base);
			border-right: 1px solid var(--border-dim);
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 12px 0;
			gap: 2px;
			overflow-y: auto;
			z-index: 100;
			scrollbar-width: none;
		}

		.sidebar::-webkit-scrollbar { display: none; }

		.minimap-bar {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 36px;
			min-height: var(--bar-h, 8px);
			background: var(--border-dim);
			border-radius: 3px;
			text-decoration: none;
			transition: all 0.2s ease;
			position: relative;
		}

		.minimap-bar:hover {
			background: var(--accent-green);
			transform: scaleX(1.15);
		}

		.minimap-label {
			font-size: 7px;
			font-family: var(--font-mono);
			color: var(--text-muted);
			transition: color 0.2s;
		}

		.minimap-bar:hover .minimap-label {
			color: var(--bg-deep);
			font-weight: 700;
		}

		/* ── Main content ── */
		.main {
			grid-column: 2;
			padding: 0 40px 80px;
			max-width: 1200px;
			width: 100%;
			margin: 0 auto;
		}

		/* ── Hero header ── */
		.hero {
			padding: 60px 0 40px;
			position: relative;
		}

		.hero-label {
			font-family: var(--font-mono);
			font-size: 11px;
			font-weight: 500;
			letter-spacing: 4px;
			text-transform: uppercase;
			color: var(--accent-green);
			margin-bottom: 12px;
			display: flex;
			align-items: center;
			gap: 10px;
		}

		.hero-label::before {
			content: '';
			width: 20px;
			height: 1px;
			background: var(--accent-green);
		}

		.hero-title {
			font-family: var(--font-display);
			font-size: 48px;
			font-weight: 800;
			color: var(--text-white);
			letter-spacing: -1.5px;
			line-height: 1.1;
			margin-bottom: 8px;
		}

		.hero-title span {
			color: var(--accent-green);
		}

		.hero-sub {
			font-size: 13px;
			color: var(--text-dim);
		}

		/* ── Summary dashboard ── */
		.dashboard {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
			gap: 12px;
			margin-bottom: 40px;
		}

		.dash-card {
			background: var(--bg-surface);
			border: 1px solid var(--border-dim);
			border-radius: var(--radius-lg);
			padding: 20px;
			position: relative;
			overflow: hidden;
			transition: border-color 0.3s, transform 0.3s;
		}

		.dash-card:hover {
			border-color: var(--border-bright);
			transform: translateY(-2px);
		}

		.dash-card::before {
			content: '';
			position: absolute;
			top: 0;
			left: 0;
			right: 0;
			height: 2px;
			background: var(--card-accent, var(--accent-green));
			opacity: 0.6;
		}

		.dash-card-value {
			font-family: var(--font-display);
			font-size: 32px;
			font-weight: 800;
			color: var(--text-white);
			line-height: 1;
			margin-bottom: 6px;
		}

		.dash-card-label {
			font-size: 11px;
			letter-spacing: 2px;
			text-transform: uppercase;
			color: var(--text-muted);
		}

		/* ── Tool breakdown ── */
		.breakdown {
			background: var(--bg-surface);
			border: 1px solid var(--border-dim);
			border-radius: var(--radius-lg);
			padding: 20px;
			margin-bottom: 40px;
		}

		.breakdown-title {
			font-family: var(--font-mono);
			font-size: 11px;
			letter-spacing: 3px;
			text-transform: uppercase;
			color: var(--text-muted);
			margin-bottom: 16px;
		}

		.breakdown-grid {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
		}

		.breakdown-item {
			display: flex;
			align-items: center;
			gap: 8px;
			background: var(--bg-elevated);
			border: 1px solid var(--border-dim);
			border-radius: var(--radius-md);
			padding: 8px 14px;
			transition: border-color 0.2s;
		}

		.breakdown-item:hover {
			border-color: var(--border-bright);
		}

		.breakdown-icon {
			font-size: 14px;
			color: var(--accent-green);
		}

		.breakdown-name {
			font-size: 12px;
			color: var(--text-bright);
		}

		.breakdown-count {
			font-size: 11px;
			font-weight: 700;
			color: var(--accent-amber);
			background: var(--accent-amber-dim);
			padding: 2px 8px;
			border-radius: 10px;
		}

		/* ── Step timeline ── */
		.step {
			display: grid;
			grid-template-columns: 32px 1fr;
			gap: 20px;
			margin-bottom: 0;
			opacity: 0;
			transform: translateY(16px);
			animation: step-appear 0.5s ease forwards;
			animation-delay: calc(var(--step-index, 0) * 0.03s);
		}

		@keyframes step-appear {
			to {
				opacity: 1;
				transform: translateY(0);
			}
		}

		.step-marker {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding-top: 20px;
		}

		.step-marker-dot {
			width: 12px;
			height: 12px;
			background: var(--accent-green);
			border-radius: 50%;
			box-shadow: 0 0 12px rgba(57, 217, 138, 0.3);
			flex-shrink: 0;
			position: relative;
		}

		.step-marker-dot::after {
			content: '';
			position: absolute;
			inset: -4px;
			border-radius: 50%;
			border: 1px solid rgba(57, 217, 138, 0.15);
		}

		.step-marker-line {
			width: 1px;
			flex: 1;
			background: linear-gradient(180deg, var(--accent-green) 0%, var(--border-dim) 100%);
			margin-top: 8px;
		}

		.step-body {
			background: var(--bg-surface);
			border: 1px solid var(--border-dim);
			border-radius: var(--radius-lg);
			overflow: hidden;
			margin-bottom: 16px;
			transition: border-color 0.3s;
		}

		.step-body:hover {
			border-color: var(--border-base);
		}

		.step-header {
			display: flex;
			justify-content: space-between;
			align-items: center;
			padding: 14px 20px;
			border-bottom: 1px solid var(--border-dim);
			flex-wrap: wrap;
			gap: 10px;
		}

		.step-header-left {
			display: flex;
			align-items: center;
			gap: 12px;
		}

		.step-header-right {
			display: flex;
			align-items: center;
			gap: 8px;
			flex-wrap: wrap;
		}

		.step-number {
			font-family: var(--font-display);
			font-size: 22px;
			font-weight: 800;
			color: var(--text-white);
			min-width: 36px;
		}

		.step-time {
			font-size: 11px;
			color: var(--text-muted);
			font-variant-numeric: tabular-nums;
		}

		.step-badge {
			font-size: 10px;
			font-weight: 600;
			letter-spacing: 1px;
			text-transform: uppercase;
			padding: 3px 10px;
			border-radius: 10px;
		}

		.step-badge-tools {
			color: var(--accent-green);
			background: var(--accent-green-dim);
		}

		.step-badge-text {
			color: var(--accent-blue);
			background: var(--accent-blue-dim);
		}

		.stat {
			font-size: 11px;
			padding: 3px 10px;
			border-radius: var(--radius-sm);
			font-variant-numeric: tabular-nums;
		}

		.stat-cost {
			color: var(--accent-amber);
			background: var(--accent-amber-dim);
		}

		.stat-tokens {
			color: var(--accent-cyan);
			background: var(--accent-cyan-dim);
		}

		.stat-icon {
			font-size: 9px;
			opacity: 0.7;
			margin: 0 2px;
		}

		.stat-duration {
			color: var(--text-dim);
			background: var(--bg-elevated);
		}

		.stat-reason {
			font-weight: 600;
			text-transform: uppercase;
			letter-spacing: 0.5px;
		}

		.stat-reason-stop {
			color: var(--accent-green);
			background: var(--accent-green-dim);
		}

		.stat-reason-tool-calls {
			color: var(--accent-blue);
			background: var(--accent-blue-dim);
		}

		.step-content {
			padding: 16px 20px;
		}

		/* ── Text messages ── */
		.text-message {
			background: var(--bg-elevated);
			border-left: 3px solid var(--accent-blue);
			padding: 14px 18px;
			border-radius: 0 var(--radius-md) var(--radius-md) 0;
			margin-bottom: 12px;
			white-space: pre-wrap;
			word-break: break-word;
			font-size: 13px;
			color: var(--text-bright);
			line-height: 1.7;
			position: relative;
		}

		.text-prefix {
			color: var(--accent-blue);
			margin-right: 6px;
			opacity: 0.6;
		}

		/* ── Tool calls ── */
		.tool-call {
			background: var(--bg-base);
			border: 1px solid var(--border-dim);
			border-radius: var(--radius-md);
			margin-bottom: 12px;
			overflow: hidden;
			transition: border-color 0.2s;
		}

		.tool-call:hover {
			border-color: var(--border-base);
		}

		.tool-call.task { border-left: 3px solid var(--accent-purple); }
		.tool-call.todowrite { border-left: 3px solid var(--accent-amber); }
		.tool-call.edit { border-left: 3px solid var(--accent-green); }
		.tool-call.write { border-left: 3px solid var(--accent-blue); }
		.tool-call.read { border-left: 3px solid var(--accent-cyan); }
		.tool-call.glob { border-left: 3px solid var(--accent-orange); }
		.tool-call.bash { border-left: 3px solid var(--text-dim); }
		.tool-call.grep { border-left: 3px solid var(--accent-cyan); }
		.tool-call.skill { border-left: 3px solid var(--accent-purple); }

		.tool-header {
			display: flex;
			align-items: center;
			gap: 10px;
			padding: 10px 14px;
			border-bottom: 1px solid var(--border-dim);
		}

		.tool-icon {
			font-size: 14px;
			color: var(--accent-green);
			width: 20px;
			text-align: center;
		}

		.tool-name {
			font-size: 12px;
			font-weight: 600;
			color: var(--text-bright);
			flex: 1;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		.tool-status {
			font-size: 9px;
			font-weight: 700;
			letter-spacing: 1.5px;
			text-transform: uppercase;
			padding: 3px 10px;
			border-radius: 10px;
		}

		.tool-status.success {
			color: var(--accent-green);
			background: var(--accent-green-dim);
		}

		.tool-status.error {
			color: var(--accent-red);
			background: var(--accent-red-dim);
		}

		.tool-status.pending {
			color: var(--accent-amber);
			background: var(--accent-amber-dim);
		}

		.tool-details {
			font-size: 12px;
		}

		.tool-details-toggle {
			display: block;
			padding: 8px 14px;
			font-size: 11px;
			color: var(--text-muted);
			cursor: pointer;
			user-select: none;
			transition: color 0.2s;
			list-style: none;
		}

		.tool-details-toggle::-webkit-details-marker { display: none; }

		.tool-details-toggle::before {
			content: '\\25B8 ';
			color: var(--text-muted);
			transition: transform 0.2s;
			display: inline-block;
		}

		details[open] > .tool-details-toggle::before {
			content: '\\25BE ';
			color: var(--accent-green);
		}

		.tool-details-toggle:hover {
			color: var(--text-base);
		}

		.tool-details-inner {
			padding: 0 14px 14px;
		}

		.tool-input {
			margin-bottom: 12px;
		}

		.tool-input-line {
			margin-bottom: 8px;
			color: var(--text-dim);
		}

		.tool-input-line strong {
			color: var(--text-base);
			font-weight: 600;
		}

		.tool-output-section {
			margin-top: 12px;
			padding-top: 12px;
			border-top: 1px solid var(--border-dim);
		}

		.output-label {
			font-size: 9px;
			font-weight: 700;
			letter-spacing: 2px;
			color: var(--text-muted);
			display: block;
			margin-bottom: 8px;
		}

		/* ── Code blocks ── */
		.code-block {
			background: var(--bg-deep);
			color: var(--accent-green);
			padding: 14px 16px;
			border-radius: var(--radius-md);
			border: 1px solid var(--border-dim);
			overflow-x: auto;
			font-family: var(--font-mono);
			font-size: 12px;
			line-height: 1.6;
			margin-top: 8px;
			white-space: pre-wrap;
			word-break: break-word;
			scrollbar-width: thin;
			scrollbar-color: var(--border-base) transparent;
		}

		.code-block::-webkit-scrollbar {
			height: 6px;
		}

		.code-block::-webkit-scrollbar-track {
			background: transparent;
		}

		.code-block::-webkit-scrollbar-thumb {
			background: var(--border-base);
			border-radius: 3px;
		}

		.code-block.output {
			color: var(--accent-blue);
			border-color: var(--accent-blue-dim);
		}

		.code-block.diff-old {
			color: var(--accent-red);
			background: rgba(252, 92, 101, 0.05);
			border-color: var(--accent-red-dim);
		}

		.code-block.diff-new {
			color: var(--accent-green);
			background: rgba(57, 217, 138, 0.05);
			border-color: var(--accent-green-dim);
		}

		code {
			background: var(--bg-elevated);
			color: var(--accent-cyan);
			padding: 2px 7px;
			border-radius: 4px;
			font-family: var(--font-mono);
			font-size: 0.9em;
			border: 1px solid var(--border-dim);
		}

		/* ── Floating controls ── */
		.floating-controls {
			position: fixed;
			bottom: 24px;
			right: 24px;
			display: flex;
			flex-direction: column;
			gap: 8px;
			z-index: 200;
		}

		.float-btn {
			width: 44px;
			height: 44px;
			display: flex;
			align-items: center;
			justify-content: center;
			background: var(--bg-elevated);
			border: 1px solid var(--border-base);
			border-radius: var(--radius-md);
			color: var(--text-base);
			text-decoration: none;
			font-size: 16px;
			transition: all 0.2s;
			cursor: pointer;
			backdrop-filter: blur(12px);
		}

		.float-btn:hover {
			background: var(--accent-green);
			border-color: var(--accent-green);
			color: var(--bg-deep);
			transform: scale(1.1);
			box-shadow: 0 0 20px rgba(57, 217, 138, 0.3);
		}

		/* ── Glow accents ── */
		.glow-line {
			height: 1px;
			background: linear-gradient(90deg, transparent, var(--accent-green), transparent);
			margin: 40px 0;
			opacity: 0.3;
		}

		/* ── Responsive ── */
		@media (max-width: 768px) {
			.layout {
				grid-template-columns: 1fr;
			}

			.sidebar {
				display: none;
			}

			.main {
				padding: 0 16px 60px;
			}

			.hero-title {
				font-size: 28px;
			}

			.dashboard {
				grid-template-columns: repeat(2, 1fr);
			}

			.step {
				grid-template-columns: 1fr;
				gap: 0;
			}

			.step-marker {
				display: none;
			}

			.step-header {
				flex-direction: column;
				align-items: flex-start;
			}

			.step-header-right {
				width: 100%;
				justify-content: flex-start;
			}
		}

		/* ── Scrollbar ── */
		::-webkit-scrollbar {
			width: 8px;
		}

		::-webkit-scrollbar-track {
			background: var(--bg-deep);
		}

		::-webkit-scrollbar-thumb {
			background: var(--border-base);
			border-radius: 4px;
		}

		::-webkit-scrollbar-thumb:hover {
			background: var(--border-bright);
		}
	</style>
</head>
<body>
	<div class="layout">
		<nav class="sidebar">
			${minimap_html}
		</nav>
		<main class="main">
			<header class="hero">
				<div class="hero-label">Mission Log</div>
				<h1 class="hero-title">Transcript <span>Replay</span></h1>
				<p class="hero-sub">${steps.length} steps \u00B7 ${total_tools} tool calls \u00B7 ${total_text} messages</p>
			</header>

			<section class="dashboard">
				<div class="dash-card" style="--card-accent: var(--accent-green)">
					<div class="dash-card-value">${steps.length}</div>
					<div class="dash-card-label">Steps</div>
				</div>
				<div class="dash-card" style="--card-accent: var(--accent-blue)">
					<div class="dash-card-value">${total_tools}</div>
					<div class="dash-card-label">Tool Calls</div>
				</div>
				<div class="dash-card" style="--card-accent: var(--accent-amber)">
					<div class="dash-card-value">$${total_cost.toFixed(2)}</div>
					<div class="dash-card-label">Total Cost</div>
				</div>
				<div class="dash-card" style="--card-accent: var(--accent-cyan)">
					<div class="dash-card-value">${(total_input_tokens / 1000).toFixed(0)}k</div>
					<div class="dash-card-label">Input Tokens</div>
				</div>
				<div class="dash-card" style="--card-accent: var(--accent-purple)">
					<div class="dash-card-value">${(total_output_tokens / 1000).toFixed(0)}k</div>
					<div class="dash-card-label">Output Tokens</div>
				</div>
			</section>

			<section class="breakdown">
				<div class="breakdown-title">Tool Breakdown</div>
				<div class="breakdown-grid">
					${tool_breakdown_html}
				</div>
			</section>

			<div class="glow-line"></div>

			<section class="timeline">
				${steps_html}
			</section>
		</main>
	</div>

	<div class="floating-controls">
		<a class="float-btn" href="#step-0" title="Jump to top">\u2191</a>
		<a class="float-btn" href="#step-${steps.length - 1}" title="Jump to bottom">\u2193</a>
	</div>

	<script>
		// Intersection Observer for scroll-triggered animations
		const observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.style.animationPlayState = 'running';
				}
			});
		}, { threshold: 0.05 });

		document.querySelectorAll('.step').forEach(step => {
			step.style.animationPlayState = 'paused';
			observer.observe(step);
		});

		// Highlight active minimap bar on scroll
		const steps = document.querySelectorAll('.step');
		const bars = document.querySelectorAll('.minimap-bar');
		
		const scrollObserver = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				const idx = Array.from(steps).indexOf(entry.target);
				if (idx >= 0 && bars[idx]) {
					if (entry.isIntersecting) {
						bars[idx].style.background = 'var(--accent-green)';
						bars[idx].querySelector('.minimap-label').style.color = 'var(--bg-deep)';
						bars[idx].querySelector('.minimap-label').style.fontWeight = '700';
					} else {
						bars[idx].style.background = '';
						bars[idx].querySelector('.minimap-label').style.color = '';
						bars[idx].querySelector('.minimap-label').style.fontWeight = '';
					}
				}
			});
		}, { threshold: 0.3 });

		steps.forEach(step => scrollObserver.observe(step));
	</script>
</body>
</html>`;
}

function convert_file(input_file: string, output_file: string) {
	console.log(`Parsing ${input_file}...`);
	const events = parse_jsonl(input_file);
	console.log(`Parsed ${events.length} events`);

	console.log('Grouping by step...');
	const steps = group_by_step(events);
	console.log(`Found ${steps.length} steps`);

	const tool_count = steps.reduce(
		(acc, s) => acc + s.events.filter((e) => e.type === 'tool_use').length,
		0,
	);
	console.log(`Found ${tool_count} tool calls`);

	console.log('Generating HTML...');
	const html = generate_html(steps);

	fs.writeFileSync(output_file, html);
	console.log(`\n✓ Generated: ${output_file}`);
	console.log(`  Steps: ${steps.length}`);
	console.log(`  Events: ${events.length}`);
	console.log(`  Tool Calls: ${tool_count}`);
}

function find_jsonl_files(dir: string): string[] {
	let results: string[] = [];
	const entries = fs.readdirSync(dir, { withFileTypes: true });
	for (const entry of entries) {
		const full_path = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			results = results.concat(find_jsonl_files(full_path));
		} else if (entry.isFile() && entry.name.endsWith('.jsonl')) {
			results.push(full_path);
		}
	}
	return results;
}

function open_file(file_path: string) {
	const platform = process.platform;
	const cmd =
		platform === 'darwin'
			? 'open'
			: platform === 'win32'
				? 'start'
				: 'xdg-open';
	exec(`${cmd} "${file_path}"`, (err) => {
		if (err) {
			console.warn(`Could not open file automatically: ${err.message}`);
		}
	});
}

function main() {
	const args = process.argv.slice(2);

	if (args.length < 1) {
		console.error(
			'Usage: node visualize-transcript.js <input.jsonl|directory> [output.html]',
		);
		process.exit(1);
	}

	const input_path = args[0];

	if (!fs.existsSync(input_path)) {
		console.error(`Error: Path not found: ${input_path}`);
		process.exit(1);
	}

	const stat = fs.statSync(input_path);

	if (stat.isDirectory()) {
		const jsonl_files = find_jsonl_files(input_path);

		if (jsonl_files.length === 0) {
			console.error(`No .jsonl files found in ${input_path}`);
			process.exit(1);
		}

		console.log(
			`Found ${jsonl_files.length} .jsonl file(s) in ${input_path}\n`,
		);

		const output_files: string[] = [];
		for (const file of jsonl_files) {
			const output_file = file.replace(/\.jsonl$/, '.html');
			convert_file(file, output_file);
			output_files.push(output_file);
			console.log('');
		}

		console.log(`Done! Converted ${jsonl_files.length} file(s).`);

		if (output_files.length === 1) {
			console.log(`Opening ${output_files[0]}...`);
			open_file(output_files[0]);
		}
	} else {
		const output_file = args[1] || input_path.replace('.jsonl', '.html');
		convert_file(input_path, output_file);
		console.log(`Opening ${output_file}...`);
		open_file(output_file);
	}
}

main();
