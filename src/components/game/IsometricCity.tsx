import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Banknote, BedDouble, BriefcaseBusiness, BusFront, Coffee, Compass, Heart, Home, MapPin, Menu, MessageCircle, ShoppingBag, Sparkles, Utensils, X } from "lucide-react";

type Place = {
  id: string; name: string; type: string; x: number; y: number; w: number; h: number;
  roof: string; front: string; side: string; icon: string; description: string; action: string; reward?: number;
};
const places: Place[] = [
  { id: "home", name: "Your Apartment", type: "HOME", x: 190, y: 265, w: 104, h: 94, roof: "#f4a261", front: "#c96b42", side: "#9e4e36", icon: "⌂", description: "Your little place in the city. Rest up and get ready for tomorrow.", action: "Rest at home" },
  { id: "market", name: "Relief Market", type: "MARKET", x: 365, y: 125, w: 120, h: 104, roof: "#e9c46a", front: "#c68e35", side: "#986923", icon: "▤", description: "Busy stalls, fresh food, and a hundred ways to make a little money.", action: "Work a market shift", reward: 6500 },
  { id: "cafe", name: "Palmwine Café", type: "FOOD & DRINK", x: 530, y: 250, w: 96, h: 85, roof: "#efb7a2", front: "#cc806d", side: "#a65f51", icon: "☕", description: "Grab a meal, recharge, and watch the city go by.", action: "Buy a meal" },
  { id: "office", name: "Civic Tower", type: "WORK", x: 680, y: 125, w: 116, h: 142, roof: "#8ecae6", front: "#4d91ad", side: "#326d86", icon: "▥", description: "A modern office block. Show up, build skills, and earn a salary.", action: "Work a shift", reward: 9500 },
  { id: "mall", name: "Owerri Mall", type: "SHOPPING", x: 720, y: 365, w: 136, h: 98, roof: "#b8c0ff", front: "#777fc4", side: "#555b9c", icon: "▦", description: "Shops, services, and a cool place to spend the afternoon.", action: "Browse shops" },
  { id: "garage", name: "City Motor Park", type: "TRANSPORT", x: 395, y: 405, w: 124, h: 92, roof: "#a8dadc", front: "#559b9c", side: "#397779", icon: "▰", description: "Yellow buses, conductors calling destinations, and new connections.", action: "Run errands", reward: 4200 },
  { id: "plaza", name: "Freedom Plaza", type: "HANGOUT", x: 535, y: 505, w: 100, h: 65, roof: "#a7c957", front: "#6f963e", side: "#4e712d", icon: "✳", description: "Meet people, catch a breeze, and improve your mood.", action: "Hang out" },
  { id: "clinic", name: "Hope Clinic", type: "HEALTH", x: 190, y: 470, w: 100, h: 78, roof: "#f1faee", front: "#9bb6a0", side: "#6e8e76", icon: "+", description: "Take care of yourself when city life gets too much.", action: "Take a break" },
];
const fmt = (n: number) => "₦" + n.toLocaleString("en-NG");
function CityMap({ selected, onSelect }: { selected: string; onSelect: (id: string) => void }) {
  return <svg viewBox="0 0 1000 720" role="img" aria-label="Interactive isometric city map of a Nigerian city" className="city-svg">
    <defs>
      <linearGradient id="grass" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#d8e6bd"/><stop offset="1" stopColor="#adc996"/></linearGradient>
      <pattern id="blocks" width="42" height="42" patternUnits="userSpaceOnUse"><path d="M42 0H0V42" fill="none" stroke="#94b58b" strokeWidth="1" opacity=".35"/></pattern>
      <filter id="buildingShadow" x="-30%" y="-30%" width="170%" height="180%"><feDropShadow dx="8" dy="14" stdDeviation="8" floodColor="#304c3b" floodOpacity=".23"/></filter>
    </defs>
    <path d="M500 22 955 258 500 697 45 258Z" fill="url(#grass)" stroke="#9ab88c" strokeWidth="2"/>
    <path d="M500 22 955 258 500 697 45 258Z" fill="url(#blocks)"/>
    <g stroke="#f6f0df" strokeWidth="34" strokeLinejoin="round" fill="none" opacity=".98">
      <path d="M130 330 500 143 872 331"/><path d="M250 540 500 415 780 555"/><path d="M500 80 500 632"/><path d="M105 290 475 478 840 295"/>
    </g>
    <g stroke="#c9c3a9" strokeWidth="2" strokeDasharray="10 11" fill="none" opacity=".8">
      <path d="M130 330 500 143 872 331"/><path d="M250 540 500 415 780 555"/><path d="M500 80 500 632"/><path d="M105 290 475 478 840 295"/>
    </g>
    <g fill="#86a97b" stroke="#759a6b" strokeWidth="1">
      <path d="M80 254l18-9 18 9-18 9Z"/><path d="M99 245v-18l17 9v18Z"/><path d="M80 254v-18l19-9v18Z"/>
      <path d="M848 445l18-9 18 9-18 9Z"/><path d="M866 436v-18l18 9v18Z"/><path d="M848 445v-18l18-9v18Z"/>
      <path d="M578 80l13-7 13 7-13 7Z"/><path d="M591 73V59l13 7v14Z"/><path d="M578 80V66l13-7v14Z"/>
      <path d="M120 430l14-7 14 7-14 7Z"/><path d="M134 423v-14l14 7v14Z"/><path d="M120 430v-14l14-7v14Z"/>
    </g>
    {places.map((p) => {
      const x = p.x, y = p.y, w = p.w, h = p.h;
      const roof = `${x},${y} ${x+w},${y-h*.38} ${x+w+42},${y-h*.05} ${x+42},${y+h*.34}`;
      const front = `${x},${y} ${x+42},${y+h*.34} ${x+42},${y+h*.34+h} ${x},${y+h}`;
      const side = `${x+42},${y+h*.34} ${x+w+42},${y-h*.05} ${x+w+42},${y-h*.05+h} ${x+42},${y+h*.34+h}`;
      const active = selected === p.id;
      return <g key={p.id} role="button" tabIndex={0} aria-label={p.name} onClick={() => onSelect(p.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(p.id); }} className="map-building" filter="url(#buildingShadow)">
        <polygon points={front} fill={p.front} stroke={active ? "#ffffff" : "rgba(36,61,45,.18)"} strokeWidth={active ? 3 : 1}/>
        <polygon points={side} fill={p.side} stroke={active ? "#ffffff" : "rgba(36,61,45,.18)"} strokeWidth={active ? 3 : 1}/>
        <polygon points={roof} fill={p.roof} stroke={active ? "#ffffff" : "rgba(36,61,45,.2)"} strokeWidth={active ? 4 : 1}/>
        {Array.from({ length: Math.max(2, Math.floor(h/25)) }, (_, i) => <g key={i} opacity=".9">
          <path d={`M${x+9} ${y+10+i*22} l12 6 v12 l-12 -6Z`} fill="#fff6dd" opacity=".85"/>
          <path d={`M${x+53} ${y+h*.34+14+i*22} l12 -6 v12 l-12 6Z`} fill="#fff6dd" opacity=".8"/>
        </g>)}
        <path d={`M${x+10} ${y-4} l${w*.42} -${h*.15} l14 7 l-${w*.42} ${h*.15}Z`} fill="rgba(255,255,255,.3)"/>
        {active && <g><ellipse cx={x+w*.55} cy={y+h*.34+h+20} rx={w*.75} ry="13" fill="#1e4734" opacity=".16"/><rect x={x+3} y={y-h*.42-36} width={w+42} height="28" rx="14" fill="#173d2e"/><text x={x+(w+42)/2} y={y-h*.42-17} fontSize="12" fill="#fff" textAnchor="middle" fontWeight="700">{p.name}</text></g>}
        <text x={x+26} y={y+h*.15} fontSize="21" fill="#fff" textAnchor="middle" fontWeight="800" style={{pointerEvents:"none"}}>{p.icon}</text>
      </g>;
    })}
    <g fontSize="12" fontWeight="800" letterSpacing="2" fill="#52724c" opacity=".9"><text x="500" y="45" textAnchor="middle">NEW OWERRI</text><text x="100" y="375" transform="rotate(-27 100 375)">MARKET ROAD</text><text x="740" y="575" transform="rotate(26 740 575)">UNITY AVENUE</text></g>
    <g transform="translate(855 92)"><circle r="25" fill="#f7f5e8" stroke="#a2bb92" strokeWidth="2"/><path d="M0 -15 7 7 0 2 -7 7Z" fill="#315b3c"/><text x="0" y="-30" textAnchor="middle" fill="#486745" fontSize="10" fontWeight="800">N</text></g>
  </svg>;
}

function IsometricCity() {
  const [name, setName] = useState("Chidi");
  const [created, setCreated] = useState(false);
  const [selected, setSelected] = useState("market");
  const [money, setMoney] = useState(35000);
  const [energy, setEnergy] = useState(82);
  const [hunger, setHunger] = useState(68);
  const [mood, setMood] = useState(74);
  const [day, setDay] = useState(1);
  const [notice, setNotice] = useState("Welcome to the city. Your next chapter starts here.");
  const [showPlaces, setShowPlaces] = useState(false);
  const place = useMemo(() => places.find((p) => p.id === selected) ?? places[0], [selected]);
  const act = () => {
    if (place.id === "home") { setEnergy(v => Math.min(100, v + 28)); setHunger(v => Math.max(0, v - 8)); setNotice("You rested at home. Energy restored."); }
    else if (place.id === "cafe") { if (money < 1800) { setNotice("You need ₦1,800 for a meal. Find work first."); return; } setMoney(v => v - 1800); setHunger(v => Math.min(100, v + 35)); setNotice("You enjoyed a hot meal. Hunger is under control."); }
    else if (place.id === "plaza") { setMood(v => Math.min(100, v + 22)); setEnergy(v => Math.max(0, v - 4)); setNotice("A little fresh air and good company lifted your mood."); }
    else if (place.id === "clinic") { setEnergy(v => Math.min(100, v + 12)); setMood(v => Math.min(100, v + 8)); setNotice("You took a breather and feel a bit better."); }
    else if (place.reward) { setMoney(v => v + place.reward!); setEnergy(v => Math.max(0, v - 14)); setHunger(v => Math.max(0, v - 9)); setNotice(`Shift complete at ${place.name}. You earned ${fmt(place.reward)}.`); }
    else { setNotice(`You explored ${place.name}. New opportunities are waiting around the corner.`); }
    if (["market","office","garage"].includes(place.id)) setDay(v => v + 1);
  };
  if (!created) return <main className="min-h-screen bg-[#f4f1e7] text-[#173d2e] flex items-center justify-center p-5">
    <section className="w-full max-w-5xl overflow-hidden rounded-[32px] bg-[#fffdf5] shadow-2xl md:grid md:grid-cols-[1.1fr_.9fr]">
      <div className="relative min-h-[340px] overflow-hidden bg-[#dce8c9] p-7 md:p-10 flex flex-col justify-between">
        <div className="absolute inset-0 opacity-90"><CityMap selected={selected} onSelect={setSelected}/></div>
        <div className="relative z-10 inline-flex w-fit items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-xs font-extrabold tracking-[.22em]"><Compass size={15}/> LIFE, YOUR WAY</div>
        <div className="relative z-10 rounded-2xl bg-white/90 p-5 backdrop-blur-sm"><p className="text-xs font-bold uppercase tracking-[.2em] text-[#6e8b61]">Your city is waiting</p><h1 className="mt-2 text-4xl font-black leading-none md:text-5xl">Make a life.<br/><span className="text-[#c87542]">Own your story.</span></h1><p className="mt-3 max-w-sm text-sm text-[#52664c]">Explore a living Nigerian city, work your way up, and discover what's around every corner.</p></div>
      </div>
      <div className="p-7 md:p-10 flex flex-col justify-center">
        <p className="text-xs font-extrabold tracking-[.2em] text-[#c87542]">WELCOME TO NEW OWERRI</p><h2 className="mt-3 text-3xl font-black">Start your story</h2><p className="mt-2 text-sm leading-6 text-[#697766]">Create your character and step into the city. This is your life—play it your way.</p>
        <label className="mt-7 text-sm font-bold" htmlFor="player-name">What should people call you?</label><input id="player-name" value={name} onChange={e => setName(e.target.value)} maxLength={22} className="mt-2 w-full rounded-xl border border-[#d9dfcf] bg-white px-4 py-3 text-base outline-none focus:border-[#64885b] focus:ring-2 focus:ring-[#64885b]/20" placeholder="Enter your character name"/>
        <div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-xl bg-[#edf2e5] p-4"><Banknote size={18}/><p className="mt-2 text-xs text-[#64755e]">Starting cash</p><p className="text-xl font-black">₦35,000</p></div><div className="rounded-xl bg-[#edf2e5] p-4"><MapPin size={18}/><p className="mt-2 text-xs text-[#64755e]">Starting district</p><p className="text-xl font-black">New Owerri</p></div></div>
        <button onClick={() => { if (name.trim()) { setName(name.trim()); setCreated(true); setNotice(`Welcome, ${name.trim()}. New Owerri is yours to explore.`); } }} className="mt-6 rounded-xl bg-[#1d5038] px-5 py-4 text-sm font-extrabold text-white shadow-lg transition hover:bg-[#286747] active:scale-[.99]">Enter the city <ArrowUpRight className="ml-2 inline" size={18}/></button>
        <p className="mt-4 text-center text-xs text-[#8a9583]">Browser game prototype · Progress is currently session-only</p>
      </div>
    </section>
  </main>;
  return <main className="min-h-screen bg-[#f3f0e6] text-[#173d2e]">
    <header className="sticky top-0 z-30 border-b border-[#dce2d2] bg-[#fffdf6]/95 backdrop-blur"><div className="mx-auto flex max-w-[1500px] items-center justify-between gap-3 px-4 py-3 md:px-7">
      <div className="flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#1d5038] text-white"><Compass size={23}/></div><div><p className="text-sm font-black tracking-wide">NEW OWERRI</p><p className="text-[10px] font-bold tracking-[.2em] text-[#819075]">LIFE SIMULATOR</p></div></div>
      <div className="hidden items-center gap-5 md:flex"><div className="text-right"><p className="text-[10px] font-bold uppercase tracking-widest text-[#87927e]">Wallet</p><p className="font-black">{fmt(money)}</p></div><div className="h-8 w-px bg-[#e1e4d9]"/><div className="text-right"><p className="text-[10px] font-bold uppercase tracking-widest text-[#87927e]">Day</p><p className="font-black">{day}</p></div><div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e7c79d] font-black">{name.slice(0,1).toUpperCase()}</div></div>
      <button className="rounded-xl border border-[#dce2d2] p-2 md:hidden" onClick={() => setShowPlaces(v => !v)} aria-label="Toggle locations">{showPlaces ? <X size={20}/> : <Menu size={20}/>}</button>
    </div></header>
    <div className="mx-auto grid max-w-[1500px] gap-4 p-3 md:grid-cols-[minmax(0,1fr)_310px] md:gap-6 md:p-6">
      <section className="min-w-0">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3"><div><p className="text-xs font-extrabold uppercase tracking-[.2em] text-[#c87542]">Tuesday · Morning bustle</p><h1 className="mt-1 text-2xl font-black md:text-3xl">Good morning, {name}.</h1><p className="mt-1 text-sm text-[#788371]">Where will today take you?</p></div><div className="rounded-xl bg-white px-3 py-2 text-xs font-bold shadow-sm"><span className="mr-2 inline-block h-2 w-2 rounded-full bg-[#70a765]"/> City is alive</div></div>
        <div className="city-map-shell relative overflow-hidden rounded-[26px] border border-[#d6dfcb] bg-[#dce8c9] shadow-[0_16px_40px_rgba(42,70,42,.12)]">
          <div className="absolute left-3 top-3 z-10 rounded-xl bg-white/90 px-3 py-2 text-xs font-extrabold shadow-sm backdrop-blur"><MapPin className="mr-1 inline" size={13}/> NEW OWERRI DISTRICT</div>
          <div className="absolute right-3 top-3 z-10 flex gap-2"><button onClick={() => setSelected("home")} className="rounded-xl bg-white/90 p-2 shadow-sm" aria-label="Go to home"><Home size={17}/></button><button onClick={() => setSelected("market")} className="rounded-xl bg-white/90 p-2 shadow-sm" aria-label="Find work"><BriefcaseBusiness size={17}/></button></div>
          <CityMap selected={selected} onSelect={setSelected}/>
          <div className="absolute bottom-3 left-3 rounded-xl bg-white/90 px-3 py-2 text-[11px] font-bold text-[#52664c] shadow-sm backdrop-blur"><span className="mr-1">↗</span> Tap a building to explore</div>
          <div className="absolute bottom-3 right-3 rounded-xl bg-[#1d5038]/90 px-3 py-2 text-[10px] font-extrabold tracking-widest text-white">ISOMETRIC CITY MAP</div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 md:gap-3">{[{label:"Energy",value:energy,color:"bg-[#e3b75e]",icon:<Sparkles size={15}/>},{label:"Hunger",value:hunger,color:"bg-[#df9369]",icon:<Utensils size={15}/>},{label:"Mood",value:mood,color:"bg-[#83a9d0]",icon:<Heart size={15}/>}].map(n=><div key={n.label} className="rounded-2xl border border-[#e1e5d9] bg-white p-3 md:p-4"><div className="flex items-center justify-between text-xs font-bold text-[#788371]"><span>{n.label}</span>{n.icon}</div><div className="mt-2 h-2 overflow-hidden rounded-full bg-[#eef0e8]"><div className={`h-full rounded-full ${n.color} transition-all`} style={{width:`${n.value}%`}}/></div><p className="mt-1 text-right text-xs font-black">{n.value}%</p></div>)}</div>
      </section>
      <aside className={`${showPlaces ? "block" : "hidden"} md:block space-y-4`}>
        <section className="rounded-[24px] border border-[#e0e5d8] bg-white p-5 shadow-sm"><div className="flex items-start justify-between"><div><p className="text-[10px] font-extrabold tracking-[.2em] text-[#c87542]">{place.type}</p><h2 className="mt-1 text-xl font-black">{place.name}</h2></div><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#edf2e5] text-2xl">{place.icon}</div></div><p className="mt-3 text-sm leading-6 text-[#75806e]">{place.description}</p>{place.reward && <div className="mt-4 flex items-center justify-between rounded-xl bg-[#edf4e7] p-3"><span className="text-xs font-bold text-[#66785c]">Potential shift pay</span><span className="font-black text-[#286747]">{fmt(place.reward)}</span></div>}<button onClick={act} className="mt-4 w-full rounded-xl bg-[#1d5038] px-4 py-3 font-extrabold text-white transition hover:bg-[#286747]">{place.action}<ArrowUpRight className="ml-2 inline" size={16}/></button><p className="mt-3 rounded-xl bg-[#f6f5ed] p-3 text-xs leading-5 text-[#677360]">{notice}</p></section>
        <section className="rounded-[24px] border border-[#e0e5d8] bg-white p-5 shadow-sm"><div className="flex items-center justify-between"><h3 className="font-black">Places nearby</h3><span className="text-xs text-[#899482]">{places.length} locations</span></div><div className="mt-3 space-y-1.5">{places.map(p=><button key={p.id} onClick={() => {setSelected(p.id); setShowPlaces(false);}} className={`flex w-full items-center gap-3 rounded-xl p-2.5 text-left transition ${selected===p.id ? "bg-[#eaf1e3] ring-1 ring-[#d0dfc5]" : "hover:bg-[#f6f7f1]"}`}><span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#f0f1e8] text-lg">{p.icon}</span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold">{p.name}</span><span className="block text-[10px] font-bold tracking-widest text-[#899482]">{p.type}</span></span>{selected===p.id ? <span className="h-2 w-2 rounded-full bg-[#4d8156]"/> : <ArrowDownRight size={15} className="text-[#a4ad9a]"/>}</button>)}</div></section>
        <section className="rounded-[24px] bg-[#1d5038] p-5 text-white"><div className="flex items-center gap-2"><MessageCircle size={17}/><h3 className="font-black">City pulse</h3></div><p className="mt-2 text-sm leading-6 text-white/75">The market is waking up and buses are filling along Unity Avenue. A good morning to make moves.</p><div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#d9e8c7]"><span className="h-2 w-2 rounded-full bg-[#a7c957]"/> 24 people around the district</div></section>
      </aside>
    </div>
    <footer className="mx-auto flex max-w-[1500px] items-center justify-between px-5 pb-6 pt-2 text-[11px] text-[#929b89]"><span>NEW OWERRI · Your story, your city.</span><span>Prototype build 0.1</span></footer>
  </main>;
}
export const Route = createFileRoute("/")({ component: IsometricCity });
