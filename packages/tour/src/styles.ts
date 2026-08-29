export const TOUR_STYLES = `
.lc-tour-root{--tour-bg:#14211d;--tour-fg:#f7f5ec;--tour-muted:#b8c4bc;--tour-line:rgba(255,255,255,.16);--tour-accent:#d9ff72;position:relative;z-index:2147483000;font-family:Inter,ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.lc-tour-root *{box-sizing:border-box}
.lc-tour-overlay{position:fixed;inset:0;display:grid;place-items:center;padding:20px;background:rgba(8,15,13,.62);backdrop-filter:blur(6px)}
.lc-tour-intro,.lc-tour-card{color:var(--tour-fg);background:var(--tour-bg);border:1px solid rgba(255,255,255,.12);box-shadow:0 28px 90px rgba(0,0,0,.32)}
.lc-tour-intro{position:relative;width:min(590px,100%);border-radius:28px;padding:clamp(26px,5vw,48px)}
.lc-tour-eyebrow{margin:0 0 15px;color:var(--tour-accent);font-size:11px;font-weight:750;letter-spacing:.12em;text-transform:uppercase}
.lc-tour-intro h2,.lc-tour-card h2{margin:0;color:var(--tour-fg);font-family:"Space Grotesk",Inter,ui-sans-serif,system-ui,sans-serif;letter-spacing:-.025em}
.lc-tour-intro h2{max-width:480px;font-size:clamp(28px,5vw,43px);line-height:1.03}
.lc-tour-intro-copy{max-width:510px;margin:18px 0 0;color:var(--tour-muted);font-size:15px;line-height:1.65}
.lc-tour-duration{display:inline-flex;margin:24px 0 0;border:1px solid var(--tour-line);border-radius:999px;padding:7px 11px;color:var(--tour-fg);font-size:12px}
.lc-tour-intro-actions,.lc-tour-actions{display:flex;gap:10px;margin-top:28px}
.lc-tour-button{min-height:42px;border:1px solid var(--tour-line);border-radius:999px;padding:10px 17px;color:var(--tour-fg);background:transparent;font:inherit;font-size:13px;font-weight:700;cursor:pointer}
.lc-tour-button:hover{border-color:rgba(255,255,255,.38);background:rgba(255,255,255,.07)}
.lc-tour-button--primary{border-color:var(--tour-accent);color:#14211d;background:var(--tour-accent)}
.lc-tour-button--primary:hover{border-color:#edffb6;background:#edffb6}
.lc-tour-button:focus-visible,.lc-tour-close:focus-visible,.lc-tour-resume:focus-visible{outline:3px solid var(--tour-accent);outline-offset:3px}
.lc-tour-close{position:absolute;top:18px;right:18px;display:grid;width:40px;height:40px;place-items:center;border:1px solid var(--tour-line);border-radius:50%;color:var(--tour-fg);background:transparent;font-size:20px;line-height:1;cursor:pointer}
.lc-tour-card{position:fixed;right:22px;bottom:22px;width:min(410px,calc(100vw - 44px));border-radius:24px;padding:22px}
.lc-tour-card-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
.lc-tour-step{margin:0;color:var(--tour-muted);font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.lc-tour-card h2{margin-top:7px;padding-right:26px;font-size:24px;line-height:1.12}
.lc-tour-card .lc-tour-close{top:16px;right:16px;width:34px;height:34px;font-size:18px}
.lc-tour-segments{display:grid;grid-template-columns:repeat(9,1fr);gap:5px;margin-bottom:18px}
.lc-tour-segment{height:4px;border-radius:99px;background:rgba(255,255,255,.16)}
.lc-tour-segment.is-done{background:var(--tour-accent)}
.lc-tour-description{margin:16px 0 0;color:var(--tour-muted);font-size:14px;line-height:1.58}
.lc-tour-evidence{margin:16px 0 0;border-left:2px solid var(--tour-accent);padding-left:12px;color:var(--tour-fg);font-size:12px;line-height:1.5}
.lc-tour-evidence strong{display:block;margin-bottom:3px;color:var(--tour-accent);font-size:10px;letter-spacing:.08em;text-transform:uppercase}
.lc-tour-actions{align-items:center;justify-content:flex-end;margin-top:20px}
.lc-tour-actions .lc-tour-button:first-child{margin-right:auto}
.lc-tour-resume{position:fixed;top:84px;right:18px;display:inline-flex;min-height:44px;align-items:center;gap:9px;border:1px solid rgba(255,255,255,.18);border-radius:999px;padding:10px 16px;color:var(--tour-fg);background:var(--tour-bg);box-shadow:0 14px 40px rgba(0,0,0,.24);font:inherit;font-size:13px;font-weight:750;cursor:pointer}
.lc-tour-resume::before{content:"";width:8px;height:8px;border-radius:50%;background:var(--tour-accent)}
@media(max-width:560px){.lc-tour-overlay{align-items:end;padding:12px}.lc-tour-intro{border-radius:24px;padding:28px 22px max(24px,env(safe-area-inset-bottom))}.lc-tour-intro-actions{flex-direction:column}.lc-tour-intro-actions .lc-tour-button{width:100%}.lc-tour-card{right:8px;bottom:8px;width:calc(100vw - 16px);max-height:min(70dvh,560px);overflow:auto;border-radius:22px;padding:18px 18px max(18px,env(safe-area-inset-bottom))}.lc-tour-card h2{font-size:21px}.lc-tour-actions{display:grid;grid-template-columns:1fr;margin-top:18px}.lc-tour-actions .lc-tour-button{width:100%;margin:0}.lc-tour-actions .lc-tour-button:first-child{order:2}.lc-tour-resume{top:auto;right:10px;bottom:max(10px,env(safe-area-inset-bottom))}.lc-tour-description{font-size:13px}}
@media(prefers-reduced-motion:no-preference){.lc-tour-intro,.lc-tour-card,.lc-tour-resume{animation:lc-tour-enter 220ms cubic-bezier(.2,.8,.2,1)}@keyframes lc-tour-enter{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}}
`;
