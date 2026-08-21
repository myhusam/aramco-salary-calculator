// Design philosophy: Desert Ledger — editorial finance utility with parchment surfaces, petrol ink, burnt-amber signals, and a clear split workbench.
import { useMemo, useState } from "react";
import { ArrowUpRight, Calculator, CircleHelp, FileCheck2, FileUp, RotateCcw, ShieldCheck, Sparkles, X } from "lucide-react";
import { trpc } from "@/lib/trpc";

const GOSI_RATE = 0.0975;
const acceptedCertificateTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"] as const;
type CertificateMimeType = (typeof acceptedCertificateTypes)[number];
type ExtractedSalary = { basicSalary: number | null; housing: number | null; housingBasis: "annual" | "percent" | "monthly" | "unknown" | null; bonus: number | null; transportation: number | null; otherAllowances: number | null; currency: string | null; confidence: "high" | "medium" | "low"; notes: string[] };
type ExtractionDraft = { basicSalary: string; housing: string; bonus: string; housingBasis: ExtractedSalary["housingBasis"]; transportation: string; otherAllowances: string };

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
  const [bonusCustomized, setBonusCustomized] = useState(false);
  const [housingMethod, setHousingMethod] = useState<"percent" | "annual">("annual");
  const [hasCalculated, setHasCalculated] = useState(false);
  const [extractionResult, setExtractionResult] = useState<{ fileName: string; extraction: ExtractedSalary } | null>(null);
  const [extractionDraft, setExtractionDraft] = useState<ExtractionDraft | null>(null);
  const [extractionError, setExtractionError] = useState("");
  const extractCertificate = trpc.salaryCertificate.extract.useMutation();

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
    setBonusCustomized(false);
    setHousingMethod("annual");
    setHasCalculated(false);
    setExtractionResult(null);
    setExtractionDraft(null);
    setExtractionError("");
  }

  function toDraft(extraction: ExtractedSalary): ExtractionDraft {
    return {
      basicSalary: extraction.basicSalary?.toString() ?? "",
      housing: extraction.housing?.toString() ?? "",
      bonus: extraction.bonus?.toString() ?? "",
      housingBasis: extraction.housingBasis,
      transportation: extraction.transportation?.toString() ?? "",
      otherAllowances: extraction.otherAllowances?.toString() ?? "",
    };
  }

  async function handleCertificateUpload(file: File) {
    setExtractionError("");
    setExtractionResult(null);
    setExtractionDraft(null);
    if (!acceptedCertificateTypes.includes(file.type as CertificateMimeType)) {
      setExtractionError("Please choose a PDF, JPG, PNG, or WebP certificate.");
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setExtractionError("Please upload a certificate smaller than 8 MB.");
      return;
    }
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
      reader.onerror = () => reject(new Error("The file could not be read."));
      reader.readAsDataURL(file);
    });
    extractCertificate.mutate({ fileName: file.name, mimeType: file.type as CertificateMimeType, base64 }, {
      onSuccess: (result) => { setExtractionResult(result); setExtractionDraft(toDraft(result.extraction)); },
      onError: (error) => setExtractionError(error.message || "The certificate could not be read. Please try another file."),
    });
  }

  function applyExtraction() {
    if (!extractionDraft) return;
    setBasicSalary(extractionDraft.basicSalary);
    setHousing(extractionDraft.housing);
    setBonus(extractionDraft.bonus);
    setBonusCustomized(true);
    if (extractionDraft.housingBasis === "percent") setHousingMethod("percent");
    else setHousingMethod("annual");
    setExtractionResult(null);
    setExtractionDraft(null);
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

            <div className="certificate-upload">
              <div className="certificate-upload-copy"><FileUp size={18} /><div><strong>Import from salary certificate</strong><span>PDF or image · max 8 MB · review before use</span></div></div>
              <label className="upload-button"><input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => { const file = event.target.files?.[0]; if (file) void handleCertificateUpload(file); event.currentTarget.value = ""; }} />{extractCertificate.isPending ? "Reading certificate…" : "Choose file"}</label>
            </div>
            <p className="privacy-note"><ShieldCheck size={12} /> Certificate files are sent to the secure document processor for extraction. Review every value before using it and avoid uploading documents you are not authorized to share.</p>
            {extractionError && <p className="extraction-error" role="alert">{extractionError}</p>}
            {extractionResult && extractionDraft && <div className="extraction-review" role="dialog" aria-label="Review extracted salary values">
              <div className="review-heading"><div><p className="section-kicker">Certificate review</p><h3><FileCheck2 size={17} /> {extractionResult.fileName}</h3></div><button type="button" className="review-close" onClick={() => { setExtractionResult(null); setExtractionDraft(null); }} aria-label="Close review"><X size={16} /></button></div>
              <p className="review-note">Check the extracted values before using them. Confidence: <strong>{extractionResult.extraction.confidence}</strong>.</p>
              <div className="review-grid">
                <label>Basic salary<input type="number" value={extractionDraft.basicSalary} onChange={(e) => setExtractionDraft({ ...extractionDraft, basicSalary: e.target.value })} /></label>
                <label>Housing<input type="number" value={extractionDraft.housing} onChange={(e) => setExtractionDraft({ ...extractionDraft, housing: e.target.value })} /></label>
                <label>Ramadan / bonus<input type="number" value={extractionDraft.bonus} onChange={(e) => setExtractionDraft({ ...extractionDraft, bonus: e.target.value })} /></label>
                <label>Housing basis<select value={extractionDraft.housingBasis ?? "unknown"} onChange={(e) => setExtractionDraft({ ...extractionDraft, housingBasis: e.target.value as ExtractionDraft["housingBasis"] })}><option value="unknown">Unknown</option><option value="annual">Annual ÷ 12</option><option value="percent">25% of basic</option><option value="monthly">Monthly amount</option></select></label>
              </div>
              {(extractionDraft.transportation || extractionDraft.otherAllowances) && <p className="review-extra">Also found: {extractionDraft.transportation ? `transportation ${extractionDraft.transportation}` : ""}{extractionDraft.transportation && extractionDraft.otherAllowances ? " · " : ""}{extractionDraft.otherAllowances ? `other allowances ${extractionDraft.otherAllowances}` : ""}. These fields are shown for review but are not included in the current calculator.</p>}
              {extractionResult.extraction.notes.length > 0 && <p className="review-extra">Note: {extractionResult.extraction.notes.join(" ")}</p>}
              <button type="button" className="primary-action review-apply" onClick={applyExtraction}>Use these values <ArrowUpRight size={17} /></button>
            </div>}

            <div className="input-stack">
              <label className="salary-field">
                <span className="field-label">Basic salary <small>Monthly</small></span>
                <span className="input-wrap"><span className="currency-prefix">SAR</span><input inputMode="decimal" type="number" min="0" placeholder="0.00" value={basicSalary} onChange={(e) => { const nextBasic = e.target.value; setBasicSalary(nextBasic); if (!bonusCustomized) setBonus(nextBasic); setHasCalculated(false); }} /></span>
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
                <span className="input-wrap"><span className="currency-prefix">SAR</span><input inputMode="decimal" type="number" min="0" placeholder="0.00" value={bonus} onChange={(e) => { setBonus(e.target.value); setBonusCustomized(true); setHasCalculated(false); }} /></span>
                <span className="field-help">Defaults to basic salary; edit it if your annual bonus differs.</span>
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
