export type Chapter = {
  chapterNumber: number;
  name: string;
  file: string | null;
  hasData: boolean;
};

export type SubjectSyllabus = {
  Physics: Chapter[];
  Chemistry: Chapter[];
  Mathematics: Chapter[];
  Biology: Chapter[];
};

export type CourseSyllabus = {
  Class11: SubjectSyllabus;
  Class12: SubjectSyllabus;
};

export const Syllabus: CourseSyllabus = {
  Class11: {
    Physics: [
      { chapterNumber: 1, name: "Physical World", file: "physical_world.xml", hasData: true },
      { chapterNumber: 2, name: "Units and Measurements", file: "units_and_measurements.xml", hasData: true },
      { chapterNumber: 3, name: "Kinematics", file: "kinematics.xml", hasData: true },
      { chapterNumber: 4, name: "Laws of Motion", file: "laws_of_motion.xml", hasData: true },
      { chapterNumber: 5, name: "Work, Energy and Power", file: "work_energy_power.xml", hasData: true },
      { chapterNumber: 6, name: "System of Particles and Rotational Motion", file: "system_of_particles.xml", hasData: true },
      { chapterNumber: 7, name: "Gravitation", file: "gravitation.xml", hasData: true },
      { chapterNumber: 8, name: "Mechanical Properties of Solids", file: "mechanical_properties_of_solids.xml", hasData: true },
      { chapterNumber: 9, name: "Mechanical Properties of Fluids", file: "mechanical_properties_of_fluids.xml", hasData: true },
      { chapterNumber: 10, name: "Thermal Properties of Matter", file: "thermal_properties_of_matter.xml", hasData: true },
      { chapterNumber: 11, name: "Thermodynamics", file: "thermodynamics.xml", hasData: true },
      { chapterNumber: 12, name: "Kinetic Theory", file: "kinetic_theory.xml", hasData: true },
      { chapterNumber: 13, name: "Oscillations", file: "oscillations.xml", hasData: true },
      { chapterNumber: 14, name: "Waves", file: "waves.xml", hasData: true },
    ],
    Chemistry: [
      { chapterNumber: 1, name: "Some Basic Concepts of Chemistry", file: "some_basic_concepts_of_chemistry.xml", hasData: true },
      { chapterNumber: 2, name: "Structure of Atom", file: "structure_of_atom.xml", hasData: true },
      { chapterNumber: 3, name: "Classification of Elements and Periodicity in Properties", file: "classification_of_elements.xml", hasData: true },
      { chapterNumber: 4, name: "Chemical Bonding and Molecular Structure", file: "chemical_bonding.xml", hasData: true },
      { chapterNumber: 5, name: "States of Matter", file: "states_of_matter.xml", hasData: true },
      { chapterNumber: 6, name: "Thermodynamics", file: "chemical_thermodynamics.xml", hasData: true },
      { chapterNumber: 7, name: "Equilibrium", file: "equilibrium.xml", hasData: true },
      { chapterNumber: 8, name: "Redox Reactions", file: "redox_reactions.xml", hasData: true },
      { chapterNumber: 9, name: "Hydrogen", file: "hydrogen.xml", hasData: true },
      { chapterNumber: 10, name: "The s-Block Elements", file: "s_block_elements.xml", hasData: true },
      { chapterNumber: 11, name: "The p-Block Elements (Class 11)", file: "p_block_elements_11.xml", hasData: true },
      { chapterNumber: 12, name: "Organic Chemistry - Some Basic Principles and Techniques", file: "some_basic_principles_of_organic_chemistry.xml", hasData: true },
      { chapterNumber: 13, name: "Hydrocarbons", file: "hydrocarbons.xml", hasData: true },
      { chapterNumber: 14, name: "Environmental Chemistry", file: "environmental_chemistry.xml", hasData: true },
    ],
    Mathematics: [
      { chapterNumber: 1, name: "Sets", file: "sets.xml", hasData: true },
      { chapterNumber: 2, name: "Relations and Functions", file: "relations_and_functions.xml", hasData: true },
      { chapterNumber: 3, name: "Trigonometric Functions", file: "trigonometric_functions.xml", hasData: true },
      { chapterNumber: 4, name: "Principle of Mathematical Induction", file: "principle_of_mathematical_induction.xml", hasData: true },
      { chapterNumber: 5, name: "Complex Numbers and Quadratic Equations", file: "complex_numbers_and_quadratic_equations.xml", hasData: true },
      { chapterNumber: 6, name: "Linear Inequalities", file: "linear_inequalities.xml", hasData: true },
      { chapterNumber: 7, name: "Permutations and Combinations", file: "permutations_and_combinations.xml", hasData: true },
      { chapterNumber: 8, name: "Binomial Theorem", file: "binomial_theorem.xml", hasData: true },
      { chapterNumber: 9, name: "Sequences and Series", file: "sequences_and_series.xml", hasData: true },
      { chapterNumber: 10, name: "Straight Lines", file: "straight_lines.xml", hasData: true },
      { chapterNumber: 11, name: "Conic Sections", file: "conic_sections.xml", hasData: true },
      { chapterNumber: 12, name: "Introduction to Three Dimensional Geometry", file: "introduction_to_3d_geometry.xml", hasData: true },
      { chapterNumber: 13, name: "Limits and Derivatives", file: "limits_and_derivatives.xml", hasData: true },
      { chapterNumber: 14, name: "Mathematical Reasoning", file: "mathematical_reasoning.xml", hasData: true },
      { chapterNumber: 15, name: "Statistics", file: "statistics.xml", hasData: true },
      { chapterNumber: 16, name: "Probability", file: "probability.xml", hasData: true },
    ],
    Biology: [
      { chapterNumber: 1, name: "The Living World", file: "the_living_world.xml", hasData: true },
      { chapterNumber: 2, name: "Biological Classification", file: "biological_classification.xml", hasData: true },
      { chapterNumber: 3, name: "Plant Kingdom", file: "plant_kingdom.xml", hasData: true },
      { chapterNumber: 4, name: "Animal Kingdom", file: "animal_kingdom.xml", hasData: true },
      { chapterNumber: 5, name: "Morphology of Flowering Plants", file: "morphology_of_flowering_plants.xml", hasData: true },
      { chapterNumber: 6, name: "Anatomy of Flowering Plants", file: "anatomy_of_flowering_plants.xml", hasData: true },
      { chapterNumber: 7, name: "Structural Organisation in Animals", file: "structural_organisation_in_animals.xml", hasData: true },
      { chapterNumber: 8, name: "Cell: The Unit of Life", file: "cell_the_unit_of_life.xml", hasData: true },
      { chapterNumber: 9, name: "Biomolecules", file: "biomolecules.xml", hasData: true },
      { chapterNumber: 10, name: "Cell Cycle and Cell Division", file: "cell_cycle_and_cell_division.xml", hasData: true },
      { chapterNumber: 11, name: "Transport in Plants", file: "transport_in_plants.xml", hasData: true },
      { chapterNumber: 12, name: "Mineral Nutrition", file: "mineral_nutrition.xml", hasData: true },
      { chapterNumber: 13, name: "Photosynthesis in Higher Plants", file: "photosynthesis_in_higher_plants.xml", hasData: true },
      { chapterNumber: 14, name: "Respiration in Plants", file: "respiration_in_plants.xml", hasData: true },
      { chapterNumber: 15, name: "Plant Growth and Development", file: "plant_growth_and_development.xml", hasData: true },
      { chapterNumber: 16, name: "Digestion and Absorption", file: "digestion_and_absorption.xml", hasData: true },
      { chapterNumber: 17, name: "Breathing and Exchange of Gases", file: "breathing_and_exchange_of_gases.xml", hasData: true },
      { chapterNumber: 18, name: "Body Fluids and Circulation", file: "body_fluids_and_circulation.xml", hasData: true },
      { chapterNumber: 19, name: "Excretory Products and their Elimination", file: "excretory_products_and_their_elimination.xml", hasData: true },
      { chapterNumber: 20, name: "Locomotion and Movement", file: "locomotion_and_movement.xml", hasData: true },
      { chapterNumber: 21, name: "Neural Control and Coordination", file: "neural_control_and_coordination.xml", hasData: true },
      { chapterNumber: 22, name: "Chemical Coordination and Integration", file: "chemical_coordination_and_integration.xml", hasData: true },
    ]
  },
  Class12: {
    Physics: [
      { chapterNumber: 1, name: "Electric Charges and Fields", file: "electric_charges_and_fields.xml", hasData: true },
      { chapterNumber: 2, name: "Electrostatic Potential and Capacitance", file: "electrostatic_potential_and_capacitance.xml", hasData: true },
      { chapterNumber: 3, name: "Current Electricity", file: "current_electricity.xml", hasData: true },
      { chapterNumber: 4, name: "Moving Charges and Magnetism", file: "moving_charges_and_magnetism.xml", hasData: true },
      { chapterNumber: 5, name: "Magnetism and Matter", file: "magnetism_and_matter.xml", hasData: true },
      { chapterNumber: 6, name: "Electromagnetic Induction", file: "electromagnetic_induction.xml", hasData: true },
      { chapterNumber: 7, name: "Alternating Current", file: "alternating_current.xml", hasData: true },
      { chapterNumber: 8, name: "Electromagnetic Waves", file: "electromagnetic_waves.xml", hasData: true },
      { chapterNumber: 9, name: "Ray Optics and Optical Instruments", file: "ray_optics_and_optical_instruments.xml", hasData: true },
      { chapterNumber: 10, name: "Wave Optics", file: "wave_optics.xml", hasData: true },
      { chapterNumber: 11, name: "Dual Nature of Radiation and Matter", file: "dual_nature_of_radiation.xml", hasData: true },
      { chapterNumber: 12, name: "Atoms", file: "atoms.xml", hasData: true },
      { chapterNumber: 13, name: "Nuclei", file: "nuclei.xml", hasData: true },
      { chapterNumber: 14, name: "Semiconductor Electronics", file: "semiconductor_electronics.xml", hasData: true },
    ],
    Chemistry: [
      { chapterNumber: 1, name: "The Solid State", file: "the_solid_state.xml", hasData: true },
      { chapterNumber: 2, name: "Solutions", file: "solutions.xml", hasData: true },
      { chapterNumber: 3, name: "Electrochemistry", file: "electrochemistry.xml", hasData: true },
      { chapterNumber: 4, name: "Chemical Kinetics", file: "chemical_kinetics.xml", hasData: true },
      { chapterNumber: 5, name: "Surface Chemistry", file: "surface_chemistry.xml", hasData: true },
      { chapterNumber: 6, name: "General Principles and Processes of Isolation of Elements", file: "isolation_of_elements.xml", hasData: true },
      { chapterNumber: 7, name: "The p-Block Elements (Class 12)", file: "p_block_elements_12.xml", hasData: true },
      { chapterNumber: 8, name: "The d- and f-Block Elements", file: "d_and_f_block_elements.xml", hasData: true },
      { chapterNumber: 9, name: "Coordination Compounds", file: "coordination_compounds.xml", hasData: true },
      { chapterNumber: 10, name: "Haloalkanes and Haloarenes", file: "haloalkanes_and_haloarenes.xml", hasData: true },
      { chapterNumber: 11, name: "Alcohols, Phenols and Ethers", file: "alcohols_phenols_and_ethers.xml", hasData: true },
      { chapterNumber: 12, name: "Aldehydes, Ketones and Carboxylic Acids", file: "aldehydes_ketones_and_carboxylic_acids.xml", hasData: true },
      { chapterNumber: 13, name: "Amines", file: "amines.xml", hasData: true },
      { chapterNumber: 14, name: "Biomolecules (Chemistry)", file: "biomolecules_chemistry.xml", hasData: true },
      { chapterNumber: 15, name: "Polymers", file: "polymers.xml", hasData: true },
      { chapterNumber: 16, name: "Chemistry in Everyday Life", file: "chemistry_everyday_life.xml", hasData: true },
    ],
    Mathematics: [
      { chapterNumber: 1, name: "Relations and Functions", file: "relations_and_functions_12.xml", hasData: true },
      { chapterNumber: 2, name: "Inverse Trigonometric Functions", file: "inverse_trigonometric_functions.xml", hasData: true },
      { chapterNumber: 3, name: "Matrices", file: "matrices.xml", hasData: true },
      { chapterNumber: 4, name: "Determinants", file: "determinants.xml", hasData: true },
      { chapterNumber: 5, name: "Continuity and Differentiability", file: "continuity_and_differentiability.xml", hasData: true },
      { chapterNumber: 6, name: "Application of Derivatives", file: "application_of_derivatives.xml", hasData: true },
      { chapterNumber: 7, name: "Integrals", file: "integrals.xml", hasData: true },
      { chapterNumber: 8, name: "Application of Integrals", file: "application_of_integrals.xml", hasData: true },
      { chapterNumber: 9, name: "Differential Equations", file: "differential_equations.xml", hasData: true },
      { chapterNumber: 10, name: "Vector Algebra", file: "vector_algebra.xml", hasData: true },
      { chapterNumber: 11, name: "Three Dimensional Geometry", file: "three_dimensional_geometry_12.xml", hasData: true },
      { chapterNumber: 12, name: "Linear Programming", file: "linear_programming.xml", hasData: true },
      { chapterNumber: 13, name: "Probability", file: "probability_12.xml", hasData: true },
    ],
    Biology: [
      { chapterNumber: 1, name: "Reproduction in Organisms", file: "reproduction_in_organisms.xml", hasData: true },
      { chapterNumber: 2, name: "Sexual Reproduction in Flowering Plants", file: "sexual_reproduction_in_flowering_plants.xml", hasData: true },
      { chapterNumber: 3, name: "Human Reproduction", file: "human_reproduction.xml", hasData: true },
      { chapterNumber: 4, name: "Reproductive Health", file: "reproductive_health.xml", hasData: true },
      { chapterNumber: 5, name: "Principles of Inheritance and Variation", file: "principles_of_inheritance.xml", hasData: true },
      { chapterNumber: 6, name: "Molecular Basis of Inheritance", file: "molecular_basis_of_inheritance.xml", hasData: true },
      { chapterNumber: 7, name: "Evolution", file: "evolution.xml", hasData: true },
      { chapterNumber: 8, name: "Human Health and Disease", file: "human_health_and_disease.xml", hasData: true },
      { chapterNumber: 9, name: "Strategies for Enhancement in Food Production", file: "strategies_for_food_production.xml", hasData: true },
      { chapterNumber: 10, name: "Microbes in Human Welfare", file: "microbes_in_human_welfare.xml", hasData: true },
      { chapterNumber: 11, name: "Biotechnology: Principles and Processes", file: "biotechnology_principles.xml", hasData: true },
      { chapterNumber: 12, name: "Biotechnology and its Applications", file: "biotechnology_applications.xml", hasData: true },
      { chapterNumber: 13, name: "Organisms and Populations", file: "organisms_and_populations.xml", hasData: true },
      { chapterNumber: 14, name: "Ecosystem", file: "ecosystem.xml", hasData: true },
      { chapterNumber: 15, name: "Biodiversity and Conservation", file: "biodiversity_and_conservation.xml", hasData: true },
      { chapterNumber: 16, name: "Environmental Issues", file: "environmental_issues_12.xml", hasData: true },
    ]
  }
};
