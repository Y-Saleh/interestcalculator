import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { GraduationCap, Calculator, Briefcase, TrendingUp, Landmark, CircleDollarSign } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const UI = {
  Card: ({ children, className }) => (
    <div className={cn("bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl rounded-2xl p-6", className)}>
      {children}
    </div>
  ),
  Label: ({ children, className }) => (
    <label className={cn("block text-sm font-medium text-slate-300 mb-2", className)}>
      {children}
    </label>
  ),
  Input: ({ className, ...props }) => (
    <input
      className={cn("w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all placeholder:text-slate-500", className)}
      {...props}
    />
  ),
  Select: ({ className, children, ...props }) => (
    <select
      className={cn("w-full bg-slate-950/50 border border-white/10 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all appearance-none", className)}
      {...props}
    >
      {children}
    </select>
  ),
  StatBox: ({ title, value, icon: Icon, colorClass }) => (
    <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 p-5 flex items-center gap-4 rounded-2xl relative overflow-hidden group">
      <div className={cn("absolute inset-0 opacity-10 blur-xl transition-opacity group-hover:opacity-20", colorClass.replace('text-', 'bg-'))}></div>
      <div className={cn("p-4 rounded-xl bg-slate-950/50 border border-white/5", colorClass)}>
        <Icon size={24} />
      </div>
      <div className="z-10">
        <p className="text-slate-400 text-sm font-medium">{title}</p>
        <h4 className="text-2xl font-bold text-white tracking-tight">{value}</h4>
      </div>
    </div>
  )
};

export default function App() {
  const [balance, setBalance] = useState(45000);
  const [salary, setSalary] = useState(30000);
  const [salaryGrowth, setSalaryGrowth] = useState(3.0);
  const [planType, setPlanType] = useState('Plan 2');
  const [loanInterestRate, setLoanInterestRate] = useState(7.7);
  const [sp500Return, setSp500Return] = useState(10.0);

  const formatCurrency = (val) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(Math.round(val));

  const projections = useMemo(() => {
    const isPlan2 = planType === 'Plan 2';
    const threshold = isPlan2 ? 27295 : 25000;
    const maxYears = isPlan2 ? 30 : 40;
    const repaymentRate = 0.09;

    let currentBalance = parseFloat(balance) || 0;
    let currentSalary = parseFloat(salary) || 0;
    let cumulativePaid = 0;
    let sp500Balance = 0;

    const sRate = (parseFloat(salaryGrowth) || 0) / 100;
    const iRate = (parseFloat(loanInterestRate) || 0) / 100;
    const spRate = (parseFloat(sp500Return) || 0) / 100;

    let data = [];

    for (let year = 1; year <= maxYears; year++) {
      // Add interest to balance
      currentBalance += currentBalance * iRate;

      // Calculate repayment
      let repayment = 0;
      if (currentSalary > threshold) {
        repayment = (currentSalary - threshold) * repaymentRate;
      }

      if (repayment > currentBalance) {
        repayment = currentBalance;
      }

      currentBalance -= repayment;
      if (currentBalance < 0) currentBalance = 0;

      cumulativePaid += repayment;

      // Opportunity cost calculation
      sp500Balance = sp500Balance * (1 + spRate) + repayment;

      data.push({
        year: `Year ${year}`,
        balance: Math.round(currentBalance),
        cumulativePaid: Math.round(cumulativePaid),
        sp500Balance: Math.round(sp500Balance),
      });

      // Increase salary for next year
      currentSalary *= (1 + sRate);
    }

    return data;
  }, [balance, salary, salaryGrowth, planType, loanInterestRate, sp500Return]);

  const finalState = projections[projections.length - 1] || {};
  const totalPaid = finalState.cumulativePaid || 0;
  const writtenOff = finalState.balance || 0;
  const oppCost = finalState.sp500Balance || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-violet-500/30">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 relative z-10">
        <header className="mb-12">
          <div className="inline-flex items-center gap-3 bg-violet-500/10 text-violet-400 px-4 py-2 rounded-full text-sm font-semibold mb-6 ring-1 ring-violet-500/20">
            <GraduationCap size={18} />
            <span>Student Finance Analyser</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight leading-tight">
            Student Loan Dashboard
          </h1>
          <p className="text-slate-400 mt-4 text-lg max-w-2xl">
            Project your loan repayments up to the final write-off date. Track how much you'll pay and discover the true opportunity cost of your payments if invested in the S&P 500.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Config */}
          <div className="lg:col-span-4 space-y-6">
            <UI.Card>
              <div className="flex items-center gap-3 mb-6">
                <Calculator className="text-violet-400" />
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-indigo-300">Loan Parameters</h2>
              </div>

              <div className="space-y-5">
                <div>
                  <UI.Label>Plan Type</UI.Label>
                  <div className="relative">
                    <UI.Select
                      value={planType}
                      onChange={e => {
                        const val = e.target.value;
                        setPlanType(val);
                        if (val === 'Plan 2') setLoanInterestRate(7.7);
                        if (val === 'Plan 5') setLoanInterestRate(4.3);
                      }}
                    >
                      <option value="Plan 2">Plan 2 (Pre-2023, 30 years)</option>
                      <option value="Plan 5">Plan 5 (Post-2023, 40 years)</option>
                    </UI.Select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-500">
                      ▼
                    </div>
                  </div>
                </div>

                <div>
                  <UI.Label>Current Loan Balance (£)</UI.Label>
                  <UI.Input
                    type="number"
                    value={balance}
                    onChange={e => setBalance(e.target.value)}
                    placeholder="e.g. 45000"
                  />
                </div>

                <div>
                  <UI.Label>Starting Salary (£)</UI.Label>
                  <div className="relative">
                    <span className="absolute left-4 top-3 text-slate-500">£</span>
                    <UI.Input
                      className="pl-8"
                      type="number"
                      value={salary}
                      onChange={e => setSalary(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <UI.Label>Salary Growth (%)</UI.Label>
                    <UI.Input
                      type="number" step="0.1"
                      value={salaryGrowth}
                      onChange={e => setSalaryGrowth(e.target.value)}
                    />
                  </div>
                  <div>
                    <UI.Label>Loan Interest (%)</UI.Label>
                    <UI.Input
                      type="number" step="0.1"
                      value={loanInterestRate}
                      onChange={e => setLoanInterestRate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                  <UI.Label className="flex items-center gap-2">
                    <TrendingUp size={16} className="text-emerald-400" />
                    S&P 500 Expected Return (%)
                  </UI.Label>
                  <UI.Input
                    type="number" step="0.1"
                    value={sp500Return}
                    onChange={e => setSp500Return(e.target.value)}
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Discover the opportunity cost if your repayments were invested instead (default 10%).
                  </p>
                </div>
              </div>
            </UI.Card>
          </div>

          {/* Key Metrics and Charts */}
          <div className="lg:col-span-8 flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <UI.StatBox
                title="Total Repaid"
                value={formatCurrency(totalPaid)}
                icon={Briefcase}
                colorClass="text-blue-400"
              />
              <UI.StatBox
                title="S&P 500 Opportunity Cost"
                value={formatCurrency(oppCost)}
                icon={CircleDollarSign}
                colorClass="text-emerald-400"
              />
              <UI.StatBox
                title="Amount Written Off"
                value={formatCurrency(writtenOff)}
                icon={Landmark}
                colorClass="text-rose-400"
              />
            </div>

            <UI.Card className="flex-1 min-h-[450px] flex flex-col">
              <h2 className="text-xl font-bold mb-6 text-slate-200">Projection Over Time</h2>
              <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={projections} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPaid" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#60a5fa" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#60a5fa" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorSp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#34d399" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#34d399" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff15" vertical={false} />
                    <XAxis
                      dataKey="year"
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      dy={10}
                    />
                    <YAxis
                      stroke="#94a3b8"
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      dx={-10}
                      tickFormatter={(val) => `£${(val / 1000).toFixed(0)}k`}
                    />
                    <RechartsTooltip
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#ffffff1a', borderRadius: '12px', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
                      itemStyle={{ fontWeight: 600 }}
                      formatter={(value, name) => [formatCurrency(value), name === 'sp500Balance' ? 'S&P 500 Inv. Value' : name === 'balance' ? 'Loan Balance' : 'Cumulative Paid']}
                    />

                    <Area type="monotone" dataKey="balance" name="Loan Balance" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorBalance)" />
                    <Area type="monotone" dataKey="cumulativePaid" name="Cumulative Paid" stroke="#60a5fa" strokeWidth={2} fillOpacity={1} fill="url(#colorPaid)" />
                    <Area type="monotone" dataKey="sp500Balance" name="S&P 500 Inv. Value" stroke="#34d399" strokeWidth={2} fillOpacity={1} fill="url(#colorSp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex flex-wrap justify-center gap-6 mt-6 border-t border-white/5 pt-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.5)]"></div>
                  <span className="text-sm font-medium text-slate-300">Loan Balance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(96,165,250,0.5)]"></div>
                  <span className="text-sm font-medium text-slate-300">Cumulative Paid</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
                  <span className="text-sm font-medium text-slate-300">S&P 500 Opp. Cost</span>
                </div>
              </div>
            </UI.Card>

            {/* Opportunity Cost Explanation Section */}
            <UI.Card className="border-violet-500/20 bg-violet-900/10">
              <h3 className="text-xl font-bold mb-3 text-slate-200 flex items-center gap-2">
                <CircleDollarSign className="text-emerald-400" /> What is Opportunity Cost?
              </h3>
              <p className="text-slate-400 leading-relaxed text-sm md:text-base">
                In finance, <strong className="text-emerald-400 font-medium">Opportunity Cost</strong> represents the potential benefits you miss out on when you choose one financial alternative over another. Every pound that automatically goes towards repaying your student loan is a pound you cannot invest elsewhere in the market.
              </p>
              <p className="text-slate-400 leading-relaxed mt-3 text-sm md:text-base">
                The <span className="text-emerald-400 font-medium whitespace-nowrap">S&P 500 Opportunity Cost</span> metric tracks exactly how much wealth you could have accumulated if you simply took off the mandatory monthly payments for your student loan and instead invested them into an index fund tracking the S&P 500, growing at the return rate provided above.
              </p>
            </UI.Card>
          </div>
        </div>

      </div>
    </div>
  );
}
