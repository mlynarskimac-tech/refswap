// proto-create.jsx — multi-step create listing flow.
const { useState: useStateC } = React;

const STEPS = ['Brand', 'Model', 'Reference', 'Photos', 'Price tier', 'Scope', 'Top-up', 'Wishlist'];

function CreateListing({ go, onPublish }) {
  const [step, setStep] = useStateC(0);
  const [data, setData] = useStateC({ brand: 'Rolex', model: 'Submariner Date', ref: '126610LN', tier: 'High', scope: 'EU', topup: true, wants: ['AP Royal Oak', 'Patek Aquanaut'] });
  const set = (k, v) => setData(d => ({ ...d, [k]: v }));
  const next = () => step < STEPS.length - 1 ? setStep(step + 1) : onPublish();
  const back = () => step > 0 ? setStep(step - 1) : go('mywatch');

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '26px 26px 40px' }}>
      <PageHead title="Create a listing" sub="List one watch, plus the references you’d swap it for." />
      {/* stepper */}
      <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '10px 0', margin: '22px 0 28px' }}>
        {STEPS.map((s, i) => (
          <React.Fragment key={s}>
            <button onClick={() => setStep(i)} style={{ all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 7 }}>
              <span style={{ width: 24, height: 24, borderRadius: '50%', fontFamily: P.sans, fontSize: 11.5,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${i <= step ? P.gold : P.strokeMd}`,
                background: i === step ? P.gold : i < step ? `${P.gold}18` : 'transparent',
                color: i === step ? '#fff' : i < step ? P.gold : P.ink3 }}>{i < step ? '✓' : i + 1}</span>
              <span style={{ fontFamily: P.sans, fontSize: 11.5, color: i <= step ? P.ink2 : P.ink3 }}>{s}</span>
            </button>
            {i < STEPS.length - 1 && <span style={{ width: 16, height: 1, background: P.stroke, margin: '0 7px' }} />}
          </React.Fragment>
        ))}
      </div>

      <div style={{ background: P.surface, border: `1px solid ${P.stroke}`, borderRadius: 14, padding: 26, minHeight: 280 }}>
        <div style={{ fontFamily: P.mono, fontSize: 10.5, letterSpacing: '.1em', color: P.ink3, textTransform: 'uppercase' }}>Step {step + 1} · {STEPS[step]}</div>

        <div style={{ marginTop: 16 }}>
          {step === 0 && <Field label="Brand"><TextInput value={data.brand} onChange={v => set('brand', v)} placeholder="e.g. Rolex" /></Field>}
          {step === 1 && <Field label="Model"><TextInput value={data.model} onChange={v => set('model', v)} placeholder="e.g. Submariner Date" /></Field>}
          {step === 2 && <Field label="Reference number"><TextInput value={data.ref} onChange={v => set('ref', v)} placeholder="e.g. 126610LN" /></Field>}
          {step === 3 && <PhotoStep />}
          {step === 4 && <TierStep value={data.tier} onChange={v => set('tier', v)} />}
          {step === 5 && <ChoiceRow value={data.scope} onChange={v => set('scope', v)} options={['EU', 'US only', 'Worldwide']} />}
          {step === 6 && <ChoiceRow value={data.topup ? 'Yes' : 'No'} onChange={v => set('topup', v === 'Yes')} options={['Yes', 'No']} hint="Are you open to a cash top-up to balance the swap?" />}
          {step === 7 && <WishlistStep wants={data.wants} setWants={v => set('wants', v)} />}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 22 }}>
        <button onClick={back} style={{ all: 'unset', cursor: 'pointer', fontFamily: P.sans, fontSize: 13.5,
          color: P.ink2, border: `1px solid ${P.stroke}`, borderRadius: 8, padding: '11px 20px' }}>← Back</button>
        <button onClick={next} style={{ all: 'unset', cursor: 'pointer', fontFamily: P.sans, fontSize: 13.5, fontWeight: 600,
          color: '#fff', background: P.gold, borderRadius: 8, padding: '11px 24px' }}>
          {step < STEPS.length - 1 ? 'Continue →' : 'Publish listing'}</button>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
      <span style={{ fontFamily: P.sans, fontSize: 13, color: P.ink2, fontWeight: 500 }}>{label}</span>
      {children}
    </div>
  );
}

function TextInput({ value, onChange, placeholder }) {
  return (
    <input value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ height: 46, border: `1px solid ${P.stroke}`, borderRadius: 10, padding: '0 16px',
        fontFamily: P.sans, fontSize: 15, color: P.ink, background: P.bg, outline: 'none', maxWidth: 420 }} />
  );
}

function PhotoStep() {
  const [files, setFiles] = useStateC([0, 1]);
  return (
    <div>
      <div style={{ height: 180, border: `1.5px dashed ${P.strokeMd}`, borderRadius: 12, background: P.bg,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer' }}
        onClick={() => setFiles(f => [...f, f.length])}>
        <span style={{ fontSize: 30, color: P.ink3 }}>⤓</span>
        <span style={{ fontFamily: P.sans, fontSize: 14, color: P.ink2 }}>Drag &amp; drop photos</span>
        <span style={{ fontFamily: P.sans, fontSize: 11.5, color: P.ink3 }}>or click to add · up to 8</span>
      </div>
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        {files.map(i => <PhotoBox key={i} h={62} w={62} r={8} />)}
        <button onClick={() => setFiles(f => [...f, f.length])} style={{ all: 'unset', cursor: 'pointer', width: 62, height: 62,
          border: `1px dashed ${P.strokeMd}`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: P.ink3, fontSize: 20 }}>+</button>
      </div>
    </div>
  );
}

function TierStep({ value, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
      {Object.entries(TIERS).map(([k, t]) => {
        const sel = value === k;
        return (
          <button key={k} onClick={() => onChange(k)} style={{ all: 'unset', cursor: 'pointer', boxSizing: 'border-box',
            border: `1px solid ${sel ? P.gold : P.stroke}`, borderRadius: 12, padding: '18px 16px',
            background: sel ? `${P.gold}10` : P.bg, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ fontFamily: P.serif, fontSize: 20, fontWeight: 600, color: sel ? P.gold : P.ink }}>{t.label}</span>
            <span style={{ fontFamily: P.mono, fontSize: 12.5, color: P.ink2 }}>{t.range}</span>
          </button>
        );
      })}
    </div>
  );
}

function ChoiceRow({ value, onChange, options, hint }) {
  return (
    <div>
      {hint && <div style={{ fontFamily: P.sans, fontSize: 13.5, color: P.ink2, marginBottom: 14 }}>{hint}</div>}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        {options.map(o => {
          const sel = value === o;
          return (
            <button key={o} onClick={() => onChange(o)} style={{ all: 'unset', cursor: 'pointer',
              fontFamily: P.sans, fontSize: 14, padding: '12px 22px', borderRadius: 10,
              border: `1px solid ${sel ? P.gold : P.stroke}`, color: sel ? P.gold : P.ink,
              background: sel ? `${P.gold}10` : P.bg }}>{o}</button>
          );
        })}
      </div>
    </div>
  );
}

function WishlistStep({ wants, setWants }) {
  const [draft, setDraft] = useStateC('');
  const add = () => { if (draft.trim()) { setWants([...wants, draft.trim()]); setDraft(''); } };
  return (
    <div>
      <div style={{ fontFamily: P.sans, fontSize: 13.5, color: P.ink2, marginBottom: 14 }}>Which references would you swap this for?</div>
      <div style={{ display: 'flex', gap: 10 }}>
        <TextInput value={draft} onChange={setDraft} placeholder="e.g. Patek Aquanaut" />
        <button onClick={add} style={{ all: 'unset', cursor: 'pointer', fontFamily: P.sans, fontSize: 13.5, fontWeight: 600,
          color: P.gold, border: `1px solid ${P.gold}`, borderRadius: 10, padding: '0 18px', display: 'inline-flex', alignItems: 'center' }}>Add</button>
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 16 }}>
        {wants.map((t, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontFamily: P.sans, fontSize: 13,
            color: P.ink2, border: `1px solid ${P.stroke}`, borderRadius: 999, padding: '7px 8px 7px 14px' }}>
            {t}<button onClick={() => setWants(wants.filter((_, j) => j !== i))} style={{ all: 'unset', cursor: 'pointer', color: P.ink3, fontSize: 14 }}>✕</button>
          </span>
        ))}
      </div>
    </div>
  );
}

Object.assign(window, { CreateListing });
