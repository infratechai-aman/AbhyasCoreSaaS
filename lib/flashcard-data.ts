// Flashcard formula data organized by subject
export type Flashcard = {
  id: string;
  subject: "Physics" | "Chemistry" | "Mathematics" | "Biology";
  topic: string;
  front: string;   // The formula name / question prompt
  back: string;     // The actual formula / answer
};

export const flashcardDecks: Record<string, Flashcard[]> = {
  "Physics Essentials": [
    { id: "p1", subject: "Physics", topic: "Kinematics", front: "Equations of Motion (Constant Acceleration)", back: "v = u + at\ns = ut + ½at²\nv² = u² + 2as" },
    { id: "p2", subject: "Physics", topic: "Kinematics", front: "Range of Projectile", back: "R = (u² sin2θ) / g\nMax range at θ = 45°" },
    { id: "p3", subject: "Physics", topic: "Newton's Laws", front: "Newton's Second Law", back: "F = ma = dp/dt\nImpulse J = FΔt = Δp" },
    { id: "p4", subject: "Physics", topic: "Work & Energy", front: "Work-Energy Theorem", back: "W_net = ΔKE = ½mv² − ½mu²" },
    { id: "p5", subject: "Physics", topic: "Gravitation", front: "Gravitational Potential Energy", back: "U = −GMm/r\nEscape velocity: vₑ = √(2gR)" },
    { id: "p6", subject: "Physics", topic: "SHM", front: "Time Period of Simple Pendulum", back: "T = 2π√(l/g)\nFor spring: T = 2π√(m/k)" },
    { id: "p7", subject: "Physics", topic: "Waves", front: "Speed of Sound in Gas", back: "v = √(γRT/M)\nwhere γ = Cp/Cv" },
    { id: "p8", subject: "Physics", topic: "Electrostatics", front: "Coulomb's Law", back: "F = kq₁q₂/r²\nk = 1/(4πε₀) = 9×10⁹ Nm²/C²" },
    { id: "p9", subject: "Physics", topic: "Current Electricity", front: "Ohm's Law & Power", back: "V = IR\nP = VI = I²R = V²/R" },
    { id: "p10", subject: "Physics", topic: "Magnetism", front: "Biot-Savart Law", back: "dB = (μ₀/4π)(Idl × r̂)/r²\nFor circular loop: B = μ₀I/(2R)" },
    { id: "p11", subject: "Physics", topic: "EMI", front: "Faraday's Law of EMI", back: "ε = −dΦ/dt\nΦ = BA cosθ" },
    { id: "p12", subject: "Physics", topic: "Optics", front: "Mirror / Lens Formula", back: "1/v − 1/u = 1/f (mirror)\n1/v − 1/u = 1/f (lens)\nMagnification: m = −v/u" },
    { id: "p13", subject: "Physics", topic: "Modern Physics", front: "de Broglie Wavelength", back: "λ = h/p = h/(mv)\nFor electron: λ = 1.226/√V nm" },
    { id: "p14", subject: "Physics", topic: "Nuclear", front: "Radioactive Decay Law", back: "N = N₀e^(−λt)\nt₁/₂ = 0.693/λ\nActivity A = λN" },
    { id: "p15", subject: "Physics", topic: "Thermodynamics", front: "Carnot Engine Efficiency", back: "η = 1 − T₂/T₁\nW = Q₁ − Q₂" },
  ],
  "Chemistry Must-Know": [
    { id: "c1", subject: "Chemistry", topic: "Mole Concept", front: "Ideal Gas Equation", back: "PV = nRT\nR = 8.314 J/(mol·K) = 0.0821 L·atm/(mol·K)" },
    { id: "c2", subject: "Chemistry", topic: "Atomic Structure", front: "de Broglie + Heisenberg", back: "λ = h/(mv)\nΔx·Δp ≥ h/(4π)" },
    { id: "c3", subject: "Chemistry", topic: "Chemical Bonding", front: "Hybridization Types", back: "sp → Linear (180°)\nsp² → Trigonal planar (120°)\nsp³ → Tetrahedral (109.5°)\nsp³d → TBP\nsp³d² → Octahedral" },
    { id: "c4", subject: "Chemistry", topic: "Thermodynamics", front: "Gibbs Free Energy", back: "ΔG = ΔH − TΔS\nSpontaneous if ΔG < 0\nΔG° = −nFE°cell = −RT ln K" },
    { id: "c5", subject: "Chemistry", topic: "Equilibrium", front: "Henderson-Hasselbalch Eq.", back: "pH = pKa + log([A⁻]/[HA])\npOH = pKb + log([BH⁺]/[B])" },
    { id: "c6", subject: "Chemistry", topic: "Kinetics", front: "First Order Rate Law", back: "k = (2.303/t) log(a/(a−x))\nt₁/₂ = 0.693/k" },
    { id: "c7", subject: "Chemistry", topic: "Electrochemistry", front: "Nernst Equation", back: "E = E° − (RT/nF) ln Q\nAt 298K: E = E° − (0.0591/n) log Q" },
    { id: "c8", subject: "Chemistry", topic: "Solutions", front: "Raoult's Law", back: "P = P°₁x₁ + P°₂x₂\nΔTb = Kb·m\nΔTf = Kf·m" },
    { id: "c9", subject: "Chemistry", topic: "Organic", front: "Markovnikov's Rule", back: "In HX addition to alkene:\nH adds to C with MORE H's\nX adds to C with FEWER H's\nAnti-Markovnikov with peroxide (HBr only)" },
    { id: "c10", subject: "Chemistry", topic: "Coordination", front: "Crystal Field Theory", back: "Octahedral: t₂g (3) + eg (2)\nΔ₀ > Δₜ\nSpectrochemical series:\nI⁻ < Br⁻ < Cl⁻ < F⁻ < H₂O < NH₃ < en < CN⁻ < CO" },
    { id: "c11", subject: "Chemistry", topic: "Solid State", front: "Packing Efficiency", back: "BCC = 68%\nFCC/CCP = 74%\nSimple cubic = 52.4%" },
    { id: "c12", subject: "Chemistry", topic: "p-Block", front: "Oxoacids of Phosphorus", back: "H₃PO₂ (1 P−OH, reducing)\nH₃PO₃ (2 P−OH, reducing)\nH₃PO₄ (3 P−OH, non-reducing)" },
  ],
  "Mathematics Core": [
    { id: "m1", subject: "Mathematics", topic: "Quadratic", front: "Quadratic Formula", back: "x = (−b ± √(b²−4ac)) / 2a\nD = b²−4ac\nSum of roots = −b/a\nProduct = c/a" },
    { id: "m2", subject: "Mathematics", topic: "Trigonometry", front: "sin²θ + cos²θ", back: "sin²θ + cos²θ = 1\n1 + tan²θ = sec²θ\n1 + cot²θ = csc²θ" },
    { id: "m3", subject: "Mathematics", topic: "Calculus", front: "Integration by Parts", back: "∫u·dv = u·v − ∫v·du\nILATE: Inverse, Log, Algebraic, Trig, Exponential" },
    { id: "m4", subject: "Mathematics", topic: "Calculus", front: "L'Hôpital's Rule", back: "If lim f(x)/g(x) = 0/0 or ∞/∞:\nlim f(x)/g(x) = lim f'(x)/g'(x)" },
    { id: "m5", subject: "Mathematics", topic: "Matrices", front: "Inverse of 2×2 Matrix", back: "A⁻¹ = (1/|A|) × adj(A)\nFor [a b; c d]:\nA⁻¹ = (1/(ad−bc)) × [d −b; −c a]" },
    { id: "m6", subject: "Mathematics", topic: "Vectors", front: "Cross Product", back: "a⃗ × b⃗ = |a||b|sinθ · n̂\n|a⃗ × b⃗| = Area of parallelogram\nScalar triple product = [a⃗ b⃗ c⃗] = Volume" },
    { id: "m7", subject: "Mathematics", topic: "Probability", front: "Bayes' Theorem", back: "P(A|B) = P(B|A)·P(A) / P(B)\nConditional probability" },
    { id: "m8", subject: "Mathematics", topic: "Sequences", front: "Sum of AP & GP", back: "AP: Sₙ = n/2(2a + (n−1)d)\nGP: Sₙ = a(rⁿ−1)/(r−1)\nInfinite GP: S∞ = a/(1−r), |r|<1" },
    { id: "m9", subject: "Mathematics", topic: "3D Geometry", front: "Distance Between Skew Lines", back: "d = |[(a₂−a₁)·(b₁×b₂)]| / |b₁×b₂|" },
    { id: "m10", subject: "Mathematics", topic: "Differential Eq", front: "Linear DE Solution", back: "dy/dx + Py = Q\nIF = e^∫P dx\ny·IF = ∫Q·IF dx + C" },
    { id: "m11", subject: "Mathematics", topic: "Conic Sections", front: "Eccentricity of Conics", back: "Circle: e = 0\nEllipse: 0 < e < 1\nParabola: e = 1\nHyperbola: e > 1" },
    { id: "m12", subject: "Mathematics", topic: "Binomial", front: "Binomial Theorem", back: "(x+y)ⁿ = Σ ⁿCᵣ xⁿ⁻ʳ yʳ\nGeneral term: T(r+1) = ⁿCᵣ xⁿ⁻ʳ yʳ" },
  ],
  "Biology Quick Recall": [
    { id: "b1", subject: "Biology", topic: "Cell Biology", front: "Mitosis Phases", back: "Prophase → Metaphase → Anaphase → Telophase\nPMAT\nResult: 2 identical diploid cells" },
    { id: "b2", subject: "Biology", topic: "Genetics", front: "Mendel's Laws", back: "1. Law of Dominance\n2. Law of Segregation\n3. Law of Independent Assortment\nDihybrid ratio: 9:3:3:1" },
    { id: "b3", subject: "Biology", topic: "Molecular Bio", front: "Central Dogma", back: "DNA →(Transcription)→ mRNA →(Translation)→ Protein\nReverse transcriptase: RNA → DNA" },
    { id: "b4", subject: "Biology", topic: "Ecology", front: "Ecological Pyramids", back: "Energy: Always upright (10% rule)\nBiomass: Inverted in aquatic\nNumbers: Inverted in parasitic/tree" },
    { id: "b5", subject: "Biology", topic: "Reproduction", front: "Gametogenesis", back: "Spermatogenesis: 1 cell → 4 sperms\nOogenesis: 1 cell → 1 ovum + 3 polar bodies" },
    { id: "b6", subject: "Biology", topic: "Plant Physiology", front: "Photosynthesis Equations", back: "6CO₂ + 12H₂O → C₆H₁₂O₆ + 6O₂ + 6H₂O\nLight reactions: Thylakoid\nCalvin cycle: Stroma" },
    { id: "b7", subject: "Biology", topic: "Human Physiology", front: "Blood Groups", back: "A: antigen A, anti-B antibody\nB: antigen B, anti-A antibody\nAB: both antigens, no antibodies (universal recipient)\nO: no antigens, both antibodies (universal donor)" },
    { id: "b8", subject: "Biology", topic: "Evolution", front: "Hardy-Weinberg Principle", back: "p² + 2pq + q² = 1\np + q = 1\nConditions: No mutation, random mating, no selection, large population, no migration" },
    { id: "b9", subject: "Biology", topic: "Biotechnology", front: "Restriction Enzymes", back: "EcoRI: 5'-GAATTC-3' (palindromic)\nSticky ends: Staggered cut\nBlunt ends: Straight cut\nLigase joins fragments" },
    { id: "b10", subject: "Biology", topic: "Immunity", front: "Innate vs Adaptive Immunity", back: "Innate: Non-specific, present from birth (skin, phagocytes, NK cells)\nAdaptive: Specific, memory (B cells → antibodies, T cells → cell-mediated)" },
  ]
};

export const allDecks = Object.keys(flashcardDecks);
