import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';

export const dynamic = 'force-dynamic';

function shuffleArray(array: any[]) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Shuffle options and remap the correct answer to the new position
function shuffleOptionsAndAnswer(options: {id: string, text: string}[], answer: string) {
  const shuffled = [...options];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const ids = ["A", "B", "C", "D"];
  let newAnswer = answer;
  const reassigned = shuffled.map((opt, idx) => {
    const newId = ids[idx] || opt.id;
    if (opt.id === answer) newAnswer = newId;
    return { id: newId, text: opt.text };
  });
  return { options: reassigned, answer: newAnswer };
}

// Utility to format math symbols
function formatMathText(str: string) {
  if (!str) return "";
  return str
    .replace(/(^|\b|\d)phi(\b|$)/g, "$1φ$2")
    .replace(/(^|\b|\d)theta(\b|$)/g, "$1θ$2")
    .replace(/(^|\b|\d)alpha(\b|$)/g, "$1α$2")
    .replace(/(^|\b|\d)beta(\b|$)/g, "$1β$2")
    .replace(/(^|\b|\d)gamma(\b|$)/g, "$1γ$2")
    .replace(/(^|\b|\d)lambda(\b|$)/g, "$1λ$2")
    .replace(/(^|\b|\d)mu(\b|$)/g, "$1μ$2")
    .replace(/(^|\b|\d)pi(\b|$)/g, "$1π$2")
    .replace(/(^|\b|\d)omega(\b|$)/g, "$1ω$2")
    .replace(/(^|\b|\d)sigma(\b|$)/g, "$1σ$2")
    .replace(/(^|\b|\d)Delta(\b|$)/g, "$1Δ$2")
    .replace(/(^|\b|\d)infty(\b|$)/g, "$1∞$2")
    .replace(/\*/g, "·");
}

function sanitizeOptionText(str: string) {
  let cleaned = formatMathText(str).trim();
  if (/^[A-D]$/i.test(cleaned) || cleaned.toLowerCase() === "none") {
    return "None of the above";
  }
  return cleaned;
}

const getTierDistribution = (tier: number, total: number) => {
    let e = 0, m = 0, h = 0;
    switch(tier) {
        case 1: e = 0.7; m = 0.3; h = 0.0; break;
        case 2: e = 0.5; m = 0.5; h = 0.0; break;
        case 3: e = 0.4; m = 0.5; h = 0.1; break;
        case 4: e = 0.3; m = 0.5; h = 0.2; break;
        case 5: e = 0.2; m = 0.5; h = 0.3; break;
        case 6: e = 0.1; m = 0.5; h = 0.4; break;
        case 7: e = 0.1; m = 0.4; h = 0.5; break;
        case 8: e = 0.0; m = 0.5; h = 0.5; break;
        case 9: e = 0.0; m = 0.3; h = 0.7; break;
        case 10: e = 0.0; m = 0.1; h = 0.9; break;
        default: e = 0.33; m = 0.33; h = 0.34;
    }
    return {
        easy: Math.round(total * e),
        medium: Math.round(total * m),
        hard: total - Math.round(total * e) - Math.round(total * m)
    };
};

// Hardcoded chapter lists to avoid parsing Syllabus object dynamically
const subjectChapters = {
    physics: [
        "physical_world","units_and_measurements","kinematics",
        "laws_of_motion","work_energy_power","system_of_particles",
        "gravitation","mechanical_properties_of_solids",
        "mechanical_properties_of_fluids","thermal_properties_of_matter",
        "thermodynamics","kinetic_theory","oscillations","waves",
        "electric_charges_and_fields","electrostatic_potential_and_capacitance",
        "current_electricity","moving_charges_and_magnetism",
        "magnetism_and_matter","electromagnetic_induction",
        "alternating_current","electromagnetic_waves",
        "ray_optics_and_optical_instruments","wave_optics",
        "dual_nature_of_radiation","atoms","nuclei",
        "semiconductor_electronics"
    ],
    chemistry: [
        "some_basic_concepts_of_chemistry","structure_of_atom",
        "classification_of_elements","chemical_bonding","states_of_matter",
        "chemical_thermodynamics","equilibrium","redox_reactions",
        "hydrogen","s_block_elements","p_block_elements_11",
        "some_basic_principles_of_organic_chemistry","hydrocarbons",
        "environmental_chemistry","the_solid_state","solutions",
        "electrochemistry","chemical_kinetics","surface_chemistry",
        "isolation_of_elements","p_block_elements_12",
        "d_and_f_block_elements","coordination_compounds",
        "haloalkanes_and_haloarenes","alcohols_phenols_and_ethers",
        "aldehydes_ketones_and_carboxylic_acids","amines",
        "biomolecules_chemistry","polymers","chemistry_everyday_life"
    ],
    math: [
        "sets","relations_and_functions","trigonometric_functions",
        "principle_of_mathematical_induction",
        "complex_numbers_and_quadratic_equations","linear_inequalities",
        "permutations_and_combinations","binomial_theorem",
        "sequences_and_series","straight_lines","conic_sections",
        "introduction_to_3d_geometry","limits_and_derivatives",
        "mathematical_reasoning","statistics","probability",
        "relations_and_functions_12","inverse_trigonometric_functions",
        "matrices","determinants","continuity_and_differentiability",
        "application_of_derivatives","integrals","application_of_integrals",
        "differential_equations","vector_algebra",
        "three_dimensional_geometry_12","linear_programming","probability_12"
    ],
    biology: [
        "the_living_world","biological_classification","plant_kingdom",
        "animal_kingdom","morphology_of_flowering_plants",
        "anatomy_of_flowering_plants","structural_organisation_in_animals",
        "cell_the_unit_of_life","biomolecules","cell_cycle_and_cell_division",
        "transport_in_plants","mineral_nutrition",
        "photosynthesis_in_higher_plants","respiration_in_plants",
        "plant_growth_and_development","digestion_and_absorption",
        "breathing_and_exchange_of_gases","body_fluids_and_circulation",
        "excretory_products_and_their_elimination","locomotion_and_movement",
        "neural_control_and_coordination","chemical_coordination_and_integration",
        "reproduction_in_organisms","sexual_reproduction_in_flowering_plants",
        "human_reproduction","reproductive_health",
        "principles_of_inheritance_and_variation","molecular_basis_of_inheritance",
        "evolution","human_health_and_disease","strategies_for_enhancement_in_food_production",
        "microbes_in_human_welfare","biotechnology_principles_and_processes",
        "biotechnology_and_its_applications","organisms_and_populations",
        "ecosystem","biodiversity_and_conservation","environmental_issues"
    ]
};

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const tierParam = searchParams.get('tier') || '1';
        const examParam = searchParams.get('exam') || 'JEE';
        
        const tier = parseInt(tierParam, 10);
        
        // Distribution of questions per subject
        const schema = examParam === 'NEET' 
            ? [ {sub: 'physics', q: 45}, {sub: 'chemistry', q: 45}, {sub: 'biology', q: 90} ]
            : [ {sub: 'physics', q: 30}, {sub: 'chemistry', q: 30}, {sub: 'math', q: 30} ];

        const rawDir = path.join(process.cwd(), 'raw_questions');
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: "@_"
        });

        let finalQuestions: any[] = [];

        // Pick roughly 5 random files per subject to ensure we have enough pool of questions but don't over-read 100 files
        for (const {sub, q} of schema) {
            const allFiles = subjectChapters[sub as keyof typeof subjectChapters];
            const selectedFiles = shuffleArray(allFiles).slice(0, 10); // pick 10 random chapters to pull from
            
            let easyPool: any[] = [];
            let mediumPool: any[] = [];
            let hardPool: any[] = [];

            for (const chapter of selectedFiles) {
                const filePath = path.join(rawDir, `${chapter}.xml`);
                if (fs.existsSync(filePath)) {
                    try {
                        const xmlData = fs.readFileSync(filePath, 'utf-8');
                        const result = parser.parse(xmlData);
                        
                        if (result.chapter) {
                            const easyQs = result.chapter.easy?.question || [];
                            const mediumQs = result.chapter.medium?.question || [];
                            const hardQs = result.chapter.hard?.question || [];
                            
                            const processQs = (arr: any, diff: string) => {
                                const list = Array.isArray(arr) ? arr : [arr];
                                return list.map((q: any) => {
                                    if (!q || !q.text) return null;
                                    const rawOptions = q.option ? (Array.isArray(q.option) ? q.option : [q.option]) : [];
                                    const formattedOptions = rawOptions.map((opt: any) => {
                                        if (typeof opt === "string") return { id: "?", text: sanitizeOptionText(opt) };
                                        return {
                                            id: String(opt["@_id"] ?? ""),
                                            text: sanitizeOptionText(String(opt["#text"] ?? opt ?? ""))
                                        };
                                    });
                                    const originalAnswer = String(q.answer ?? "");
                                    const { options: shuffledOpts, answer: newAnswer } = shuffleOptionsAndAnswer(formattedOptions, originalAnswer);
                                    return {
                                        id: q["@_id"] || Math.random().toString(36).slice(2, 9),
                                        text: formatMathText(String(q.text ?? "")),
                                        options: shuffledOpts,
                                        answer: newAnswer,
                                        explanation: formatMathText(String(q.explanation ?? "")),
                                        difficulty: diff,
                                        chapterSource: chapter
                                    };
                                }).filter(Boolean);
                            };

                            easyPool = easyPool.concat(processQs(easyQs, 'easy'));
                            mediumPool = mediumPool.concat(processQs(mediumQs, 'medium'));
                            hardPool = hardPool.concat(processQs(hardQs, 'hard'));
                        }
                    } catch (e) {
                        console.error(`Error parsing ${chapter}.xml:`, e);
                    }
                }
            }

            // Shuffle pools
            easyPool = shuffleArray(easyPool);
            mediumPool = shuffleArray(mediumPool);
            hardPool = shuffleArray(hardPool);

            // Get target distribution for this subject
            const dist = getTierDistribution(tier, q);
            
            // Draw questions. If a pool falls short, steal from another pool (fallback mechanism)
            let drawnEasy = easyPool.slice(0, dist.easy);
            let drawnMed = mediumPool.slice(0, dist.medium);
            let drawnHard = hardPool.slice(0, dist.hard);

            let subjectQuestions = [...drawnEasy, ...drawnMed, ...drawnHard];
            
            // Fallback to fill exactly 'q' questions if we lacked questions in some pool
            const poolRemovals = [
                ...easyPool.slice(drawnEasy.length),
                ...mediumPool.slice(drawnMed.length),
                ...hardPool.slice(drawnHard.length)
            ];
            const remainingPool = shuffleArray(poolRemovals);

            while (subjectQuestions.length < q && remainingPool.length > 0) {
                subjectQuestions.push(remainingPool.pop());
            }

            finalQuestions = finalQuestions.concat(subjectQuestions);
        }

        return NextResponse.json({
            chapterName: `Tier ${tier} Simulation Mock`,
            subject: examParam,
            questions: finalQuestions
        });

    } catch (error: any) {
        console.error("Custom test gen error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
