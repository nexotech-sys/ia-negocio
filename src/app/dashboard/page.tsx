'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  agents,
  getActivityFeed,
  getActiveAgents,
  getTotalCompletedTasks,
  getAverageEfficiency,
  getPendingRequests,
  getRequestsByAgent,
  accessRequests,
  type Agent,
  type ActivityItem,
  type AccessRequest,
} from '@/lib/agents';

const PASS = 'nacho2026';

/* ------------------------------------------------------------------ */
/*  LOCAL HELPERS (for functions not yet in @/lib/agents)               */
/* ------------------------------------------------------------------ */

function getAgentById(id: string): Agent | undefined {
  return agents.find((a) => a.id === id);
}

function getDepartments(): string[] {
  return [...new Set(agents.map((a) => a.department))];
}

function getDepartmentStats(department: string) {
  const deptAgents = agents.filter((a) => a.department === department);
  return {
    totalTasks: deptAgents.reduce((s, a) => s + a.completedTasks, 0),
    avgEfficiency: Math.round(deptAgents.reduce((s, a) => s + a.efficiency, 0) / (deptAgents.length || 1)),
    activeAgents: deptAgents.filter((a) => a.status === 'working').length,
    totalAgents: deptAgents.length,
  };
}

function getCompanyKPIs(): { name: string; value: string; trend: 'up' | 'down' | 'stable' }[] {
  return [
    { name: 'Articulos Publicados', value: '155', trend: 'up' },
    { name: 'Trafico Mensual', value: 'Google indexando', trend: 'up' },
    { name: 'Ingresos Mensuales', value: '$0', trend: 'stable' },
    { name: 'Agentes Activos', value: `${getActiveAgents().length}/${agents.length}`, trend: 'up' },
    { name: 'Eficiencia Promedio', value: `${getAverageEfficiency()}%`, trend: 'up' },
    { name: 'Solicitudes Pendientes', value: `${getPendingRequests().length}`, trend: 'stable' },
  ];
}

/* ------------------------------------------------------------------ */
/*  DEPARTMENT COLOUR MAPS                                             */
/* ------------------------------------------------------------------ */

const DEPT_RING: Record<string, string> = {
  Direccion:  'ring-yellow-500',
  Contenido:  'ring-purple-500',
  SEO:        'ring-cyan-500',
  Marketing:  'ring-orange-500',
  Finanzas:   'ring-green-500',
  Tecnologia: 'ring-blue-500',
  Analytics:  'ring-pink-500',
  Ventas:     'ring-emerald-500',
};

const DEPT_BG: Record<string, string> = {
  Direccion:  'bg-yellow-500',
  Contenido:  'bg-purple-500',
  SEO:        'bg-cyan-500',
  Marketing:  'bg-orange-500',
  Finanzas:   'bg-green-500',
  Tecnologia: 'bg-blue-500',
  Analytics:  'bg-pink-500',
  Ventas:     'bg-emerald-500',
};

const DEPT_BADGE: Record<string, string> = {
  Direccion:  'bg-yellow-500/20 text-yellow-400',
  Contenido:  'bg-purple-500/20 text-purple-400',
  SEO:        'bg-cyan-500/20 text-cyan-400',
  Marketing:  'bg-orange-500/20 text-orange-400',
  Finanzas:   'bg-green-500/20 text-green-400',
  Tecnologia: 'bg-blue-500/20 text-blue-400',
  Analytics:  'bg-pink-500/20 text-pink-400',
  Ventas:     'bg-emerald-500/20 text-emerald-400',
};

const DEPT_TEXT: Record<string, string> = {
  Direccion:  'text-yellow-400',
  Contenido:  'text-purple-400',
  SEO:        'text-cyan-400',
  Marketing:  'text-orange-400',
  Finanzas:   'text-green-400',
  Tecnologia: 'text-blue-400',
  Analytics:  'text-pink-400',
  Ventas:     'text-emerald-400',
};

const DEPT_BORDER: Record<string, string> = {
  Direccion:  'border-yellow-500/40',
  Contenido:  'border-purple-500/40',
  SEO:        'border-cyan-500/40',
  Marketing:  'border-orange-500/40',
  Finanzas:   'border-green-500/40',
  Tecnologia: 'border-blue-500/40',
  Analytics:  'border-pink-500/40',
  Ventas:     'border-emerald-500/40',
};

const DEPT_HEADER_BG: Record<string, string> = {
  Direccion:  'bg-yellow-500/10',
  Contenido:  'bg-purple-500/10',
  SEO:        'bg-cyan-500/10',
  Marketing:  'bg-orange-500/10',
  Finanzas:   'bg-green-500/10',
  Tecnologia: 'bg-blue-500/10',
  Analytics:  'bg-pink-500/10',
  Ventas:     'bg-emerald-500/10',
};

const ALL_DEPARTMENTS = [
  'Direccion', 'Contenido', 'SEO', 'Marketing',
  'Finanzas', 'Tecnologia', 'Analytics', 'Ventas',
];

const priorityStyles: Record<string, string> = {
  alta: 'bg-red-500/20 text-red-400 border border-red-500/30',
  media: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
  baja: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
};

const typeIcons: Record<string, string> = {
  permiso: '🔑',
  acceso: '🔓',
  presupuesto: '💳',
  aprobacion: '✅',
};

type Section = 'overview' | 'oficina' | 'departamentos' | 'solicitudes' | 'actividad' | 'integraciones' | 'kpis' | 'pagos' | 'calendario';

/* ------------------------------------------------------------------ */
/*  SMALL HELPERS                                                      */
/* ------------------------------------------------------------------ */

function statusLabel(s: Agent['status']) {
  return s === 'working' ? 'Trabajando' : s === 'analyzing' ? 'Analizando' : 'En espera';
}

function StatusDot({ status, size = 'sm' }: { status: Agent['status']; size?: 'sm' | 'lg' }) {
  const dim = size === 'lg' ? 'h-3.5 w-3.5' : 'h-2.5 w-2.5';
  if (status === 'working')
    return (
      <span className={`relative flex ${dim}`}>
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
        <span className={`relative inline-flex ${dim} rounded-full bg-green-500`} />
      </span>
    );
  if (status === 'analyzing')
    return (
      <span className={`relative flex ${dim}`}>
        <span className="absolute inline-flex h-full w-full animate-pulse rounded-full bg-yellow-400 opacity-75" />
        <span className={`relative inline-flex ${dim} rounded-full bg-yellow-500`} />
      </span>
    );
  return <span className={`inline-flex ${dim} rounded-full bg-gray-600`} />;
}

function BarFill({ pct, colorClass }: { pct: number; colorClass: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-700">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorClass}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function TrendArrow({ trend }: { trend: 'up' | 'down' | 'stable' }) {
  if (trend === 'up') return <span className="text-green-400 font-bold">↑</span>;
  if (trend === 'down') return <span className="text-red-400 font-bold">↓</span>;
  return <span className="text-gray-400 font-bold">→</span>;
}

/* ------------------------------------------------------------------ */
/*  LOGIN GATE                                                         */
/* ------------------------------------------------------------------ */

function LoginGate({ onAuth }: { onAuth: () => void }) {
  const [pw, setPw] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw === PASS) {
      setLoading(true);
      setTimeout(() => onAuth(), 600);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-gray-950 px-4">
      <div className="pointer-events-none absolute -left-40 -top-40 h-[500px] w-[500px] animate-pulse rounded-full bg-blue-600/10 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-[500px] w-[500px] animate-pulse rounded-full bg-purple-600/10 blur-3xl" />

      <form
        onSubmit={submit}
        className="relative z-10 w-full max-w-sm rounded-2xl border border-gray-800 bg-gray-900/80 p-8 shadow-2xl backdrop-blur"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 text-4xl shadow-lg shadow-blue-500/20">
            🏢
          </div>
          <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-2xl font-extrabold text-transparent">
            Nexo Articles
          </h1>
          <p className="mt-1 text-sm text-gray-500">Centro de Comando — Acceso Privado</p>
        </div>
        <label className="mb-2 block text-xs font-semibold uppercase tracking-widest text-gray-500">
          Contrasena
        </label>
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Ingresa la contrasena"
          className={`mb-4 w-full rounded-xl border bg-gray-800/60 px-4 py-3 text-white placeholder-gray-600 outline-none transition-all focus:ring-2 focus:ring-blue-500 ${
            error ? 'border-red-500 animate-pulse' : 'border-gray-700'
          }`}
          autoFocus
        />
        {error && <p className="mb-3 text-center text-sm font-medium text-red-400">Contrasena incorrecta</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 py-3 font-bold text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/40 active:scale-[0.98] disabled:opacity-60"
        >
          {loading ? 'Ingresando...' : 'Acceder al Dashboard'}
        </button>
      </form>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  TOAST                                                              */
/* ------------------------------------------------------------------ */

function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 4000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed left-1/2 top-6 z-[300] -translate-x-1/2 animate-bounce rounded-2xl border border-green-500/30 bg-green-900/95 px-6 py-3 text-sm font-medium text-green-200 shadow-2xl backdrop-blur">
      {message}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SUMMARY CARD                                                       */
/* ------------------------------------------------------------------ */

function SummaryCard({
  label,
  value,
  icon,
  gradient,
}: {
  label: string;
  value: string;
  icon: string;
  gradient: string;
}) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/80 p-5 transition-all hover:border-gray-700 hover:shadow-lg hover:shadow-black/40">
      <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full ${gradient} opacity-20 blur-2xl transition-all group-hover:opacity-40`} />
      <div className="relative">
        <div className="mb-3 flex items-center justify-between">
          <span className="text-3xl">{icon}</span>
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-500">{label}</span>
        </div>
        <p className="text-3xl font-extrabold text-white">{value}</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CONFERENCE TABLE                                                   */
/* ------------------------------------------------------------------ */

function ConferenceTable({
  onSelectAgent,
  pendingCountMap,
}: {
  onSelectAgent: (a: Agent) => void;
  pendingCountMap: Record<string, number>;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const count = agents.length;

  return (
    <div className="relative mx-auto" style={{ width: '100%', maxWidth: 800, height: 420 }}>
      {/* Table surface */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[50%] border-2 border-amber-900/50 shadow-2xl"
        style={{
          width: '70%',
          height: '55%',
          background: 'radial-gradient(ellipse at 40% 30%, #5c3d1e 0%, #3b2510 40%, #2a1a0a 80%, #1a100a 100%)',
          boxShadow: '0 8px 60px rgba(60,30,5,0.5), inset 0 2px 20px rgba(255,200,100,0.05)',
        }}
      >
        {/* Table shine */}
        <div
          className="absolute left-[20%] top-[15%] h-[30%] w-[40%] rounded-[50%] opacity-10"
          style={{ background: 'radial-gradient(ellipse, rgba(255,220,150,0.5), transparent)' }}
        />
        {/* Center label */}
        <div className="flex h-full items-center justify-center">
          <span className="text-sm font-bold uppercase tracking-widest text-amber-800/60">Mesa de Comando</span>
        </div>
      </div>

      {/* Agent seats */}
      {agents.map((agent, i) => {
        const angle = (2 * Math.PI * i) / count - Math.PI / 2;
        const rx = 46;
        const ry = 44;
        const cx = 50 + rx * Math.cos(angle);
        const cy = 50 + ry * Math.sin(angle);
        const reqCount = pendingCountMap[agent.id] || 0;
        const isHovered = hoveredId === agent.id;

        return (
          <div
            key={agent.id}
            className="absolute z-10"
            style={{
              left: `${cx}%`,
              top: `${cy}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* Tooltip */}
            {isHovered && (
              <div className="absolute bottom-full left-1/2 z-30 mb-2 -translate-x-1/2 whitespace-nowrap rounded-xl border border-gray-700 bg-gray-900/95 px-4 py-2.5 text-xs shadow-xl backdrop-blur">
                <p className="font-bold text-white">{agent.name}</p>
                <p className="text-gray-400">{agent.role}</p>
                <p className="mt-1 text-gray-300">{agent.currentTask.length > 50 ? agent.currentTask.slice(0, 50) + '...' : agent.currentTask}</p>
                <div className="absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-gray-700 bg-gray-900" />
              </div>
            )}

            {/* Agent circle */}
            <button
              onClick={() => onSelectAgent(agent)}
              onMouseEnter={() => setHoveredId(agent.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`relative flex h-14 w-14 items-center justify-center rounded-full ring-3 transition-all duration-200 ${DEPT_RING[agent.department]} ${
                isHovered ? 'scale-125 shadow-lg shadow-black/60' : 'hover:scale-110'
              }`}
              style={{
                background: 'linear-gradient(135deg, rgba(30,30,40,0.95), rgba(20,20,30,0.95))',
              }}
            >
              <span className="text-2xl">{agent.avatar}</span>

              {/* Status dot */}
              <span className="absolute -bottom-0.5 -right-0.5">
                <StatusDot status={agent.status} size="sm" />
              </span>

              {/* Request notification badge */}
              {reqCount > 0 && (
                <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-lg animate-pulse">
                  {reqCount}
                </span>
              )}
            </button>

            {/* Name label below */}
            <p className={`mt-1 text-center text-[10px] font-semibold leading-tight ${DEPT_TEXT[agent.department]}`}>
              {agent.name.split(' ')[0]}
            </p>
          </div>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AGENT DETAIL MODAL                                                 */
/* ------------------------------------------------------------------ */

function AgentDetailModal({
  agent,
  requests,
  approvedIds,
  rejectedIds,
  onClose,
  onApprove,
  onReject,
}: {
  agent: Agent;
  requests: AccessRequest[];
  approvedIds: Set<string>;
  rejectedIds: Set<string>;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [customTask, setCustomTask] = useState('');

  async function askAgent(task?: string) {
    setAiLoading(true);
    setAiResponse(null);
    try {
      const res = await fetch('/api/agent-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: agent.id, task: task || undefined }),
      });
      const data = await res.json();
      if (data.status === 'ok') {
        setAiResponse(data.response);
      } else {
        setAiResponse(`Error: ${data.error || 'No se pudo conectar'}`);
      }
    } catch {
      setAiResponse('Error de conexion — intenta de nuevo');
    }
    setAiLoading(false);
  }

  const agentRequests = requests.filter(
    (r) => r.agentId === agent.id && !approvedIds.has(r.id) && !rejectedIds.has(r.id)
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const a = agent as any;
  const agentGoals = a.goals as string[] | undefined;
  const agentIdeas = a.ideas as string[] | undefined;
  const agentProjections = a.projections as { metric: string; current: string; projected: string; timeframe: string }[] | undefined;
  const agentKpis = a.kpis as { name: string; value: string; trend: 'up' | 'down' | 'stable' }[] | undefined;
  const agentWeekly = a.weeklyProgress as { week: string; tasks: number; efficiency: number }[] | undefined;
  const agentImprovements = a.improvements as string[] | undefined;
  const agentNextActions = a.nextActions as string[] | undefined;
  const agentBlockers = a.blockers as string[] | undefined;
  const agentMessage = a.messageToOwner as string | undefined;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-gray-700 bg-gray-900 shadow-2xl"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-gray-400 transition hover:bg-gray-700 hover:text-white"
        >
          X
        </button>

        {/* Header */}
        <div className={`px-6 pb-4 pt-6 ${DEPT_HEADER_BG[agent.department]}`}>
          <div className="flex items-center gap-4">
            <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ring-3 ${DEPT_RING[agent.department]}`} style={{ background: 'rgba(20,20,30,0.9)' }}>
              <span className="text-4xl">{agent.avatar}</span>
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white">{agent.name}</h2>
              <p className="text-sm text-gray-400">{agent.role}</p>
              <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${DEPT_BADGE[agent.department]}`}>
                {agent.department}
              </span>
            </div>
            {/* AI Action Button */}
            <button
              onClick={() => askAgent()}
              disabled={aiLoading}
              className="ml-auto shrink-0 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 px-4 py-2 text-xs font-bold text-white hover:from-purple-500 hover:to-blue-500 active:scale-95 transition disabled:opacity-50"
            >
              {aiLoading ? '⏳ Pensando...' : '🧠 Pedir Reporte'}
            </button>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <StatusDot status={agent.status} size="lg" />
            <span className={`text-sm font-medium ${agent.status === 'working' ? 'text-green-400' : agent.status === 'analyzing' ? 'text-yellow-400' : 'text-gray-500'}`}>
              {statusLabel(agent.status)}
            </span>
            <span className="text-xs text-gray-500">Activo {agent.lastActive}</span>
          </div>
        </div>

        <div className="space-y-5 px-6 py-5">
          <div>
            <p className="text-sm italic text-gray-400">{agent.personality}</p>
            <p className="mt-1 text-xs font-medium text-gray-600">{agent.motto}</p>
          </div>

          {/* AI Live Panel */}
          <div className="rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
            <p className="mb-2 text-[10px] font-bold uppercase tracking-widest text-purple-400">🧠 Agente IA en Vivo</p>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder={`Pedile algo a ${agent.name.split(' ')[0]}...`}
                value={customTask}
                onChange={(e) => setCustomTask(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && customTask.trim()) { askAgent(customTask); setCustomTask(''); } }}
                className="flex-1 rounded-lg border border-gray-600 bg-gray-800/80 px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-purple-500"
              />
              <button
                onClick={() => { if (customTask.trim()) { askAgent(customTask); setCustomTask(''); } }}
                disabled={!customTask.trim() || aiLoading}
                className="rounded-lg bg-purple-600 px-3 py-2 text-xs font-bold text-white hover:bg-purple-500 disabled:opacity-40 transition"
              >
                Enviar
              </button>
            </div>
            {aiLoading && (
              <div className="flex items-center gap-3 rounded-lg bg-gray-800/60 p-3">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
                <p className="text-xs text-purple-300">{agent.name.split(' ')[0]} esta pensando...</p>
              </div>
            )}
            {aiResponse && !aiLoading && (
              <div className="rounded-lg bg-gray-800/60 p-3 border border-purple-500/20">
                <p className="text-xs text-gray-200 leading-relaxed whitespace-pre-wrap">{aiResponse}</p>
                <p className="text-[9px] text-gray-600 mt-2">Generado por IA — {new Date().toLocaleString('es-AR')}</p>
              </div>
            )}
          </div>

          {agentMessage && (
            <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-4">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-blue-400">Mensaje para vos</p>
              <p className="text-sm text-blue-200">{agentMessage}</p>
            </div>
          )}

          <div className="rounded-xl bg-gray-800/80 p-4">
            <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">Tarea Actual</p>
            <p className="text-sm text-gray-200">{agent.currentTask}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-gray-800/60 p-3 text-center">
              <p className="text-2xl font-extrabold text-white">{agent.completedTasks}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-500">Tareas</p>
            </div>
            <div className="rounded-xl bg-gray-800/60 p-3 text-center">
              <p className="text-2xl font-extrabold text-white">{agent.streak}</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-500">Dias seguidos</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <div className="mb-1 flex justify-between text-xs text-gray-400">
                <span>Eficiencia</span>
                <span className="font-mono font-bold text-white">{agent.efficiency}%</span>
              </div>
              <BarFill pct={agent.efficiency} colorClass={agent.efficiency >= 95 ? 'bg-green-500' : agent.efficiency >= 90 ? 'bg-blue-500' : 'bg-yellow-500'} />
            </div>
            <div>
              <div className="mb-1 flex justify-between text-xs text-gray-400">
                <span>Energia</span>
                <span className="font-mono font-bold text-white">{agent.energy}%</span>
              </div>
              <BarFill pct={agent.energy} colorClass={agent.energy >= 90 ? 'bg-green-400' : agent.energy >= 70 ? 'bg-yellow-400' : 'bg-red-400'} />
            </div>
          </div>

          {/* Goals */}
          {agentGoals && agentGoals.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Objetivos</p>
              <ul className="space-y-1.5">
                {agentGoals.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="mt-0.5 text-yellow-400">&#9733;</span>{g}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Ideas */}
          {agentIdeas && agentIdeas.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Ideas</p>
              <ul className="space-y-1.5">
                {agentIdeas.map((idea, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="mt-0.5 text-purple-400">&#9670;</span>{idea}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* KPIs */}
          {agentKpis && agentKpis.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">KPIs Individuales</p>
              <div className="grid grid-cols-2 gap-2">
                {agentKpis.map((kpi, i) => (
                  <div key={i} className="rounded-lg bg-gray-800/60 p-2.5 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-gray-500">{kpi.name}</p>
                      <p className="text-sm font-bold text-white">{kpi.value}</p>
                    </div>
                    <TrendArrow trend={kpi.trend} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projections */}
          {agentProjections && agentProjections.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Proyecciones</p>
              <div className="space-y-2">
                {agentProjections.map((p, i) => (
                  <div key={i} className="rounded-lg bg-gray-800/60 p-3">
                    <p className="text-xs font-semibold text-white">{p.metric}</p>
                    <div className="mt-1 flex items-center gap-3 text-[11px]">
                      <span className="text-gray-400">Actual: <span className="text-white font-mono">{p.current}</span></span>
                      <span className="text-green-400">Proyectado: <span className="font-mono">{p.projected}</span></span>
                      <span className="text-gray-500">{p.timeframe}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Progress */}
          {agentWeekly && agentWeekly.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Progreso Semanal</p>
              <div className="flex items-end gap-2 h-24">
                {agentWeekly.map((w, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t bg-blue-500/70 transition-all" style={{ height: `${w.efficiency}%` }} />
                    <span className="text-[9px] text-gray-500">{w.week}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Improvements */}
          {agentImprovements && agentImprovements.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Auto-Mejoras</p>
              <ul className="space-y-1">
                {agentImprovements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="mt-0.5 text-green-400">&#10003;</span>{imp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Next Actions */}
          {agentNextActions && agentNextActions.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Proximas Acciones Autonomas</p>
              <ul className="space-y-1">
                {agentNextActions.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                    <span className="mt-0.5 text-blue-400">&#9656;</span>{a}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Blockers */}
          {agentBlockers && agentBlockers.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-red-400">Bloqueos</p>
              <ul className="space-y-1">
                {agentBlockers.map((b, i) => (
                  <li key={i} className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-xs text-red-300">
                    <span className="mt-0.5">&#9888;</span>{b}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Skills */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Skills</p>
            <div className="flex flex-wrap gap-2">
              {agent.skills.map((s) => (
                <span key={s} className={`rounded-full px-3 py-1 text-xs font-medium ${DEPT_BADGE[agent.department]}`}>
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Recent actions */}
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">Acciones Recientes</p>
            <ul className="space-y-1.5">
              {agent.recentActions.map((a, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-gray-300">
                  <span className="mt-0.5 text-gray-600">&#9656;</span>
                  {a}
                </li>
              ))}
            </ul>
          </div>

          {/* Pending requests for this agent */}
          {agentRequests.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-widest text-red-400">
                Solicitudes Pendientes ({agentRequests.length})
              </p>
              <div className="space-y-3">
                {agentRequests.map((req) => (
                  <div key={req.id} className="rounded-xl border border-gray-700 bg-gray-800/80 p-4">
                    <div className="mb-1 flex items-center gap-2">
                      <span>{typeIcons[req.type]}</span>
                      <span className="text-sm font-bold text-white">{req.title}</span>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${priorityStyles[req.priority]}`}>
                        {req.priority}
                      </span>
                    </div>
                    <p className="mb-2 text-xs leading-relaxed text-gray-400">{req.description}</p>
                    <div className="mb-3 flex flex-wrap gap-3 text-[10px]">
                      <span className="text-green-400">Impacto: {req.estimatedImpact}</span>
                      {req.cost && <span className="text-yellow-400">Costo: {req.cost}</span>}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => onApprove(req.id)}
                        className="flex-1 rounded-lg bg-green-600 py-2 text-xs font-bold text-white transition hover:bg-green-500 active:scale-95"
                      >
                        Aprobar
                      </button>
                      <button
                        onClick={() => onReject(req.id)}
                        className="flex-1 rounded-lg bg-gray-700 py-2 text-xs font-bold text-gray-300 transition hover:bg-gray-600 active:scale-95"
                      >
                        Rechazar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Integraciones */}
          {(() => {
            const agentIntegrations = (a.integrations as { name: string; icon: string; description: string; status: 'conectado' | 'pendiente' | 'no_configurado'; credentialNeeded?: string }[] | undefined);
            if (!agentIntegrations || agentIntegrations.length === 0) return null;
            return (
              <div>
                <p className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-500">🔌 Integraciones</p>
                <div className="space-y-2">
                  {agentIntegrations.map((ig, i) => (
                    <div key={i} className="flex items-start gap-2.5 rounded-lg border border-gray-700/60 bg-gray-800/50 p-2.5">
                      <span className="text-base mt-0.5">{ig.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-white">{ig.name}</span>
                          <span className={`inline-block h-2 w-2 rounded-full ${ig.status === 'conectado' ? 'bg-green-500' : ig.status === 'pendiente' ? 'bg-yellow-500' : 'bg-red-500'}`} />
                          <span className={`text-[10px] font-semibold ${ig.status === 'conectado' ? 'text-green-400' : ig.status === 'pendiente' ? 'text-yellow-400' : 'text-gray-400'}`}>
                            {ig.status === 'conectado' ? 'Conectado' : ig.status === 'pendiente' ? 'Pendiente' : 'No configurado'}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-0.5">{ig.description}</p>
                        {ig.status !== 'conectado' && ig.credentialNeeded && (
                          <div className="mt-1.5 rounded bg-yellow-500/10 border border-yellow-500/20 px-2 py-1">
                            <p className="text-[10px] text-yellow-300">🔑 Se necesita: <span className="font-semibold">{ig.credentialNeeded}</span></p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SIDEBAR                                                            */
/* ------------------------------------------------------------------ */

function Sidebar({
  activeSection,
  onNavigate,
  pendingCount,
  onLogout,
  mobileOpen,
  onCloseMobile,
}: {
  activeSection: Section;
  onNavigate: (s: Section) => void;
  pendingCount: number;
  onLogout: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}) {
  const navItems: { key: Section; icon: string; label: string }[] = [
    { key: 'overview', icon: '🏠', label: 'Resumen' },
    { key: 'oficina', icon: '🪑', label: 'Oficina' },
    { key: 'departamentos', icon: '📋', label: 'Departamentos' },
    { key: 'solicitudes', icon: '🔔', label: 'Solicitudes' },
    { key: 'actividad', icon: '📡', label: 'Actividad' },
    { key: 'integraciones', icon: '🔌', label: 'Integraciones' },
    { key: 'kpis', icon: '📊', label: 'KPIs' },
    { key: 'pagos', icon: '💳', label: 'Pagos' },
    { key: 'calendario', icon: '📅', label: 'Calendario' },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 border-b border-gray-800 px-5 py-5">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 text-lg shadow-md shadow-blue-500/20">
          🏢
        </div>
        <div>
          <h1 className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-lg font-extrabold text-transparent">
            Nexo Articles
          </h1>
          <p className="text-[10px] text-gray-600">Centro de Comando</p>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const isActive = activeSection === item.key;
          return (
            <button
              key={item.key}
              onClick={() => {
                onNavigate(item.key);
                onCloseMobile();
              }}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white shadow-lg shadow-blue-500/5 border border-blue-500/20'
                  : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
              {item.key === 'solicitudes' && pendingCount > 0 && (
                <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-800 px-4 py-4 space-y-3">
        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-xs font-medium text-green-400">Sistema Activo</span>
        </div>
        <button
          onClick={onLogout}
          className="w-full rounded-lg bg-gray-800 px-3 py-2 text-xs font-medium text-gray-400 transition hover:bg-gray-700 hover:text-white"
        >
          Cerrar Sesion
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 bg-gray-900 border-r border-gray-800">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCloseMobile} />
          <aside className="relative z-10 flex h-full w-72 flex-col bg-gray-900 shadow-2xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION: OVERVIEW                                                  */
/* ------------------------------------------------------------------ */

function OverviewSection({
  time,
  pendingCountMap,
  onNavigateToSolicitudes,
}: {
  time: string;
  pendingCountMap: Record<string, number>;
  onNavigateToSolicitudes: () => void;
}) {
  const kpis = getCompanyKPIs();
  const feed = getActivityFeed().slice(0, 5);
  const activeCount = getActiveAgents().length;
  const totalTasks = getTotalCompletedTasks();
  const avgEff = getAverageEfficiency();

  const kpiIcons = ['📝', '🌐', '💵', '🤖', '📈', '🔔'];
  const kpiGradients = ['bg-purple-500', 'bg-cyan-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-red-500'];

  // Agents with pending requests
  const agentsWithRequests = agents.filter((a) => (pendingCountMap[a.id] || 0) > 0);

  // Summary paragraph
  const workingAgents = agents.filter((a) => a.status === 'working');
  const analyzingAgents = agents.filter((a) => a.status === 'analyzing');

  return (
    <div className="space-y-6">
      {/* Welcome + clock */}
      <div className="rounded-2xl border border-gray-800 bg-gradient-to-r from-blue-600/10 to-purple-600/10 p-6">
        <h2 className="text-2xl font-extrabold text-white">Buen dia, Nacho</h2>
        <p className="mt-1 text-sm capitalize text-gray-400">{time}</p>
        <p className="mt-3 text-sm text-gray-300">
          Nexo Articles esta en linea con 150 articulos publicados. Tu equipo de {agents.length} agentes IA esta operativo. {workingAgents.length} trabajando activamente,{' '}
          {analyzingAgents.length} analizando datos. Search Console y Analytics conectados. Google indexando contenido — esperando trafico organico.
        </p>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-3">
        {kpis.map((kpi, i) => (
          <SummaryCard
            key={kpi.name}
            icon={kpiIcons[i] || '📊'}
            label={kpi.name}
            value={kpi.value}
            gradient={kpiGradients[i] || 'bg-gray-500'}
          />
        ))}
      </div>

      {/* Quick alerts */}
      {agentsWithRequests.length > 0 && (
        <div>
          <h3 className="mb-3 text-sm font-bold text-white">Alertas Rapidas</h3>
          <div className="flex flex-wrap gap-3">
            {agentsWithRequests.map((agent) => (
              <button
                key={agent.id}
                onClick={onNavigateToSolicitudes}
                className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-2.5 text-xs transition-all hover:bg-red-500/20 hover:border-red-500/40"
              >
                <span className="text-xl">{agent.avatar}</span>
                <span className="text-gray-300">
                  <span className="font-semibold text-white">{agent.name.split(' ')[0]}</span> tiene{' '}
                  <span className="font-bold text-red-400">{pendingCountMap[agent.id]}</span> solicitud{pendingCountMap[agent.id] > 1 ? 'es' : ''} pendiente{pendingCountMap[agent.id] > 1 ? 's' : ''}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Recent activity */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <h3 className="mb-4 text-sm font-bold text-white">Actividad Reciente</h3>
        <div className="space-y-2">
          {feed.map((item, i) => (
            <div key={i} className="flex items-start gap-3 rounded-xl bg-gray-800/50 p-3 transition-colors hover:bg-gray-800">
              <span className="text-xl">{item.agentAvatar}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{item.agentName}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${DEPT_BADGE[item.department]}`}>
                    {item.department}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-400">{item.action}</p>
              </div>
              <span className="shrink-0 text-[10px] text-gray-600">{item.timestamp}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION: OFICINA (Conference Table)                                */
/* ------------------------------------------------------------------ */

function PixelChar({ color, isTyping, size = 1 }: { color: string; isTyping: boolean; size?: number }) {
  const s = size;
  const skin = '#FDB';
  return (
    <div className="relative" style={{ width: 24*s, height: 32*s, imageRendering: 'pixelated' }}>
      {/* Hair */}
      <div style={{ position: 'absolute', top: 0, left: 5*s, width: 14*s, height: 4*s, backgroundColor: color, borderRadius: `${3*s}px ${3*s}px 0 0` }} />
      {/* Face */}
      <div style={{ position: 'absolute', top: 4*s, left: 5*s, width: 14*s, height: 8*s, backgroundColor: skin, borderRadius: `0 0 ${2*s}px ${2*s}px` }} />
      {/* Eyes */}
      <div style={{ position: 'absolute', top: 7*s, left: 8*s, width: 3*s, height: 2*s, backgroundColor: '#333', borderRadius: '50%' }} />
      <div style={{ position: 'absolute', top: 7*s, left: 14*s, width: 3*s, height: 2*s, backgroundColor: '#333', borderRadius: '50%' }} />
      {/* Mouth */}
      <div style={{ position: 'absolute', top: 10*s, left: 10*s, width: 4*s, height: 1*s, backgroundColor: '#c88', borderRadius: 1*s }} />
      {/* Body */}
      <div style={{ position: 'absolute', top: 12*s, left: 2*s, width: 20*s, height: 12*s, backgroundColor: color, borderRadius: `${2*s}px ${2*s}px 0 0` }}>
        {/* Collar */}
        <div style={{ width: 6*s, height: 2*s, backgroundColor: '#fff8', margin: '0 auto', borderRadius: `0 0 ${2*s}px ${2*s}px` }} />
      </div>
      {/* Arms */}
      <div className={isTyping ? 'animate-pulse' : ''} style={{ position: 'absolute', top: 14*s, left: 0, width: 3*s, height: 8*s, backgroundColor: skin, borderRadius: 1*s, animationDuration: '0.4s' }} />
      <div className={isTyping ? 'animate-pulse' : ''} style={{ position: 'absolute', top: 14*s, right: 0, width: 3*s, height: 8*s, backgroundColor: skin, borderRadius: 1*s, animationDuration: '0.6s' }} />
      {/* Legs */}
      <div style={{ position: 'absolute', top: 24*s, left: 5*s, width: 5*s, height: 6*s, backgroundColor: '#334', borderRadius: `0 0 ${1*s}px ${1*s}px` }} />
      <div style={{ position: 'absolute', top: 24*s, right: 5*s, width: 5*s, height: 6*s, backgroundColor: '#334', borderRadius: `0 0 ${1*s}px ${1*s}px` }} />
      {/* Shoes */}
      <div style={{ position: 'absolute', bottom: 0, left: 4*s, width: 6*s, height: 3*s, backgroundColor: '#222', borderRadius: `0 0 ${2*s}px ${2*s}px` }} />
      <div style={{ position: 'absolute', bottom: 0, right: 4*s, width: 6*s, height: 3*s, backgroundColor: '#222', borderRadius: `0 0 ${2*s}px ${2*s}px` }} />
    </div>
  );
}

function OficinaSection({
  onSelectAgent,
  pendingCountMap,
}: {
  onSelectAgent: (a: Agent) => void;
  pendingCountMap: Record<string, number>;
}) {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [hoveredRoom, setHoveredRoom] = useState<string | null>(null);
  const [typingAgent, setTypingAgent] = useState('marco');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setTick((t) => t + 1);
      const activeIds = ['marco', 'luna', 'carlos', 'diego', 'ana', 'sofia', 'tomas', 'valentina'];
      setTypingAgent(prev => {
        const idx = activeIds.indexOf(prev);
        return activeIds[(idx + 1) % activeIds.length];
      });
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const pixelColors: Record<string, string> = {
    sofia: '#eab308', marco: '#a855f7', luna: '#06b6d4', carlos: '#3b82f6',
    diego: '#f97316', tomas: '#10b981', ana: '#ec4899', valentina: '#22c55e',
  };

  // Collaboration pairs for meeting room indicator
  const collabPairs: { pair: [string, string]; label: string }[] = [
    { pair: ['marco', 'luna'],   label: 'Contenido + SEO' },
    { pair: ['carlos', 'ana'],   label: 'Tecnologia + Datos' },
    { pair: ['diego', 'tomas'],  label: 'Marketing + Ventas' },
  ];

  // ---- Room definitions: position as % of the 16/9 container ----
  // Layout:
  //  Col A: 0–44%   Col B (hall): 44–56%   Col C: 56–100%
  //  Row 1: 0–33%   Row 2: 33–66%          Row 3: 66–100%

  const rooms = [
    {
      id: 'sofia',
      label: 'Oficina de Sofia',
      sublabel: 'CEO - Direccion Ejecutiva',
      x: 0, y: 0, w: 44, h: 33,
      color: pixelColors.sofia,
      agentIds: ['sofia'],
    },
    {
      id: 'meeting',
      label: 'Sala de Reuniones',
      sublabel: 'Mesa de trabajo',
      x: 56, y: 0, w: 44, h: 33,
      color: '#6366f1',
      agentIds: [],
    },
    {
      id: 'redaccion',
      label: 'Redaccion y SEO',
      sublabel: 'Marco + Luna',
      x: 0, y: 33, w: 44, h: 33,
      color: pixelColors.marco,
      agentIds: ['marco', 'luna'],
    },
    {
      id: 'devlab',
      label: 'Tecnologia y Datos',
      sublabel: 'Carlos + Ana',
      x: 56, y: 33, w: 44, h: 33,
      color: pixelColors.carlos,
      agentIds: ['carlos', 'ana'],
    },
    {
      id: 'growth',
      label: 'Marketing y Ventas',
      sublabel: 'Diego + Tomas',
      x: 0, y: 66, w: 44, h: 34,
      color: pixelColors.diego,
      agentIds: ['diego', 'tomas'],
    },
    {
      id: 'finanzas',
      label: 'Finanzas',
      sublabel: 'Valentina',
      x: 56, y: 66, w: 44, h: 34,
      color: pixelColors.valentina,
      agentIds: ['valentina'],
    },
  ];

  // Agent positions within their room (relative to room, in %)
  const agentRoomPos: Record<string, { rx: number; ry: number }> = {
    sofia:     { rx: 50, ry: 58 },
    marco:     { rx: 28, ry: 60 },
    luna:      { rx: 72, ry: 60 },
    carlos:    { rx: 28, ry: 60 },
    ana:       { rx: 72, ry: 60 },
    diego:     { rx: 28, ry: 60 },
    tomas:     { rx: 72, ry: 60 },
    valentina: { rx: 50, ry: 60 },
  };

  // Meeting room chair positions (around oval table), in % of room
  const meetingChairs = [
    { x: 50, y: 15 }, { x: 75, y: 22 }, { x: 88, y: 45 }, { x: 80, y: 70 },
    { x: 60, y: 82 }, { x: 40, y: 82 }, { x: 20, y: 70 }, { x: 12, y: 45 },
  ];
  const meetingChairLabels = ['Sofia', 'Marco', 'Luna', 'Carlos', 'Ana', 'Diego', 'Tomas', 'Valentina'];

  // Active collab pair (cycles with tick)
  const activeCollabIdx = Math.floor(tick / 4) % collabPairs.length;
  const activePair = collabPairs[activeCollabIdx];

  // Helper: desk renderer
  function Desk({ color, monitors = 2 }: { color: string; monitors?: number }) {
    return (
      <div style={{ position: 'relative', display: 'inline-block' }}>
        {/* Monitors */}
        <div style={{ display: 'flex', gap: '3px', justifyContent: 'center', marginBottom: '2px' }}>
          {Array.from({ length: monitors }).map((_, mi) => (
            <div key={mi} style={{
              width: '16px', height: '11px',
              backgroundColor: '#0d1117',
              border: `1px solid ${color}70`,
              borderRadius: '1px',
              boxShadow: `0 0 4px ${color}40`,
              position: 'relative',
              overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', inset: '1px',
                background: `linear-gradient(135deg, ${color}20 0%, transparent 60%)`,
              }} />
              {/* tiny code lines */}
              <div style={{ position: 'absolute', top: '2px', left: '2px', right: '2px', height: '1px', backgroundColor: color, opacity: 0.5 }} />
              <div style={{ position: 'absolute', top: '4px', left: '2px', width: '60%', height: '1px', backgroundColor: color, opacity: 0.3 }} />
              <div style={{ position: 'absolute', top: '6px', left: '2px', width: '80%', height: '1px', backgroundColor: color, opacity: 0.3 }} />
            </div>
          ))}
        </div>
        {/* Desk surface */}
        <div style={{
          width: monitors === 2 ? '38px' : '22px',
          height: '14px',
          backgroundColor: '#2d1f10',
          border: `1px solid ${color}30`,
          borderRadius: '2px',
          boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 2px 4px rgba(0,0,0,0.4)`,
          position: 'relative',
        }}>
          {/* keyboard */}
          <div style={{
            position: 'absolute', bottom: '2px', left: '50%', transform: 'translateX(-50%)',
            width: '18px', height: '3px',
            backgroundColor: '#1a1a2a', border: '1px solid #333', borderRadius: '1px',
          }} />
        </div>
        {/* Chair behind desk */}
        <div style={{
          width: '14px', height: '7px',
          backgroundColor: '#1e1e2e',
          border: '1px solid #333',
          borderRadius: '0 0 4px 4px',
          margin: '2px auto 0',
        }} />
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ====== Header ====== */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2
            className="text-white font-bold tracking-widest uppercase"
            style={{ fontFamily: 'monospace', fontSize: '15px', letterSpacing: '3px', textShadow: '0 0 12px #eab30860' }}
          >
            &#9632; NEXO ARTICLES HQ
          </h2>
          <p className="text-[10px] text-gray-500 mt-1 font-mono">
            {agents.filter(a => a.status === 'working').length} agentes activos &bull; {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
        {/* Live ticker */}
        <div className="hidden sm:flex items-center gap-2 rounded border border-green-500/20 bg-green-500/5 px-3 py-1.5">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-[10px] text-green-400 font-mono">
            {agents.find(a => a.id === typingAgent)?.name.split(' ')[0]}: {agents.find(a => a.id === typingAgent)?.currentTask.slice(0, 30)}...
          </span>
        </div>
      </div>

      {/* ====== Floor Plan Office ====== */}
      <div
        className="rounded-2xl border border-gray-700 bg-gray-950 shadow-2xl overflow-hidden"
        style={{ aspectRatio: '16/9', position: 'relative' }}
      >
        {/* Outer office background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(255,255,255,0.015) 19px, rgba(255,255,255,0.015) 20px), repeating-linear-gradient(90deg, transparent, transparent 19px, rgba(255,255,255,0.015) 19px, rgba(255,255,255,0.015) 20px), #0d1117',
        }} />

        {/* === HALLWAYS === */}
        {/* Vertical hallway */}
        <div style={{
          position: 'absolute',
          left: '44%', top: 0, width: '12%', height: '100%',
          backgroundColor: 'rgba(255,255,255,0.018)',
          borderLeft: '1px solid rgba(100,100,120,0.25)',
          borderRight: '1px solid rgba(100,100,120,0.25)',
        }} />
        {/* Horizontal hallway row1->row2 */}
        <div style={{
          position: 'absolute',
          left: 0, top: '33%', width: '100%', height: '0',
          borderTop: '1px solid rgba(100,100,120,0.25)',
        }} />
        {/* Horizontal hallway row2->row3 */}
        <div style={{
          position: 'absolute',
          left: 0, top: '66%', width: '100%', height: '0',
          borderTop: '1px solid rgba(100,100,120,0.25)',
        }} />

        {/* === HALLWAY LABELS === */}
        <div style={{
          position: 'absolute',
          left: '44%', top: '45%',
          width: '12%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '6px', color: 'rgba(156,163,175,0.35)',
          fontFamily: 'monospace', fontWeight: 'bold', letterSpacing: '2px',
          writingMode: 'vertical-rl', textOrientation: 'mixed',
          userSelect: 'none',
        }}>
          PASILLO
        </div>

        {/* === ROOMS === */}
        {rooms.map((room) => {
          const isHoveredR = hoveredRoom === room.id;
          const isMeetingRoom = room.id === 'meeting';
          const isCollabActive = isMeetingRoom && (tick % 8 < 5);

          return (
            <div
              key={room.id}
              onMouseEnter={() => setHoveredRoom(room.id)}
              onMouseLeave={() => setHoveredRoom(null)}
              style={{
                position: 'absolute',
                left: `${room.x}%`, top: `${room.y}%`,
                width: `${room.w}%`, height: `${room.h}%`,
                boxSizing: 'border-box',
                border: `1px solid rgba(100,100,120,0.3)`,
                borderTop: `2px solid ${room.color}`,
                backgroundColor: isHoveredR
                  ? `${room.color}08`
                  : `${room.color}04`,
                transition: 'background-color 0.3s',
                overflow: 'hidden',
              }}
            >
              {/* Room floor subtle grid */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'repeating-linear-gradient(0deg, transparent, transparent 11px, rgba(255,255,255,0.012) 11px, rgba(255,255,255,0.012) 12px), repeating-linear-gradient(90deg, transparent, transparent 11px, rgba(255,255,255,0.012) 11px, rgba(255,255,255,0.012) 12px)',
                pointerEvents: 'none',
              }} />

              {/* Room label */}
              <div style={{
                position: 'absolute', top: '4px', left: '50%', transform: 'translateX(-50%)',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                zIndex: 2, pointerEvents: 'none',
              }}>
                <span style={{
                  fontSize: '6px', fontFamily: 'monospace', fontWeight: 'bold',
                  color: room.color, letterSpacing: '1.5px', whiteSpace: 'nowrap',
                  textShadow: `0 0 6px ${room.color}60`,
                }}>
                  {room.label.toUpperCase()}
                </span>
                <span style={{
                  fontSize: '5px', fontFamily: 'monospace', color: 'rgba(156,163,175,0.4)',
                  letterSpacing: '0.5px', whiteSpace: 'nowrap',
                }}>
                  {room.sublabel}
                </span>
              </div>

              {/* Door opening — gap in bottom wall */}
              <div style={{
                position: 'absolute', bottom: '-1px',
                left: isMeetingRoom ? '30%' : room.id === 'finanzas' ? '35%' : '40%',
                width: '20%', height: '3px',
                backgroundColor: '#0d1117',
              }} />

              {/* === MEETING ROOM SPECIAL CONTENT === */}
              {isMeetingRoom && (
                <>
                  {/* Oval table */}
                  <div style={{
                    position: 'absolute',
                    left: '20%', top: '30%', width: '60%', height: '45%',
                    backgroundColor: '#2d1f10',
                    borderRadius: '50%',
                    border: `2px solid ${isCollabActive ? '#6366f1' : '#3d2d1a'}`,
                    boxShadow: isCollabActive ? '0 0 12px rgba(99,102,241,0.3)' : '0 2px 8px rgba(0,0,0,0.5)',
                    transition: 'border-color 0.5s, box-shadow 0.5s',
                    zIndex: 2,
                  }}>
                    <div style={{
                      position: 'absolute', inset: '15%',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(255,255,255,0.04), transparent)',
                    }} />
                  </div>

                  {/* 8 chairs around table */}
                  {meetingChairs.map((ch, ci) => (
                    <div
                      key={ci}
                      title={meetingChairLabels[ci]}
                      style={{
                        position: 'absolute',
                        left: `calc(20% + ${ch.x}% * 0.6 - 4px)`,
                        top: `calc(30% + ${ch.y}% * 0.45 - 4px)`,
                        width: '8px', height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#1e1e2e',
                        border: `1px solid rgba(99,102,241,0.4)`,
                        zIndex: 3,
                      }}
                    />
                  ))}

                  {/* Meeting indicator */}
                  {isCollabActive && (
                    <div style={{
                      position: 'absolute', bottom: '8%', left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 5, whiteSpace: 'nowrap',
                      padding: '2px 6px',
                      backgroundColor: 'rgba(99,102,241,0.15)',
                      border: '1px solid rgba(99,102,241,0.5)',
                      borderRadius: '3px',
                    }}>
                      <span style={{ fontSize: '5px', fontFamily: 'monospace', color: '#818cf8', fontWeight: 'bold' }}>
                        &#9670; {activePair.label}
                      </span>
                    </div>
                  )}

                  {/* Hover tooltip */}
                  {isHoveredR && (
                    <div style={{
                      position: 'absolute', top: '20%', left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 10, whiteSpace: 'nowrap',
                      padding: '3px 8px',
                      backgroundColor: 'rgba(0,0,0,0.9)',
                      border: '1px solid #6366f1',
                      borderRadius: '3px',
                    }}>
                      {collabPairs.map((cp) => (
                        <div key={cp.label} style={{ fontSize: '5px', fontFamily: 'monospace', color: '#a5b4fc', margin: '1px 0' }}>
                          {cp.label}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Corner plants */}
                  {[{ l: '3%', t: '6%' }, { l: '88%', t: '6%' }].map((p, pi) => (
                    <div key={pi} style={{ position: 'absolute', left: p.l, top: p.t }}>
                      <div style={{ width: '6px', height: '6px', backgroundColor: '#1a6a2a', borderRadius: '50% 50% 0 50%', transform: 'rotate(-20deg)' }} />
                      <div style={{ width: '5px', height: '5px', backgroundColor: '#1d7a30', borderRadius: '50% 0 50% 50%', marginTop: '-3px', transform: 'rotate(20deg)' }} />
                      <div style={{ width: '5px', height: '4px', backgroundColor: '#7a5030', margin: '0 auto', borderRadius: '0 0 2px 2px' }} />
                    </div>
                  ))}
                </>
              )}

              {/* === SOFIA'S OFFICE === */}
              {room.id === 'sofia' && (
                <>
                  {/* Big CEO desk */}
                  <div style={{
                    position: 'absolute',
                    left: '20%', top: '32%', width: '60%', height: '35%',
                    backgroundColor: '#2d1f10',
                    border: `2px solid ${pixelColors.sofia}40`,
                    borderRadius: '3px',
                    boxShadow: `0 2px 8px rgba(0,0,0,0.5), 0 0 10px ${pixelColors.sofia}15`,
                    zIndex: 2,
                  }}>
                    {/* 3 monitors */}
                    <div style={{ position: 'absolute', top: '-12px', left: '5%', right: '5%', display: 'flex', gap: '4px', justifyContent: 'center' }}>
                      {[0,1,2].map(mi => (
                        <div key={mi} style={{
                          width: '18px', height: '12px',
                          backgroundColor: '#0d1117',
                          border: `1px solid ${pixelColors.sofia}60`,
                          borderRadius: '1px',
                          boxShadow: `0 0 5px ${pixelColors.sofia}30`,
                        }}>
                          <div style={{ width: '100%', height: '100%', background: `radial-gradient(ellipse at 50% 20%, ${pixelColors.sofia}25, transparent)` }} />
                        </div>
                      ))}
                    </div>
                    {/* Keyboard */}
                    <div style={{
                      position: 'absolute', bottom: '4px', left: '50%', transform: 'translateX(-50%)',
                      width: '30px', height: '5px',
                      backgroundColor: '#1a1a2a', border: '1px solid #333', borderRadius: '1px',
                    }} />
                  </div>
                  {/* CEO chair */}
                  <div style={{
                    position: 'absolute',
                    left: '50%', top: '68%', transform: 'translateX(-50%)',
                    width: '18px', height: '10px',
                    backgroundColor: '#1e1e2e', border: `1px solid ${pixelColors.sofia}30`,
                    borderRadius: '0 0 5px 5px',
                    zIndex: 2,
                  }} />
                  {/* Corner plants */}
                  {[{ l: '3%', t: '8%' }, { l: '88%', t: '8%' }].map((p, pi) => (
                    <div key={pi} style={{ position: 'absolute', left: p.l, top: p.t }}>
                      <div style={{ width: '6px', height: '6px', backgroundColor: '#1a6a2a', borderRadius: '50% 50% 0 50%', transform: 'rotate(-20deg)' }} />
                      <div style={{ width: '5px', height: '5px', backgroundColor: '#1d7a30', borderRadius: '50% 0 50% 50%', marginTop: '-3px', transform: 'rotate(20deg)' }} />
                      <div style={{ width: '5px', height: '4px', backgroundColor: '#7a5030', margin: '0 auto', borderRadius: '0 0 2px 2px' }} />
                    </div>
                  ))}
                </>
              )}

              {/* === TWO-PERSON ROOMS (redaccion, devlab, growth) === */}
              {['redaccion', 'devlab', 'growth'].includes(room.id) && (
                <div style={{
                  position: 'absolute',
                  left: '8%', top: '38%', right: '8%',
                  display: 'flex', gap: '8%', justifyContent: 'center',
                  zIndex: 2, pointerEvents: 'none',
                }}>
                  <Desk color={pixelColors[room.agentIds[0]] || '#888'} monitors={2} />
                  <Desk color={pixelColors[room.agentIds[1]] || '#888'} monitors={2} />
                </div>
              )}

              {/* === FINANZAS (single desk) === */}
              {room.id === 'finanzas' && (
                <div style={{
                  position: 'absolute',
                  left: '50%', top: '38%', transform: 'translateX(-50%)',
                  zIndex: 2, pointerEvents: 'none',
                }}>
                  <Desk color={pixelColors.valentina} monitors={2} />
                </div>
              )}

            </div>
          );
        })}

        {/* === PIXEL CHARACTERS === */}
        {rooms.flatMap((room) =>
          room.agentIds.map((agentId) => {
            const agent = agents.find(a => a.id === agentId);
            if (!agent) return null;
            const pos = agentRoomPos[agentId] || { rx: 50, ry: 60 };
            // Absolute position: room top-left + relative pos within room
            const absX = room.x + pos.rx * room.w / 100;
            const absY = room.y + pos.ry * room.h / 100;
            const pending = pendingCountMap[agent.id] || 0;
            const firstName = agent.name.split(' ')[0];
            const isActive = agent.status === 'working' || agent.status === 'analyzing';
            const isHovered = hoveredAgent === agentId;
            const isTypingNow = typingAgent === agentId && isActive;

            return (
              <button
                key={agentId}
                onClick={() => onSelectAgent(agent)}
                onMouseEnter={() => setHoveredAgent(agentId)}
                onMouseLeave={() => setHoveredAgent(null)}
                className="absolute flex flex-col items-center hover:scale-110"
                style={{
                  left: `${absX}%`,
                  top: `${absY}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: isHovered ? 25 : 10,
                  transition: 'transform 0.2s',
                }}
              >
                {/* Hover speech bubble */}
                {isHovered && (
                  <div
                    className="absolute whitespace-nowrap"
                    style={{ bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '4px', zIndex: 30 }}
                  >
                    <div style={{
                      padding: '3px 7px',
                      backgroundColor: 'rgba(0,0,0,0.95)',
                      border: `1px solid ${pixelColors[agentId]}`,
                      borderRadius: '4px',
                      fontSize: '7px',
                      color: '#fff',
                      fontFamily: 'monospace',
                      maxWidth: '120px',
                      textOverflow: 'ellipsis',
                      overflow: 'hidden',
                    }}>
                      {agent.currentTask.slice(0, 28)}...
                    </div>
                    <div style={{
                      width: '4px', height: '4px',
                      backgroundColor: 'rgba(0,0,0,0.95)',
                      border: `1px solid ${pixelColors[agentId]}`,
                      borderTop: 'none', borderLeft: 'none',
                      transform: 'rotate(45deg)',
                      margin: '-2px auto 0',
                    }} />
                  </div>
                )}

                {/* Typing bubble */}
                {isTypingNow && !isHovered && (
                  <div
                    className="absolute whitespace-nowrap animate-bounce"
                    style={{ bottom: '100%', left: '50%', transform: 'translateX(-50%)', marginBottom: '4px', animationDuration: '2.5s' }}
                  >
                    <div style={{
                      padding: '2px 5px',
                      backgroundColor: 'rgba(0,0,0,0.9)',
                      border: `1px solid ${pixelColors[agentId]}80`,
                      borderRadius: '3px',
                      fontSize: '6px',
                      color: pixelColors[agentId],
                      fontFamily: 'monospace',
                    }}>
                      &#9679;&#9679;&#9679;
                    </div>
                  </div>
                )}

                {/* Active pulse dot */}
                {isActive && (
                  <div
                    className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 animate-pulse"
                    style={{ zIndex: 15, animationDuration: '1.5s' }}
                  />
                )}

                {/* Pixel character */}
                <PixelChar color={pixelColors[agentId] || '#888'} isTyping={isTypingNow} size={0.8} />

                {/* Name tag */}
                <div style={{ marginTop: '1px', textAlign: 'center', pointerEvents: 'none' }}>
                  <span style={{
                    fontSize: '6px', fontFamily: 'monospace', fontWeight: 'bold',
                    color: pixelColors[agentId],
                    display: 'block',
                  }}>
                    {firstName}
                  </span>
                </div>

                {/* Pending badge */}
                {pending > 0 && (
                  <span
                    className="absolute -top-1.5 -right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[6px] font-bold text-white animate-bounce"
                    style={{ animationDuration: '2s', zIndex: 20 }}
                  >
                    {pending}
                  </span>
                )}

                {/* Hover glow ring */}
                {isHovered && (
                  <div
                    className="absolute inset-0 rounded-lg pointer-events-none"
                    style={{ boxShadow: `0 0 14px ${pixelColors[agentId]}60` }}
                  />
                )}
              </button>
            );
          })
        )}

        {/* === HALLWAY ELEMENTS === */}
        {/* Coffee machine */}
        <div style={{ position: 'absolute', left: '45%', top: '36%', zIndex: 5 }}>
          <div style={{ width: '10px', height: '12px', backgroundColor: '#333', border: '1px solid #555', borderRadius: '2px 2px 0 0' }}>
            <div style={{ width: '5px', height: '4px', backgroundColor: '#c44', borderRadius: '50%', margin: '1px auto', boxShadow: '0 0 3px #c44' }} />
          </div>
        </div>
        {/* Water cooler */}
        <div style={{ position: 'absolute', left: '45%', top: '68%', zIndex: 5 }}>
          <div style={{ width: '8px', height: '7px', backgroundColor: '#5af', borderRadius: '4px 4px 2px 2px', border: '1px solid #28a', margin: '0 auto', boxShadow: '0 0 4px rgba(80,160,255,0.4)' }} />
          <div style={{ width: '10px', height: '10px', backgroundColor: '#444', borderRadius: '1px', margin: '0 auto', border: '1px solid #555' }} />
        </div>

      </div>

      {/* ====== Agent Status Strip ====== */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {agents.map((agent) => {
          const isActive = agent.status === 'working';
          const color = pixelColors[agent.id] || '#888';
          const isTypingNow = typingAgent === agent.id;
          return (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className="flex flex-col items-center gap-1 rounded-lg border p-2 transition-all hover:scale-105"
              style={{
                borderColor: isTypingNow ? color + '60' : isActive ? '#22c55e30' : '#1f2937',
                backgroundColor: isTypingNow ? color + '10' : isActive ? 'rgba(34,197,94,0.04)' : 'rgba(17,24,39,0.4)',
              }}
            >
              <div className="scale-75">
                <PixelChar color={color} isTyping={isTypingNow} size={1} />
              </div>
              <span className="text-[8px] font-mono font-bold" style={{ color }}>{agent.name.split(' ')[0]}</span>
              <span className={`text-[7px] px-1 py-0.5 rounded font-mono ${
                agent.status === 'working'   ? 'bg-green-500/20 text-green-400' :
                agent.status === 'analyzing' ? 'bg-blue-500/20 text-blue-400'  :
                'bg-gray-700/40 text-gray-500'
              }`}>
                {agent.status === 'working' ? 'ON' : agent.status === 'analyzing' ? 'SCAN' : 'IDLE'}
              </span>
            </button>
          );
        })}
      </div>

      {/* ====== Terminal del Equipo ====== */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white font-mono">
          <span className="text-green-400">&gt;_</span> Terminal del Equipo
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {agents.map((agent) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (agent as any).messageToOwner as string | undefined;
            const color = pixelColors[agent.id] || '#888';
            return (
              <div
                key={agent.id}
                className="rounded-lg border border-gray-700/50 bg-gray-950/80 p-3 transition-all hover:border-gray-600 cursor-pointer font-mono"
                onClick={() => onSelectAgent(agent)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="scale-50 -mx-1">
                    <PixelChar color={color} isTyping={false} size={1} />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold" style={{ color }}>{agent.name}</p>
                    <p className="text-[8px] text-gray-600">{agent.department}</p>
                  </div>
                  <div className="ml-auto"><StatusDot status={agent.status} /></div>
                </div>
                <p className="text-[10px] text-green-400/70 leading-relaxed">
                  <span className="text-gray-600">&gt; </span>
                  {msg || `Trabajando en: ${agent.currentTask.length > 50 ? agent.currentTask.slice(0, 48) + '..' : agent.currentTask}`}
                </p>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION: DEPARTAMENTOS                                             */
/* ------------------------------------------------------------------ */

function DepartamentosSection({
  onSelectAgent,
  pendingCountMap,
}: {
  onSelectAgent: (a: Agent) => void;
  pendingCountMap: Record<string, number>;
}) {
  const [expandedDept, setExpandedDept] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-extrabold text-white">Departamentos</h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {ALL_DEPARTMENTS.map((dept) => {
          const stats = getDepartmentStats(dept);
          const deptAgents = agents.filter((a) => a.department === dept);
          if (deptAgents.length === 0) return null;
          const isExpanded = expandedDept === dept;

          return (
            <div
              key={dept}
              className={`rounded-2xl border ${DEPT_BORDER[dept]} bg-gray-900/60 overflow-hidden transition-all ${
                isExpanded ? 'sm:col-span-2 xl:col-span-3' : ''
              }`}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedDept(isExpanded ? null : dept)}
                className={`flex w-full items-center justify-between px-5 py-3 transition-colors ${DEPT_HEADER_BG[dept]} hover:opacity-90`}
              >
                <div className="flex items-center gap-3">
                  <span className={`h-3 w-3 rounded-full ${DEPT_BG[dept]}`} />
                  <span className={`text-sm font-bold ${DEPT_TEXT[dept]}`}>{dept}</span>
                  <span className="text-xs text-gray-500">{stats.totalAgents} agente{stats.totalAgents > 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-[11px] text-gray-500">
                    Tareas: <span className="font-mono font-bold text-white">{stats.totalTasks}</span>
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Eficiencia: <span className="font-mono font-bold text-white">{stats.avgEfficiency}%</span>
                  </span>
                  <span className="text-[11px] text-gray-500">
                    Activos: <span className="font-mono font-bold text-white">{stats.activeAgents}/{stats.totalAgents}</span>
                  </span>
                  <span className={`text-sm transition-transform duration-200 text-gray-500 ${isExpanded ? 'rotate-180' : ''}`}>&#9660;</span>
                </div>
              </button>

              {/* Agent list (collapsed) */}
              {!isExpanded && (
                <div className="px-5 py-3 flex gap-2">
                  {deptAgents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => onSelectAgent(agent)}
                      className="flex items-center gap-2 rounded-lg bg-gray-800/60 px-3 py-2 text-xs transition hover:bg-gray-800 hover:scale-[1.02]"
                    >
                      <span className="text-lg">{agent.avatar}</span>
                      <span className="text-gray-300 font-medium">{agent.name.split(' ')[0]}</span>
                      <StatusDot status={agent.status} />
                      {(pendingCountMap[agent.id] || 0) > 0 && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                          {pendingCountMap[agent.id]}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Expanded view */}
              {isExpanded && (
                <div className="p-5 space-y-4">
                  {deptAgents.map((agent) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const ax = agent as any;
                    const agentGoals = ax.goals as string[] | undefined;
                    const agentIdeas = ax.ideas as string[] | undefined;
                    const agentProjections = ax.projections as { metric: string; current: string; projected: string; timeframe: string }[] | undefined;
                    const agentKpis = ax.kpis as { name: string; value: string; trend: 'up' | 'down' | 'stable' }[] | undefined;
                    const agentWeekly = ax.weeklyProgress as { week: string; tasks: number; efficiency: number }[] | undefined;
                    const agentImprovements = ax.improvements as string[] | undefined;
                    const agentNextActions = ax.nextActions as string[] | undefined;
                    const agentBlockers = ax.blockers as string[] | undefined;

                    return (
                      <div key={agent.id} className="rounded-xl border border-gray-800 bg-gray-800/40 p-5">
                        {/* Agent header */}
                        <div className="flex items-center gap-3 mb-4">
                          <button onClick={() => onSelectAgent(agent)} className={`flex h-12 w-12 items-center justify-center rounded-xl ring-2 ${DEPT_RING[agent.department]} transition hover:scale-105`} style={{ background: 'rgba(20,20,30,0.9)' }}>
                            <span className="text-2xl">{agent.avatar}</span>
                          </button>
                          <div className="flex-1">
                            <p className="text-sm font-bold text-white">{agent.name}</p>
                            <p className="text-xs text-gray-500">{agent.role}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <StatusDot status={agent.status} size="lg" />
                            <span className={`text-xs font-medium ${agent.status === 'working' ? 'text-green-400' : agent.status === 'analyzing' ? 'text-yellow-400' : 'text-gray-500'}`}>
                              {statusLabel(agent.status)}
                            </span>
                          </div>
                        </div>

                        {/* Stats row */}
                        <div className="grid grid-cols-4 gap-2 mb-4">
                          <div className="rounded-lg bg-gray-900/60 p-2 text-center">
                            <p className="text-lg font-extrabold text-white">{agent.completedTasks}</p>
                            <p className="text-[9px] text-gray-500">Tareas</p>
                          </div>
                          <div className="rounded-lg bg-gray-900/60 p-2 text-center">
                            <p className="text-lg font-extrabold text-white">{agent.efficiency}%</p>
                            <p className="text-[9px] text-gray-500">Eficiencia</p>
                          </div>
                          <div className="rounded-lg bg-gray-900/60 p-2 text-center">
                            <p className="text-lg font-extrabold text-white">{agent.energy}%</p>
                            <p className="text-[9px] text-gray-500">Energia</p>
                          </div>
                          <div className="rounded-lg bg-gray-900/60 p-2 text-center">
                            <p className="text-lg font-extrabold text-white">{agent.streak}</p>
                            <p className="text-[9px] text-gray-500">Racha</p>
                          </div>
                        </div>

                        {/* Current task */}
                        <div className="rounded-lg bg-gray-900/40 p-3 mb-4">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">Tarea Actual</p>
                          <p className="text-xs text-gray-300">{agent.currentTask}</p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                          {/* Goals */}
                          {agentGoals && agentGoals.length > 0 && (
                            <div className="rounded-lg bg-gray-900/40 p-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-yellow-400 mb-2">Objetivos</p>
                              <ul className="space-y-1">
                                {agentGoals.map((g, i) => (
                                  <li key={i} className="text-[11px] text-gray-300 flex items-start gap-1.5">
                                    <span className="text-yellow-400 mt-0.5">&#9733;</span>{g}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Ideas */}
                          {agentIdeas && agentIdeas.length > 0 && (
                            <div className="rounded-lg bg-gray-900/40 p-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-purple-400 mb-2">Ideas</p>
                              <ul className="space-y-1">
                                {agentIdeas.map((idea, i) => (
                                  <li key={i} className="text-[11px] text-gray-300 flex items-start gap-1.5">
                                    <span className="text-purple-400 mt-0.5">&#9670;</span>{idea}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* KPIs with trends */}
                          {agentKpis && agentKpis.length > 0 && (
                            <div className="rounded-lg bg-gray-900/40 p-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">KPIs</p>
                              <div className="space-y-1.5">
                                {agentKpis.map((kpi, i) => (
                                  <div key={i} className="flex items-center justify-between text-[11px]">
                                    <span className="text-gray-400">{kpi.name}</span>
                                    <span className="flex items-center gap-1.5">
                                      <span className="font-mono font-bold text-white">{kpi.value}</span>
                                      <TrendArrow trend={kpi.trend} />
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Projections */}
                          {agentProjections && agentProjections.length > 0 && (
                            <div className="rounded-lg bg-gray-900/40 p-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-green-400 mb-2">Proyecciones</p>
                              <div className="space-y-2">
                                {agentProjections.map((p, i) => (
                                  <div key={i}>
                                    <p className="text-[11px] font-semibold text-white">{p.metric}</p>
                                    <div className="flex gap-2 text-[10px]">
                                      <span className="text-gray-400">{p.current}</span>
                                      <span className="text-green-400">→ {p.projected}</span>
                                      <span className="text-gray-600">{p.timeframe}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Weekly Progress bar chart */}
                          {agentWeekly && agentWeekly.length > 0 && (
                            <div className="rounded-lg bg-gray-900/40 p-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-cyan-400 mb-2">Progreso Semanal</p>
                              <div className="flex items-end gap-1.5 h-16">
                                {agentWeekly.map((w, i) => {
                                  const maxTasks = Math.max(...agentWeekly.map((wk) => wk.tasks), 1);
                                  const barH = (w.tasks / maxTasks) * 100;
                                  return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                                      <span className="text-[8px] text-gray-500 font-mono">{w.tasks}</span>
                                      <div className="w-full rounded-t bg-cyan-500/70 transition-all" style={{ height: `${barH}%`, minHeight: 2 }} />
                                      <span className="text-[8px] text-gray-600">{w.week}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Improvements */}
                          {agentImprovements && agentImprovements.length > 0 && (
                            <div className="rounded-lg bg-gray-900/40 p-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-green-400 mb-2">Auto-Mejoras</p>
                              <ul className="space-y-1">
                                {agentImprovements.map((imp, i) => (
                                  <li key={i} className="text-[11px] text-gray-300 flex items-start gap-1.5">
                                    <span className="text-green-400 mt-0.5">&#10003;</span>{imp}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Next Actions */}
                          {agentNextActions && agentNextActions.length > 0 && (
                            <div className="rounded-lg bg-gray-900/40 p-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-2">Proximas Acciones</p>
                              <ul className="space-y-1">
                                {agentNextActions.map((a, i) => (
                                  <li key={i} className="text-[11px] text-gray-300 flex items-start gap-1.5">
                                    <span className="text-blue-400 mt-0.5">&#9656;</span>{a}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* Blockers */}
                          {agentBlockers && agentBlockers.length > 0 && (
                            <div className="rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                              <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mb-2">Bloqueos</p>
                              <ul className="space-y-1">
                                {agentBlockers.map((b, i) => (
                                  <li key={i} className="text-[11px] text-red-300 flex items-start gap-1.5">
                                    <span className="mt-0.5">&#9888;</span>{b}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION: SOLICITUDES                                               */
/* ------------------------------------------------------------------ */

function SolicitudesSection({
  requests,
  approvedIds,
  rejectedIds,
  onApprove,
  onReject,
  approvalResponses,
  approvalLoading,
}: {
  requests: AccessRequest[];
  approvedIds: Set<string>;
  rejectedIds: Set<string>;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  approvalResponses: Record<string, string>;
  approvalLoading: Record<string, boolean>;
}) {
  const pending = requests.filter(
    (r) => !approvedIds.has(r.id) && !rejectedIds.has(r.id)
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-lg font-extrabold text-white">Solicitudes Pendientes</h2>
        <p className="mb-4 text-sm text-gray-500">
          Tu equipo necesita tu aprobacion para avanzar.
        </p>

        {pending.length > 0 ? (
          <div className="space-y-3">
            {pending.map((req) => {
              const agent = getAgentById(req.agentId);
              return (
                <div key={req.id} className="rounded-xl border border-gray-700 bg-gray-800/80 p-5 transition-all hover:border-gray-600">
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{agent?.avatar}</span>
                      <div>
                        <p className="text-sm font-bold text-white">{agent?.name}</p>
                        <p className="text-xs text-gray-500">{agent?.department}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${priorityStyles[req.priority]}`}>
                        {req.priority}
                      </span>
                      <span className="text-lg">{typeIcons[req.type]}</span>
                    </div>
                  </div>
                  <h4 className="mb-1 text-sm font-semibold text-white">{req.title}</h4>
                  <p className="mb-3 text-xs leading-relaxed text-gray-400">{req.description}</p>
                  <div className="mb-4 flex flex-wrap gap-3 text-[11px]">
                    <span className="text-green-400">Impacto: {req.estimatedImpact}</span>
                    {req.cost && <span className="text-yellow-400">Costo: {req.cost}</span>}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onApprove(req.id)}
                      className="flex-1 rounded-lg bg-green-600 py-2.5 text-xs font-bold text-white transition hover:bg-green-500 active:scale-95"
                    >
                      Aprobar y Ejecutar
                    </button>
                    <button
                      onClick={() => onReject(req.id)}
                      className="flex-1 rounded-lg bg-gray-700 py-2.5 text-xs font-bold text-gray-300 transition hover:bg-gray-600 active:scale-95"
                    >
                      Rechazar → Alternativas
                    </button>
                  </div>
                  {/* Agent AI response after approval/rejection */}
                  {approvalLoading[req.id] && (
                    <div className="mt-3 flex items-center gap-3 rounded-lg bg-purple-500/10 border border-purple-500/20 p-3">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-400 border-t-transparent" />
                      <p className="text-xs text-purple-300">{agent?.name?.split(' ')[0]} esta trabajando en esto...</p>
                    </div>
                  )}
                  {approvalResponses[req.id] && !approvalLoading[req.id] && (
                    <div className={`mt-3 rounded-lg p-3 border ${approvedIds.has(req.id) ? 'bg-green-500/5 border-green-500/20' : 'bg-yellow-500/5 border-yellow-500/20'}`}>
                      <p className="text-[10px] font-bold uppercase tracking-wider mb-1 ${approvedIds.has(req.id) ? 'text-green-400' : 'text-yellow-400'}">
                        {approvedIds.has(req.id) ? '✅ Ejecutando' : '🔄 Alternativas propuestas'}
                      </p>
                      <p className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{approvalResponses[req.id]}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-10 text-center">
            <span className="text-4xl">🎉</span>
            <p className="mt-3 text-sm font-semibold text-gray-400">
              No hay solicitudes pendientes. Tu equipo esta trabajando sin bloqueos.
            </p>
          </div>
        )}
      </div>

      {/* Approved */}
      {approvedIds.size > 0 && (
        <div className="rounded-2xl border border-green-500/20 bg-green-900/10 p-5">
          <h3 className="mb-3 text-sm font-bold text-green-400">Aprobadas ({approvedIds.size})</h3>
          <div className="space-y-2">
            {requests
              .filter((r) => approvedIds.has(r.id))
              .map((r) => {
                const agent = getAgentById(r.agentId);
                return (
                  <div key={r.id} className="flex items-center gap-3 rounded-lg bg-green-500/10 px-4 py-2.5">
                    <span className="text-lg">{agent?.avatar}</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-white">{r.title}</p>
                      <p className="text-[10px] text-green-400">{agent?.name} — {agent?.department}</p>
                    </div>
                    <span className="text-xs font-bold text-green-400">Aprobada</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Rejected */}
      {rejectedIds.size > 0 && (
        <div className="rounded-2xl border border-red-500/20 bg-red-900/10 p-5">
          <h3 className="mb-3 text-sm font-bold text-red-400">Rechazadas ({rejectedIds.size})</h3>
          <div className="space-y-2">
            {requests
              .filter((r) => rejectedIds.has(r.id))
              .map((r) => {
                const agent = getAgentById(r.agentId);
                return (
                  <div key={r.id} className="flex items-center gap-3 rounded-lg bg-red-500/10 px-4 py-2.5">
                    <span className="text-lg">{agent?.avatar}</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-white">{r.title}</p>
                      <p className="text-[10px] text-red-400">{agent?.name} — {agent?.department}</p>
                    </div>
                    <span className="text-xs font-bold text-red-400">Rechazada</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION: ACTIVIDAD                                                 */
/* ------------------------------------------------------------------ */

function ActividadSection() {
  const feed = getActivityFeed();
  const [filterDept, setFilterDept] = useState<string>('all');

  const filteredFeed = filterDept === 'all' ? feed : feed.filter((item) => item.department === filterDept);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-white">Feed de Actividad</h2>
        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-xs text-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Todos los departamentos</option>
          {ALL_DEPARTMENTS.map((dept) => (
            <option key={dept} value={dept}>{dept}</option>
          ))}
        </select>
      </div>

      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        <div className="max-h-[600px] space-y-2 overflow-y-auto pr-1">
          {filteredFeed.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-xl bg-gray-800/50 p-3 transition-colors hover:bg-gray-800"
            >
              <span className="text-xl">{item.agentAvatar}</span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{item.agentName}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[9px] font-medium ${DEPT_BADGE[item.department]}`}>
                    {item.department}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-gray-400">{item.action}</p>
              </div>
              <span className="shrink-0 text-[10px] text-gray-600">{item.timestamp}</span>
            </div>
          ))}
          {filteredFeed.length === 0 && (
            <p className="py-8 text-center text-sm text-gray-600">No hay actividad en este departamento.</p>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION: CALENDARIO                                                 */
/* ------------------------------------------------------------------ */

function CalendarioSection() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => { const d = new Date(); return { year: d.getFullYear(), month: d.getMonth() }; });
  const [completedTasks, setCompletedTasks] = useState<Record<string, 'verified' | 'failed' | 'checking'>>({});
  const [reportData, setReportData] = useState<Record<string, string>>({});
  const [loadingReport, setLoadingReport] = useState<string | null>(null);
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  const [taskInputs, setTaskInputs] = useState<Record<string, string>>({});
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [dynamicStatus, setDynamicStatus] = useState<any>(null);
  const today = new Date();

  // Load saved task inputs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexo_task_inputs');
      if (saved) setTaskInputs(JSON.parse(saved));
    } catch { /* ignore */ }
    // Load dynamic status from Sofia's daily updates
    fetch('/status.json').then(r => r.ok ? r.json() : null).then(d => { if (d) setDynamicStatus(d); }).catch(() => {});
  }, []);

  const saveTaskInput = (key: string, value: string) => {
    const updated = { ...taskInputs, [key]: value };
    setTaskInputs(updated);
    try { localStorage.setItem('nexo_task_inputs', JSON.stringify(updated)); } catch { /* ignore */ }
  };

  const generateReport = async (taskKey: string, weekNum: number, reportType: string) => {
    setLoadingReport(taskKey);
    try {
      const prompt = reportType === 'semanal'
        ? `Sos Sofia, CEO de Nexo Articles. Genera el informe semanal #${weekNum} para Nacho. Incluí: 1) Estado general del negocio 2) Articulos publicados (150 base + cron diario) 3) Estado SEO e indexacion en Google 4) Metricas clave 5) Proximos pasos. Se breve y concreta, usa bullet points. El sitio es ia-negocio.vercel.app con 150+ articulos de IA para negocios en español.`
        : reportType === 'mensual'
        ? `Sos Sofia, CEO de Nexo Articles. Genera el informe mensual para Nacho. Incluí: 1) Resumen ejecutivo del mes 2) Crecimiento de contenido 3) Trafico organico y tendencias SEO 4) Estado de monetizacion (AdSense/afiliados) 5) Recomendaciones estrategicas 6) Plan para el proximo mes. Se concreta. El sitio es ia-negocio.vercel.app.`
        : `Sos Sofia, CEO de Nexo Articles. Genera el informe trimestral para Nacho. Incluí: 1) Resumen de 3 meses 2) Metricas de crecimiento 3) Ingresos generados 4) ROI del proyecto 5) Evaluacion de replicar el modelo en Nexo Web, Nexo Trade y Melococo 6) Plan Q2. Se concreta.`;
      const res = await fetch('/api/agent-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agentId: 'sofia', task: prompt }),
      });
      const data = await res.json();
      if (data.response) {
        setReportData(prev => ({ ...prev, [taskKey]: data.response }));
      } else {
        setReportData(prev => ({ ...prev, [taskKey]: 'Error: No se pudo generar el informe. Verifica que tengas credito en la API.' }));
      }
    } catch {
      setReportData(prev => ({ ...prev, [taskKey]: 'Error de conexion. Intenta de nuevo.' }));
    }
    setLoadingReport(null);
  };
  const todayStr = today.toISOString().split('T')[0];

  // Load completed tasks from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('nexo_calendar_completed');
      if (saved) setCompletedTasks(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  const saveCompleted = (updated: Record<string, 'verified' | 'failed' | 'checking'>) => {
    setCompletedTasks(updated);
    try { localStorage.setItem('nexo_calendar_completed', JSON.stringify(updated)); } catch { /* ignore */ }
  };

  const [verifyMsg, setVerifyMsg] = useState<Record<string, string>>({});

  const verifyTask = async (taskKey: string, task: { link?: string; section?: string; task: string; agent: string; inputs?: { label: string; placeholder: string; inputKey: string }[] }) => {
    const updated = { ...completedTasks, [taskKey]: 'checking' as const };
    setCompletedTasks(updated);
    setVerifyMsg(prev => ({ ...prev, [taskKey]: '' }));

    await new Promise(r => setTimeout(r, 1200)); // Simular verificacion

    // Si la tarea tiene inputs, verificar que esten completos y con formato valido
    if (task.inputs && task.inputs.length > 0) {
      const missing: string[] = [];
      const invalid: string[] = [];

      for (const inp of task.inputs) {
        const val = (taskInputs[inp.inputKey] || '').trim();
        if (!val) {
          missing.push(inp.label);
          continue;
        }
        // Validaciones de formato segun tipo
        if (inp.inputKey === 'paypal_email') {
          const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
          if (!emailRegex.test(val)) {
            invalid.push(`${inp.label}: "${val}" no es un email valido. Necesito tu email real de PayPal.`);
          }
        } else if (inp.inputKey === 'affiliate_jasper') {
          if (!val.startsWith('https://') || !val.toLowerCase().includes('jasper')) {
            invalid.push(`${inp.label}: el link debe ser de Jasper (contener "jasper" en la URL). Lo que pusiste no es un link de afiliado de Jasper. Entra a jasper.ai/partners, registrate, y copia tu link de referido.`);
          }
        } else if (inp.inputKey === 'affiliate_canva') {
          if (!val.startsWith('https://') || (!val.toLowerCase().includes('canva') && !val.toLowerCase().includes('pxf.io'))) {
            invalid.push(`${inp.label}: el link debe ser de Canva (contener "canva" o "pxf.io" en la URL). Lo que pusiste no es un link de afiliado de Canva. Entra a canva.com/affiliates, registrate, y copia tu link.`);
          }
        } else if (inp.inputKey === 'affiliate_hostinger') {
          if (!val.startsWith('https://') || !val.toLowerCase().includes('hostinger')) {
            invalid.push(`${inp.label}: el link debe ser de Hostinger (contener "hostinger" en la URL). Lo que pusiste no es un link de afiliado de Hostinger. Entra a hostinger.com/affiliates, registrate, y copia tu link.`);
          }
        } else if (inp.inputKey === 'adsense_code') {
          if (!/^ca-pub-\d{10,20}$/.test(val)) {
            invalid.push(`${inp.label}: debe tener formato "ca-pub-" seguido de 10-20 numeros. Ej: ca-pub-1234567890123456`);
          }
        } else if (inp.inputKey === 'adsense_cbu') {
          if (val.length !== 22 || !/^\d{22}$/.test(val)) {
            invalid.push(`${inp.label}: debe ser un CBU de exactamente 22 digitos numericos`);
          }
        }
      }

      if (missing.length > 0) {
        const u = { ...completedTasks, [taskKey]: 'failed' as const };
        saveCompleted(u);
        setVerifyMsg(prev => ({ ...prev, [taskKey]: `Te falta completar: ${missing.join(', ')}. Toca "Como hacer?" y completa los campos.` }));
        return;
      }
      if (invalid.length > 0) {
        const u = { ...completedTasks, [taskKey]: 'failed' as const };
        saveCompleted(u);
        setVerifyMsg(prev => ({ ...prev, [taskKey]: invalid.join('. ') }));
        return;
      }

      // Todo completo y formato valido
      const u = { ...completedTasks, [taskKey]: 'verified' as const };
      saveCompleted(u);
      setVerifyMsg(prev => ({ ...prev, [taskKey]: `Datos verificados correctamente. ${task.agent} ya tiene acceso.` }));
      return;
    }

    // Tareas sin inputs — verificar por tipo
    if (task.task.includes('Informe')) {
      // Informes: verificar si hay reporte generado
      if (reportData[taskKey]) {
        const u = { ...completedTasks, [taskKey]: 'verified' as const };
        saveCompleted(u);
        setVerifyMsg(prev => ({ ...prev, [taskKey]: 'Informe leido.' }));
      } else {
        const u = { ...completedTasks, [taskKey]: 'failed' as const };
        saveCompleted(u);
        setVerifyMsg(prev => ({ ...prev, [taskKey]: 'Primero tenes que tocar "Ver informe" para generarlo y leerlo.' }));
      }
      return;
    }

    if (task.task.includes('credito API')) {
      try {
        const res = await fetch('/api/agent-action', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ agentId: 'sofia', task: 'Di OK en una palabra' }) });
        if (res.ok) {
          const u = { ...completedTasks, [taskKey]: 'verified' as const };
          saveCompleted(u);
          setVerifyMsg(prev => ({ ...prev, [taskKey]: 'API funcionando correctamente. Hay credito disponible.' }));
        } else {
          const u = { ...completedTasks, [taskKey]: 'failed' as const };
          saveCompleted(u);
          setVerifyMsg(prev => ({ ...prev, [taskKey]: 'La API no responde. Recarga credito en console.anthropic.com/settings/billing' }));
        }
      } catch {
        const u = { ...completedTasks, [taskKey]: 'failed' as const };
        saveCompleted(u);
        setVerifyMsg(prev => ({ ...prev, [taskKey]: 'Error de conexion. Verifica tu credito.' }));
      }
      return;
    }

    // Default — tareas sin requisitos especiales
    const u = { ...completedTasks, [taskKey]: 'verified' as const };
    saveCompleted(u);
    setVerifyMsg(prev => ({ ...prev, [taskKey]: 'Completado.' }));
  };

  const resetTask = (taskKey: string) => {
    const updated = { ...completedTasks };
    delete updated[taskKey];
    saveCompleted(updated);
  };

  // Tareas por fecha (key = YYYY-MM-DD)
  type CalTask = { agent: string; avatar: string; task: string; priority: 'alta' | 'media' | 'baja'; link?: string; section?: string; steps?: string[]; inputs?: { label: string; placeholder: string; inputKey: string }[] };
  const allTasks: Record<string, CalTask[]> = {};

  const addTask = (daysFromNow: number, t: CalTask) => {
    const d = new Date(today.getTime() + daysFromNow * 86400000);
    const key = d.toISOString().split('T')[0];
    if (!allTasks[key]) allTasks[key] = [];
    allTasks[key].push(t);
  };

  // SOLO tareas que Nacho tiene que hacer personalmente + informes del CEO

  // Viernes — Informe semanal de Sofia (CEO) cada viernes por 12 semanas
  for (let w = 0; w < 12; w++) {
    const daysUntilFriday = ((5 - today.getDay()) + 7) % 7 || 7;
    addTask(daysUntilFriday + (w * 7), { agent: 'Sofia', avatar: '👩‍💼', task: `Informe semanal #${w + 1} — resumen de operaciones`, priority: 'media', section: 'kpis', steps: ['Toca "Ver informe" para que Sofia genere el reporte en tiempo real', 'Revisa los numeros y el estado general', 'Si todo esta bien, toca "Ya la hice" para marcar como leido'] });
  }

  // Semana 2 — Afiliados
  addTask(14, { agent: 'Tomas', avatar: '🤝', task: 'Registrarte en Jasper AI como afiliado', priority: 'alta', link: 'https://www.jasper.ai/partners',
    steps: ['Abri el link de abajo (Jasper Partners)', 'Registrate con tu email y nombre', 'Te van a aprobar en 1-3 dias', 'Cuando te aprueben, entra a tu panel de afiliado', 'Copia tu link de referido (algo como jasper.ai?ref=TUCODIGO)', 'Pegalo abajo para que Tomas lo inserte en los articulos'],
    inputs: [{ label: 'Tu link de afiliado Jasper', placeholder: 'https://jasper.ai?ref=...', inputKey: 'affiliate_jasper' }]
  });
  addTask(14, { agent: 'Tomas', avatar: '🤝', task: 'Registrarte en Canva como afiliado', priority: 'alta', link: 'https://www.canva.com/affiliates/',
    steps: ['Abri el link de Canva Affiliates', 'Toca "Join Now" o "Registrarse"', 'Completa con tu email y datos', 'Espera aprobacion (1-5 dias)', 'Cuando te aprueben, copia tu link de referido', 'Pegalo abajo'],
    inputs: [{ label: 'Tu link de afiliado Canva', placeholder: 'https://canva.pxf.io/...', inputKey: 'affiliate_canva' }]
  });
  addTask(15, { agent: 'Tomas', avatar: '🤝', task: 'Registrarte en Hostinger como afiliado', priority: 'alta', link: 'https://www.hostinger.com/affiliates',
    steps: ['Abri el link de Hostinger Affiliates', 'Toca "Sign Up" o "Registrarse"', 'Pone tu email, nombre y URL del sitio: ia-negocio.vercel.app', 'Espera aprobacion', 'Copia tu link de referido y pegalo abajo'],
    inputs: [{ label: 'Tu link de afiliado Hostinger', placeholder: 'https://hostinger.com?ref=...', inputKey: 'affiliate_hostinger' }]
  });

  // Semana 3 — PayPal
  addTask(21, { agent: 'Valentina', avatar: '💰', task: 'Crear cuenta de PayPal y conectar tu banco', priority: 'alta', link: 'https://www.paypal.com/ar/webapps/mpp/account-selection',
    steps: ['Abri paypal.com y toca "Registrarse"', 'Elegi cuenta "Personal"', 'Pone tu email, nombre y crea una contrasena', 'Verifica tu email (te llega un mail)', 'Dentro de PayPal anda a "Cartera" o "Wallet"', 'Toca "Vincular banco" y pone tu CBU', 'Copia tu email de PayPal y pegalo abajo'],
    inputs: [{ label: 'Tu email de PayPal', placeholder: 'tu-email@gmail.com', inputKey: 'paypal_email' }]
  });

  // Mes 2 — AdSense
  addTask(45, { agent: 'Valentina', avatar: '💰', task: 'Aplicar a Google AdSense', priority: 'alta', link: 'https://adsense.google.com',
    steps: ['Abri adsense.google.com con tu Gmail', 'Toca "Empezar"', 'URL del sitio: ia-negocio.vercel.app', 'Pone tu nombre completo y direccion', 'Acepta los terminos', 'Te van a dar un codigo de verificacion — pegalo abajo', 'Google tarda 2-14 dias en aprobar'],
    inputs: [
      { label: 'Codigo de AdSense (ca-pub-XXXXXXXXXX)', placeholder: 'ca-pub-1234567890', inputKey: 'adsense_code' },
      { label: 'CBU donde Google te paga', placeholder: '0000000000000000000000', inputKey: 'adsense_cbu' },
    ]
  });

  // Reportes mensuales
  addTask(30, { agent: 'Sofia', avatar: '👩‍💼', task: 'Informe mensual #1 — trafico, posicionamiento, estado general', priority: 'alta', section: 'kpis', steps: ['Toca "Ver informe" para que Sofia genere el reporte mensual', 'Revisa trafico, SEO y estado de monetizacion'] });
  addTask(60, { agent: 'Sofia', avatar: '👩‍💼', task: 'Informe mensual #2 — primeros ingresos y proyeccion', priority: 'alta', section: 'kpis', steps: ['Toca "Ver informe" para el segundo reporte mensual'] });
  addTask(90, { agent: 'Sofia', avatar: '👩‍💼', task: 'Informe trimestral — evaluar replicar en Nexo Web, Nexo Trade, Melococo', priority: 'alta', section: 'kpis', steps: ['Toca "Ver informe" para el reporte trimestral', 'Sofia va a evaluar si conviene replicar el modelo en tus otros negocios'] });

  // Recargar API
  addTask(50, { agent: 'Carlos', avatar: '💻', task: 'Verificar credito API Claude y recargar si hace falta', priority: 'media', link: 'https://console.anthropic.com/settings/billing',
    steps: ['Abri el link de Anthropic Billing', 'Fijate cuanto credito te queda', 'Si queda menos de $1, toca "Add credits" y carga $5 mas', 'Si queda mas de $1, no hagas nada'],
  });

  // Add dynamic tasks from Sofia's daily status.json
  if (dynamicStatus?.calendarTasks) {
    for (const dt of dynamicStatus.calendarTasks) {
      const taskDate = new Date(dt.date);
      const diffDays = Math.round((taskDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays >= 0 && diffDays <= 120) {
        const key = dt.date;
        if (!allTasks[key]) allTasks[key] = [];
        const exists = allTasks[key].some(t => t.task === dt.task);
        if (!exists) {
          allTasks[key].push({
            agent: dt.agent || 'Sofia',
            avatar: dt.agent === 'Marco' ? '✍️' : dt.agent === 'Tomas' ? '🤝' : dt.agent === 'Luna' ? '🔍' : '👩‍💼',
            task: dt.task,
            priority: (dt.priority || 'media') as 'alta' | 'media' | 'baja',
            steps: ['Tarea generada automaticamente por Sofia basada en el estado actual del proyecto'],
          });
        }
      }
    }
  }

  // Calendar grid
  const { year, month } = currentMonth;
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();
  const monthName = firstDay.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentMonth(p => p.month === 0 ? { year: p.year - 1, month: 11 } : { year: p.year, month: p.month - 1 });
  const nextMonth = () => setCurrentMonth(p => p.month === 11 ? { year: p.year + 1, month: 0 } : { year: p.year, month: p.month + 1 });

  const days: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getDateStr = (day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  const tasksForSelected = selectedDate ? (allTasks[selectedDate] || []) : [];

  const priorityColor = { alta: 'bg-red-500/20 text-red-400 border-red-500/30', media: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', baja: 'bg-blue-500/20 text-blue-400 border-blue-500/30' };
  const priorityDot = { alta: 'bg-red-500', media: 'bg-yellow-500', baja: 'bg-blue-500' };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-extrabold text-white">Calendario</h2>
        <p className="text-sm text-gray-500">Toca un dia para ver las tareas. Los puntos indican tareas pendientes.</p>
      </div>

      {/* Calendar grid */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={prevMonth} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors">←</button>
          <h3 className="text-lg font-bold text-white capitalize">{monthName}</h3>
          <button onClick={nextMonth} className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors">→</button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'].map(d => (
            <div key={d} className="text-center text-[10px] font-semibold text-gray-500 uppercase py-1">{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (day === null) return <div key={`e${i}`} />;
            const dateStr = getDateStr(day);
            const dateObj = new Date(year, month, day);
            const isPast = dateObj.toDateString() !== today.toDateString() && dateObj < today;
            const hasTasks = allTasks[dateStr] && allTasks[dateStr].length > 0;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;
            const taskList = allTasks[dateStr] || [];
            const highestPriority = taskList.length > 0 ? (taskList.some(t => t.priority === 'alta') ? 'alta' : taskList.some(t => t.priority === 'media') ? 'media' : 'baja') : null;

            return (
              <button
                key={day}
                onClick={() => setSelectedDate(isSelected ? null : dateStr)}
                className={`relative flex flex-col items-center justify-center rounded-xl py-2.5 transition-all ${
                  isSelected ? 'bg-blue-600 ring-2 ring-blue-400 scale-105' :
                  isToday ? 'bg-gray-800 ring-1 ring-blue-500/50' :
                  isPast ? 'bg-gray-900/20 opacity-40' :
                  hasTasks ? 'bg-gray-800/60 hover:bg-gray-800 hover:scale-105' :
                  'bg-gray-900/30 hover:bg-gray-800/40'
                }`}
              >
                <span className={`text-sm font-semibold ${
                  isSelected ? 'text-white' :
                  isToday ? 'text-blue-400' :
                  isPast ? 'text-gray-600' :
                  'text-gray-300'
                }`}>
                  {day}
                </span>
                {/* Past days — show check if had tasks (completed) */}
                {isPast && hasTasks && (
                  <span className="text-[9px] text-green-500/60 mt-0.5">✓</span>
                )}
                {/* Future/today — task indicator dots */}
                {!isPast && hasTasks && (
                  <div className="flex gap-0.5 mt-0.5">
                    {taskList.length <= 3 ? taskList.map((t, j) => (
                      <span key={j} className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : priorityDot[t.priority]}`} />
                    )) : (
                      <>
                        <span className={`h-1.5 w-1.5 rounded-full ${isSelected ? 'bg-white' : priorityDot[highestPriority || 'baja']}`} />
                        <span className={`text-[8px] ${isSelected ? 'text-white' : 'text-gray-500'}`}>+{taskList.length}</span>
                      </>
                    )}
                  </div>
                )}
                {isToday && !isSelected && <span className="absolute -top-1 -right-1 text-[8px]">📍</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day tasks */}
      {selectedDate && (
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-5">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white capitalize">
            📅 {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {tasksForSelected.length > 0 && (
              <span className="ml-auto rounded-full bg-blue-500/20 border border-blue-500/30 px-2.5 py-0.5 text-[10px] text-blue-400">{tasksForSelected.length} tarea{tasksForSelected.length > 1 ? 's' : ''}</span>
            )}
          </h3>

          {tasksForSelected.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-2xl mb-2">🏖️</p>
              <p className="text-sm text-gray-500">Sin tareas este dia. Relajate.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasksForSelected.map((task, i) => {
                const taskKey = `${selectedDate}_${i}`;
                const status = completedTasks[taskKey];
                return (
                <div key={i} className={`flex items-start gap-3 rounded-xl border p-4 transition-all ${
                  status === 'verified' ? 'border-green-500/40 bg-green-500/5' :
                  status === 'failed' ? 'border-red-500/40 bg-red-500/5' :
                  'border-gray-800 bg-gray-800/30 hover:bg-gray-800/60'
                }`}>
                  <span className="mt-0.5 text-xl">{status === 'verified' ? '✅' : status === 'failed' ? '❌' : task.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${status === 'verified' ? 'text-green-400 line-through' : 'text-white'}`}>{task.task}</p>
                    <p className="mt-1 text-[11px] text-gray-500">{task.agent}</p>
                    {status === 'verified' && <p className="mt-1 text-[10px] text-green-500">✓ Verificado por {task.agent}: {verifyMsg[taskKey] || 'Completado'}</p>}
                    {status === 'failed' && <p className="mt-1 text-[10px] text-red-400">✗ {task.agent} dice: {verifyMsg[taskKey] || 'No se pudo confirmar'}</p>}
                    {/* Expandable guide */}
                    {expandedTask === taskKey && (
                      <div className="mt-3 space-y-3">
                        {/* Step by step */}
                        {task.steps && task.steps.length > 0 && (
                          <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                            <p className="text-[11px] font-bold text-cyan-400 mb-2">📝 Paso a paso:</p>
                            <ol className="space-y-1.5">
                              {task.steps.map((step, si) => (
                                <li key={si} className="flex gap-2 text-[11px] text-gray-300">
                                  <span className="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500/20 text-[9px] font-bold text-cyan-400">{si + 1}</span>
                                  <span className="pt-0.5">{step}</span>
                                </li>
                              ))}
                            </ol>
                          </div>
                        )}
                        {/* Input fields */}
                        {task.inputs && task.inputs.length > 0 && (
                          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 space-y-3">
                            <p className="text-[11px] font-bold text-amber-400">📋 Pega aca lo que sacaste:</p>
                            {task.inputs.map((inp) => (
                              <div key={inp.inputKey}>
                                <label className="block text-[10px] text-gray-400 mb-1">{inp.label}</label>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    placeholder={inp.placeholder}
                                    value={taskInputs[inp.inputKey] || ''}
                                    onChange={(e) => saveTaskInput(inp.inputKey, e.target.value)}
                                    className="flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-xs text-white placeholder-gray-600 focus:border-amber-500 focus:outline-none"
                                  />
                                  {taskInputs[inp.inputKey] && (
                                    <span className="flex items-center text-[9px] text-green-400">✓ Guardado</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Report content */}
                    {reportData[taskKey] && (
                      <div className="mt-3 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs">📋</span>
                          <span className="text-[11px] font-bold text-purple-400">Informe de Sofia — CEO</span>
                        </div>
                        <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap">{reportData[taskKey]}</div>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-semibold ${
                      status === 'verified' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                      status === 'failed' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                      priorityColor[task.priority]
                    }`}>
                      {status === 'verified' ? 'hecho' : status === 'failed' ? 'error' : task.priority}
                    </span>
                    <div className="flex flex-col gap-1.5">
                      {/* Guide toggle */}
                      {(task.steps || task.inputs) && status !== 'verified' && (
                        <button onClick={() => setExpandedTask(expandedTask === taskKey ? null : taskKey)}
                          className={`rounded-lg border px-3 py-1.5 text-[10px] font-semibold transition-colors ${
                            expandedTask === taskKey
                              ? 'border-cyan-500/40 bg-cyan-500/20 text-cyan-300'
                              : 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400 hover:bg-cyan-500/10'
                          }`}>
                          {expandedTask === taskKey ? 'Cerrar guia ✕' : 'Como hacer? 📝'}
                        </button>
                      )}
                      {/* Report button for Informe tasks */}
                      {task.task.includes('Informe') && !reportData[taskKey] && loadingReport !== taskKey && (
                        <button onClick={() => {
                          const weekMatch = task.task.match(/#(\d+)/);
                          const weekNum = weekMatch ? parseInt(weekMatch[1]) : 1;
                          const type = task.task.includes('trimestral') ? 'trimestral' : task.task.includes('mensual') ? 'mensual' : 'semanal';
                          generateReport(taskKey, weekNum, type);
                        }}
                          className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-3 py-1.5 text-[10px] font-semibold text-purple-400 hover:bg-purple-500/20 transition-colors">
                          Ver informe 📋
                        </button>
                      )}
                      {loadingReport === taskKey && (
                        <span className="rounded-lg border border-purple-500/20 bg-purple-500/5 px-3 py-1.5 text-[10px] font-semibold text-purple-300 animate-pulse">
                          Generando informe...
                        </span>
                      )}
                      {task.link && status !== 'verified' && (
                        <a href={task.link} target="_blank" rel="noopener noreferrer"
                          className="rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-1.5 text-[10px] font-semibold text-blue-400 hover:bg-blue-500/20 transition-colors">
                          Abrir →
                        </a>
                      )}
                      {status === 'checking' ? (
                        <span className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-1.5 text-[10px] font-semibold text-gray-400 animate-pulse">
                          Verificando...
                        </span>
                      ) : status === 'verified' ? (
                        <button onClick={() => resetTask(taskKey)}
                          className="rounded-lg border border-gray-600 bg-gray-800 px-3 py-1.5 text-[10px] font-semibold text-gray-500 hover:text-gray-300 transition-colors">
                          Deshacer
                        </button>
                      ) : (
                        <button onClick={() => verifyTask(taskKey, task)}
                          className="rounded-lg border border-green-500/30 bg-green-500/10 px-3 py-1.5 text-[10px] font-semibold text-green-400 hover:bg-green-500/20 transition-colors">
                          Ya la hice ✓
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Resumen rapido */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 text-center">
          <p className="text-2xl font-bold text-red-400">{Object.values(allTasks).flat().filter(t => t.priority === 'alta').length}</p>
          <p className="text-[10px] text-gray-500 mt-1">Prioridad alta</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 text-center">
          <p className="text-2xl font-bold text-yellow-400">{Object.values(allTasks).flat().filter(t => t.priority === 'media').length}</p>
          <p className="text-[10px] text-gray-500 mt-1">Prioridad media</p>
        </div>
        <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 text-center">
          <p className="text-2xl font-bold text-blue-400">{Object.values(allTasks).flat().filter(t => t.priority === 'baja').length}</p>
          <p className="text-[10px] text-gray-500 mt-1">Prioridad baja</p>
        </div>
      </div>

      <div className="rounded-xl border border-gray-700/50 bg-gray-800/30 p-4">
        <p className="text-xs text-gray-500">
          💡 Calendario exclusivo de Nexo Articles. Las tareas se actualizan automaticamente.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION: PAGOS — CBU & PayPal config                               */
/* ------------------------------------------------------------------ */

function PagosSection({ onNotify }: { onNotify: (msg: string) => void }) {
  const [cbu, setCbu] = useState('');
  const [cbuSaved, setCbuSaved] = useState(false);
  const [cbuAlias, setCbuAlias] = useState('');
  const [paypalEmail, setPaypalEmail] = useState('');
  const [paypalSaved, setPaypalSaved] = useState(false);
  const [titular, setTitular] = useState('');

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ia-negocio-pagos');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.cbu) { setCbu(data.cbu); setCbuSaved(true); }
        if (data.cbuAlias) setCbuAlias(data.cbuAlias);
        if (data.paypalEmail) { setPaypalEmail(data.paypalEmail); setPaypalSaved(true); }
        if (data.titular) setTitular(data.titular);
      } catch { /* ignore */ }
    }
  }, []);

  function saveCbu() {
    if (!cbu || cbu.length !== 22 || !/^\d{22}$/.test(cbu)) {
      onNotify('El CBU debe tener exactamente 22 digitos numericos.');
      return;
    }
    if (!titular.trim()) {
      onNotify('Ingresa el nombre del titular de la cuenta.');
      return;
    }
    const prev = localStorage.getItem('ia-negocio-pagos');
    const data = prev ? JSON.parse(prev) : {};
    data.cbu = cbu;
    data.cbuAlias = cbuAlias;
    data.titular = titular;
    localStorage.setItem('ia-negocio-pagos', JSON.stringify(data));
    setCbuSaved(true);
    onNotify('💰 Valentina (CFO): "CBU guardado. Cuando AdSense este activo, los pagos van a caer ahi directo."');
  }

  function savePaypal() {
    if (!paypalEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(paypalEmail)) {
      onNotify('Ingresa un email de PayPal valido.');
      return;
    }
    const prev = localStorage.getItem('ia-negocio-pagos');
    const data = prev ? JSON.parse(prev) : {};
    data.paypalEmail = paypalEmail;
    localStorage.setItem('ia-negocio-pagos', JSON.stringify(data));
    setPaypalSaved(true);
    onNotify('💰 Tomas (Ventas): "PayPal conectado. Las comisiones de afiliados van a caer ahi."');
  }

  function resetCbu() {
    setCbu(''); setCbuAlias(''); setTitular(''); setCbuSaved(false);
    const prev = localStorage.getItem('ia-negocio-pagos');
    const data = prev ? JSON.parse(prev) : {};
    delete data.cbu; delete data.cbuAlias; delete data.titular;
    localStorage.setItem('ia-negocio-pagos', JSON.stringify(data));
  }

  function resetPaypal() {
    setPaypalEmail(''); setPaypalSaved(false);
    const prev = localStorage.getItem('ia-negocio-pagos');
    const data = prev ? JSON.parse(prev) : {};
    delete data.paypalEmail;
    localStorage.setItem('ia-negocio-pagos', JSON.stringify(data));
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold">💳 Metodos de Pago</h2>
        <p className="mt-1 text-sm text-gray-400">
          Configura donde recibis los pagos. Tus agentes usan esta info para conectar AdSense y los programas de afiliados.
        </p>
      </div>

      {/* Status banner */}
      <div className={`rounded-xl border p-4 ${
        cbuSaved && paypalSaved
          ? 'border-green-500/30 bg-green-500/5'
          : 'border-yellow-500/30 bg-yellow-500/5'
      }`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{cbuSaved && paypalSaved ? '✅' : '⚠️'}</span>
          <div>
            <p className="font-semibold text-white">
              {cbuSaved && paypalSaved
                ? 'Metodos de pago configurados'
                : 'Faltan metodos de pago por configurar'}
            </p>
            <p className="text-sm text-gray-400">
              {!cbuSaved && !paypalSaved && 'Necesitas configurar CBU (para AdSense) y PayPal (para afiliados).'}
              {cbuSaved && !paypalSaved && 'CBU listo. Falta configurar PayPal para cobrar comisiones de afiliados.'}
              {!cbuSaved && paypalSaved && 'PayPal listo. Falta configurar CBU para cobrar de Google AdSense.'}
              {cbuSaved && paypalSaved && 'Valentina y Tomas tienen acceso. Cuando el sitio este online, los ingresos van a caer automaticamente.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* CBU Card */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-2xl">🏦</div>
              <div>
                <h3 className="font-bold text-white">Cuenta Bancaria (CBU)</h3>
                <p className="text-xs text-gray-500">Para cobrar Google AdSense</p>
              </div>
            </div>
            {cbuSaved && (
              <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
                Guardado
              </span>
            )}
          </div>

          {cbuSaved ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-gray-800/50 p-3">
                <p className="text-xs text-gray-500">Titular</p>
                <p className="font-mono text-sm text-white">{titular}</p>
              </div>
              <div className="rounded-lg bg-gray-800/50 p-3">
                <p className="text-xs text-gray-500">CBU</p>
                <p className="font-mono text-sm text-white">{cbu.slice(0, 4)}{'*'.repeat(14)}{cbu.slice(-4)}</p>
              </div>
              {cbuAlias && (
                <div className="rounded-lg bg-gray-800/50 p-3">
                  <p className="text-xs text-gray-500">Alias</p>
                  <p className="font-mono text-sm text-white">{cbuAlias}</p>
                </div>
              )}
              <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-3">
                <p className="text-xs text-blue-400">💡 Valentina (CFO) va a usar este CBU para configurar Google AdSense cuando el sitio este online.</p>
              </div>
              <button onClick={resetCbu} className="text-xs text-gray-500 underline hover:text-gray-300">
                Cambiar CBU
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Nombre del titular *</label>
                <input
                  type="text"
                  value={titular}
                  onChange={(e) => setTitular(e.target.value)}
                  placeholder="Ej: Nacho Rodriguez"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">CBU (22 digitos) *</label>
                <input
                  type="text"
                  value={cbu}
                  onChange={(e) => setCbu(e.target.value.replace(/\D/g, '').slice(0, 22))}
                  placeholder="0000000000000000000000"
                  maxLength={22}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 font-mono text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <p className="mt-1 text-xs text-gray-600">{cbu.length}/22 digitos</p>
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Alias (opcional)</label>
                <input
                  type="text"
                  value={cbuAlias}
                  onChange={(e) => setCbuAlias(e.target.value)}
                  placeholder="Ej: nacho.mp"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={saveCbu}
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 py-2.5 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-blue-500/20"
              >
                Guardar CBU
              </button>
            </div>
          )}
        </div>

        {/* PayPal Card */}
        <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-2xl">🅿️</div>
              <div>
                <h3 className="font-bold text-white">PayPal</h3>
                <p className="text-xs text-gray-500">Para cobrar comisiones de afiliados</p>
              </div>
            </div>
            {paypalSaved && (
              <span className="rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-400">
                Guardado
              </span>
            )}
          </div>

          {paypalSaved ? (
            <div className="space-y-3">
              <div className="rounded-lg bg-gray-800/50 p-3">
                <p className="text-xs text-gray-500">Email de PayPal</p>
                <p className="font-mono text-sm text-white">{paypalEmail}</p>
              </div>
              <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/5 p-3">
                <p className="text-xs text-indigo-400">💡 Tomas (Ventas) va a usar este PayPal para registrar los programas de afiliados (Jasper, Canva, Hostinger, etc).</p>
              </div>
              <button onClick={resetPaypal} className="text-xs text-gray-500 underline hover:text-gray-300">
                Cambiar PayPal
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Email de PayPal *</label>
                <input
                  type="email"
                  value={paypalEmail}
                  onChange={(e) => setPaypalEmail(e.target.value)}
                  placeholder="tu-email@ejemplo.com"
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/5 p-3">
                <p className="text-xs text-yellow-400">⚠️ Debe ser el mismo email que usaste para crear tu cuenta de PayPal. Si no tenes PayPal, creala en paypal.com primero.</p>
              </div>
              <button
                onClick={savePaypal}
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-500 py-2.5 text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-indigo-500/20"
              >
                Guardar PayPal
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Flow diagram */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
        <h3 className="mb-4 font-bold text-white">📊 Flujo de ingresos</h3>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4 text-center">
            <p className="text-2xl">🌐</p>
            <p className="mt-2 text-sm font-bold text-white">Google AdSense</p>
            <p className="text-xs text-gray-400">Ads automaticos en el blog</p>
            <p className="mt-2 text-lg">↓</p>
            <div className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${cbuSaved ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {cbuSaved ? '→ Tu CBU' : 'CBU no configurado'}
            </div>
          </div>
          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4 text-center">
            <p className="text-2xl">🤝</p>
            <p className="mt-2 text-sm font-bold text-white">Afiliados</p>
            <p className="text-xs text-gray-400">Jasper, Canva, Hostinger...</p>
            <p className="mt-2 text-lg">↓</p>
            <div className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${paypalSaved ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
              {paypalSaved ? '→ Tu PayPal' : 'PayPal no configurado'}
            </div>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
            <p className="text-2xl">💰</p>
            <p className="mt-2 text-sm font-bold text-white">Tu Banco</p>
            <p className="text-xs text-gray-400">Todo termina aca</p>
            <p className="mt-2 text-lg">↓</p>
            <div className={`mt-1 inline-block rounded-full px-3 py-1 text-xs font-semibold ${cbuSaved ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
              {cbuSaved ? `Cuenta de ${titular.split(' ')[0] || 'titular'}` : 'Pendiente'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SECTION: KPIs                                                      */
/* ------------------------------------------------------------------ */

function KPIsSection() {
  const companyKpis = getCompanyKPIs();
  const kpiIcons = ['📝', '🌐', '💵', '🤖', '📈', '🔔'];

  return (
    <div className="space-y-8">
      {/* Company KPIs */}
      <div>
        <h2 className="mb-4 text-lg font-extrabold text-white">KPIs de la Empresa</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {companyKpis.map((kpi, i) => (
            <div key={kpi.name} className="group relative overflow-hidden rounded-2xl border border-gray-800 bg-gray-900/80 p-6 transition-all hover:border-gray-700 hover:shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl">{kpiIcons[i] || '📊'}</span>
                <TrendArrow trend={kpi.trend} />
              </div>
              <p className="text-3xl font-extrabold text-white mb-1">{kpi.value}</p>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">{kpi.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Per-department KPIs */}
      <div>
        <h2 className="mb-4 text-lg font-extrabold text-white">KPIs por Departamento</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ALL_DEPARTMENTS.map((dept) => {
            const stats = getDepartmentStats(dept);
            const deptAgents = agents.filter((a) => a.department === dept);
            if (deptAgents.length === 0) return null;
            return (
              <div key={dept} className={`rounded-xl border ${DEPT_BORDER[dept]} bg-gray-900/60 p-4`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`h-2.5 w-2.5 rounded-full ${DEPT_BG[dept]}`} />
                  <span className={`text-sm font-bold ${DEPT_TEXT[dept]}`}>{dept}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Tareas</span>
                    <span className="font-mono font-bold text-white">{stats.totalTasks}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Eficiencia</span>
                    <span className="font-mono font-bold text-white">{stats.avgEfficiency}%</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Activos</span>
                    <span className="font-mono font-bold text-white">{stats.activeAgents}/{stats.totalAgents}</span>
                  </div>
                  <BarFill pct={stats.avgEfficiency} colorClass={stats.avgEfficiency >= 95 ? 'bg-green-500' : stats.avgEfficiency >= 90 ? 'bg-blue-500' : 'bg-yellow-500'} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Individual agent KPIs table */}
      <div>
        <h2 className="mb-4 text-lg font-extrabold text-white">KPIs Individuales por Agente</h2>
        <div className="overflow-x-auto rounded-2xl border border-gray-800 bg-gray-900/60">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-800 text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-gray-500">Agente</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-gray-500">Depto.</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-gray-500">Estado</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-gray-500 text-right">Tareas</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-gray-500 text-right">Eficiencia</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-gray-500 text-right">Energia</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-widest text-gray-500 text-right">Racha</th>
              </tr>
            </thead>
            <tbody>
              {agents.map((agent) => (
                <tr key={agent.id} className="border-b border-gray-800/50 transition-colors hover:bg-gray-800/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{agent.avatar}</span>
                      <span className="font-medium text-white">{agent.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${DEPT_BADGE[agent.department]}`}>
                      {agent.department}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <StatusDot status={agent.status} />
                      <span className="text-xs text-gray-400">{statusLabel(agent.status)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-white">{agent.completedTasks}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono font-bold ${agent.efficiency >= 95 ? 'text-green-400' : agent.efficiency >= 90 ? 'text-blue-400' : 'text-yellow-400'}`}>
                      {agent.efficiency}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className={`font-mono font-bold ${agent.energy >= 90 ? 'text-green-400' : agent.energy >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                      {agent.energy}%
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-white">{agent.streak}d</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  INTEGRACIONES SECTION                                              */
/* ------------------------------------------------------------------ */

function IntegracionesSection({ onNotify }: { onNotify: (msg: string) => void }) {
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleConnected, setGoogleConnected] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [expandedSection, setExpandedSection] = useState<string | null>('google');
  const [loaded, setLoaded] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [agentRequests, setAgentRequests] = useState<any[]>([]);

  // Load from localStorage FIRST
  useEffect(() => {
    // Load dynamic integration requests from agents
    fetch('/status.json').then(r => r.ok ? r.json() : null).then(d => {
      if (d?.integrationRequests) setAgentRequests(d.integrationRequests);
    }).catch(() => {});
    try {
      const saved = localStorage.getItem('ia-negocio-integrations');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.credentials) setCredentials(data.credentials);
        if (data.connected) setConnected(data.connected);
        if (data.googleEmail) { setGoogleEmail(data.googleEmail); setGoogleConnected(true); }
      }
    } catch { /* ignore */ }
    setLoaded(true);
  }, []);

  // Save ONLY after initial load is done
  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem('ia-negocio-integrations', JSON.stringify({ credentials, connected, googleEmail: googleConnected ? googleEmail : '' }));
    } catch { /* storage full or unavailable */ }
  }, [connected, credentials, googleEmail, googleConnected, loaded]);

  // Essential integrations for THIS project only
  const essentialServices = [
    {
      id: 'google',
      title: 'Cuenta Google',
      icon: '🔑',
      description: 'Una cuenta Gmail conecta: Search Console, Analytics y AdSense',
      priority: 'URGENTE',
      priorityColor: 'text-red-400 bg-red-500/10 border-red-500/30',
      credential: 'Email Gmail',
      placeholder: 'tu-email@gmail.com',
      validation: /^[a-zA-Z0-9._%+-]+@(gmail\.com|googlemail\.com)$/,
      validationMsg: 'Necesitas un email @gmail.com',
      subServices: [
        { name: 'Google Search Console', agent: 'Luna (SEO)', status: 'Pendiente', url: 'https://search.google.com/search-console', instruction: 'Agrega tu sitio ia-negocio.vercel.app y verifica con etiqueta HTML', why: 'Para que Google indexe tus 30 articulos' },
        { name: 'Google Analytics 4', agent: 'Ana (Analytics)', status: 'Pendiente', url: 'https://analytics.google.com', instruction: 'Crea propiedad, copia el codigo G-XXXXXXX y pasaselo a Claude', why: 'Para medir trafico y saber cuanta gente llega' },
        { name: 'Google AdSense', agent: 'Valentina (Finanzas)', status: 'Despues (necesitas trafico)', url: 'https://adsense.google.com', instruction: 'Aplica cuando tengas +1000 visitas/mes', why: 'Monetizacion con publicidad automatica' },
      ],
    },
    {
      id: 'paypal',
      title: 'PayPal',
      icon: '💳',
      description: 'Para cobrar comisiones de afiliados',
      priority: 'SEMANA 2',
      priorityColor: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30',
      credential: 'Email PayPal',
      placeholder: 'tu-email@paypal.com',
      validation: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
      validationMsg: 'Ingresa un email valido',
      subServices: [
        { name: 'Cobro de Afiliados', agent: 'Tomas (Ventas)', status: 'Despues', url: 'https://www.paypal.com/signup', instruction: 'Crea cuenta PayPal y conecta tu banco argentino (CBU)', why: 'Los programas de afiliados pagan por PayPal' },
      ],
    },
    {
      id: 'bank',
      title: 'Cuenta Bancaria (CBU)',
      icon: '🏦',
      description: 'Para cobrar AdSense — Google paga directo a tu banco',
      priority: 'SEMANA 3',
      priorityColor: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
      credential: 'CBU (22 digitos)',
      placeholder: '0000000000000000000000',
      validation: /^\d{22}$/,
      validationMsg: 'El CBU tiene exactamente 22 numeros',
      subServices: [
        { name: 'Cobro AdSense', agent: 'Valentina (Finanzas)', status: 'Despues', url: '#', instruction: 'Se configura dentro de AdSense cuando te aprueben', why: 'Google deposita automaticamente cuando llegas a USD $100' },
      ],
    },
  ];

  const totalSteps = essentialServices.reduce((s, svc) => s + 1, 0);
  const completedSteps = Object.keys(connected).filter(k => connected[k]).length;
  const progressPct = Math.round((completedSteps / totalSteps) * 100);

  function handleConnect(serviceId: string) {
    const service = essentialServices.find(s => s.id === serviceId);
    if (!service) return;
    const value = credentials[serviceId]?.trim();
    if (!value) return;

    if (!service.validation.test(value)) {
      onNotify(`❌ ${service.validationMsg}`);
      return;
    }

    setConnected(prev => ({ ...prev, [serviceId]: true }));
    if (serviceId === 'google') {
      setGoogleEmail(value);
      setGoogleConnected(true);
    }
    onNotify(`✅ ${service.title} conectado correctamente`);
  }

  return (
    <div>
      <h2 className="text-2xl font-extrabold text-white">Conexiones Esenciales</h2>
      <p className="mt-1 text-sm text-gray-400">Solo lo que necesitas para que el negocio funcione — sin basura</p>

      {/* Dynamic agent requests */}
      {agentRequests.length > 0 && (
        <div className="mt-4 rounded-xl border border-purple-500/30 bg-purple-500/5 p-4">
          <h3 className="text-sm font-bold text-purple-300 mb-3">🔔 Los agentes necesitan acceso:</h3>
          <div className="space-y-2">
            {agentRequests.map((req: { agent: string; service: string; reason: string; urgent: boolean }, i: number) => (
              <div key={i} className={`flex items-center justify-between rounded-lg p-3 ${req.urgent ? 'border border-red-500/30 bg-red-500/5' : 'border border-gray-700/30 bg-gray-800/30'}`}>
                <div>
                  <p className="text-xs font-bold text-white">{req.agent} necesita: <span className="text-purple-400">{req.service}</span></p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{req.reason}</p>
                </div>
                {req.urgent && <span className="text-[9px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-full">URGENTE</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Priority banner */}
      <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-5 py-4">
        <p className="text-sm font-bold text-amber-300">⚡ Orden de prioridad:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="rounded-full border border-red-500/30 bg-red-500/10 px-3 py-1 text-xs font-bold text-red-400">1. Google (AHORA)</span>
          <span className="rounded-full border border-yellow-500/30 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-400">2. PayPal (Semana 2)</span>
          <span className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-bold text-blue-400">3. CBU (Semana 3)</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-6 rounded-2xl border border-gray-700 bg-gray-800/60 p-5">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-300">{completedSteps} de {totalSteps} cuentas conectadas</span>
          <span className="text-xs font-mono text-gray-500">{progressPct}%</span>
        </div>
        <div className="h-2.5 w-full rounded-full bg-gray-700 overflow-hidden">
          <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-400 transition-all duration-500" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* Service cards */}
      <div className="mt-6 space-y-4">
        {essentialServices.map((service) => {
          const isExpanded = expandedSection === service.id;
          const isConnected = connected[service.id];

          return (
            <div key={service.id} className={`rounded-2xl border overflow-hidden transition-all ${isConnected ? 'border-green-500/30 bg-green-500/5' : 'border-gray-700 bg-gray-800/40'}`}>
              {/* Header */}
              <button
                onClick={() => setExpandedSection(isExpanded ? null : service.id)}
                className="flex w-full items-center gap-4 p-5 text-left hover:bg-gray-800/40 transition"
              >
                <span className="text-3xl">{service.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base font-bold text-white">{service.title}</span>
                    {isConnected ? (
                      <span className="rounded-full bg-green-500/20 border border-green-500/30 px-2.5 py-0.5 text-[10px] font-bold text-green-400">✓ CONECTADO</span>
                    ) : (
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${service.priorityColor}`}>{service.priority}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{service.description}</p>
                </div>
                <span className={`text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>&#9660;</span>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-5 pb-5 space-y-4">
                  {/* Credential input */}
                  {!isConnected && (
                    <div className="rounded-xl border border-gray-600 bg-gray-900/60 p-4">
                      <p className="text-xs font-bold text-gray-300 mb-2">📋 {service.credential}</p>
                      <div className="flex items-center gap-2">
                        <input
                          type={service.id === 'bank' ? 'text' : 'email'}
                          placeholder={service.placeholder}
                          value={credentials[service.id] || ''}
                          onChange={(e) => setCredentials(prev => ({ ...prev, [service.id]: e.target.value }))}
                          onKeyDown={(e) => { if (e.key === 'Enter') handleConnect(service.id); }}
                          className="flex-1 rounded-lg border border-gray-600 bg-gray-800/80 px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
                        />
                        <button
                          onClick={() => handleConnect(service.id)}
                          disabled={!credentials[service.id]?.trim()}
                          className="shrink-0 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition"
                        >
                          Conectar
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Connected credential display */}
                  {isConnected && (
                    <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4 flex items-center gap-3">
                      <span className="text-green-400 text-lg">✅</span>
                      <div>
                        <p className="text-sm font-semibold text-green-300">Conectado</p>
                        <p className="text-xs text-gray-400 font-mono">{credentials[service.id]?.slice(0, 6)}{'•'.repeat(8)}</p>
                      </div>
                    </div>
                  )}

                  {/* Sub-services this unlocks */}
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Servicios que desbloquea:</p>
                    <div className="space-y-2">
                      {service.subServices.map((sub, i) => (
                        <div key={i} className="rounded-lg border border-gray-700/50 bg-gray-900/40 p-3">
                          <div className="flex items-center justify-between flex-wrap gap-2">
                            <div>
                              <span className="text-sm font-semibold text-white">{sub.name}</span>
                              <span className="ml-2 text-[10px] text-gray-500">({sub.agent})</span>
                            </div>
                            {sub.url !== '#' && (
                              <a
                                href={sub.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="rounded-lg bg-gray-700 px-3 py-1 text-xs font-semibold text-blue-300 hover:bg-gray-600 transition"
                              >
                                Abrir ↗
                              </a>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">👉 {sub.instruction}</p>
                          <p className="text-[10px] text-cyan-400/60 mt-0.5">¿Por que? {sub.why}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* What's NOT needed */}
      <div className="mt-8 rounded-2xl border border-gray-800 bg-gray-900/40 p-5">
        <p className="text-sm font-bold text-gray-400 mb-3">🚫 Lo que NO necesitas ahora:</p>
        <div className="flex flex-wrap gap-2">
          {['Instagram', 'Facebook Ads', 'Twitter/X', 'Slack', 'Notion', 'HubSpot', 'Mailchimp', 'Hotjar', 'Reddit', 'Screaming Frog'].map((name) => (
            <span key={name} className="rounded-full border border-gray-700/50 bg-gray-800/40 px-3 py-1 text-xs text-gray-600 line-through">{name}</span>
          ))}
        </div>
        <p className="text-[10px] text-gray-600 mt-2">El trafico de este proyecto viene de Google organico (SEO), no de redes sociales. Estas herramientas son para mas adelante si el negocio escala.</p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MAIN DASHBOARD                                                     */
/* ------------------------------------------------------------------ */

export default function DashboardPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [time, setTime] = useState('');
  const [requests, setRequests] = useState(getPendingRequests);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  const [notification, setNotification] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Load approvals from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ia-negocio-approvals');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.approved) setApprovedIds(new Set(data.approved));
        if (data.rejected) setRejectedIds(new Set(data.rejected));
      }
    } catch { /* ignore */ }
  }, []);

  // Save approvals whenever they change
  useEffect(() => {
    if (approvedIds.size > 0 || rejectedIds.size > 0) {
      localStorage.setItem('ia-negocio-approvals', JSON.stringify({
        approved: Array.from(approvedIds),
        rejected: Array.from(rejectedIds),
      }));
    }
  }, [approvedIds, rejectedIds]);

  // Lock body scroll when dashboard is active
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Clock
  useEffect(() => {
    function tick() {
      const now = new Date();
      setTime(
        now.toLocaleDateString('es-AR', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }) +
          ' — ' +
          now.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
    }
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const clearNotification = useCallback(() => setNotification(''), []);

  const [approvalResponses, setApprovalResponses] = useState<Record<string, string>>({});
  const [approvalLoading, setApprovalLoading] = useState<Record<string, boolean>>({});

  // Load approval responses from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ia-negocio-approval-responses');
      if (saved) setApprovalResponses(JSON.parse(saved));
    } catch { /* ignore */ }
  }, []);

  async function handleApprove(id: string) {
    const req = requests.find((r) => r.id === id);
    const agent = getAgentById(req?.agentId || '');
    setApprovedIds((prev) => new Set(prev).add(id));
    setNotification(`${agent?.avatar} ${agent?.name}: "Dale, ya me pongo a laburar en esto!"`);
    setApprovalLoading(prev => ({ ...prev, [id]: true }));

    try {
      const res = await fetch('/api/agent-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: req?.agentId,
          task: `El dueño APROBÓ tu solicitud: "${req?.description}". Ejecutá esta tarea ahora. Explicá exactamente qué vas a hacer, paso a paso, y qué resultados esperás. Se concreto y actionable.`,
        }),
      });
      const data = await res.json();
      const response = data.status === 'ok' ? data.response : 'Error al conectar con el agente';
      setApprovalResponses(prev => {
        const updated = { ...prev, [id]: response };
        localStorage.setItem('ia-negocio-approval-responses', JSON.stringify(updated));
        return updated;
      });
      setNotification(`✅ ${agent?.name} ejecutó la tarea`);

      // Generate a NEW request from this agent (they always have more ideas)
      try {
        const newReqRes = await fetch('/api/agent-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            agentId: req?.agentId,
            task: `Acabas de completar: "${req?.description}". Ahora propone UNA nueva solicitud para mejorar el negocio. Responde SOLO en JSON: {"title":"titulo corto","description":"que queres hacer y por que","priority":"alta","type":"feature","estimatedImpact":"que impacto tendria","cost":"gratis o el costo"}`,
          }),
        });
        const newReqData = await newReqRes.json();
        if (newReqData.status === 'ok') {
          try {
            const jsonMatch = newReqData.response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
              const parsed = JSON.parse(jsonMatch[0]);
              const newRequest: AccessRequest = {
                id: `auto-${Date.now()}`,
                agentId: req?.agentId || '',
                title: parsed.title || 'Nueva propuesta',
                description: parsed.description || '',
                priority: (parsed.priority === 'alta' ? 'alta' : parsed.priority === 'media' ? 'media' : 'alta') as 'alta' | 'media' | 'baja',
                type: 'permiso' as const,
                status: 'pendiente' as const,
                estimatedImpact: parsed.estimatedImpact || 'Mejora general',
                cost: parsed.cost,
              };
              setRequests(prev => [...prev, newRequest]);
            }
          } catch { /* parse error, skip */ }
        }
      } catch { /* skip new request generation if fails */ }
    } catch {
      setApprovalResponses(prev => {
        const updated = { ...prev, [id]: 'Error de conexion — intenta de nuevo' };
        localStorage.setItem('ia-negocio-approval-responses', JSON.stringify(updated));
        return updated;
      });
    }
    setApprovalLoading(prev => ({ ...prev, [id]: false }));
  }

  async function handleReject(id: string) {
    const req = requests.find((r) => r.id === id);
    const agent = getAgentById(req?.agentId || '');
    setRejectedIds((prev) => new Set(prev).add(id));
    setNotification(`${agent?.avatar} ${agent?.name}: "Entendido, busco alternativas..."`);
    setApprovalLoading(prev => ({ ...prev, [id]: true }));

    try {
      const res = await fetch('/api/agent-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: req?.agentId,
          task: `El dueño RECHAZÓ tu solicitud: "${req?.description}". Buscá alternativas o formas distintas de lograr el mismo objetivo sin lo que pediste. Proponé 2-3 alternativas concretas.`,
        }),
      });
      const data = await res.json();
      const response = data.status === 'ok' ? data.response : 'Error al conectar con el agente';
      setApprovalResponses(prev => {
        const updated = { ...prev, [id]: response };
        localStorage.setItem('ia-negocio-approval-responses', JSON.stringify(updated));
        return updated;
      });
      setNotification(`🔄 ${agent?.name} propuso alternativas`);
    } catch {
      setApprovalResponses(prev => {
        const updated = { ...prev, [id]: 'Error de conexion — intenta de nuevo' };
        localStorage.setItem('ia-negocio-approval-responses', JSON.stringify(updated));
        return updated;
      });
    }
    setApprovalLoading(prev => ({ ...prev, [id]: false }));
  }

  if (!authenticated) {
    return <LoginGate onAuth={() => setAuthenticated(true)} />;
  }

  const pendingReqs = requests.filter(
    (r) => !approvedIds.has(r.id) && !rejectedIds.has(r.id)
  );

  const pendingCountMap: Record<string, number> = {};
  for (const r of pendingReqs) {
    pendingCountMap[r.agentId] = (pendingCountMap[r.agentId] || 0) + 1;
  }

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-gray-950 text-gray-100">
      {/* Toast */}
      {notification && <Toast message={notification} onDone={clearNotification} />}

      {/* Agent Detail Modal */}
      {selectedAgent && (
        <AgentDetailModal
          agent={selectedAgent}
          requests={requests}
          approvedIds={approvedIds}
          rejectedIds={rejectedIds}
          onClose={() => setSelectedAgent(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onNavigate={setActiveSection}
        pendingCount={pendingReqs.length}
        onLogout={() => setAuthenticated(false)}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Mobile header */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-gray-800 bg-gray-950/90 px-4 py-3 backdrop-blur lg:hidden">
        <button
          onClick={() => setMobileMenuOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-gray-400 transition hover:bg-gray-700 hover:text-white"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 5h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2zm0 4h14a1 1 0 010 2H3a1 1 0 010-2z" clipRule="evenodd" />
          </svg>
        </button>
        <div className="flex items-center gap-2">
          <span className="text-lg">🏢</span>
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-sm font-extrabold text-transparent">
            Nexo Articles
          </span>
        </div>
        <div className="flex items-center gap-2">
          {pendingReqs.length > 0 && (
            <button
              onClick={() => setActiveSection('solicitudes')}
              className="flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse"
            >
              {pendingReqs.length}
            </button>
          )}
        </div>
      </div>

      {/* Main content */}
      <main className="lg:ml-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
          {activeSection === 'overview' && (
            <OverviewSection
              time={time}
              pendingCountMap={pendingCountMap}
              onNavigateToSolicitudes={() => setActiveSection('solicitudes')}
            />
          )}

          {activeSection === 'oficina' && (
            <OficinaSection
              onSelectAgent={setSelectedAgent}
              pendingCountMap={pendingCountMap}
            />
          )}

          {activeSection === 'departamentos' && (
            <DepartamentosSection
              onSelectAgent={setSelectedAgent}
              pendingCountMap={pendingCountMap}
            />
          )}

          {activeSection === 'solicitudes' && (
            <SolicitudesSection
              requests={requests}
              approvedIds={approvedIds}
              rejectedIds={rejectedIds}
              onApprove={handleApprove}
              onReject={handleReject}
              approvalResponses={approvalResponses}
              approvalLoading={approvalLoading}
            />
          )}

          {activeSection === 'actividad' && <ActividadSection />}

          {activeSection === 'integraciones' && <IntegracionesSection onNotify={setNotification} />}

          {activeSection === 'kpis' && <KPIsSection />}

          {activeSection === 'pagos' && <PagosSection onNotify={setNotification} />}

          {activeSection === 'calendario' && <CalendarioSection />}

          {/* Footer */}
          <footer className="mt-10 border-t border-gray-800 py-6 text-center text-xs text-gray-600">
            Nexo Articles — Dashboard privado — {agents.length} agentes IA operando 24/7
          </footer>
        </div>
      </main>
    </div>
  );
}
