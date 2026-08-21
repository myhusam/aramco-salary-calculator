// Design philosophy: Desert Ledger — editorial finance utility with parchment surfaces, petrol ink, burnt-amber signals, and a clear split workbench.
import { useMemo, useState } from "react";
import { ArrowUpRight, Calculator, CircleHelp, RotateCcw, ShieldCheck, Sparkles } from "lucide-react";

const GOSI_RATE = 0.0975;

function formatSAR(value: number) {
  return new Intl.NumberFormat("en-SA", {
    style: "currency",
    currency: "SAR",
    maximumFractionDigits: 2,
  }).format(value);
}

export default function Home() {
  const [basicSalary, setBasicSalary] = useState("");
  const [housing, setHousing] = useState("");
  const [bonus, setBonus] = useState("");
  const [housingMethod, setHousingMethod] = useState<"percent" | "annual">("annual");
  const [hasCalculated, setHasCalculated] = useState(false);

  const values = useMemo(() => {
    const basic = Math.max(0, Number(basicSalary) || 0);
    const annualHousing = Math.max(0, Number(housing) || 0);
    const annualBonus = Math.max(0, Number(bonus) || 0);
    const gosi = basic * GOSI_RATE;
    const monthlyHousing = housingMethod === "percent" ? basic * 0.25 : annualHousing / 12;
    const monthlyBonus = annualBonus / 12;
    const net = basic - gosi + monthlyHousing + monthlyBonus;
    return { basic, annualHousing, annualBonus, gosi, monthlyHousing, monthlyBonus, net };
  }, [basicSalary, housing, bonus, housingMethod]);

  const canCalculate = values.basic > 0;

  function calculate() {
    if (canCalculate) setHasCalculated(true);
  }

  function reset() {
    setBasicSalary("");
    setHousing("");
    setBonus("");
    setHousingMethod("annual");
    setHasCalculated(false);
  }

  return (
    <main className="min-h-screen bg-[#f1eadf] text-[#193b3b] selection:bg-[#c96832] selection:text-white">
      <div className="ledger-shell">
        <header className="site-header">
          <div className="brand-lockup" aria-label="Aramco Salary Calculator">
            <div className="brand-mark" aria-hidden="true">
              <img src="/manus-storage/ledger-logo_d03adc0a.png" alt="" />
            </div>
            <div>
              <p className="brand-name">aramco / paydesk</p>
              <p className="brand-subtitle">Monthly salary companion</p>
            </div>
          </div>
          <div className="header-note"><ShieldCheck size={16} /> Built for clarity</div>
        </header>

        <section className="hero-grid">
          <div className="intro-column">
            <div className="eyebrow"><span className="eyebrow-dot" /> Payroll, made legible</div>
            <h1>See what lands<br /><em>in your month.</em></h1>
            <p className="intro-copy">A simple estimate of your Aramco monthly net salary. Enter your basic salary and annual allowances; we’ll normalize the yearly figures for you.</p>
            <div className="rule-note">
              <div className="rule-marker" />
              <div>
                <p>One clean calculation</p>
                <span>Basic salary − 9.75% GOSI<br />+ monthly housing + monthly bonus</span>
              </div>
            </div>
            <p className="disclaimer"><CircleHelp size={14} /> Estimate only. Your official payslip remains the source of truth.</p>
          </div>

          <section className="calculator-workbench" aria-labelledby="calculator-title">
            <div className="workbench-topline">
              <div>
                <p className="section-kicker">01 / Your inputs</p>
                <h2 id="calculator-title">Build your monthly picture</h2>
              </div>
              <Calculator className="workbench-icon" size={24} strokeWidth={1.5} />
            </div>

            <div className="input-stack">
              <label className="salary-field">
                <span className="field-label">Basic salary <small>Monthly</small></span>
                <span className="input-wrap"><span className="currency-prefix">SAR</span><input inputMode="decimal" type="number" min="0" placeholder="0.00" value={basicSalary} onChange={(e) => { setBasicSalary(e.target.value); setHasCalculated(false); }} /></span>
                <span className="field-help">GOSI is deducted from this amount.</span>
              </label>
              <div className="salary-field housing-field">
                <span className="field-label">Housing <small>Choose a method</small></span>
                <div className="housing-methods" role="group" aria-label="Housing calculation method">
                  <button type="button" className={`method-option ${housingMethod === "percent" ? "selected" : ""}`} onClick={() => { setHousingMethod("percent"); setHasCalculated(false); }}><strong>25%</strong><span>of basic salary</span></button>
                  <button type="button" className={`method-option ${housingMethod === "annual" ? "selected" : ""}`} onClick={() => { setHousingMethod("annual"); setHasCalculated(false); }}><strong>Annual ÷ 12</strong><span>monthly equivalent</span></button>
                </div>
                {housingMethod === "annual" ? <><span className="input-wrap"><span className="currency-prefix">SAR</span><input inputMode="decimal" type="number" min="0" placeholder="0.00" value={housing} onChange={(e) => { setHousing(e.target.value); setHasCalculated(false); }} /></span><span className="field-help">Enter the yearly housing amount; we divide it by 12.</span></> : <span className="field-help method-note">Housing will be calculated as 25% of your monthly basic salary.</span>}
              </div>
              <label className="salary-field">
                <span className="field-label">Ramadan / bonus <small>Annual amount</small></span>
                <span className="input-wrap"><span className="currency-prefix">SAR</span><input inputMode="decimal" type="number" min="0" placeholder="0.00" value={bonus} onChange={(e) => { setBonus(e.target.value); setHasCalculated(false); }} /></span>
                <span className="field-help">Optional — also normalized to a monthly figure.</span>
              </label>
            </div>

            <div className="action-row">
              <button className="primary-action" type="button" onClick={calculate} disabled={!canCalculate}>Calculate net salary <ArrowUpRight size={18} /></button>
              <button className="reset-action" type="button" onClick={reset}><RotateCcw size={15} /> Reset</button>
            </div>
          </section>
        </section>

        <section className={`result-section ${hasCalculated ? "is-ready" : ""}`} aria-live="polite">
          <div className="result-copy">
            <p className="section-kicker light">02 / Your estimate</p>
            <h2>{hasCalculated ? "Your estimated net salary" : "Your net salary will appear here"}</h2>
            <p>{hasCalculated ? "A monthly estimate after GOSI and annual allowances are accounted for." : "Add your basic salary to reveal the monthly calculation."}</p>
          </div>
          <div className="result-amount"><span>{hasCalculated ? formatSAR(values.net) : "SAR —"}</span><small>per month</small></div>
          <div className="breakdown">
            <div><span>Basic salary</span><strong>{formatSAR(values.basic)}</strong></div>
            <div><span>GOSI · 9.75%</span><strong className="negative">− {formatSAR(values.gosi)}</strong></div>
            <div><span>{housingMethod === "percent" ? "Housing · 25% of basic" : "Housing / 12"}</span><strong>+ {formatSAR(values.monthlyHousing)}</strong></div>
            <div><span>Bonus / 12</span><strong>+ {formatSAR(values.monthlyBonus)}</strong></div>
          </div>
        </section>

        <footer className="site-footer"><span>Aramco Salary Calculator</span><span className="footer-center"><Sparkles size={14} /> Made for a clearer payday</span><span>GOSI rate applied: 9.75%</span></footer>
      </div>
    </main>
  );
}
