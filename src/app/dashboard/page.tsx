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
    { name: 'Articulos Publicados', value: '40', trend: 'up' },
    { name: 'Trafico Mensual', value: 'Pre-launch', trend: 'stable' },
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

type Section = 'overview' | 'oficina' | 'departamentos' | 'solicitudes' | 'actividad' | 'integraciones' | 'kpis' | 'pagos';

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
            IA Negocio
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
            IA Negocio
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
          Estamos en fase pre-lanzamiento. Tu equipo de {agents.length} agentes IA esta siendo configurado. {workingAgents.length} trabajando activamente,{' '}
          {analyzingAgents.length} analizando datos. Todavia no hay trafico ni ingresos — el foco ahora es preparar contenido,
          conectar integraciones y dejar todo listo para el lanzamiento.
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

function OficinaSection({
  onSelectAgent,
  pendingCountMap,
}: {
  onSelectAgent: (a: Agent) => void;
  pendingCountMap: Record<string, number>;
}) {
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTime((t) => t + 1), 3000);
    return () => clearInterval(id);
  }, []);

  // Shared desks — agents that collaborate sit at the same table
  const desks: {
    id: string;
    zone: string;
    zoneColor: string;
    agents: string[];
    top: string;
    left: string;
    w: string;
    h: string;
    deskStyle: 'L' | 'straight' | 'round' | 'corner';
  }[] = [
    { id: 'ceo', zone: 'Sala Ejecutiva', zoneColor: '#eab308', agents: ['sofia'], top: '3%', left: '35%', w: '30%', h: '20%', deskStyle: 'corner' },
    { id: 'content', zone: 'Redaccion', zoneColor: '#a855f7', agents: ['marco', 'luna'], top: '28%', left: '2%', w: '33%', h: '22%', deskStyle: 'L' },
    { id: 'tech', zone: 'Dev Lab', zoneColor: '#3b82f6', agents: ['carlos', 'ana'], top: '28%', left: '65%', w: '33%', h: '22%', deskStyle: 'L' },
    { id: 'growth', zone: 'Growth Hub', zoneColor: '#f97316', agents: ['diego', 'tomas'], top: '58%', left: '8%', w: '36%', h: '22%', deskStyle: 'straight' },
    { id: 'finance', zone: 'Finanzas', zoneColor: '#22c55e', agents: ['valentina'], top: '58%', left: '56%', w: '36%', h: '22%', deskStyle: 'corner' },
  ];

  // Data flow lines between desks
  const flows: { from: string; to: string; label: string }[] = [
    { from: 'ceo', to: 'content', label: 'Estrategia' },
    { from: 'ceo', to: 'tech', label: 'Prioridades' },
    { from: 'content', to: 'growth', label: 'Contenido' },
    { from: 'tech', to: 'finance', label: 'Reportes' },
    { from: 'ceo', to: 'finance', label: 'KPIs' },
    { from: 'growth', to: 'finance', label: 'ROI' },
  ];

  const getDeskCenter = (deskId: string) => {
    const d = desks.find((dk) => dk.id === deskId);
    if (!d) return { x: 50, y: 50 };
    return { x: parseFloat(d.left) + parseFloat(d.w) / 2, y: parseFloat(d.top) + parseFloat(d.h) / 2 };
  };

  const activityMessages = [
    { agent: 'marco', msg: 'Escribiendo articulo #16...' },
    { agent: 'luna', msg: 'Analizando keywords...' },
    { agent: 'carlos', msg: 'Optimizando performance...' },
    { agent: 'diego', msg: 'Preparando campana...' },
    { agent: 'ana', msg: 'Procesando metricas...' },
    { agent: 'sofia', msg: 'Revisando reportes...' },
    { agent: 'tomas', msg: 'Contactando afiliados...' },
    { agent: 'valentina', msg: 'Actualizando proyecciones...' },
  ];
  const currentActivity = activityMessages[time % activityMessages.length];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-extrabold text-white">Oficina Virtual</h2>
          <p className="text-sm text-gray-500">Coworking IA Negocio — {agents.filter(a => a.status === 'working').length} agentes activos ahora</p>
        </div>
        {/* Live activity ticker */}
        <div className="hidden sm:flex items-center gap-2 rounded-full border border-gray-700 bg-gray-800/80 px-4 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
          </span>
          <span className="text-xs text-gray-400">
            <span className="font-semibold text-white">{agents.find(a => a.id === currentActivity.agent)?.name.split(' ')[0]}</span>{' '}
            {currentActivity.msg}
          </span>
        </div>
      </div>

      {/* ====== Floor Plan ====== */}
      <div className="rounded-2xl border border-gray-700/60 bg-gray-900/80 p-4 sm:p-6 shadow-2xl shadow-black/40">
        <div
          className="relative mx-auto w-full overflow-hidden rounded-xl"
          style={{
            aspectRatio: '16 / 9',
            background: `
              radial-gradient(ellipse at 30% 20%, rgba(59,130,246,0.04) 0%, transparent 50%),
              radial-gradient(ellipse at 70% 80%, rgba(168,85,247,0.04) 0%, transparent 50%),
              linear-gradient(rgba(15,23,42,0.98), rgba(15,23,42,0.98)),
              repeating-linear-gradient(0deg, transparent, transparent 49px, rgba(55,65,81,0.15) 49px, rgba(55,65,81,0.15) 50px),
              repeating-linear-gradient(90deg, transparent, transparent 49px, rgba(55,65,81,0.15) 49px, rgba(55,65,81,0.15) 50px)
            `,
          }}
        >
          {/* SVG layer — connection flows between desks */}
          <svg className="absolute inset-0 h-full w-full pointer-events-none" style={{ zIndex: 1 }}>
            <defs>
              {flows.map((f, i) => (
                <linearGradient key={`g${i}`} id={`flow${i}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={desks.find(d => d.id === f.from)?.zoneColor || '#666'} stopOpacity="0.4" />
                  <stop offset="100%" stopColor={desks.find(d => d.id === f.to)?.zoneColor || '#666'} stopOpacity="0.4" />
                </linearGradient>
              ))}
              <marker id="flowArrow" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                <path d="M0,0 L6,2 L0,4" fill="rgba(156,163,175,0.5)" />
              </marker>
            </defs>
            {flows.map((f, i) => {
              const from = getDeskCenter(f.from);
              const to = getDeskCenter(f.to);
              const mx = (from.x + to.x) / 2;
              const my = (from.y + to.y) / 2;
              return (
                <g key={i}>
                  <line
                    x1={`${from.x}%`} y1={`${from.y}%`}
                    x2={`${to.x}%`} y2={`${to.y}%`}
                    stroke={`url(#flow${i})`}
                    strokeWidth="1.5"
                    strokeDasharray="8 5"
                    markerEnd="url(#flowArrow)"
                    opacity={0.6}
                  />
                  <text x={`${mx}%`} y={`${my - 1.5}%`} textAnchor="middle" fill="rgba(156,163,175,0.4)" fontSize="8" fontWeight="500">
                    {f.label}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Decorative elements — plants, coffee machine, whiteboard */}
          <div className="absolute top-[2%] right-[2%] text-lg opacity-60 z-[3]">🪴</div>
          <div className="absolute bottom-[3%] left-[2%] text-lg opacity-60 z-[3]">🪴</div>
          <div className="absolute bottom-[3%] right-[2%] text-lg opacity-60 z-[3]">☕</div>
          <div className="absolute top-[2%] left-[2%] flex flex-col items-center opacity-40 z-[3]">
            <div className="w-8 h-5 rounded-sm border border-gray-600 bg-gray-800/80 flex items-center justify-center text-[6px] text-gray-500">WIFI</div>
          </div>
          <div className="absolute top-[2%] left-[18%] flex items-center gap-1 opacity-30 z-[3]">
            <div className="w-16 h-3 rounded-full border border-gray-600 bg-gray-800/80 flex items-center justify-center text-[5px] text-gray-500 tracking-wider">IA NEGOCIO</div>
          </div>

          {/* Desk zones */}
          {desks.map((desk) => {
            const deskAgents = desk.agents.map(id => agents.find(a => a.id === id)).filter(Boolean) as Agent[];
            const isMulti = deskAgents.length > 1;
            const anyHovered = desk.agents.some(id => hoveredAgent === id);

            return (
              <div
                key={desk.id}
                className="absolute transition-all duration-300"
                style={{ top: desk.top, left: desk.left, width: desk.w, height: desk.h, zIndex: 2 }}
              >
                {/* Zone label */}
                <div className="absolute -top-[2px] left-1/2 -translate-x-1/2 -translate-y-full z-10">
                  <span
                    className="inline-block rounded-full px-2.5 py-0.5 text-[8px] font-bold tracking-wider uppercase"
                    style={{ backgroundColor: `${desk.zoneColor}15`, color: desk.zoneColor, border: `1px solid ${desk.zoneColor}30` }}
                  >
                    {desk.zone}
                  </span>
                </div>

                {/* Desk surface — a real desk shape */}
                <div
                  className={`absolute inset-0 rounded-xl transition-all duration-300 ${anyHovered ? 'shadow-lg' : ''}`}
                  style={{
                    background: `linear-gradient(135deg, rgba(30,41,59,0.9) 0%, rgba(15,23,42,0.95) 100%)`,
                    border: `1px solid ${anyHovered ? desk.zoneColor + '60' : 'rgba(55,65,81,0.4)'}`,
                    boxShadow: anyHovered ? `0 0 30px ${desk.zoneColor}15, inset 0 1px 0 rgba(255,255,255,0.03)` : 'inset 0 1px 0 rgba(255,255,255,0.03)',
                  }}
                >
                  {/* Desk inner texture — monitor/screen area */}
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1">
                    {deskAgents.map((_, idx) => (
                      <div key={idx} className="w-8 h-5 rounded-sm border border-gray-700/50 bg-gray-950/60" style={{ boxShadow: `0 0 4px ${desk.zoneColor}10` }}>
                        <div className="w-full h-[2px] rounded-full mt-1 mx-auto" style={{ width: '60%', backgroundColor: `${desk.zoneColor}40` }} />
                        <div className="w-full h-[1px] rounded-full mt-0.5 mx-auto" style={{ width: '40%', backgroundColor: `${desk.zoneColor}20` }} />
                      </div>
                    ))}
                  </div>

                  {/* Desk items — keyboard, coffee, notebook */}
                  {deskAgents.map((_, idx) => (
                    <div key={`items-${idx}`} className="absolute bottom-2 text-[7px] opacity-30" style={{ left: isMulti ? `${20 + idx * 45}%` : '40%' }}>
                      ⌨️
                    </div>
                  ))}
                </div>

                {/* Chair(s) behind desk */}
                <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 flex ${isMulti ? 'gap-6 sm:gap-10' : ''}`}>
                  {deskAgents.map((_, idx) => (
                    <div key={`chair-${idx}`} className="relative">
                      {/* Chair back */}
                      <div className="w-6 h-3 rounded-t-lg border border-gray-700/40 bg-gray-800/60 mx-auto" style={{ borderBottom: 'none' }} />
                      {/* Chair seat */}
                      <div className="w-7 h-2 rounded-b-sm border border-gray-700/40 bg-gray-800/40 mx-auto" />
                    </div>
                  ))}
                </div>

                {/* Agent avatars ON the desk */}
                <div className={`absolute top-[30%] left-0 w-full flex items-center justify-center ${isMulti ? 'gap-2 sm:gap-6' : ''}`} style={{ zIndex: 5 }}>
                  {deskAgents.map((agent) => {
                    const pending = pendingCountMap[agent.id] || 0;
                    const firstName = agent.name.split(' ')[0];
                    const isActive = agent.status === 'working' || agent.status === 'analyzing';
                    const isHovered = hoveredAgent === agent.id;

                    return (
                      <button
                        key={agent.id}
                        onClick={() => onSelectAgent(agent)}
                        onMouseEnter={() => setHoveredAgent(agent.id)}
                        onMouseLeave={() => setHoveredAgent(null)}
                        className="relative flex flex-col items-center transition-transform duration-200 hover:scale-110 group"
                      >
                        {/* Glow ring for active agents */}
                        {isActive && (
                          <div
                            className="absolute -inset-2 rounded-full animate-pulse opacity-30"
                            style={{ background: `radial-gradient(circle, ${desk.zoneColor}40, transparent 70%)`, animationDuration: '2s' }}
                          />
                        )}

                        {/* Avatar */}
                        <div className="relative">
                          <div
                            className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full ring-2 transition-all duration-200 ${
                              isHovered ? 'ring-offset-2 ring-offset-gray-900 scale-110' : ''
                            }`}
                            style={{
                              backgroundColor: 'rgba(15,23,42,0.9)',
                              borderColor: desk.zoneColor,
                              boxShadow: isHovered ? `0 0 20px ${desk.zoneColor}40, inset 0 0 0 2px ${desk.zoneColor}` : `0 0 8px ${desk.zoneColor}15, inset 0 0 0 2px ${desk.zoneColor}80`,
                            }}
                          >
                            <span className="text-lg sm:text-xl">{agent.avatar}</span>
                          </div>
                          {/* Status indicator */}
                          <span className="absolute -bottom-0.5 -right-0.5">
                            <StatusDot status={agent.status} />
                          </span>
                          {/* Pending badge */}
                          {pending > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white shadow-lg shadow-red-500/40 animate-bounce" style={{ animationDuration: '2s' }}>
                              {pending}
                            </span>
                          )}
                        </div>

                        {/* Name + role */}
                        <span className="mt-1 text-[10px] sm:text-[11px] font-bold text-gray-200">{firstName}</span>
                        <span className="text-[8px] sm:text-[9px] font-medium" style={{ color: desk.zoneColor }}>{agent.role.split(' ')[0]}</span>

                        {/* Thought bubble on hover */}
                        {isHovered && isActive && (
                          <div
                            className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2.5 py-1 text-[9px] text-white shadow-xl"
                            style={{ backgroundColor: 'rgba(15,23,42,0.95)', border: `1px solid ${desk.zoneColor}40`, zIndex: 20 }}
                          >
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45" style={{ backgroundColor: 'rgba(15,23,42,0.95)', borderRight: `1px solid ${desk.zoneColor}40`, borderBottom: `1px solid ${desk.zoneColor}40` }} />
                            {agent.currentTask.length > 35 ? agent.currentTask.slice(0, 33) + '..' : agent.currentTask}
                          </div>
                        )}
                      </button>
                    );
                  })}

                  {/* Collaboration indicator for shared desks */}
                  {isMulti && (
                    <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1 rounded-full border border-gray-700/30 bg-gray-800/60 px-2 py-0.5">
                      <span className="text-[7px]">🤝</span>
                      <span className="text-[7px] text-gray-500">Colaborando</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Glass partition lines */}
          <div className="absolute top-[25%] left-[36%] w-[0.5px] h-[30%] bg-gradient-to-b from-transparent via-gray-600/20 to-transparent" />
          <div className="absolute top-[25%] left-[64%] w-[0.5px] h-[30%] bg-gradient-to-b from-transparent via-gray-600/20 to-transparent" />
          <div className="absolute top-[53%] left-[10%] w-[80%] h-[0.5px] bg-gradient-to-r from-transparent via-gray-600/15 to-transparent" />
        </div>
      </div>

      {/* ====== Agent Status Strip ====== */}
      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {agents.map((agent) => {
          const isActive = agent.status === 'working';
          return (
            <button
              key={agent.id}
              onClick={() => onSelectAgent(agent)}
              className={`flex flex-col items-center gap-1 rounded-xl border p-2 transition-all hover:scale-105 ${
                isActive ? 'border-green-500/30 bg-green-500/5' : 'border-gray-800 bg-gray-900/40'
              }`}
            >
              <span className="text-lg">{agent.avatar}</span>
              <span className="text-[9px] font-semibold text-gray-300">{agent.name.split(' ')[0]}</span>
              <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-medium ${
                agent.status === 'working' ? 'bg-green-500/20 text-green-400' :
                agent.status === 'analyzing' ? 'bg-blue-500/20 text-blue-400' :
                'bg-gray-700/40 text-gray-500'
              }`}>
                {agent.status === 'working' ? 'Activo' : agent.status === 'analyzing' ? 'Analizando' : 'Standby'}
              </span>
            </button>
          );
        })}
      </div>

      {/* ====== Mensajes del Equipo ====== */}
      <div className="rounded-2xl border border-gray-800 bg-gray-900/60 p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-white">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-purple-500/10 text-xs">💬</span>
          Mensajes del Equipo
        </h3>
        <div className="grid gap-3 sm:grid-cols-2">
          {agents.map((agent) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const msg = (agent as any).messageToOwner as string | undefined;
            return (
              <div
                key={agent.id}
                className={`rounded-xl border ${DEPT_BORDER[agent.department]} bg-gray-800/40 p-4 transition-all hover:bg-gray-800/70 cursor-pointer group`}
                onClick={() => onSelectAgent(agent)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xl transition-transform group-hover:scale-110">{agent.avatar}</span>
                  <div>
                    <p className="text-xs font-bold text-white">{agent.name}</p>
                    <p className={`text-[10px] ${DEPT_TEXT[agent.department]}`}>{agent.department}</p>
                  </div>
                  <StatusDot status={agent.status} />
                </div>
                <p className="text-xs text-gray-400 italic leading-relaxed">
                  {msg || `"Trabajando en: ${agent.currentTask.length > 60 ? agent.currentTask.slice(0, 60) + '...' : agent.currentTask}"`}
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
  // Load from localStorage on mount
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleConnected, setGoogleConnected] = useState(false);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [connected, setConnected] = useState<Record<string, boolean>>({});
  const [expandedSection, setExpandedSection] = useState<string | null>('google');

  // Persist to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ia-negocio-integrations');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.credentials) setCredentials(data.credentials);
        if (data.connected) setConnected(data.connected);
        if (data.googleEmail) { setGoogleEmail(data.googleEmail); setGoogleConnected(true); }
      }
    } catch { /* ignore */ }
  }, []);

  // Save whenever connected changes
  useEffect(() => {
    if (Object.keys(connected).length > 0 || googleEmail) {
      localStorage.setItem('ia-negocio-integrations', JSON.stringify({ credentials, connected, googleEmail: googleConnected ? googleEmail : '' }));
    }
  }, [connected, credentials, googleEmail, googleConnected]);

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
            IA Negocio
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

          {/* Footer */}
          <footer className="mt-10 border-t border-gray-800 py-6 text-center text-xs text-gray-600">
            IA Negocio — Dashboard privado — {agents.length} agentes IA operando 24/7
          </footer>
        </div>
      </main>
    </div>
  );
}
