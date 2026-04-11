$path = "c:\Users\Aman Talukdar\Desktop\AbhyasCore_2.0\src\data\raw_questions"
$physics = @("units_and_measurements.xml", "kinematics.xml", "laws_of_motion.xml", "work_energy_power.xml", "system_of_particles.xml", "gravitation.xml", "mechanical_properties_of_solids.xml", "mechanical_properties_of_fluids.xml", "thermal_properties_of_matter.xml", "thermodynamics.xml", "kinetic_theory.xml", "oscillations.xml", "waves.xml")
$chemistry = @("some_basic_concepts_of_chemistry.xml", "structure_of_atom.xml", "classification_of_elements.xml", "chemical_bonding.xml", "states_of_matter.xml", "chemical_thermodynamics.xml", "equilibrium.xml", "redox_reactions.xml", "hydrogen.xml", "s_block_elements.xml", "p_block_elements.xml", "organic_chemistry_basic_principles.xml", "hydrocarbons.xml", "environmental_chemistry.xml")

Write-Host "Checking Physics..."
foreach ($f in $physics) {
    try {
        $fullPath = Join-Path $path $f
        if (-not (Test-Path $fullPath)) {
            Write-Host "MISSING: $f" -ForegroundColor Red
            continue
        }
        [xml]$xml = Get-Content $fullPath -Raw
        $e = ($xml.chapter.easy.question).Count
        $m = ($xml.chapter.medium.question).Count
        $h = ($xml.chapter.hard.question).Count
        
        # Handle case where single item is not a collection
        if ($null -eq $e) { if ($xml.chapter.easy.question) { $e=1 } else { $e=0 } }
        if ($null -eq $m) { if ($xml.chapter.medium.question) { $m=1 } else { $m=0 } }
        if ($null -eq $h) { if ($xml.chapter.hard.question) { $h=1 } else { $h=0 } }

        if ($e -ne 40 -or $m -ne 40 -or $h -ne 40) {
             Write-Host "$f : E=$e M=$m H=$h" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "ERROR reading $f : $_" -ForegroundColor Red
    }
}

Write-Host "Checking Chemistry..."
foreach ($f in $chemistry) {
    try {
        $fullPath = Join-Path $path $f
         if (-not (Test-Path $fullPath)) {
            Write-Host "MISSING: $f" -ForegroundColor Red
            continue
        }
        [xml]$xml = Get-Content $fullPath -Raw
        $e = ($xml.chapter.easy.question).Count
        $m = ($xml.chapter.medium.question).Count
        $h = ($xml.chapter.hard.question).Count

        # Handle case where single item is not a collection
        if ($null -eq $e) { if ($xml.chapter.easy.question) { $e=1 } else { $e=0 } }
        if ($null -eq $m) { if ($xml.chapter.medium.question) { $m=1 } else { $m=0 } }
        if ($null -eq $h) { if ($xml.chapter.hard.question) { $h=1 } else { $h=0 } }

        if ($e -ne 40 -or $m -ne 40 -or $h -ne 40) {
             Write-Host "$f : E=$e M=$m H=$h" -ForegroundColor Yellow
        }
    } catch {
       Write-Host "ERROR reading $f : $_" -ForegroundColor Red
    }
}
