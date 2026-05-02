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

all_valid = True
for f in files:
    if os.path.exists(f):
        try:
            tree = ET.parse(f)
            root = tree.getroot()
            questions = root.findall(".//question")
            print(f"[OK] {f}: {len(questions)} questions")
        except Exception as e:
            print(f"[ERROR] {f}: {e}")
            all_valid = False
    else:
        print(f"[MISSING] {f}")
        all_valid = False

if all_valid:
    print("\nALL ZOOLOGY FILES VALID.")
else:
    print("\nSOME FILES HAVE ERRORS.")
