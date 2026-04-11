import xml.etree.ElementTree as ET
import os

files = [
    "animal_kingdom.xml",
    "structural_organisation_in_animals.xml",
    "biomolecules.xml",
    "breathing_and_exchange_of_gases.xml",
    "body_fluids_and_circulation.xml",
    "excretory_products_and_their_elimination.xml",
    "locomotion_and_movement.xml",
    "neural_control_and_coordination.xml",
    "chemical_coordination_and_integration.xml"
]

for f in files:
    if os.path.exists(f):
        try:
            tree = ET.parse(f)
            root = tree.getroot()
            questions = root.findall(".//question")
            print(f"{f}: Valid XML, {len(questions)} questions")
        except Exception as e:
            print(f"{f}: ERROR {e}")
    else:
        print(f"{f}: NOT FOUND")
