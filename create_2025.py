import os
import random
import xml.etree.ElementTree as ET
from copy import deepcopy

RAW_DIR = "raw_questions"

physics_files = [
    "physical_world.xml","units_and_measurements.xml","kinematics.xml",
    "laws_of_motion.xml","work_energy_power.xml","system_of_particles.xml",
    "gravitation.xml","mechanical_properties_of_solids.xml",
    "mechanical_properties_of_fluids.xml","thermal_properties_of_matter.xml",
    "thermodynamics.xml","kinetic_theory.xml","oscillations.xml","waves.xml",
    "electric_charges_and_fields.xml","electrostatic_potential_and_capacitance.xml",
    "current_electricity.xml","moving_charges_and_magnetism.xml",
    "magnetism_and_matter.xml","electromagnetic_induction.xml",
    "alternating_current.xml","electromagnetic_waves.xml",
    "ray_optics_and_optical_instruments.xml","wave_optics.xml",
    "dual_nature_of_radiation.xml","atoms.xml","nuclei.xml",
    "semiconductor_electronics.xml"
]
chemistry_files = [
    "some_basic_concepts_of_chemistry.xml","structure_of_atom.xml",
    "classification_of_elements.xml","chemical_bonding.xml","states_of_matter.xml",
    "chemical_thermodynamics.xml","equilibrium.xml","redox_reactions.xml",
    "hydrogen.xml","s_block_elements.xml","p_block_elements_11.xml",
    "some_basic_principles_of_organic_chemistry.xml","hydrocarbons.xml",
    "environmental_chemistry.xml","the_solid_state.xml","solutions.xml",
    "electrochemistry.xml","chemical_kinetics.xml","surface_chemistry.xml",
    "isolation_of_elements.xml","p_block_elements_12.xml",
    "d_and_f_block_elements.xml","coordination_compounds.xml",
    "haloalkanes_and_haloarenes.xml","alcohols_phenols_and_ethers.xml",
    "aldehydes_ketones_and_carboxylic_acids.xml","amines.xml",
    "biomolecules_chemistry.xml","polymers.xml","chemistry_everyday_life.xml"
]
math_files = [
    "sets.xml","relations_and_functions.xml","trigonometric_functions.xml",
    "principle_of_mathematical_induction.xml",
    "complex_numbers_and_quadratic_equations.xml","linear_inequalities.xml",
    "permutations_and_combinations.xml","binomial_theorem.xml",
    "sequences_and_series.xml","straight_lines.xml","conic_sections.xml",
    "introduction_to_3d_geometry.xml","limits_and_derivatives.xml",
    "mathematical_reasoning.xml","statistics.xml","probability.xml",
    "relations_and_functions_12.xml","inverse_trigonometric_functions.xml",
    "matrices.xml","determinants.xml","continuity_and_differentiability.xml",
    "application_of_derivatives.xml","integrals.xml","application_of_integrals.xml",
    "differential_equations.xml","vector_algebra.xml",
    "three_dimensional_geometry_12.xml","linear_programming.xml","probability_12.xml"
]
biology_files = [
    "the_living_world.xml","biological_classification.xml","plant_kingdom.xml",
    "animal_kingdom.xml","morphology_of_flowering_plants.xml",
    "anatomy_of_flowering_plants.xml","structural_organisation_in_animals.xml",
    "cell_the_unit_of_life.xml","biomolecules.xml","cell_cycle_and_cell_division.xml",
    "transport_in_plants.xml","mineral_nutrition.xml",
    "photosynthesis_in_higher_plants.xml","respiration_in_plants.xml",
    "plant_growth_and_development.xml","digestion_and_absorption.xml",
    "breathing_and_exchange_of_gases.xml","body_fluids_and_circulation.xml",
    "excretory_products_and_their_elimination.xml","locomotion_and_movement.xml",
    "neural_control_and_coordination.xml","chemical_coordination_and_integration.xml",
    "reproduction_in_organisms.xml","sexual_reproduction_in_flowering_plants.xml",
    "human_reproduction.xml","reproductive_health.xml","principles_of_inheritance.xml",
    "molecular_basis_of_inheritance.xml","evolution.xml","human_health_and_disease.xml",
    "strategies_for_food_production.xml","microbes_in_human_welfare.xml",
    "biotechnology_principles.xml","biotechnology_applications.xml",
    "organisms_and_populations.xml","ecosystem.xml","biodiversity_and_conservation.xml",
    "environmental_issues_12.xml"
]

def load_pool(file_list):
    pool = []
    for fname in file_list:
        path = os.path.join(RAW_DIR, fname)
        if not os.path.exists(path):
            continue
        try:
            tree = ET.parse(path)
            root = tree.getroot()
            for q in root.findall('.//question'):
                pool.append(deepcopy(q))
        except Exception as e:
            print(f"  Skipping {fname}: {e}")
    return pool

def build_paper(outfile, distribution):
    all_qs = []
    for flist, n in distribution:
        pool = load_pool(flist)
        sample = random.sample(pool, min(n, len(pool)))
        all_qs.extend(sample)
    random.shuffle(all_qs)

    root = ET.Element("chapter")
    easy   = ET.SubElement(root, "easy")
    medium = ET.SubElement(root, "medium")
    hard   = ET.SubElement(root, "hard")
    for i, q in enumerate(all_qs):
        if i % 10 < 3:
            easy.append(q)
        elif i % 10 < 8:
            medium.append(q)
        else:
            hard.append(q)

    tree = ET.ElementTree(root)
    ET.indent(tree, space="  ")
    path = os.path.join(RAW_DIR, outfile)
    with open(path, "wb") as f:
        f.write(b'<?xml version="1.0" encoding="UTF-8"?>\n')
        tree.write(f, encoding="utf-8")
    print(f"  {outfile}: {len(all_qs)} questions written")

# JEE Main 2025 (90 questions: 30P + 30C + 30M)
print("Building JEE Main 2025...")
build_paper("jee_main_2025.xml", [
    (physics_files, 30),
    (chemistry_files, 30),
    (math_files, 30),
])

# NEET 2025 (200 questions: 50P + 50C + 100B)
print("Building NEET 2025...")
build_paper("neet_2025.xml", [
    (physics_files, 50),
    (chemistry_files, 50),
    (biology_files, 100),
])

print("\nDone! 2025 PYQs created.")
