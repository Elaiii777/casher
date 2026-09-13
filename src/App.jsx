import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus, X, ChevronLeft, ChevronRight, LayoutDashboard, CalendarDays, Landmark, Home,
  TrendingUp, TrendingDown, Briefcase, Clapperboard, Camera, Music, Users, ShoppingCart,
  Zap, CreditCard, Car, User, MoreHorizontal, AlertCircle, Pencil,
} from 'lucide-react';

/* ---------------------------------- storage ---------------------------------- */
/* Standalone build: persistence lives in the browser's localStorage.           */
/* Swap loadFromStorage/saveToStorage for real API calls to add a backend.      */

const STORAGE_KEY = 'finance_tracker_app_data';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function saveToStorage(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (e) {
    return false;
  }
}

/* ---------------------------------- data ---------------------------------- */

const INCOME_CATEGORIES = [
  { id: 'main_job', label: 'Основная работа', icon: Briefcase },
  { id: 'editing', label: 'Монтаж', icon: Clapperboard },
  { id: 'filming', label: 'Съёмка', icon: Camera },
  { id: 'music', label: 'Музыка', icon: Music },
  { id: 'other_income', label: 'Другое', icon: MoreHorizontal },
];

const EXPENSE_CATEGORIES = [
  { id: 'family', label: 'Семья', icon: Users },
  { id: 'groceries', label: 'Продукты', icon: ShoppingCart },
  { id: 'utilities', label: 'ЖКХ', icon: Zap },
  { id: 'credit_card', label: 'Кредитка', icon: CreditCard },
  { id: 'transport', label: 'Транспорт', icon: Car },
  { id: 'personal', label: 'Личное', icon: User },
  { id: 'other_expense', label: 'Другое', icon: MoreHorizontal },
];

const ALL_CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
function getCategory(id) {
  return ALL_CATEGORIES.find((c) => c.id === id) || { id, label: id, icon: MoreHorizontal };
}

const MONTH_GEN = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
const MONTH_NOM = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
const WEEKDAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
const TAB_TITLES = { home: 'Главная', calendar: 'Календарь', budget: 'Бюджет дома', obligations: 'Обязательства' };
const DOT_COLORS = { green: '#33D6A0', red: '#FF6B6B', amber: '#FFB454', blue: '#7C9CFF' };
const STATUS_OPTIONS = [
  { id: 'expected', label: 'Ожидается', color: '#7C9CFF' },
  { id: 'received', label: 'Получено', color: '#33D6A0' },
  { id: 'cancelled', label: 'Отменено', color: '#8992A3' },
];
const LEGEND = [
  { color: 'green', label: 'Доход' },
  { color: 'red', label: 'Расход' },
  { color: 'amber', label: 'Обязательство' },
  { color: 'blue', label: 'Ожидается' },
];
const FILTER_OPTIONS = [
  { id: 'all', label: 'Все' },
  { id: 'income', label: 'Доходы' },
  { id: 'expense', label: 'Расходы' },
  { id: 'obligation', label: 'Обязат.' },
];
const FILTER_KINDS = { income: ['income'], expense: ['expense'], obligation: ['obligation_due', 'obligation_paid'] };

function pad2(n) { return String(n).padStart(2, '0'); }
function toDateStr(d) { return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; }
function parseDateStr(s) { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); }
function formatMoney(n) {
  const v = Math.round(Math.abs(n || 0));
  return `${new Intl.NumberFormat('ru-RU').format(v)} ₽`;
}
function formatShortDate(dateStr) { const d = parseDateStr(dateStr); return `${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}`; }
function formatDayLabel(dateStr, todayStr) {
  if (dateStr === todayStr) return 'Сегодня';
  const d = parseDateStr(dateStr);
  return `${d.getDate()} ${MONTH_GEN[d.getMonth()]}, ${WEEKDAYS[d.getDay()]}`;
}
function genId() { return Math.random().toString(36).slice(2, 10) + Date.now().toString(36); }

/* ---------------------------------- seed data ---------------------------------- */

function seedIncomes() {
  return [
    { id: genId(), date: '2026-09-15', category: 'filming', source: 'Запись клиента', plannedAmount: 5200, actualAmount: null, status: 'expected', comment: '' },
    { id: genId(), date: '2026-09-17', category: 'main_job', source: 'Ковчег', plannedAmount: 4000, actualAmount: null, status: 'expected', comment: '' },
    { id: genId(), date: '2026-09-19', category: 'music', source: 'Обучение', plannedAmount: 3400, actualAmount: null, status: 'expected', comment: '' },
    { id: genId(), date: '2026-09-20', category: 'main_job', source: 'Ковчег', plannedAmount: 4000, actualAmount: null, status: 'expected', comment: '' },
    { id: genId(), date: '2026-09-22', category: 'main_job', source: 'Ковчег', plannedAmount: 4000, actualAmount: null, status: 'expected', comment: '' },
    { id: genId(), date: '2026-09-25', category: 'main_job', source: 'Ковчег', plannedAmount: 4000, actualAmount: null, status: 'expected', comment: '' },
    { id: genId(), date: '2026-09-27', category: 'main_job', source: 'Ковчег', plannedAmount: 4000, actualAmount: null, status: 'expected', comment: '' },
  ];
}
function seedExpenses() { return []; }
function seedFamilyBudget() {
  return [
    { id: genId(), name: 'Продукты', monthlyLimit: 30000 },
    { id: genId(), name: 'Кот', monthlyLimit: 8000 },
    { id: genId(), name: 'Бытовая химия', monthlyLimit: 3000 },
    { id: genId(), name: 'ЖКХ', monthlyLimit: 7000 },
    { id: genId(), name: 'Интернет', monthlyLimit: 1000 },
    { id: genId(), name: 'Подписки', monthlyLimit: 500 },
  ];
}
function seedObligations() {
  return [
    { id: genId(), name: 'Кредитка', totalAmount: 130000, paidAmount: 0, paymentDue: 7000, dueDate: '2026-09-17', history: [] },
    { id: genId(), name: 'ЖКХ', totalAmount: 10000, paidAmount: 0, paymentDue: 10000, dueDate: '2026-09-30', history: [] },
    { id: genId(), name: 'Бабушке', totalAmount: 5000, paidAmount: 0, paymentDue: 5000, dueDate: '2026-09-30', history: [] },
  ];
}
const SEED_STARTING_BALANCE = 33;

/* ------------------------------ calendar events ------------------------------ */

function buildCalendarEvents(monthIncomes, monthExpenses, obligations, monthKey) {
  const events = [];
  monthIncomes.forEach((i) => {
    if (i.status === 'cancelled') return;
    const received = i.status === 'received';
    events.push({
      id: `inc-${i.id}`, date: i.date, color: received ? 'green' : 'blue', kind: 'income', data: i,
      title: i.source,
      subtitle: `${getCategory(i.category).label} · ${received ? 'получено' : 'ожидается'}${i.comment ? ' — ' + i.comment : ''}`,
      amount: received ? (i.actualAmount ?? i.plannedAmount) : i.plannedAmount,
      sign: '+',
    });
  });
  monthExpenses.forEach((e) => {
    events.push({
      id: `exp-${e.id}`, date: e.date, color: 'red', kind: 'expense', data: e,
      title: e.name,
      subtitle: `${getCategory(e.category).label}${e.isMandatory ? ' · обязательный' : ''}${e.comment ? ' — ' + e.comment : ''}`,
      amount: e.amount, sign: '−',
    });
  });
  obligations.forEach((o) => {
    const remaining = o.totalAmount - o.paidAmount;
    if (o.dueDate && o.dueDate.startsWith(monthKey) && remaining > 0) {
      events.push({
        id: `obd-${o.id}`, date: o.dueDate, color: 'amber', kind: 'obligation_due', data: o,
        title: `К оплате: ${o.name}`, subtitle: 'Обязательство', amount: o.paymentDue, sign: '',
      });
    }
    o.history.forEach((h) => {
      if (h.date.startsWith(monthKey)) {
        events.push({
          id: `obp-${h.id}`, date: h.date, color: 'amber', kind: 'obligation_paid', data: { obligation: o, history: h },
          title: `Оплата: ${o.name}`, subtitle: `Обязательство${h.comment ? ' — ' + h.comment : ''}`, amount: h.amount, sign: '−',
        });
      }
    });
  });
  return events;
}

/* ------------------------------- small pieces ------------------------------- */

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="rounded-2xl p-3.5 bg-[#141822] border border-[#20242E]">
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={14} style={{ color }} />
        <span className="text-[11px] leading-tight text-neutral-400">{label}</span>
      </div>
      <p className="text-[17px] font-bold tabular-nums" style={{ fontFamily: 'Manrope, sans-serif', color }}>{formatMoney(value)}</p>
    </div>
  );
}

function MonthSwitcher({ year, month, onPrev, onNext }) {
  return (
    <div className="flex items-center justify-between px-5 pt-1 pb-3">
      <button onClick={onPrev} className="p-2 -ml-2 rounded-full active:bg-white/5 transition-colors">
        <ChevronLeft size={20} className="text-neutral-400" />
      </button>
      <span className="text-[15px] font-medium text-neutral-200" style={{ fontFamily: 'Manrope, sans-serif' }}>
        {MONTH_NOM[month]} {year}
      </span>
      <button onClick={onNext} className="p-2 -mr-2 rounded-full active:bg-white/5 transition-colors">
        <ChevronRight size={20} className="text-neutral-400" />
      </button>
    </div>
  );
}

function EventIcon({ ev }) {
  let Icon = Landmark;
  if (ev.kind === 'income' || ev.kind === 'expense') Icon = getCategory(ev.data.category).icon;
  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 relative" style={{ background: '#1B2029' }}>
      <Icon size={15} className="text-neutral-300" />
      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2" style={{ background: DOT_COLORS[ev.color], borderColor: '#0B0E14' }} />
    </div>
  );
}

function EventRow({ ev, onOpen }) {
  const clickable = ev.kind !== 'obligation_paid';
  const inner = (
    <>
      <EventIcon ev={ev} />
      <div className="flex-1 min-w-0">
        <p className="text-[14px] text-neutral-200 truncate">{ev.title}</p>
        <p className="text-[12px] text-neutral-500 truncate">{ev.subtitle}</p>
      </div>
      <span className="text-[14.5px] font-semibold tabular-nums shrink-0" style={{ color: DOT_COLORS[ev.color] }}>{ev.sign}{formatMoney(ev.amount)}</span>
    </>
  );
  return clickable ? (
    <button onClick={() => onOpen(ev)} className="w-full flex items-center gap-3 py-3 active:bg-white/[0.03] transition-colors text-left">{inner}</button>
  ) : (
    <div className="w-full flex items-center gap-3 py-3 opacity-70">{inner}</div>
  );
}

function ProgressBar({ value, color }) {
  return (
    <div className="h-2 rounded-full bg-[#20242E] overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(100, Math.max(0, value))}%`, background: color }} />
    </div>
  );
}

function ObligationCard({ obligation, expanded, onToggle, onAddPayment, onEdit, todayStr }) {
  const remaining = obligation.totalAmount - obligation.paidAmount;
  const progress = obligation.totalAmount > 0 ? (obligation.paidAmount / obligation.totalAmount) * 100 : 0;
  const isPaid = remaining <= 0;
  const isOverdue = !isPaid && obligation.dueDate && obligation.dueDate < todayStr;
  const statusLabel = isPaid ? 'Оплачено' : isOverdue ? 'Просрочено' : 'Ожидает';
  const statusColor = isPaid ? '#33D6A0' : isOverdue ? '#FF6B6B' : '#FFB454';
  return (
    <div className="rounded-2xl p-4 bg-[#141822] border border-[#20242E]">
      <button onClick={onToggle} className="w-full text-left">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[15px] font-semibold text-neutral-100">{obligation.name}</p>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded-full" style={{ background: `${statusColor}22`, color: statusColor }}>{statusLabel}</span>
        </div>
        <p className="text-[15px] font-bold tabular-nums mb-1" style={{ fontFamily: 'Manrope, sans-serif', color: '#FFB454' }}>{formatMoney(remaining)}</p>
        <p className="text-[12px] text-neutral-500 mb-2">
          из {formatMoney(obligation.totalAmount)} · платёж {formatMoney(obligation.paymentDue)}{obligation.dueDate ? ` до ${formatShortDate(obligation.dueDate)}` : ''}
        </p>
        <ProgressBar value={progress} color="#33D6A0" />
      </button>
      {expanded && (
        <div className="mt-4 pt-4 border-t border-[#20242E] space-y-3">
          {obligation.history.length > 0 && (
            <div className="space-y-2">
              {[...obligation.history].sort((a, b) => b.date.localeCompare(a.date)).map((h) => (
                <div key={h.id} className="flex items-center justify-between text-[13px]">
                  <span className="text-neutral-500">{formatDayLabel(h.date, '')}{h.comment ? ` — ${h.comment}` : ''}</span>
                  <span className="text-neutral-300 tabular-nums">{formatMoney(h.amount)}</span>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-2">
            <button onClick={() => onAddPayment(obligation)} className="flex-1 py-2.5 rounded-xl text-[13.5px] font-medium" style={{ background: '#1B2029', color: '#FFB454' }}>Добавить платёж</button>
            <button onClick={() => onEdit(obligation)} className="flex-1 py-2.5 rounded-xl text-[13.5px] font-medium text-neutral-400" style={{ background: '#1B2029' }}>Изменить</button>
          </div>
        </div>
      )}
    </div>
  );
}

function FamilyCategoryCard({ cat, spent, onEdit }) {
  const remaining = cat.monthlyLimit - spent;
  const progress = cat.monthlyLimit > 0 ? (spent / cat.monthlyLimit) * 100 : 0;
  const over = remaining < 0;
  return (
    <button onClick={() => onEdit(cat)} className="w-full text-left rounded-2xl p-4 bg-[#141822] border border-[#20242E] active:scale-[0.99] transition-transform">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[15px] font-semibold text-neutral-100">{cat.name}</p>
        <p className="text-[12.5px] text-neutral-500">план {formatMoney(cat.monthlyLimit)}</p>
      </div>
      <ProgressBar value={progress} color={over ? '#FF6B6B' : '#7C9CFF'} />
      <div className="flex items-center justify-between text-[12.5px] mt-2">
        <span className="text-neutral-500">Потрачено {formatMoney(spent)}</span>
        <span style={{ color: over ? '#FF6B6B' : '#33D6A0' }}>{over ? 'Перерасход ' : 'Осталось '}{formatMoney(Math.abs(remaining))}</span>
      </div>
    </button>
  );
}

/* ---------------------------------- screens ---------------------------------- */

function HomeScreen({ balance, incomeStats, expensesActualTotal, obligationsDueStats, upcomingIncomes, familyBudgetTotal, familyBudgetSpent, familyBudgetRemaining, freeMoney, todayStr, onGoObligations, onGoBudget, onGoIncome, onEditBalance }) {
  const familyPct = familyBudgetTotal > 0 ? Math.round((familyBudgetSpent / familyBudgetTotal) * 100) : 0;
  return (
    <div className="px-5 pb-4 space-y-4">
      <button onClick={onEditBalance} className="w-full text-left rounded-3xl p-5" style={{ background: 'linear-gradient(155deg,#132018,#0E1720)', border: '1px solid #1E2A22' }}>
        <div className="flex items-center justify-between mb-1">
          <p className="text-[13px] text-neutral-400">Текущий баланс</p>
          <Pencil size={13} className="text-neutral-600" />
        </div>
        <p className="text-[40px] leading-tight font-bold tabular-nums" style={{ fontFamily: 'Manrope, sans-serif', color: balance >= 0 ? '#F2F3F5' : '#FF6B6B' }}>
          {balance < 0 ? '−' : ''}{formatMoney(balance)}
        </p>
      </button>

      <div className="grid grid-cols-2 gap-3">
        <StatCard icon={TrendingUp} label="Получено" value={incomeStats.received} color="#33D6A0" />
        <StatCard icon={TrendingUp} label="Ожидается" value={incomeStats.expected} color="#7C9CFF" />
        <StatCard icon={TrendingDown} label="Расходы" value={expensesActualTotal} color="#FF6B6B" />
        <StatCard icon={TrendingDown} label="Обязательства" value={obligationsDueStats.dueTotal} color="#FFB454" />
      </div>

      <div className="rounded-2xl p-4 bg-[#141822] border border-[#20242E]">
        <p className="text-[13px] text-neutral-400 mb-1">Свободные деньги</p>
        <p className="text-[26px] font-bold tabular-nums mb-3" style={{ fontFamily: 'Manrope, sans-serif', color: freeMoney.value >= 0 ? '#33D6A0' : '#FF6B6B' }}>
          {freeMoney.value < 0 ? '−' : ''}{formatMoney(freeMoney.value)}
        </p>
        <div className="space-y-1 text-[12px] text-neutral-500">
          <div className="flex justify-between"><span>Сейчас</span><span className="tabular-nums text-neutral-300">{balance < 0 ? '−' : ''}{formatMoney(balance)}</span></div>
          <div className="flex justify-between"><span>+ Ожидается</span><span className="tabular-nums text-neutral-300">{formatMoney(freeMoney.breakdown.expected)}</span></div>
          <div className="flex justify-between"><span>− Обязательства</span><span className="tabular-nums text-neutral-300">{formatMoney(freeMoney.breakdown.obligations)}</span></div>
          <div className="flex justify-between"><span>− Бюджет дома</span><span className="tabular-nums text-neutral-300">{formatMoney(freeMoney.breakdown.family)}</span></div>
        </div>
      </div>

      <button onClick={onGoIncome} className="w-full text-left rounded-2xl p-4 bg-[#141822] border border-[#20242E] active:scale-[0.99] transition-transform">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[14px] font-semibold text-neutral-200">Ближайшие доходы</p>
          <span className="text-[12px] text-neutral-500">{upcomingIncomes.length}</span>
        </div>
        {upcomingIncomes.length === 0 ? (
          <p className="text-[13px] text-neutral-500">Нет ожидаемых доходов в этом месяце</p>
        ) : (
          <div className="space-y-2.5">
            {upcomingIncomes.slice(0, 3).map((i) => (
              <div key={i.id} className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[13.5px] text-neutral-200 truncate">{i.source}</p>
                  <p className="text-[11.5px] text-neutral-500">{formatDayLabel(i.date, todayStr)}</p>
                </div>
                <span className="text-[13.5px] font-medium tabular-nums shrink-0" style={{ color: '#7C9CFF' }}>{formatMoney(i.plannedAmount)}</span>
              </div>
            ))}
          </div>
        )}
      </button>

      <button onClick={onGoObligations} className="w-full text-left rounded-2xl p-4 bg-[#141822] border border-[#20242E] active:scale-[0.99] transition-transform">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[14px] font-semibold text-neutral-200">Обязательные платежи</p>
          <span className="text-[12px] text-neutral-500">{obligationsDueStats.dueList.length}</span>
        </div>
        {obligationsDueStats.dueList.length === 0 ? (
          <p className="text-[13px] text-neutral-500">Нет платежей в этом месяце</p>
        ) : (
          <div className="space-y-2.5">
            {obligationsDueStats.dueList.slice(0, 3).map((o) => (
              <div key={o.id} className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-[13.5px] text-neutral-200 truncate">{o.name}</p>
                  <p className="text-[11.5px] text-neutral-500">{formatDayLabel(o.dueDate, todayStr)}</p>
                </div>
                <span className="text-[13.5px] font-medium tabular-nums shrink-0" style={{ color: '#FFB454' }}>{formatMoney(o.paymentDue)}</span>
              </div>
            ))}
          </div>
        )}
      </button>

      <button onClick={onGoBudget} className="w-full text-left rounded-2xl p-4 bg-[#141822] border border-[#20242E] active:scale-[0.99] transition-transform">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[14px] font-semibold text-neutral-200">Бюджет дома</p>
          <span className="text-[12px] text-neutral-500">{familyPct}%</span>
        </div>
        <ProgressBar value={familyPct} color="#7C9CFF" />
        <p className="text-[12px] text-neutral-500 mt-2">Осталось {formatMoney(Math.max(0, familyBudgetRemaining))} из {formatMoney(familyBudgetTotal)}</p>
      </button>
    </div>
  );
}

function CalendarScreen({ events, todayStr, onOpenIncome, onOpenExpense, onOpenObligationDue, filter, setFilter }) {
  const kinds = FILTER_KINDS[filter];
  const filtered = kinds ? events.filter((e) => kinds.includes(e.kind)) : events;
  const byDate = {};
  filtered.forEach((e) => { (byDate[e.date] = byDate[e.date] || []).push(e); });
  const dates = Object.keys(byDate).sort();

  function handleClick(ev) {
    if (ev.kind === 'income') onOpenIncome(ev.data);
    else if (ev.kind === 'expense') onOpenExpense(ev.data);
    else if (ev.kind === 'obligation_due') onOpenObligationDue(ev.data);
  }

  return (
    <div>
      <div className="flex items-center gap-x-3 gap-y-1.5 px-5 pb-2 flex-wrap">
        {LEGEND.map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: DOT_COLORS[l.color] }} />
            <span className="text-[11px] text-neutral-500">{l.label}</span>
          </div>
        ))}
      </div>
      <div className="flex gap-1 p-1 rounded-xl bg-[#141822] mx-5 mb-1">
        {FILTER_OPTIONS.map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={`flex-1 py-1.5 rounded-lg text-[12.5px] font-medium transition-colors ${filter === f.id ? 'bg-[#232936] text-neutral-100' : 'text-neutral-500'}`}
          >
            {f.label}
          </button>
        ))}
      </div>
      <div className="px-5">
        {dates.length === 0 && <p className="text-[13.5px] text-neutral-500 text-center py-10">Нет событий в этом месяце</p>}
        {dates.map((date) => (
          <div key={date} className="mb-1">
            <p className="text-[12.5px] font-medium text-neutral-500 pt-4 pb-1">{formatDayLabel(date, todayStr)}</p>
            <div className="divide-y divide-[#1B1F29]">
              {byDate[date].map((ev) => <EventRow key={ev.id} ev={ev} onOpen={handleClick} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BudgetScreen({ familyBudget, familyBudgetTotal, familyBudgetSpent, familySpentByCat, onEditCategory, onReset }) {
  const remaining = familyBudgetTotal - familyBudgetSpent;
  const pct = familyBudgetTotal > 0 ? (familyBudgetSpent / familyBudgetTotal) * 100 : 0;
  return (
    <div className="pb-4">
      <div className="px-5 pb-4">
        <p className="text-[13px] text-neutral-400 mb-1">{formatMoney(familyBudgetTotal)}</p>
        <p className="text-[13px] text-neutral-500">Потрачено {formatMoney(familyBudgetSpent)} · {remaining >= 0 ? 'осталось' : 'перерасход'} {formatMoney(Math.abs(remaining))}</p>
        <div className="mt-3"><ProgressBar value={pct} color={remaining < 0 ? '#FF6B6B' : '#7C9CFF'} /></div>
      </div>
      <div className="px-5 space-y-3">
        {familyBudget.map((c) => (
          <FamilyCategoryCard key={c.id} cat={c} spent={familySpentByCat[c.id] || 0} onEdit={onEditCategory} />
        ))}
        {familyBudget.length === 0 && <p className="text-[13.5px] text-neutral-500 text-center py-6">Категорий пока нет</p>}
      </div>
      <button onClick={onReset} className="w-full text-center text-[12.5px] text-neutral-600 py-4 mt-2 active:text-neutral-400 transition-colors">
        Сбросить все данные
      </button>
    </div>
  );
}

function ObligationsScreen({ obligations, stats, expandedId, setExpandedId, onAddPayment, onEdit, todayStr }) {
  return (
    <div className="pb-4">
      <div className="px-5 pb-4">
        <p className="text-[13px] text-neutral-400 mb-1">Осталось выплатить</p>
        <p className="text-[32px] font-bold tabular-nums" style={{ fontFamily: 'Manrope, sans-serif', color: '#FFB454' }}>{formatMoney(stats.totalRemaining)}</p>
        <div className="mt-3"><ProgressBar value={stats.progress} color="#33D6A0" /></div>
        <p className="text-[12px] text-neutral-500 mt-1.5">Погашено {formatMoney(stats.totalPaid)} из {formatMoney(stats.totalOriginal)}</p>
      </div>
      <div className="px-5 space-y-3">
        {obligations.map((o) => (
          <ObligationCard
            key={o.id}
            obligation={o}
            expanded={expandedId === o.id}
            onToggle={() => setExpandedId(expandedId === o.id ? null : o.id)}
            onAddPayment={onAddPayment}
            onEdit={onEdit}
            todayStr={todayStr}
          />
        ))}
        {obligations.length === 0 && <p className="text-[13.5px] text-neutral-500 text-center py-6">Обязательств пока нет</p>}
      </div>
    </div>
  );
}

/* ---------------------------------- modals ---------------------------------- */

function ModalShell({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 flex items-end justify-center"
      style={{
        zIndex: 1000,
        background: 'rgba(5,7,10,0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        animation: 'overlayIn .18s ease-out',
      }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] bg-[#12151C] rounded-t-3xl p-5 pb-8 max-h-[88vh] overflow-y-auto"
        style={{ animation: 'modalIn .22s cubic-bezier(0.16,1,0.3,1)', willChange: 'transform, opacity' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-10 h-1 rounded-full bg-[#2A2F3A] mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[17px] font-bold text-neutral-100" style={{ fontFamily: 'Manrope, sans-serif' }}>{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-full active:bg-white/5"><X size={20} className="text-neutral-400" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AmountInput({ value, onChange }) {
  return (
    <div className="mb-4">
      <input
        type="number" inputMode="decimal" value={value} onChange={(e) => onChange(e.target.value)} placeholder="0"
        className="w-full bg-transparent text-[36px] font-bold tabular-nums text-neutral-100 outline-none placeholder-neutral-700"
        style={{ fontFamily: 'Manrope, sans-serif' }}
      />
      <div className="h-px bg-[#20242E] mt-1" />
    </div>
  );
}

function TransactionModal({ initial, familyBudget, onClose, onSaveIncome, onSaveExpense, onDeleteIncome, onDeleteExpense }) {
  const isEditing = !!initial;
  const [type, setType] = useState(initial?.kind === 'income' ? 'income' : 'expense');
  const [incCategory, setIncCategory] = useState(initial?.kind === 'income' ? initial.data.category : INCOME_CATEGORIES[0].id);
  const [source, setSource] = useState(initial?.kind === 'income' ? initial.data.source : '');
  const [plannedAmount, setPlannedAmount] = useState(initial?.kind === 'income' ? String(initial.data.plannedAmount) : '');
  const [status, setStatus] = useState(initial?.kind === 'income' ? initial.data.status : 'expected');
  const [actualAmount, setActualAmount] = useState(initial?.kind === 'income' && initial.data.actualAmount != null ? String(initial.data.actualAmount) : '');
  const [expCategory, setExpCategory] = useState(initial?.kind === 'expense' ? initial.data.category : EXPENSE_CATEGORIES[0].id);
  const [expName, setExpName] = useState(initial?.kind === 'expense' ? initial.data.name : '');
  const [amount, setAmount] = useState(initial?.kind === 'expense' ? String(initial.data.amount) : '');
  const [isMandatory, setIsMandatory] = useState(initial?.kind === 'expense' ? !!initial.data.isMandatory : false);
  const [familyCatId, setFamilyCatId] = useState(initial?.kind === 'expense' ? (initial.data.familyBudgetCategoryId || '') : '');
  const [date, setDate] = useState(initial?.data?.date || toDateStr(new Date()));
  const [comment, setComment] = useState(initial?.data?.comment || '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  function handleStatusChange(next) {
    setStatus(next);
    if (next === 'received' && !actualAmount) setActualAmount(plannedAmount);
  }

  function handleSubmit() {
    if (type === 'income') {
      const planned = parseFloat(plannedAmount);
      if (!planned || planned <= 0 || !date || !source.trim()) return;
      const actual = status === 'received' ? (parseFloat(actualAmount) || planned) : null;
      onSaveIncome({ id: initial?.kind === 'income' ? initial.data.id : undefined, date, category: incCategory, source: source.trim(), plannedAmount: planned, status, actualAmount: actual, comment: comment.trim() });
    } else {
      const amt = parseFloat(amount);
      if (!amt || amt <= 0 || !date) return;
      onSaveExpense({ id: initial?.kind === 'expense' ? initial.data.id : undefined, date, category: expCategory, name: expName.trim() || getCategory(expCategory).label, amount: amt, isMandatory, familyBudgetCategoryId: familyCatId || null, comment: comment.trim() });
    }
    onClose();
  }

  function handleDelete() {
    if (type === 'income') onDeleteIncome(initial.data.id);
    else onDeleteExpense(initial.data.id);
    onClose();
  }

  return (
    <ModalShell title={isEditing ? (type === 'income' ? 'Изменить доход' : 'Изменить расход') : 'Новая операция'} onClose={onClose}>
      {!isEditing && (
        <div className="flex gap-2 mb-4 p-1 rounded-xl bg-[#1B2029]">
          <button onClick={() => setType('income')} className="flex-1 py-2 rounded-lg text-[13.5px] font-medium transition-colors" style={{ background: type === 'income' ? '#33D6A0' : 'transparent', color: type === 'income' ? '#0B0E14' : '#8992A3' }}>Доход</button>
          <button onClick={() => setType('expense')} className="flex-1 py-2 rounded-lg text-[13.5px] font-medium transition-colors" style={{ background: type === 'expense' ? '#FF6B6B' : 'transparent', color: type === 'expense' ? '#0B0E14' : '#8992A3' }}>Расход</button>
        </div>
      )}

      {type === 'income' ? (
        <>
          <AmountInput value={plannedAmount} onChange={setPlannedAmount} />
          <p className="text-[12.5px] text-neutral-500 mb-2">Категория</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {INCOME_CATEGORIES.map((c) => {
              const Icon = c.icon; const active = incCategory === c.id;
              return (
                <button key={c.id} onClick={() => setIncCategory(c.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] transition-colors"
                  style={active ? { background: '#33D6A022', color: '#33D6A0', border: '1px solid #33D6A0' } : { background: '#1B2029', color: '#8992A3', border: '1px solid transparent' }}>
                  <Icon size={14} />{c.label}
                </button>
              );
            })}
          </div>
          <p className="text-[12.5px] text-neutral-500 mb-1.5">Источник</p>
          <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Например, Ковчег" className="w-full bg-[#1B2029] rounded-xl px-3 py-2.5 text-[14px] text-neutral-200 outline-none placeholder-neutral-600 mb-4" />
          <p className="text-[12.5px] text-neutral-500 mb-1.5">Статус</p>
          <div className="flex gap-2 mb-4 p-1 rounded-xl bg-[#1B2029]">
            {STATUS_OPTIONS.map((s) => (
              <button key={s.id} onClick={() => handleStatusChange(s.id)} className="flex-1 py-2 rounded-lg text-[12px] font-medium transition-colors" style={{ background: status === s.id ? s.color : 'transparent', color: status === s.id ? '#0B0E14' : '#8992A3' }}>{s.label}</button>
            ))}
          </div>
          {status === 'received' && (
            <div className="mb-4">
              <p className="text-[12.5px] text-neutral-500 mb-1.5">Фактическая сумма</p>
              <input type="number" inputMode="decimal" value={actualAmount} onChange={(e) => setActualAmount(e.target.value)} placeholder={plannedAmount || '0'} className="w-full bg-[#1B2029] rounded-xl px-3 py-2.5 text-[14px] text-neutral-200 outline-none placeholder-neutral-600" />
            </div>
          )}
          <div className="mb-4">
            <p className="text-[12.5px] text-neutral-500 mb-1.5">Дата</p>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-[#1B2029] rounded-xl px-3 py-2.5 text-[14px] text-neutral-200 outline-none" />
          </div>
        </>
      ) : (
        <>
          <AmountInput value={amount} onChange={setAmount} />
          <p className="text-[12.5px] text-neutral-500 mb-2">Категория</p>
          <div className="flex flex-wrap gap-2 mb-4">
            {EXPENSE_CATEGORIES.map((c) => {
              const Icon = c.icon; const active = expCategory === c.id;
              return (
                <button key={c.id} onClick={() => setExpCategory(c.id)} className="flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] transition-colors"
                  style={active ? { background: '#FF6B6B22', color: '#FF6B6B', border: '1px solid #FF6B6B' } : { background: '#1B2029', color: '#8992A3', border: '1px solid transparent' }}>
                  <Icon size={14} />{c.label}
                </button>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <p className="text-[12.5px] text-neutral-500 mb-1.5">Дата</p>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-[#1B2029] rounded-xl px-3 py-2.5 text-[14px] text-neutral-200 outline-none" />
            </div>
            <div>
              <p className="text-[12.5px] text-neutral-500 mb-1.5">Название</p>
              <input type="text" value={expName} onChange={(e) => setExpName(e.target.value)} placeholder={getCategory(expCategory).label} className="w-full bg-[#1B2029] rounded-xl px-3 py-2.5 text-[14px] text-neutral-200 outline-none placeholder-neutral-600" />
            </div>
          </div>
          <p className="text-[12.5px] text-neutral-500 mb-1.5">Бюджет дома</p>
          <select value={familyCatId} onChange={(e) => setFamilyCatId(e.target.value)} className="w-full bg-[#1B2029] rounded-xl px-3 py-2.5 text-[14px] text-neutral-200 outline-none mb-3">
            <option value="">Не относится к бюджету дома</option>
            {familyBudget.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button type="button" onClick={() => setIsMandatory((v) => !v)} className="px-3 py-2 rounded-full text-[13px] transition-colors mb-4"
            style={isMandatory ? { background: '#FFB45422', color: '#FFB454', border: '1px solid #FFB454' } : { background: '#1B2029', color: '#8992A3', border: '1px solid transparent' }}>
            Обязательный платёж
          </button>
        </>
      )}

      <div className="mb-5">
        <p className="text-[12.5px] text-neutral-500 mb-1.5">Комментарий</p>
        <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Необязательно" className="w-full bg-[#1B2029] rounded-xl px-3 py-2.5 text-[14px] text-neutral-200 outline-none placeholder-neutral-600 resize-none" />
      </div>

      <button onClick={handleSubmit} className="w-full py-3.5 rounded-2xl text-[15px] font-semibold transition-transform active:scale-[0.98] mb-2.5" style={{ background: type === 'income' ? '#33D6A0' : '#FF6B6B', color: '#0B0E14' }}>Сохранить</button>

      {isEditing && (
        confirmDelete ? (
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(false)} className="flex-1 py-3 rounded-2xl text-[14px] font-medium text-neutral-400 bg-[#1B2029]">Отмена</button>
            <button onClick={handleDelete} className="flex-1 py-3 rounded-2xl text-[14px] font-medium bg-[#2A1A1D]" style={{ color: '#FF6B6B' }}>Удалить</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="w-full py-2.5 rounded-2xl text-[13.5px] font-medium text-neutral-500">Удалить</button>
        )
      )}
    </ModalShell>
  );
}

function ObligationPaymentModal({ obligation, onClose, onSave }) {
  const remaining = obligation.totalAmount - obligation.paidAmount;
  const defaultAmt = Math.max(0, Math.min(obligation.paymentDue || remaining, remaining));
  const [amount, setAmount] = useState(defaultAmt ? String(defaultAmt) : '');
  const [date, setDate] = useState(toDateStr(new Date()));
  const [comment, setComment] = useState('');
  function handleSubmit() { const amt = parseFloat(amount); if (!amt || amt <= 0) return; onSave(obligation.id, amt, date, comment.trim()); }
  return (
    <ModalShell title={`Платёж — ${obligation.name}`} onClose={onClose}>
      <AmountInput value={amount} onChange={setAmount} />
      <p className="text-[12.5px] text-neutral-500 mb-1.5">Дата</p>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-[#1B2029] rounded-xl px-3 py-2.5 text-[14px] text-neutral-200 outline-none mb-4" />
      <p className="text-[12.5px] text-neutral-500 mb-1.5">Комментарий</p>
      <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={2} placeholder="Необязательно" className="w-full bg-[#1B2029] rounded-xl px-3 py-2.5 text-[14px] text-neutral-200 outline-none resize-none mb-5 placeholder-neutral-600" />
      <button onClick={handleSubmit} className="w-full py-3.5 rounded-2xl text-[15px] font-semibold" style={{ background: '#FFB454', color: '#0B0E14' }}>Сохранить платёж</button>
    </ModalShell>
  );
}

function ObligationModal({ initial, onClose, onSave, onDelete }) {
  const [name, setName] = useState(initial?.name || '');
  const [totalAmount, setTotalAmount] = useState(initial ? String(initial.totalAmount) : '');
  const [paymentDue, setPaymentDue] = useState(initial ? String(initial.paymentDue) : '');
  const [dueDate, setDueDate] = useState(initial?.dueDate || toDateStr(new Date()));
  const [confirmDelete, setConfirmDelete] = useState(false);
  function handleSubmit() {
    const total = parseFloat(totalAmount);
    if (!name.trim() || !total || total <= 0) return;
    const due = parseFloat(paymentDue) || total;
    onSave({ id: initial?.id, name: name.trim(), totalAmount: total, paymentDue: due, dueDate });
    onClose();
  }
  return (
    <ModalShell title={initial ? 'Изменить обязательство' : 'Новое обязательство'} onClose={onClose}>
      <p className="text-[12.5px] text-neutral-500 mb-1.5">Название</p>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Кредитка" className="w-full bg-[#1B2029] rounded-xl px-3 py-2.5 text-[14px] text-neutral-200 outline-none placeholder-neutral-600 mb-4" />
      <p className="text-[12.5px] text-neutral-500 mb-1.5">Общая сумма</p>
      <input type="number" inputMode="decimal" value={totalAmount} onChange={(e) => setTotalAmount(e.target.value)} placeholder="0" className="w-full bg-[#1B2029] rounded-xl px-3 py-2.5 text-[14px] text-neutral-200 outline-none mb-4" />
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div>
          <p className="text-[12.5px] text-neutral-500 mb-1.5">Платёж к дате</p>
          <input type="number" inputMode="decimal" value={paymentDue} onChange={(e) => setPaymentDue(e.target.value)} placeholder={totalAmount || '0'} className="w-full bg-[#1B2029] rounded-xl px-3 py-2.5 text-[14px] text-neutral-200 outline-none" />
        </div>
        <div>
          <p className="text-[12.5px] text-neutral-500 mb-1.5">Дата платежа</p>
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-[#1B2029] rounded-xl px-3 py-2.5 text-[14px] text-neutral-200 outline-none" />
        </div>
      </div>
      <button onClick={handleSubmit} className="w-full py-3.5 rounded-2xl text-[15px] font-semibold mb-2.5" style={{ background: '#FFB454', color: '#0B0E14' }}>Сохранить</button>
      {initial && (
        confirmDelete ? (
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(false)} className="flex-1 py-3 rounded-2xl text-[14px] font-medium text-neutral-400 bg-[#1B2029]">Отмена</button>
            <button onClick={() => { onDelete(initial.id); onClose(); }} className="flex-1 py-3 rounded-2xl text-[14px] font-medium bg-[#2A1A1D]" style={{ color: '#FF6B6B' }}>Удалить</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="w-full py-2.5 rounded-2xl text-[13.5px] font-medium text-neutral-500">Удалить обязательство</button>
        )
      )}
    </ModalShell>
  );
}

function FamilyCategoryModal({ initial, onClose, onSave, onDelete }) {
  const [name, setName] = useState(initial?.name || '');
  const [limit, setLimit] = useState(initial ? String(initial.monthlyLimit) : '');
  const [confirmDelete, setConfirmDelete] = useState(false);
  function handleSubmit() {
    const lim = parseFloat(limit);
    if (!name.trim() || !lim || lim <= 0) return;
    onSave({ id: initial?.id, name: name.trim(), monthlyLimit: lim });
    onClose();
  }
  return (
    <ModalShell title={initial ? 'Изменить категорию' : 'Новая категория'} onClose={onClose}>
      <p className="text-[12.5px] text-neutral-500 mb-1.5">Название</p>
      <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Продукты" className="w-full bg-[#1B2029] rounded-xl px-3 py-2.5 text-[14px] text-neutral-200 outline-none placeholder-neutral-600 mb-4" />
      <p className="text-[12.5px] text-neutral-500 mb-1.5">Лимит в месяц</p>
      <input type="number" inputMode="decimal" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder="0" className="w-full bg-[#1B2029] rounded-xl px-3 py-2.5 text-[14px] text-neutral-200 outline-none mb-5" />
      <button onClick={handleSubmit} className="w-full py-3.5 rounded-2xl text-[15px] font-semibold mb-2.5" style={{ background: '#7C9CFF', color: '#0B0E14' }}>Сохранить</button>
      {initial && (
        confirmDelete ? (
          <div className="flex gap-2">
            <button onClick={() => setConfirmDelete(false)} className="flex-1 py-3 rounded-2xl text-[14px] font-medium text-neutral-400 bg-[#1B2029]">Отмена</button>
            <button onClick={() => { onDelete(initial.id); onClose(); }} className="flex-1 py-3 rounded-2xl text-[14px] font-medium bg-[#2A1A1D]" style={{ color: '#FF6B6B' }}>Удалить</button>
          </div>
        ) : (
          <button onClick={() => setConfirmDelete(true)} className="w-full py-2.5 rounded-2xl text-[13.5px] font-medium text-neutral-500">Удалить категорию</button>
        )
      )}
    </ModalShell>
  );
}

function BalanceEditModal({ currentBalance, onClose, onSave }) {
  const [value, setValue] = useState(String(Math.round(currentBalance)));
  function handleSubmit() { const v = parseFloat(value); if (isNaN(v)) return; onSave(v); onClose(); }
  return (
    <ModalShell title="Изменить текущий баланс" onClose={onClose}>
      <AmountInput value={value} onChange={setValue} />
      <p className="text-[12px] text-neutral-500 mb-5">Укажите фактический остаток на счёте сейчас. Дальнейшие доходы и расходы будут пересчитываться от этого значения.</p>
      <button onClick={handleSubmit} className="w-full py-3.5 rounded-2xl text-[15px] font-semibold" style={{ background: '#33D6A0', color: '#0B0E14' }}>Сохранить</button>
    </ModalShell>
  );
}

function BottomNav({ active, setActive }) {
  const items = [
    { id: 'home', label: 'Главная', icon: LayoutDashboard },
    { id: 'calendar', label: 'Календарь', icon: CalendarDays },
    { id: 'budget', label: 'Бюджет', icon: Home },
    { id: 'obligations', label: 'Обязат.', icon: Landmark },
  ];
  return (
    <div className="flex items-center border-t border-[#1B1F29] bg-[#0B0E14]/95 backdrop-blur px-2" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
      {items.map((it) => {
        const Icon = it.icon; const isActive = active === it.id; const color = isActive ? '#33D6A0' : '#5C6270';
        return (
          <button key={it.id} onClick={() => setActive(it.id)} className="flex-1 flex flex-col items-center gap-1 py-2.5 transition-colors">
            <Icon size={21} style={{ color }} />
            <span className="text-[10.5px] font-medium" style={{ color }}>{it.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------ app ------------------------------------ */

export default function App() {
  const [loading, setLoading] = useState(true);
  const [incomes, setIncomes] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [familyBudget, setFamilyBudget] = useState([]);
  const [obligations, setObligations] = useState([]);
  const [startingBalance, setStartingBalance] = useState(0);
  const [activeTab, setActiveTab] = useState('home');
  const [cursor, setCursor] = useState(() => { const n = new Date(); return { year: n.getFullYear(), month: n.getMonth() }; });
  const [calFilter, setCalFilter] = useState('all');
  const [txModal, setTxModal] = useState(undefined); // undefined = closed, null = new, {kind,data} = edit
  const [obligationModal, setObligationModal] = useState(undefined);
  const [obligationPayModal, setObligationPayModal] = useState(null);
  const [familyCatModal, setFamilyCatModal] = useState(undefined);
  const [balanceEditOpen, setBalanceEditOpen] = useState(false);
  const [expandedObligationId, setExpandedObligationId] = useState(null);
  const [saveError, setSaveError] = useState(false);

  useEffect(() => {
    const data = loadFromStorage();
    const valid = data && Array.isArray(data.incomes) && Array.isArray(data.expenses) && Array.isArray(data.familyBudget) && Array.isArray(data.obligations) && typeof data.startingBalance === 'number';
    const final = valid ? data : { incomes: seedIncomes(), expenses: seedExpenses(), familyBudget: seedFamilyBudget(), obligations: seedObligations(), startingBalance: SEED_STARTING_BALANCE };
    setIncomes(final.incomes);
    setExpenses(final.expenses);
    setFamilyBudget(final.familyBudget);
    setObligations(final.obligations);
    setStartingBalance(final.startingBalance);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (loading) return;
    const ok = saveToStorage({ incomes, expenses, familyBudget, obligations, startingBalance });
    setSaveError(!ok);
  }, [incomes, expenses, familyBudget, obligations, startingBalance, loading]);

  function shiftMonth(delta) {
    setCursor((c) => { let m = c.month + delta, y = c.year; if (m < 0) { m = 11; y -= 1; } if (m > 11) { m = 0; y += 1; } return { year: y, month: m }; });
  }

  const saveIncome = useCallback((data) => {
    setIncomes((prev) => data.id ? prev.map((i) => (i.id === data.id ? { ...i, ...data } : i)) : [...prev, { ...data, id: genId() }]);
  }, []);
  const deleteIncome = useCallback((id) => setIncomes((prev) => prev.filter((i) => i.id !== id)), []);
  const saveExpense = useCallback((data) => {
    setExpenses((prev) => data.id ? prev.map((e) => (e.id === data.id ? { ...e, ...data } : e)) : [...prev, { ...data, id: genId() }]);
  }, []);
  const deleteExpense = useCallback((id) => setExpenses((prev) => prev.filter((e) => e.id !== id)), []);

  const saveObligation = useCallback((data) => {
    if (data.id) setObligations((prev) => prev.map((o) => (o.id === data.id ? { ...o, ...data } : o)));
    else setObligations((prev) => [...prev, { id: genId(), name: data.name, totalAmount: data.totalAmount, paidAmount: 0, paymentDue: data.paymentDue, dueDate: data.dueDate, history: [] }]);
  }, []);
  const deleteObligation = useCallback((id) => setObligations((prev) => prev.filter((o) => o.id !== id)), []);
  const addObligationPayment = useCallback((obligationId, amount, date, comment) => {
    setObligations((prev) => prev.map((o) => {
      if (o.id !== obligationId) return o;
      const newPaid = Math.min(o.totalAmount, o.paidAmount + amount);
      return { ...o, paidAmount: newPaid, history: [...o.history, { id: genId(), date, amount, comment }] };
    }));
    setObligationPayModal(null);
  }, []);

  const saveFamilyCategory = useCallback((data) => {
    if (data.id) setFamilyBudget((prev) => prev.map((c) => (c.id === data.id ? { ...c, ...data } : c)));
    else setFamilyBudget((prev) => [...prev, { id: genId(), name: data.name, monthlyLimit: data.monthlyLimit }]);
  }, []);
  const deleteFamilyCategory = useCallback((id) => {
    setFamilyBudget((prev) => prev.filter((c) => c.id !== id));
    setExpenses((prev) => prev.map((e) => (e.familyBudgetCategoryId === id ? { ...e, familyBudgetCategoryId: null } : e)));
  }, []);

  function handleReset() {
    setIncomes(seedIncomes());
    setExpenses(seedExpenses());
    setFamilyBudget(seedFamilyBudget());
    setObligations(seedObligations());
    setStartingBalance(SEED_STARTING_BALANCE);
    setCursor({ year: 2026, month: 8 });
  }

  const todayStr = toDateStr(new Date());
  const monthKey = `${cursor.year}-${pad2(cursor.month + 1)}`;

  const globalReceivedIncome = useMemo(() => incomes.reduce((s, i) => s + (i.status === 'received' ? (i.actualAmount ?? i.plannedAmount) : 0), 0), [incomes]);
  const globalExpensesTotal = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses]);
  const globalObligationPayments = useMemo(() => obligations.reduce((s, o) => s + o.history.reduce((s2, h) => s2 + h.amount, 0), 0), [obligations]);
  const currentBalance = startingBalance + globalReceivedIncome - globalExpensesTotal - globalObligationPayments;

  const updateBalance = useCallback((newBalance) => {
    const delta = globalReceivedIncome - globalExpensesTotal - globalObligationPayments;
    setStartingBalance(newBalance - delta);
  }, [globalReceivedIncome, globalExpensesTotal, globalObligationPayments]);

  const monthIncomes = useMemo(() => incomes.filter((i) => i.date.startsWith(monthKey)), [incomes, monthKey]);
  const monthExpenses = useMemo(() => expenses.filter((e) => e.date.startsWith(monthKey)), [expenses, monthKey]);
  const monthObligations = useMemo(() => obligations.filter((o) => o.dueDate && o.dueDate.startsWith(monthKey)), [obligations, monthKey]);

  const incomeStats = useMemo(() => {
    let received = 0, expected = 0;
    monthIncomes.forEach((i) => {
      if (i.status === 'received') received += (i.actualAmount ?? i.plannedAmount);
      if (i.status === 'expected') expected += i.plannedAmount;
    });
    return { received, expected };
  }, [monthIncomes]);

  const familyBudgetTotal = useMemo(() => familyBudget.reduce((s, c) => s + c.monthlyLimit, 0), [familyBudget]);
  const familySpentByCat = useMemo(() => {
    const map = {};
    monthExpenses.forEach((e) => { if (e.familyBudgetCategoryId) map[e.familyBudgetCategoryId] = (map[e.familyBudgetCategoryId] || 0) + e.amount; });
    return map;
  }, [monthExpenses]);
  const familyBudgetSpent = useMemo(() => Object.values(familySpentByCat).reduce((s, v) => s + v, 0), [familySpentByCat]);
  const familyBudgetRemaining = familyBudgetTotal - familyBudgetSpent;

  const obligationsDueStats = useMemo(() => {
    let dueTotal = 0, unpaidDue = 0;
    const dueList = [];
    monthObligations.forEach((o) => {
      const remaining = o.totalAmount - o.paidAmount;
      if (remaining > 0) {
        dueTotal += o.paymentDue;
        unpaidDue += Math.max(0, Math.min(o.paymentDue, remaining));
        dueList.push(o);
      }
    });
    dueList.sort((a, b) => a.dueDate.localeCompare(b.dueDate));
    return { dueTotal, unpaidDue, dueList };
  }, [monthObligations]);

  const expensesActualTotal = useMemo(() => monthExpenses.reduce((s, e) => s + e.amount, 0), [monthExpenses]);

  const upcomingIncomes = useMemo(
    () => monthIncomes.filter((i) => i.status === 'expected').sort((a, b) => a.date.localeCompare(b.date)),
    [monthIncomes]
  );

  const freeMoney = useMemo(() => {
    const familyRemainingClamped = Math.max(0, familyBudgetRemaining);
    const value = currentBalance + incomeStats.expected - obligationsDueStats.unpaidDue - familyRemainingClamped;
    return { value, breakdown: { expected: incomeStats.expected, obligations: obligationsDueStats.unpaidDue, family: familyRemainingClamped } };
  }, [currentBalance, incomeStats.expected, obligationsDueStats.unpaidDue, familyBudgetRemaining]);

  const obligationsGlobalStats = useMemo(() => {
    const totalRemaining = obligations.reduce((s, o) => s + Math.max(0, o.totalAmount - o.paidAmount), 0);
    const totalOriginal = obligations.reduce((s, o) => s + o.totalAmount, 0);
    const totalPaid = totalOriginal - totalRemaining;
    const progress = totalOriginal > 0 ? (totalPaid / totalOriginal) * 100 : 0;
    return { totalRemaining, totalOriginal, totalPaid, progress };
  }, [obligations]);

  const calendarEvents = useMemo(() => buildCalendarEvents(monthIncomes, monthExpenses, obligations, monthKey), [monthIncomes, monthExpenses, obligations, monthKey]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex justify-center" style={{ background: '#05070A' }}>
        <div className="w-full max-w-[430px] min-h-screen flex items-center justify-center" style={{ background: '#0B0E14' }}>
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#33D6A0', borderTopColor: 'transparent' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex justify-center" style={{ background: '#05070A' }}>
      <div className="w-full max-w-[430px] min-h-screen flex flex-col relative" style={{ background: '#0B0E14' }}>
        <div className="px-5 pt-6 pb-1 flex items-center justify-between">
          <p className="text-[20px] font-bold text-neutral-100" style={{ fontFamily: 'Manrope, sans-serif' }}>{TAB_TITLES[activeTab]}</p>
          {saveError && <AlertCircle size={18} style={{ color: '#FF6B6B' }} />}
        </div>

        {activeTab !== 'obligations' && (
          <MonthSwitcher year={cursor.year} month={cursor.month} onPrev={() => shiftMonth(-1)} onNext={() => shiftMonth(1)} />
        )}

        <div className="flex-1 overflow-y-auto fade-in" key={activeTab}>
          {activeTab === 'home' && (
            <HomeScreen
              balance={currentBalance} incomeStats={incomeStats} expensesActualTotal={expensesActualTotal}
              obligationsDueStats={obligationsDueStats} upcomingIncomes={upcomingIncomes} familyBudgetTotal={familyBudgetTotal} familyBudgetSpent={familyBudgetSpent}
              familyBudgetRemaining={familyBudgetRemaining} freeMoney={freeMoney} todayStr={todayStr}
              onGoObligations={() => setActiveTab('obligations')} onGoBudget={() => setActiveTab('budget')}
              onGoIncome={() => setActiveTab('calendar')} onEditBalance={() => setBalanceEditOpen(true)}
            />
          )}
          {activeTab === 'calendar' && (
            <CalendarScreen
              events={calendarEvents} todayStr={todayStr}
              onOpenIncome={(data) => setTxModal({ kind: 'income', data })}
              onOpenExpense={(data) => setTxModal({ kind: 'expense', data })}
              onOpenObligationDue={(o) => setObligationPayModal(o)}
              filter={calFilter} setFilter={setCalFilter}
            />
          )}
          {activeTab === 'budget' && (
            <BudgetScreen
              familyBudget={familyBudget} familyBudgetTotal={familyBudgetTotal} familyBudgetSpent={familyBudgetSpent}
              familySpentByCat={familySpentByCat} onEditCategory={(c) => setFamilyCatModal(c)} onReset={handleReset}
            />
          )}
          {activeTab === 'obligations' && (
            <ObligationsScreen
              obligations={obligations} stats={obligationsGlobalStats} expandedId={expandedObligationId}
              setExpandedId={setExpandedObligationId} onAddPayment={(o) => setObligationPayModal(o)}
              onEdit={(o) => setObligationModal(o)} todayStr={todayStr}
            />
          )}
          <div className="h-24" />
        </div>

        {(activeTab === 'home' || activeTab === 'calendar') && (
          <button onClick={() => setTxModal(null)} className="absolute right-5 bottom-24 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 z-30" style={{ background: '#33D6A0' }}>
            <Plus size={26} style={{ color: '#0B0E14' }} />
          </button>
        )}
        {activeTab === 'budget' && (
          <button onClick={() => setFamilyCatModal(null)} className="absolute right-5 bottom-24 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 z-30" style={{ background: '#7C9CFF' }}>
            <Plus size={26} style={{ color: '#0B0E14' }} />
          </button>
        )}
        {activeTab === 'obligations' && (
          <button onClick={() => setObligationModal(null)} className="absolute right-5 bottom-24 w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-90 z-30" style={{ background: '#FFB454' }}>
            <Plus size={26} style={{ color: '#0B0E14' }} />
          </button>
        )}

        <BottomNav active={activeTab} setActive={setActiveTab} />
      </div>

      {txModal !== undefined && (
        <TransactionModal
          initial={txModal} familyBudget={familyBudget} onClose={() => setTxModal(undefined)}
          onSaveIncome={saveIncome} onSaveExpense={saveExpense} onDeleteIncome={deleteIncome} onDeleteExpense={deleteExpense}
        />
      )}
      {obligationPayModal && (
        <ObligationPaymentModal obligation={obligationPayModal} onClose={() => setObligationPayModal(null)} onSave={addObligationPayment} />
      )}
      {obligationModal !== undefined && (
        <ObligationModal initial={obligationModal} onClose={() => setObligationModal(undefined)} onSave={saveObligation} onDelete={deleteObligation} />
      )}
      {familyCatModal !== undefined && (
        <FamilyCategoryModal initial={familyCatModal} onClose={() => setFamilyCatModal(undefined)} onSave={saveFamilyCategory} onDelete={deleteFamilyCategory} />
      )}
      {balanceEditOpen && (
        <BalanceEditModal currentBalance={currentBalance} onClose={() => setBalanceEditOpen(false)} onSave={updateBalance} />
      )}
    </div>
  );
}
