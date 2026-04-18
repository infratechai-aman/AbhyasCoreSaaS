import os

RAW_DIR = "raw_questions"

# Populate JEE Main 2018
jee_2018_content = '''<?xml version="1.0" encoding="UTF-8"?>
<chapter>
  <medium>
    <question>
      <text>Let $\vec{u}$ be a vector coplanar with the vectors $\vec{a} = 2\hat{i} + 3\hat{j} - \hat{k}$ and $\vec{b} = \hat{j} + \hat{k}$. If $\vec{u}$ is perpendicular to $\vec{a}$ and $\vec{u} \cdot \vec{b} = 24$, then $|\vec{u}|^2$ is equal to:</text>
      <options>
        <option>256</option>
        <option>84</option>
        <option>336</option>
        <option>315</option>
      </options>
      <correctAnswer>336</correctAnswer>
    </question>
    <question>
      <text>Let $S = \{ t \in R : f(x) = |x - \pi|(e^{|x|} - 1)\sin|x| \text{ is not differentiable at } t \}$. Then the set $S$ is equal to:</text>
      <options>
        <option>$\phi$ (an empty set)</option>
        <option>$\{0\}$</option>
        <option>$\{\pi\}$</option>
        <option>$\{0, \pi\}$</option>
      </options>
      <correctAnswer>$\phi$ (an empty set)</correctAnswer>
    </question>
    <question>
      <text>A solid sphere of radius R and mass M is pulled by a force F acting at the top of the sphere. The friction is sufficient to prevent slipping. What is the acceleration of the center of mass?</text>
      <options>
        <option>$F/M$</option>
        <option>$7F/5M$</option>
        <option>$10F/7M$</option>
        <option>$5F/2M$</option>
      </options>
      <correctAnswer>$10F/7M$</correctAnswer>
    </question>
    <question>
      <text>The de Broglie wavelength of an electron in the nth Bohr orbit is related to the radius R of the orbit as:</text>
      <options>
        <option>$n\lambda = \pi R$</option>
        <option>$n\lambda = 2\pi R$</option>
        <option>$\lambda = 2\pi R/n^2$</option>
        <option>$n\lambda = 4\pi R$</option>
      </options>
      <correctAnswer>$n\lambda = 2\pi R$</correctAnswer>
    </question>
    <question>
      <text>The major product formed in the following reaction is: $CH_3CH=CH_2 + ICl \rightarrow $</text>
      <options>
        <option>$CH_3CH(I)CH_2Cl$</option>
        <option>$CH_3CH(Cl)CH_2I$</option>
        <option>$CH_3CH(I)CH_2I$</option>
        <option>$CH_3CH(Cl)CH_2Cl$</option>
      </options>
      <correctAnswer>$CH_3CH(Cl)CH_2I$</correctAnswer>
    </question>
    <question>
      <text>An aqueous solution contains an unknown concentration of $Ba^{2+}$. When 50 mL of a 1 M solution of $Na_2SO_4$ is added, $BaSO_4$ just begins to precipitate. The final volume is 500 mL. The solubility product of $BaSO_4$ is $1 \times 10^{-10}$. What is the original concentration of $Ba^{2+}$?</text>
      <options>
        <option>$2 \times 10^{-9}$ M</option>
        <option>$1.1 \times 10^{-9}$ M</option>
        <option>$1.0 \times 10^{-10}$ M</option>
        <option>$5 \times 10^{-9}$ M</option>
      </options>
      <correctAnswer>$1.1 \times 10^{-9}$ M</correctAnswer>
    </question>
  </medium>
  <hard>
    <question>
      <text>Let the orthocenter and centroid of a triangle be A(-3, 5) and B(3, 3) respectively. If C is the circumcenter of this triangle, then the radius of the circle having line segment AC as diameter, is:</text>
      <options>
        <option>$\frac{3\sqrt{5}}{2}$</option>
        <option>$\sqrt{10}$</option>
        <option>$2\sqrt{10}$</option>
        <option>$3\sqrt{\frac{5}{2}}$</option>
      </options>
      <correctAnswer>$3\sqrt{\frac{5}{2}}$</correctAnswer>
    </question>
    <question>
      <text>An oscillator circuit consists of an inductance of 0.5mH and a capacitor of 20$\mu F$. The resonant frequency of the circuit is nearly:</text>
      <options>
        <option>1.59 kHz</option>
        <option>15.9 kHz</option>
        <option>159 kHz</option>
        <option>1.59 MHz</option>
      </options>
      <correctAnswer>1.59 kHz</correctAnswer>
    </question>
  </hard>
</chapter>
'''

with open(os.path.join(RAW_DIR, "jee_main_2018.xml"), "w", encoding="utf-8") as f:
    f.write(jee_2018_content)

# Populate NEET 2018
neet_2018_content = '''<?xml version="1.0" encoding="UTF-8"?>
<chapter>
  <easy>
    <question>
      <text>Select the incorrect match :</text>
      <options>
        <option>Lampbrush chromosomes - Diplotene bivalents</option>
        <option>Allosomes - Sex chromosomes</option>
        <option>Submetacentric chromosomes - L-shaped</option>
        <option>Polytene chromosomes - Oocytes of amphibians</option>
      </options>
      <correctAnswer>Polytene chromosomes - Oocytes of amphibians</correctAnswer>
    </question>
    <question>
      <text>Which of the following is true for nucleolus?</text>
      <options>
        <option>Larger nucleoli are present in dividing cells.</option>
        <option>It is a membrane-bound structure.</option>
        <option>It takes part in spindle formation.</option>
        <option>It is a site for active ribosomal RNA synthesis.</option>
      </options>
      <correctAnswer>It is a site for active ribosomal RNA synthesis.</correctAnswer>
    </question>
    <question>
      <text>The Golgi complex participates in :</text>
      <options>
        <option>Fatty acid breakdown</option>
        <option>Formation of secretory vesicles</option>
        <option>Respiration in bacteria</option>
        <option>Activation of amino acid</option>
      </options>
      <correctAnswer>Formation of secretory vesicles</correctAnswer>
    </question>
    <question>
      <text>At what temperature will the rms speed of oxygen molecules become just sufficient for escaping from the Earth's atmosphere? (Given: Mass of oxygen molecule $(m) = 2.76 \times 10^{-26} \text{ kg}$, Boltzmann's constant $k_B = 1.38 \times 10^{-23} \text{ J K}^{-1}$)</text>
      <options>
        <option>$2.508 \times 10^4 \text{ K}$</option>
        <option>$8.360 \times 10^4 \text{ K}$</option>
        <option>$5.016 \times 10^4 \text{ K}$</option>
        <option>$1.254 \times 10^4 \text{ K}$</option>
      </options>
      <correctAnswer>$8.360 \times 10^4 \text{ K}$</correctAnswer>
    </question>
  </easy>
  <medium>
    <question>
      <text>Iron carbonyl, $Fe(CO)_5$ is :</text>
      <options>
        <option>Tetranuclear</option>
        <option>Mononuclear</option>
        <option>Trinuclear</option>
        <option>Dinuclear</option>
      </options>
      <correctAnswer>Mononuclear</correctAnswer>
    </question>
    <question>
      <text>Following solutions were prepared by mixing different volumes of NaOH and HCl of different concentrations: a: 60 mL M/10 HCl + 40 mL M/10 NaOH b: 55 mL M/10 HCl + 45 mL M/10 NaOH c: 75 mL M/5 HCl + 25 mL M/5 NaOH d: 100 mL M/10 HCl + 100 mL M/10 NaOH pH of which one of them will be equal to 1 ?</text>
      <options>
        <option>b</option>
        <option>a</option>
        <option>d</option>
        <option>c</option>
      </options>
      <correctAnswer>c</correctAnswer>
    </question>
  </medium>
</chapter>
'''

with open(os.path.join(RAW_DIR, "neet_2018.xml"), "w", encoding="utf-8") as f:
    f.write(neet_2018_content)

print("Successfully injected genuine 2018 questions into jee_main_2018.xml and neet_2018.xml!")
