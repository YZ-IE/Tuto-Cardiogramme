import { useState, useEffect, useRef } from 'react';

// ═══════════════════════════════════════════════════
// ECG STRIP GENERATORS
// ═══════════════════════════════════════════════════
const B = 65, W = 800;

function normalComplex(x0, bw = 160, b = B) {
  const p = dx => x0 + dx * (bw / 160), a = dy => b - dy;
  return [
    `L${p(18)},${b}`, `C${p(23)},${b} ${p(26)},${a(8)} ${p(30)},${a(11)}`,
    `C${p(34)},${a(13)} ${p(38)},${b} ${p(42)},${b}`, `L${p(56)},${b}`,
    `L${p(58)},${a(-5)}`, `L${p(62)},${a(47)}`, `L${p(66)},${a(-9)}`, `L${p(71)},${b}`,
    `L${p(86)},${b}`, `C${p(93)},${b} ${p(100)},${a(12)} ${p(108)},${a(14)}`,
    `C${p(116)},${a(12)} ${p(124)},${b} ${p(132)},${b}`, `L${p(bw)},${b}`
  ].join(' ');
}

function generateStrip(id) {
  let path = `M 0,${B}`;
  if (id === 'normal') { for (let i = 0; i < 5; i++) path += normalComplex(i * 160); }
  else if (id === 'tachy') { for (let i = 0; i < 8; i++) path += normalComplex(i * 100, 100); }
  else if (id === 'brady') {
    const bw = 267;
    for (let i = 0; i < 3; i++) if (i * bw < W + 50) path += normalComplex(i * bw, bw);
  } else if (id === 'avblock1') {
    for (let i = 0; i < 5; i++) {
      const x0 = i * 160, p = dx => x0 + dx, a = dy => B - dy;
      path += [`L${p(14)},${B}`, `C${p(18)},${B} ${p(21)},${a(8)} ${p(24)},${a(11)}`,
        `C${p(27)},${a(13)} ${p(31)},${B} ${p(34)},${B}`, `L${p(78)},${B}`,
        `L${p(80)},${a(-5)}`, `L${p(84)},${a(47)}`, `L${p(88)},${a(-9)}`, `L${p(93)},${B}`,
        `L${p(105)},${B}`, `C${p(112)},${B} ${p(118)},${a(12)} ${p(125)},${a(14)}`,
        `C${p(132)},${a(12)} ${p(138)},${B} ${p(145)},${B}`, `L${p(160)},${B}`].join(' ');
    }
  } else if (id === 'afib') {
    const rrs = [125, 95, 148, 110, 138, 102, 118, 88]; let x = 0;
    for (let k = 0; k < rrs.length && x < W; k++) {
      const rr = rrs[k], qx = x + rr - 22;
      for (let px = x; px < Math.min(qx, W); px += 7) {
        const n = Math.sin(px * 0.48 + k * 1.1) * 3.2 + Math.sin(px * 0.85) * 2;
        path += ` L${px + 3.5},${B + n} L${px + 7},${B - n * 0.6}`;
      }
      if (qx < W) path += ` L${qx},${B + 4} L${qx + 4},${B - 38} L${qx + 8},${B + 6} L${qx + 13},${B}`;
      x += rr;
    }
  } else if (id === 'vtach') {
    for (let i = 0; i < 10; i++) {
      const x0 = i * 82; if (x0 >= W) break;
      path += [`L${x0 + 4},${B}`, `C${x0 + 13},${B + 6} ${x0 + 20},${B - 18} ${x0 + 28},${B - 48}`,
        `C${x0 + 36},${B - 66} ${x0 + 41},${B - 60} ${x0 + 49},${B - 44}`,
        `C${x0 + 55},${B - 26} ${x0 + 58},${B + 12} ${x0 + 62},${B + 22}`,
        `C${x0 + 66},${B + 26} ${x0 + 72},${B + 14} ${x0 + 79},${B}`, `L${x0 + 82},${B}`].join(' ');
    }
  } else if (id === 'flutter') {
    for (let i = 0; i < 17; i++) {
      const fx = i * 47; if (fx >= W) break;
      path += ` C${fx + 14},${B - 7} ${fx + 34},${B - 9} ${fx + 38},${B - 8} L${fx + 47},${B + 9}`;
      if (i % 4 === 1) { const qx = fx + 40; path += ` L${qx},${B + 4} L${qx + 4},${B - 38} L${qx + 8},${B + 5} L${qx + 12},${B + 9}`; }
    }
  } else if (id === 'esv') {
    path += normalComplex(0); path += normalComplex(160);
    const ex = 292;
    path += [`L${ex + 4},${B}`, `C${ex + 11},${B + 9} ${ex + 18},${B - 22} ${ex + 26},${B - 52}`,
      `C${ex + 34},${B - 70} ${ex + 40},${B - 63} ${ex + 48},${B - 45}`,
      `C${ex + 54},${B - 18} ${ex + 58},${B + 14} ${ex + 63},${B + 23}`,
      `C${ex + 67},${B + 28} ${ex + 73},${B + 16} ${ex + 79},${B}`,
      `C${ex + 85},${B} ${ex + 92},${B + 16} ${ex + 100},${B + 19}`,
      `C${ex + 108},${B + 16} ${ex + 116},${B} ${ex + 124},${B}`, `L${ex + 174},${B}`].join(' ');
    path += normalComplex(ex + 174);
  } else if (id === 'lbbb') {
    for (let i = 0; i < 5; i++) {
      const x0 = i * 160, p = dx => x0 + dx, a = dy => B - dy;
      path += [`L${p(17)},${B}`, `C${p(21)},${B} ${p(24)},${a(8)} ${p(27)},${a(11)}`,
        `C${p(30)},${a(13)} ${p(34)},${B} ${p(38)},${B}`, `L${p(51)},${B}`, `L${p(53)},${a(-2)}`,
        `C${p(57)},${a(10)} ${p(62)},${a(30)} ${p(67)},${a(40)}`,
        `C${p(71)},${a(32)} ${p(74)},${a(37)} ${p(77)},${a(44)}`,
        `C${p(81)},${a(54)} ${p(86)},${a(52)} ${p(90)},${a(40)}`,
        `C${p(94)},${a(20)} ${p(98)},${a(4)} ${p(103)},${a(-4)}`, `L${p(109)},${B}`,
        `C${p(115)},${B} ${p(121)},${a(-11)} ${p(127)},${a(-13)}`,
        `C${p(133)},${a(-11)} ${p(139)},${B} ${p(145)},${B}`, `L${p(160)},${B}`].join(' ');
    }
  } else { for (let i = 0; i < 5; i++) path += normalComplex(i * 160); }
  return path;
}

// ═══════════════════════════════════════════════════
// RHYTHM DATABASE
// ═══════════════════════════════════════════════════
const RHYTHMS = [
  {
    id: 'normal', label: 'Rythme Sinusal Normal', hr: '60-100 bpm', color: '#00e676', category: 'Normal',
    desc: 'Rythme cardiaque normal originant du nœud sinusal avec conduction régulière AV normale.',
    signs: ['Onde P avant chaque QRS', 'PR: 0,12–0,20 s', 'QRS < 0,12 s', 'Rythme régulier'],
    nursing: {
      priority: 'routine', actions: [
        { icon: '📋', step: 'Surveillance', text: 'Surveiller la FC toutes les 4-8h. Documenter dans le dossier de soins.' },
        { icon: '💊', step: 'Médicaments', text: 'Administrer les traitements prescrits. Vérifier les interactions médicamenteuses.' },
        { icon: '📚', step: 'Éducation', text: "Rassurer le patient. Expliquer les signes d'alerte à signaler (palpitations, syncope, dyspnée)." },
      ]
    }
  },
  {
    id: 'tachy', label: 'Tachycardie Sinusale', hr: '> 100 bpm', color: '#ff9800', category: 'Tachycardie',
    desc: "Accélération du rythme sinusal. Causes fréquentes : fièvre, douleur, déshydratation, anémie.",
    signs: ['Morphologie sinusale normale', 'FC > 100/min', 'RR raccourci', 'Onde P visible'],
    nursing: {
      priority: 'surveillance', actions: [
        { icon: '🔔', step: '1 — Appeler le médecin', text: 'Prévenir si FC > 130/min, si symptomatique (dyspnée, douleur thoracique, syncope) ou si tachycardie nouvelle.' },
        { icon: '🩺', step: '2 — Évaluation clinique', text: 'Constantes complètes : PA, SpO₂, température, FR. Rechercher une cause : fièvre, douleur, hémorragie, hypovolémie, anxiété.' },
        { icon: '💉', step: '3 — Voie veineuse', text: 'Poser ou vérifier la VVP. Prélèvements selon prescription : NFS, ionogramme, TSH, D-dimères.' },
        { icon: '🫁', step: '4 — Oxygène', text: "Administrer O₂ si SpO₂ < 94%. Installer le patient en position demi-assise." },
        { icon: '💊', step: '5 — Traitement causal', text: "Antipyrétiques si fièvre, antalgiques si douleur, remplissage si hypovolémie. Éviter les bêta-bloquants sans avis médical." },
        { icon: '📊', step: '6 — Monitorage continu', text: 'Brancher le scope. ECG 12 dérivations. Surveillance toutes les 30 min.' },
      ]
    }
  },
  {
    id: 'brady', label: 'Bradycardie Sinusale', hr: '< 60 bpm', color: '#42a5f5', category: 'Bradycardie',
    desc: "Ralentissement du rythme sinusal. Peut être normal chez l'athlète. Causes : hypothyroïdie, médicaments.",
    signs: ['Morphologie sinusale normale', 'FC < 60/min', 'RR allongé', 'Onde P présente'],
    nursing: {
      priority: 'surveillance', actions: [
        { icon: '🔔', step: '1 — Évaluer la tolérance', text: "Si FC < 50/min avec signes d'intolérance (hypotension, syncope, douleur thoracique), APPELER LE MÉDECIN EN URGENCE." },
        { icon: '🧪', step: '2 — Rechercher la cause', text: 'Vérifier les médicaments : bêta-bloquants, digitaliques, antiarythmiques. PA, SpO₂, glycémie, température.' },
        { icon: '💊', step: "3 — Préparer l'Atropine", text: "Préparer 1 mg d'Atropine IV sur prescription (0,5 mg IV en bolus, répétable). Ne pas administrer sans prescription." },
        { icon: '🛏', step: '4 — Position et surveillance', text: 'Allonger en Trendelenburg si hypotension. Brancher le scope. ECG 12 dérivations. VVP en place.' },
        { icon: '⚡', step: '5 — Stimulation externe', text: "En cas d'échec médical : préparer le matériel de pacemaker transcutané selon protocole du service." },
        { icon: '📋', step: '6 — Traçabilité', text: "Documenter l'heure d'apparition, la FC, les symptômes, les traitements administrés et la réponse thérapeutique." },
      ]
    }
  },
  {
    id: 'afib', label: 'Fibrillation Auriculaire', hr: 'Irrégulier 100-180 bpm', color: '#f06292', category: 'Arythmie',
    desc: "Arythmie supraventriculaire la plus fréquente. Activité auriculaire chaotique, risque thrombo-embolique.",
    signs: ["Absence d'onde P", 'Ligne isoélectrique fibrillante', 'RR totalement irrégulier', 'QRS fin (< 0,12 s)'],
    nursing: {
      priority: 'urgent', actions: [
        { icon: '🚨', step: '1 — Alerte médicale', text: "Prévenir le médecin immédiatement, surtout si FA récente < 48h (risque thrombo-embolique lors d'une cardioversion). Évaluer tolérance hémodynamique." },
        { icon: '🩺', step: '2 — Constantes complètes', text: "FC (au pouls radial), PA aux deux bras, SpO₂, conscience. Rechercher signes d'AVC (FAST : Face, Arm, Speech, Time)." },
        { icon: '💉', step: '3 — VVP + bilan', text: 'VVP G18 ou G16. Prélèvements : NFS, ionogramme, créatinine, TP/TCA, TSH, troponine. Anticoagulation selon prescription.' },
        { icon: '💊', step: '4 — Contrôle de la fréquence', text: 'Préparer selon prescription : Bêta-bloquant IV, Amiodarone IV ou Digoxine. Surveiller PA avant/après chaque injection.' },
        { icon: '⚡', step: '5 — Cardioversion électrique', text: "Si instabilité hémodynamique : préparer le chariot d'urgence, défibrillateur, matériel d'intubation, sédation (Midazolam, Propofol)." },
        { icon: '🩸', step: '6 — Anticoagulation', text: "Initier anticoagulation sur prescription (FA > 48h ou durée inconnue). Surveiller signes de saignement. Expliquer le risque d'AVC." },
      ]
    }
  },
  {
    id: 'flutter', label: 'Flutter Auriculaire', hr: '75-150 bpm (4:1 ou 2:1)', color: '#ce93d8', category: 'Arythmie',
    desc: "Circuit de réentrée dans l'oreillette droite. Ondes F en dents de scie à 300/min.",
    signs: ['Ondes F en dents de scie (V1)', "Pas d'isoélectrique entre ondes F", 'Bloc AV 2:1 ou 4:1', 'QRS fin'],
    nursing: {
      priority: 'urgent', actions: [
        { icon: '🔔', step: '1 — Appel médical', text: 'Prévenir le médecin. Le flutter peut se convertir en FA ou évoluer vers une décompensation cardiaque.' },
        { icon: '🩺', step: '2 — Évaluation', text: "FC, PA, SpO₂, conscience. Rechercher signes d'insuffisance cardiaque (crépitants, OMI, dyspnée). ECG 12 dérivations en urgence." },
        { icon: '💉', step: '3 — VVP + bilan', text: 'Ionogramme (kaliémie++), NFS, TP/TCA, troponine. Anticoagulation à discuter selon durée (même stratégie que FA).' },
        { icon: '💊', step: '4 — Médicaments', text: "Préparer selon prescription : Amiodarone IV, Bêta-bloquant IV. Attention : la Digoxine est souvent inefficace sur le flutter." },
        { icon: '⚡', step: '5 — Cardioversion', text: 'Le flutter répond bien à la cardioversion électrique (50-100J biphasique). Préparer matériel de sédation et défibrillation.' },
        { icon: '📊', step: '6 — Monitorage', text: 'Scope continu. Surveiller le passage spontané en FA ou en rythme sinusal. Tracer un nouvel ECG après tout changement.' },
      ]
    }
  },
  {
    id: 'vtach', label: 'Tachycardie Ventriculaire', hr: '> 120 bpm', color: '#ff5252', category: 'URGENCE',
    desc: "⚠️ Urgence ! Activité ventriculaire rapide et autonome. Risque de dégénération en FV.",
    signs: ['QRS large > 0,12 s', 'Dissociation auriculo-ventriculaire', 'Rythme régulier ou sub-régulier', "Pas d'onde P discernable"],
    nursing: {
      priority: 'critique', actions: [
        { icon: '🚨', step: '1 — APPEL URGENCE IMMÉDIAT', text: "APPELER LE MÉDECIN ET L'ÉQUIPE D'URGENCE. Patient conscient ? Pouls palpable ? Si absence de pouls → RCP immédiate." },
        { icon: '🛏', step: '2 — Position + O₂', text: 'Allonger le patient. O₂ haut débit (15 L/min au masque à réservoir). Défibrillateur en place et ALLUMÉ. Bouton alarme.' },
        { icon: '💉', step: '3 — Accès veineux', text: 'VVP G16 minimum, voire 2 voies. Prélèvements urgents : ionogramme (K⁺ +++), NFS, troponine, gaz du sang.' },
        { icon: '💊', step: '4 — Amiodarone IV', text: 'Préparer Amiodarone 300 mg dans 250 ml G5% (perfusion 20-60 min) sur prescription. Si TV tolérée hémodynamiquement.' },
        { icon: '⚡', step: '5 — Choc électrique', text: 'Si TV mal tolérée ou sans pouls : choc électrique externe synchronisé (200J biphasique) ou RCP si FV. Algorithme ACLS.' },
        { icon: '🏥', step: '6 — Transfert USIC/Réa', text: 'Préparer le transfert en soins intensifs cardiologiques. Dossier, ECG, liste des traitements. Brancard avec scope portable.' },
      ]
    }
  },
  {
    id: 'avblock1', label: 'Bloc AV 1er Degré', hr: 'Variable', color: '#ffcc02', category: 'Bloc',
    desc: "Allongement de la conduction auriculo-ventriculaire. Souvent bénin, peut indiquer une maladie dégénérative.",
    signs: ['PR > 0,20 s (> 1 grand carré)', 'Chaque P conduit au QRS', 'QRS fin', 'Rythme régulier'],
    nursing: {
      priority: 'routine', actions: [
        { icon: '📋', step: '1 — Signalement médical', text: 'Informer le médecin si le bloc AV 1° est nouveau ou associé à une bradycardie, des symptômes ou des médicaments bradycardisants.' },
        { icon: '💊', step: '2 — Revue des traitements', text: 'Vérifier : bêta-bloquants, anticalciques, digitaliques, Amiodarone. Signaler toute association potentiellement aggravante.' },
        { icon: '🔬', step: '3 — Bilan biologique', text: "Kaliémie, magnésémie, dosage Digoxine si prescrite. Bilan thyroïdien si suspicion d'hypothyroïdie." },
        { icon: '📊', step: '4 — Surveillance', text: "ECG de contrôle. Surveiller toute évolution vers un bloc AV 2° ou 3° (augmentation du PR, pauses, syncopes)." },
        { icon: '📚', step: '5 — Éducation', text: "Expliquer au patient de signaler : vertiges, malaises, syncopes, sensations de pause cardiaque." },
      ]
    }
  },
  {
    id: 'esv', label: 'Extrasystole Ventriculaire', hr: 'Variable', color: '#80cbc4', category: 'Ectopie',
    desc: "Battement prématuré d'origine ventriculaire. Isolée, souvent bénigne. Fréquentes = bilan à faire.",
    signs: ["QRS large prématuré sans onde P", 'Pause compensatrice complète', "T inversé après l'ESV", 'Retour au rythme sinusal'],
    nursing: {
      priority: 'surveillance', actions: [
        { icon: '📊', step: '1 — Quantifier et caractériser', text: 'Fréquence des ESV : isolées, doublets, triplets, bigéminisme. > 5/min, en salves ou polymorphes = avis médical.' },
        { icon: '🩺', step: '2 — Évaluation clinique', text: "Constantes. Demander si le patient ressent les ESV (palpitations). Rechercher signes d'insuffisance cardiaque ou d'ischémie." },
        { icon: '🔬', step: '3 — Bilan ionique', text: 'Kaliémie et magnésémie (hypokaliémie et hypomagnésémie = causes fréquentes). Corriger les troubles électrolytiques.' },
        { icon: '💊', step: '4 — Facteurs déclenchants', text: "Identifier et traiter : hypoxie (SpO₂), douleur, anxiété, stimulants (café, tabac). Vérifier toxicité digitalique." },
        { icon: '⚠️', step: '5 — Surveillance rapprochée', text: 'Si ESV fréquentes ou polymorphes : scope continu. Prévenir le médecin. Préparer Amiodarone et chariot d\'urgence.' },
        { icon: '📋', step: '6 — Traçabilité', text: 'Imprimer et coller les tracés ECG dans le dossier avec heure et contexte. Transmission infirmière détaillée.' },
      ]
    }
  },
  {
    id: 'lbbb', label: 'Bloc de Branche Gauche', hr: 'Variable', color: '#a5d6a7', category: 'Bloc',
    desc: "Trouble de conduction dans la branche gauche du faisceau de His. QRS élargi avec aspect caractéristique.",
    signs: ['QRS ≥ 0,12 s (≥ 3 petits carreaux)', 'R large et encochée en V5-V6', "Absence d'onde Q septale", 'Troubles repolarisation secondaires'],
    nursing: {
      priority: 'surveillance', actions: [
        { icon: '🚨', step: '1 — BBG NOUVEAU = URGENCE', text: "Un BBG apparu récemment (< 24h) = SCA jusqu'à preuve du contraire. APPELER LE MÉDECIN IMMÉDIATEMENT." },
        { icon: '🩺', step: '2 — Évaluation SCA', text: "Rechercher douleur thoracique, irradiation, sueurs, dyspnée. Comparer avec ECG antérieur. Troponine en urgence." },
        { icon: '💉', step: '3 — Bilan biologique urgent', text: 'Troponine HS (Tn0 et Tn3h), NFS, ionogramme, TP/TCA, groupe sanguin. VVP G16. Préparer éventuel transfert en coronarographie.' },
        { icon: '💊', step: '4 — Traitement antiagrégant', text: 'Sur prescription si SCA : Aspirine 250-500 mg, Ticagrelor ou Clopidogrel. Anticoagulation IV. Dérivés nitrés si douleur.' },
        { icon: '🏥', step: '5 — Transfert USIC', text: "Préparer le transfert en unité coronarienne. ECG serial (toutes les 15-30 min), constantes, liste des traitements, heure de début." },
        { icon: '📊', step: '6 — Si BBG connu et stable', text: "BBG ancien confirmé et asymptomatique : surveillance standard, scope. Informer tout soignant que l'ECG est 'anormal de base'." },
      ]
    }
  },
];

const PRIORITY_CONFIG = {
  critique:     { label: '🚨 CRITIQUE',     bg: '#2d0a0a', border: '#ff5252', text: '#ff5252' },
  urgent:       { label: '⚠️ URGENT',       bg: '#2a1a00', border: '#ff9800', text: '#ff9800' },
  surveillance: { label: '👁 SURVEILLANCE', bg: '#0a1a2d', border: '#42a5f5', text: '#42a5f5' },
  routine:      { label: '✅ ROUTINE',      bg: '#0a1f12', border: '#00e676', text: '#00e676' },
};

// ═══════════════════════════════════════════════════
// SVG COMPONENTS
// ═══════════════════════════════════════════════════
function EcgGrid({ width = W, height = 130 }) {
  const minor = [], major = [];
  for (let x = 0; x <= width; x += 20) (x % 100 === 0 ? major : minor).push(`M${x},0 L${x},${height}`);
  for (let y = 0; y <= height; y += 20) (y % 100 === 0 ? major : minor).push(`M0,${y} L${width},${y}`);
  return (
    <>
      <path d={minor.join(' ')} stroke="#0d2d18" strokeWidth="0.5" fill="none" />
      <path d={major.join(' ')} stroke="#143d20" strokeWidth="1" fill="none" />
    </>
  );
}

function EcgStrip({ rhythmId, color = '#00e676', height = 130, animate = false }) {
  const pathRef = useRef(null);
  const stripPath = generateStrip(rhythmId);
  useEffect(() => {
    if (!animate || !pathRef.current) return;
    const el = pathRef.current;
    el.style.strokeDasharray = '3000';
    el.style.strokeDashoffset = '3000';
    el.style.transition = 'none';
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.transition = 'stroke-dashoffset 2s ease-out';
      el.style.strokeDashoffset = '0';
    }));
  }, [animate, rhythmId]);
  return (
    <svg viewBox={`0 0 ${W} ${height}`} width="100%" height={height} style={{ display: 'block' }}>
      <defs>
        <filter id={`glow-${rhythmId}`}>
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width={W} height={height} fill="#050f0a" />
      <EcgGrid width={W} height={height} />
      <path ref={pathRef} d={stripPath} fill="none" stroke={color} strokeWidth="2"
        filter={`url(#glow-${rhythmId})`} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function AnatomyDiagram() {
  const b = 65, oneBeat = `M 0,${b} ${normalComplex(0, 320, b)}`;
  const segs = [
    { x1: 38, x2: 88, label: 'PR: 0,12–0,20s', y: 100 },
    { x1: 108, x2: 138, label: 'QRS < 0,12s', y: 108 },
    { x1: 138, x2: 200, label: 'QT: 0,35–0,45s', y: 116 }
  ];
  return (
    <svg viewBox="0 0 380 140" width="100%" style={{ display: 'block' }}>
      <rect width="380" height="140" fill="#050f0a" rx="8" />
      <EcgGrid width={380} height={140} />
      <path d={oneBeat} fill="none" stroke="#00e676" strokeWidth="2.5" strokeLinecap="round" />
      <text x="28" y="32" fill="#ffcc02" fontSize="11" fontFamily="monospace" fontWeight="bold">P</text>
      <line x1="35" y1="36" x2="55" y2="54" stroke="#ffcc0288" strokeWidth="1" strokeDasharray="3,2" />
      <text x="100" y="10" fill="#00e676" fontSize="11" fontFamily="monospace" fontWeight="bold">QRS</text>
      <line x1="116" y1="14" x2="116" y2="18" stroke="#00e67688" strokeWidth="1" strokeDasharray="3,2" />
      <text x="150" y="32" fill="#42a5f5" fontSize="11" fontFamily="monospace" fontWeight="bold">T</text>
      <line x1="156" y1="36" x2="168" y2="50" stroke="#42a5f588" strokeWidth="1" strokeDasharray="3,2" />
      {segs.map((s, i) => (
        <g key={i}>
          <line x1={s.x1} y1={s.y - 3} x2={s.x2} y2={s.y - 3} stroke="#ffffff44" strokeWidth="1" />
          <line x1={s.x1} y1={s.y - 6} x2={s.x1} y2={s.y} stroke="#ffffff44" strokeWidth="1" />
          <line x1={s.x2} y1={s.y - 6} x2={s.x2} y2={s.y} stroke="#ffffff44" strokeWidth="1" />
          <text x={(s.x1 + s.x2) / 2} y={s.y + 9} fill="#ffffff77" fontSize="8" fontFamily="monospace" textAnchor="middle">{s.label}</text>
        </g>
      ))}
      <text x="100" y="72" fill="#f06292" fontSize="10" fontFamily="monospace">Q</text>
      <text x="130" y="72" fill="#f06292" fontSize="10" fontFamily="monospace">S</text>
    </svg>
  );
}

// ═══════════════════════════════════════════════════
// DETAIL PANEL
// ═══════════════════════════════════════════════════
function DetailPanel({ rhythm, onClose }) {
  const [activeTab, setActiveTab] = useState('ecg');
  const p = PRIORITY_CONFIG[rhythm.nursing?.priority] || PRIORITY_CONFIG.routine;
  return (
    <div style={{ background: '#070f09', border: `1px solid ${rhythm.color}`, borderRadius: 12, overflow: 'hidden', boxShadow: `0 0 24px ${rhythm.color}22`, marginTop: 14, animation: 'fadeIn 0.3s ease' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #143d20' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1, paddingRight: 8 }}>
            <h2 style={{ color: rhythm.color, fontFamily: 'monospace', fontSize: 15, margin: '0 0 4px', lineHeight: 1.3 }}>{rhythm.label}</h2>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ color: '#8ab89a', fontSize: 11, fontFamily: 'monospace' }}>FC: {rhythm.hr}</span>
              <span style={{ background: p.bg, border: `1px solid ${p.border}`, color: p.text, fontSize: 9, fontFamily: 'monospace', padding: '2px 7px', borderRadius: 10 }}>{p.label}</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: '1px solid #143d20', color: '#8ab89a', borderRadius: 6, padding: '4px 10px', fontSize: 12, fontFamily: 'monospace', cursor: 'pointer', flexShrink: 0 }}>✕</button>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
          {[{ id: 'ecg', label: '📈 ECG' }, { id: 'nursing', label: '💉 Infirmier·ère' }].map(t => (
            <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
              background: activeTab === t.id ? '#0a2a14' : 'none',
              border: `1px solid ${activeTab === t.id ? rhythm.color : '#143d20'}`,
              color: activeTab === t.id ? rhythm.color : '#8ab89a',
              borderRadius: 6, padding: '7px 12px', fontSize: 12, fontFamily: 'monospace', cursor: 'pointer', transition: 'all 0.2s'
            }}>{t.label}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: '14px 16px' }}>
        {activeTab === 'ecg' && <>
          <EcgStrip rhythmId={rhythm.id} color={rhythm.color} animate height={110} />
          <p style={{ color: '#c8e6c9', fontSize: 13.5, lineHeight: 1.7, margin: '12px 0' }}>{rhythm.desc}</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {rhythm.signs.map((s, i) => (
              <span key={i} style={{ background: '#0a1a10', border: `1px solid ${rhythm.color}44`, color: rhythm.color, padding: '4px 10px', borderRadius: 20, fontSize: 11, fontFamily: 'monospace' }}>✓ {s}</span>
            ))}
          </div>
        </>}
        {activeTab === 'nursing' && rhythm.nursing && <>
          <div style={{ background: p.bg, border: `1px solid ${p.border}`, borderRadius: 8, padding: '9px 12px', marginBottom: 14 }}>
            <span style={{ color: p.text, fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold' }}>Niveau de priorité : {p.label}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rhythm.nursing.actions.map((a, i) => (
              <div key={i} style={{ background: '#050f07', border: '1px solid #143d20', borderLeft: `3px solid ${rhythm.color}`, borderRadius: 8, padding: '10px 12px', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20, flexShrink: 0, marginTop: 2 }}>{a.icon}</span>
                <div>
                  <div style={{ color: rhythm.color, fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold', marginBottom: 4 }}>{a.step}</div>
                  <div style={{ color: '#c8e6c9', fontSize: 13, lineHeight: 1.65 }}>{a.text}</div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 12, padding: '9px 12px', background: '#0a1408', border: '1px dashed #143d20', borderRadius: 8, color: '#ffffff44', fontSize: 11, fontFamily: 'monospace', lineHeight: 1.5 }}>
            ⚕️ Ces actions sont données à titre éducatif. Toute décision thérapeutique doit être validée par le médecin prescripteur.
          </div>
        </>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// BASES TAB
// ═══════════════════════════════════════════════════
function BasesTab() {
  const concepts = [
    { icon: '⚡', title: 'Origine du signal', text: "Le cœur génère des impulsions électriques qui déclenchent les contractions musculaires. Le nœud sinusal (pace-maker naturel) est situé dans l'oreillette droite et dépolarise à 60-100 fois/min." },
    { icon: '〰', title: "L'onde P", text: "Représente la dépolarisation auriculaire. Elle est positive en D1, D2, aVF. Durée < 0,12s, amplitude < 0,25mV. Son absence signe une FA ou un rythme jonctionnel." },
    { icon: '→', title: 'Intervalle PR', text: "Temps de conduction du nœud sinusal jusqu'au ventricule via le nœud AV. Normal: 0,12–0,20s. > 0,20s = bloc AV 1°. < 0,12s = pré-excitation (WPW)." },
    { icon: '⬆', title: 'Complexe QRS', text: "Dépolarisation ventriculaire. Durée normale < 0,12s. Q: déflexion négative initiale, R: déflexion positive, S: déflexion négative après R. > 0,12s = bloc de branche." },
    { icon: '🌀', title: 'Segment ST et onde T', text: "Le segment ST correspond à la repolarisation ventriculaire précoce. Normalement isoélectrique. Sus-décalage > 1mm = ischémie. L'onde T représente la repolarisation tardive." },
    { icon: '📏', title: 'Intervalle QT', text: "De l'onset du QRS à la fin de l'onde T. QTc normal: < 440ms ♂, < 460ms ♀. Un QT long prédispose aux torsades de pointes." },
    { icon: '🧭', title: 'Axe électrique', text: "Normal: -30° à +90°. Axe gauche (< -30°): bloc fasciculaire antérieur, HVG. Axe droit (> +90°): HTAP, bloc fasciculaire postérieur." },
    { icon: '📄', title: 'Vitesse du papier', text: "Standard: 25 mm/s. 1 petit carré = 0,04s, 1 grand carré = 0,20s. Amplitude: 1 grand carré vertical = 1 mV (10mm)." },
  ];
  return (
    <div style={{ padding: '16px 0' }}>
      <div style={{ marginBottom: 20 }}>
        <h3 style={{ color: '#00e676', fontFamily: 'monospace', fontSize: 11, letterSpacing: 3, marginBottom: 12 }}>ANATOMIE DU COMPLEXE ECG</h3>
        <AnatomyDiagram />
      </div>
      <h3 style={{ color: '#00e676', fontFamily: 'monospace', fontSize: 11, letterSpacing: 3, marginBottom: 12 }}>NOTIONS FONDAMENTALES</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 10 }}>
        {concepts.map((c, i) => (
          <div key={i} style={{ background: '#0a1a10', border: '1px solid #143d20', borderRadius: 8, padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 7 }}>
              <span style={{ fontSize: 18 }}>{c.icon}</span>
              <span style={{ color: '#00e676', fontFamily: 'monospace', fontSize: 13, fontWeight: 'bold' }}>{c.title}</span>
            </div>
            <p style={{ color: '#8ab89a', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{c.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// RYTHMES TAB
// ═══════════════════════════════════════════════════
function RythmesTab() {
  const [selected, setSelected] = useState(null);
  const detailRef = useRef(null);
  const select = (r) => {
    setSelected(sel => sel?.id === r.id ? null : r);
    setTimeout(() => detailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  };
  return (
    <div style={{ padding: '16px 0' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 8 }}>
        {RHYTHMS.map(r => (
          <div key={r.id} onClick={() => select(r)} style={{
            background: selected?.id === r.id ? '#0a1f12' : '#070f09',
            border: `1px solid ${selected?.id === r.id ? r.color : '#143d20'}`,
            borderRadius: 8, padding: '10px 12px', cursor: 'pointer', transition: 'all 0.2s',
            boxShadow: selected?.id === r.id ? `0 0 12px ${r.color}33` : 'none'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 4 }}>
              <span style={{ color: r.color, fontFamily: 'monospace', fontSize: 11, fontWeight: 'bold', lineHeight: 1.3, flex: 1 }}>{r.label}</span>
              <span style={{ background: r.category === 'URGENCE' ? '#ff525222' : '#143d2088', color: r.category === 'URGENCE' ? '#ff5252' : '#8ab89a', fontSize: 9, fontFamily: 'monospace', padding: '2px 5px', borderRadius: 4, flexShrink: 0 }}>{r.category}</span>
            </div>
            <div style={{ height: 50, overflow: 'hidden', borderRadius: 4 }}>
              <svg viewBox="0 0 800 130" width="100%" height={50} style={{ display: 'block' }}>
                <rect width={W} height={130} fill="#050f0a" />
                <EcgGrid />
                <path d={generateStrip(r.id)} fill="none" stroke={r.color} strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div style={{ marginTop: 5, color: '#ffffff55', fontSize: 10, fontFamily: 'monospace' }}>FC: {r.hr}</div>
          </div>
        ))}
      </div>
      <div ref={detailRef}>
        {selected && <DetailPanel rhythm={selected} onClose={() => setSelected(null)} />}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// QUIZ TAB
// ═══════════════════════════════════════════════════
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }
function generateQuestion(used = []) {
  const pool = RHYTHMS.filter(r => !used.includes(r.id));
  const target = pool.length > 0 ? pool[Math.floor(Math.random() * pool.length)] : RHYTHMS[Math.floor(Math.random() * RHYTHMS.length)];
  const options = shuffle([target, ...shuffle(RHYTHMS.filter(r => r.id !== target.id)).slice(0, 3)]);
  return { target, options };
}

function QuizTab() {
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const [q, setQ] = useState(() => generateQuestion());
  const [answered, setAnswered] = useState(null);
  const [streak, setStreak] = useState(0);
  const usedRef = useRef([]);
  const resultRef = useRef(null);

  const handleAnswer = (opt) => {
    if (answered) return;
    setAnswered(opt.id);
    const correct = opt.id === q.target.id;
    setScore(s => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    setStreak(s => correct ? s + 1 : 0);
    if (correct) usedRef.current = [...usedRef.current.slice(-5), q.target.id];
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
  };
  const next = () => { setQ(generateQuestion(usedRef.current)); setAnswered(null); };
  const accuracy = score.total > 0 ? Math.round(score.correct / score.total * 100) : 0;

  return (
    <div style={{ padding: '16px 0' }}>
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, background: '#070f09', border: '1px solid #143d20', borderRadius: 10, overflow: 'hidden' }}>
        {[{ label: 'Score', value: `${score.correct}/${score.total}`, color: '#00e676' },
          { label: 'Précision', value: `${accuracy}%`, color: accuracy >= 80 ? '#00e676' : accuracy >= 50 ? '#ffcc02' : '#ff5252' },
          { label: 'Série', value: `🔥 ${streak}`, color: streak >= 3 ? '#ff9800' : '#8ab89a' }
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center', padding: '12px 8px', borderRight: i < 2 ? '1px solid #143d20' : 'none' }}>
            <div style={{ color: s.color, fontFamily: 'monospace', fontSize: 20, fontWeight: 'bold' }}>{s.value}</div>
            <div style={{ color: '#ffffff44', fontSize: 10, fontFamily: 'monospace', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: '#070f09', border: '1px solid #143d20', borderRadius: 10, padding: '14px', marginBottom: 14 }}>
        <div style={{ color: '#ffffff55', fontFamily: 'monospace', fontSize: 10, marginBottom: 10, letterSpacing: 2 }}>IDENTIFIEZ CE RYTHME</div>
        <EcgStrip rhythmId={q.target.id} color={q.target.color} height={110} animate={!answered} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
        {q.options.map(opt => {
          const isCorrect = opt.id === q.target.id, isSelected = answered === opt.id;
          let bg = '#070f09', borderColor = '#143d20', textColor = '#c8e6c9';
          if (answered) { if (isCorrect) { bg = '#0a1f12'; borderColor = '#00e676'; textColor = '#00e676'; } else if (isSelected) { bg = '#1f0a0a'; borderColor = '#ff5252'; textColor = '#ff5252'; } else { textColor = '#ffffff33'; } }
          return (
            <button key={opt.id} onClick={() => handleAnswer(opt)} style={{ background: bg, border: `1px solid ${borderColor}`, borderRadius: 8, padding: '10px 12px', textAlign: 'left', transition: 'all 0.25s', fontFamily: 'monospace', cursor: answered ? 'default' : 'pointer' }}>
              <div style={{ color: textColor, fontSize: 12, fontWeight: 'bold', marginBottom: 3, lineHeight: 1.3 }}>{answered && isCorrect ? '✓ ' : answered && isSelected ? '✗ ' : ''}{opt.label}</div>
              <div style={{ color: answered ? (isCorrect ? '#8ab89a' : '#ffffff33') : '#ffffff44', fontSize: 10 }}>{opt.hr}</div>
            </button>
          );
        })}
      </div>
      {answered && (
        <div ref={resultRef} style={{ marginTop: 12, background: answered === q.target.id ? '#0a1f12' : '#1a0a0a', border: `1px solid ${answered === q.target.id ? '#00e676' : '#ff5252'}`, borderRadius: 10, overflow: 'hidden', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid #143d20' }}>
            <div style={{ color: answered === q.target.id ? '#00e676' : '#ff5252', fontFamily: 'monospace', fontSize: 12, fontWeight: 'bold', marginBottom: 6 }}>
              {answered === q.target.id ? '✓ BONNE RÉPONSE !' : `✗ C'était : ${q.target.label}`}
            </div>
            <p style={{ color: '#c8e6c9', fontSize: 13, lineHeight: 1.6, margin: '0 0 8px' }}>{q.target.desc}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
              {q.target.signs.map((s, i) => (
                <span key={i} style={{ background: '#0a1a10', color: '#00e676', padding: '3px 8px', borderRadius: 20, fontSize: 10, fontFamily: 'monospace', border: '1px solid #00e67644' }}>✓ {s}</span>
              ))}
            </div>
          </div>
          {q.target.nursing && (
            <div style={{ padding: '12px 14px', borderBottom: '1px solid #143d20' }}>
              <div style={{ color: '#42a5f5', fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, marginBottom: 8 }}>💉 ACTIONS INFIRMIÈRES CLÉS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                {q.target.nursing.actions.slice(0, 3).map((a, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, background: '#050f07', borderLeft: `2px solid ${q.target.color}`, borderRadius: 6, padding: '7px 10px' }}>
                    <span style={{ fontSize: 16, flexShrink: 0 }}>{a.icon}</span>
                    <div>
                      <div style={{ color: q.target.color, fontFamily: 'monospace', fontSize: 10, marginBottom: 2 }}>{a.step}</div>
                      <div style={{ color: '#8ab89a', fontSize: 12, lineHeight: 1.5 }}>{a.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ padding: '10px 14px' }}>
            <button onClick={next} style={{ background: '#00e67618', border: '1px solid #00e676', color: '#00e676', fontFamily: 'monospace', fontSize: 13, padding: '8px 18px', borderRadius: 8, cursor: 'pointer' }}>
              PROCHAIN ECG →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
// ASSISTANT IA TAB
// ═══════════════════════════════════════════════════
async function askClaude(messages) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514', max_tokens: 1000,
      system: "Tu es un expert en cardiologie et lecture d'ECG. Tu aides des étudiants en médecine et infirmiers à apprendre l'électrocardiographie. Tes réponses sont claires, structurées et pédagogiques. Réponds toujours en français.",
      messages
    })
  });
  const data = await res.json();
  return data.content?.find(b => b.type === 'text')?.text || 'Erreur de réponse.';
}

function AssistantTab() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: "Bonjour ! Je suis votre assistant ECG. Posez-moi toutes vos questions sur l'électrocardiographie : interprétation, pathologies, mesures, cas cliniques, actions infirmières… Je suis là pour vous aider à apprendre." }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const suggestions = ["Comment différencier FA et flutter ?", "Quand s'inquiéter d'un QT long ?", "Expliquez le bloc de branche droit", "Comment reconnaître un SCA sur l'ECG ?", "Qu'est-ce que la dissociation AV ?", "Préparer une cardioversion électrique ?"];

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const send = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', text };
    const newMsgs = [...messages, userMsg];
    setMessages(newMsgs); setInput(''); setLoading(true);
    try {
      const history = newMsgs.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.text }));
      const reply = await askClaude(history);
      setMessages(prev => [...prev, { role: 'assistant', text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', text: "Désolé, une erreur s'est produite. Vérifiez votre connexion et réessayez." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 200px)', minHeight: 400 }}>
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 12 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
            <div style={{ maxWidth: '85%', padding: '10px 14px', borderRadius: 12, background: m.role === 'user' ? '#0a2a14' : '#070f09', border: `1px solid ${m.role === 'user' ? '#00e67644' : '#143d20'}`, color: '#c8e6c9', fontSize: 13.5, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {m.role === 'assistant' && <div style={{ color: '#00e676', fontFamily: 'monospace', fontSize: 10, letterSpacing: 2, marginBottom: 5 }}>◈ ASSISTANT ECG</div>}
              {m.text}
            </div>
          </div>
        ))}
        {loading && <div style={{ display: 'flex' }}>
          <div style={{ background: '#070f09', border: '1px solid #143d20', borderRadius: 12, padding: '10px 14px' }}>
            <span style={{ color: '#00e676', fontFamily: 'monospace', fontSize: 12 }}>◈ Analyse en cours <span style={{ animation: 'blink 1s infinite' }}>...</span></span>
          </div>
        </div>}
        <div ref={bottomRef} />
      </div>
      {messages.length === 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
          {suggestions.map((s, i) => (
            <button key={i} onClick={() => send(s)} style={{ background: '#0a1a10', border: '1px solid #143d20', color: '#8ab89a', borderRadius: 20, padding: '5px 11px', fontSize: 11, fontFamily: 'monospace', cursor: 'pointer' }}>{s}</button>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send(input)}
          placeholder="Posez votre question sur l'ECG..."
          style={{ flex: 1, background: '#070f09', border: '1px solid #143d20', borderRadius: 8, padding: '10px 13px', color: '#c8e6c9', fontSize: 13, outline: 'none' }} />
        <button onClick={() => send(input)} disabled={!input.trim() || loading} style={{ background: input.trim() && !loading ? '#00e67618' : '#050f0a', border: '1px solid #00e676', color: '#00e676', borderRadius: 8, padding: '10px 16px', fontSize: 13, opacity: !input.trim() || loading ? 0.4 : 1, fontFamily: 'monospace', cursor: 'pointer' }}>↑</button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════
const TABS = [
  { id: 'bases', label: 'Bases', icon: '📖' },
  { id: 'rythmes', label: 'Rythmes', icon: '💓' },
  { id: 'quiz', label: 'Quiz', icon: '🎯' },
  { id: 'ia', label: 'IA', icon: '🤖' },
];

export default function App() {
  const [tab, setTab] = useState('bases');
  const normalPath = generateStrip('normal');

  return (
    <div style={{ minHeight: '100vh', background: '#030a05', color: '#c8e6c9', fontFamily: 'system-ui,sans-serif', paddingBottom: 'env(safe-area-inset-bottom,0)' }}>
      <style>{`
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes blink  { 0%,100% { opacity:1; } 50% { opacity:0; } }
        ::-webkit-scrollbar { width: 3px; }
        ::-webkit-scrollbar-thumb { background: #143d20; border-radius: 2px; }
      `}</style>

      {/* Header */}
      <div style={{ background: '#050f07', borderBottom: '1px solid #143d20', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div>
          <div style={{ fontFamily: 'monospace', fontSize: 9, color: '#00e676', letterSpacing: 3, marginBottom: 1 }}>CARDIOLEARN</div>
          <h1 style={{ fontFamily: 'monospace', fontSize: 18, margin: 0, color: '#fff', letterSpacing: 1 }}>ECG <span style={{ color: '#00e676' }}>Interactif</span></h1>
        </div>
        <div style={{ width: 100, height: 32, overflow: 'hidden', opacity: 0.6 }}>
          <svg viewBox="100 40 700 80" width="100" height="32" style={{ display: 'block' }}>
            <path d={normalPath} fill="none" stroke="#00e676" strokeWidth="3" strokeLinecap="round" />
          </svg>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#ff5252', fontFamily: 'monospace', fontSize: 9, letterSpacing: 1 }}>● EN LIGNE</div>
          <div style={{ color: '#00e676', fontFamily: 'monospace', fontSize: 18, fontWeight: 'bold' }}>75 BPM</div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ display: 'flex', background: '#050f07', borderBottom: '1px solid #143d20', position: 'sticky', top: 58, zIndex: 9 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, background: 'none', border: 'none',
            borderBottom: tab === t.id ? '2px solid #00e676' : '2px solid transparent',
            color: tab === t.id ? '#00e676' : '#8ab89a',
            fontFamily: 'monospace', fontSize: 11, padding: '11px 4px', cursor: 'pointer', transition: 'all 0.2s'
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ padding: '0 14px 80px', maxWidth: 640, margin: '0 auto' }}>
        {tab === 'bases' && <BasesTab />}
        {tab === 'rythmes' && <RythmesTab />}
        {tab === 'quiz' && <QuizTab />}
        {tab === 'ia' && <AssistantTab />}
      </div>
    </div>
  );
}
