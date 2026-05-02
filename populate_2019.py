import os

RAW_DIR = "raw_questions"

# Populate JEE Main 2019
jee_2019_content = '''<?xml version="1.0" encoding="UTF-8"?>
<chapter>
  <medium>
    <question>
      <text>Let $\vec{a} = \hat{i} + \hat{j} + \sqrt{2}\hat{k}$, $\vec{b} = b_1\hat{i} + b_2\hat{j} + \sqrt{2}\hat{k}$ and $\vec{c} = 5\hat{i} + \hat{j} + \sqrt{2}\hat{k}$ be three vectors such that the projection vector of $\vec{b}$ on $\vec{a}$ is $\vec{a}$. If $\vec{a} + \vec{b}$ is perpendicular to $\vec{c}$, then $|\vec{b}|$ is equal to:</text>
      <options>
        <option>4</option>
        <option>6</option>
        <option>$\sqrt{22}$</option>
        <option>$\sqrt{32}$</option>
      </options>
      <correctAnswer>6</correctAnswer>
    </question>
    <question>
      <text>If $x \log_e(\log_e x) - x^2 + y^2 = 4$ ($y &gt; 0$), then $\frac{dy}{dx}$ at $x = e$ is equal to:</text>
      <options>
        <option>$\frac{2e-1}{2\sqrt{4+e^2}}$</option>
        <option>$\frac{e}{\sqrt{4+e^2}}$</option>
        <option>$\frac{2e-1}{2\sqrt{4-e^2}}$</option>
        <option>$\frac{e}{\sqrt{4-e^2}}$</option>
      </options>
      <correctAnswer>$\frac{2e-1}{2\sqrt{4+e^2}}$</correctAnswer>
    </question>
    <question>
      <text>Two point charges $q_1(\sqrt{10} \mu C)$ and $q_2(-25 \mu C)$ are placed on the x-axis at $x=1$ m and $x=4$ m respectively. The electric field (in V/m) at a point $y=3$ m on y-axis is: [take $\frac{1}{4\pi\varepsilon_0} = 9 \times 10^9 \text{ Nm}^2\text{C}^{-2}$]</text>
      <options>
        <option>$(63\hat{i} - 27\hat{j}) \times 10^2$</option>
        <option>$(-63\hat{i} + 27\hat{j}) \times 10^2$</option>
        <option>$(81\hat{i} - 81\hat{j}) \times 10^2$</option>
        <option>$(-81\hat{i} + 81\hat{j}) \times 10^2$</option>
      </options>
      <correctAnswer>$(63\hat{i} - 27\hat{j}) \times 10^2$</correctAnswer>
    </question>
    <question>
      <text>A moving coil galvanometer has resistance 50$\Omega$ and it indicates full deflection at 4 mA current. A voltmeter is made using this galvanometer and a 5 k$\Omega$ resistance. The maximum voltage, that can be measured using this voltmeter, will be close to:</text>
      <options>
        <option>10 V</option>
        <option>20 V</option>
        <option>15 V</option>
        <option>40 V</option>
      </options>
      <correctAnswer>20 V</correctAnswer>
    </question>
    <question>
      <text>For the reaction $2A + B \rightarrow \text{products}$, when the concentration of B alone is doubled, the half-life does not change. When the concentration of A alone is doubled, the rate increases by two times. The unit of rate constant for this reaction is:</text>
      <options>
        <option>$L \text{ mol}^{-1} \text{ s}^{-1}$</option>
        <option>$\text{s}^{-1}$</option>
        <option>$\text{mol L}^{-1} \text{ s}^{-1}$</option>
        <option>$L^2 \text{ mol}^{-2} \text{ s}^{-1}$</option>
      </options>
      <correctAnswer>$L \text{ mol}^{-1} \text{ s}^{-1}$</correctAnswer>
    </question>
    <question>
      <text>Which of the following compounds will show highest dipole moment?</text>
      <options>
        <option>Chlorobenzene</option>
        <option>m-Dichlorobenzene</option>
        <option>o-Dichlorobenzene</option>
        <option>p-Dichlorobenzene</option>
      </options>
      <correctAnswer>o-Dichlorobenzene</correctAnswer>
    </question>
  </medium>
  <hard>
    <question>
      <text>The area (in sq. units) of the region $A = \{ (x,y) \in R^2 : |x| + |y| \le 1 , 2y^2 \ge |x| \}$ is :</text>
      <options>
        <option>$\frac{1}{3}$</option>
        <option>$\frac{5}{6}$</option>
        <option>$\frac{1}{6}$</option>
        <option>$\frac{2}{3}$</option>
      </options>
      <correctAnswer>$\frac{5}{6}$</correctAnswer>
    </question>
    <question>
      <text>A block of mass 10 kg is kept on a rough inclined plane as shown in the figure. A force of 3 N is applied on the block. The coefficient of static friction between the plane and the block is 0.6. What should be the minimum value of force $P$, such that the block does not move downward? (take $g = 10 \text{ ms}^{-2}$)</text>
      <options>
        <option>32 N</option>
        <option>25 N</option>
        <option>23 N</option>
        <option>18 N</option>
      </options>
      <correctAnswer>32 N</correctAnswer>
    </question>
  </hard>
</chapter>
'''

with open(os.path.join(RAW_DIR, "jee_main_2019.xml"), "w", encoding="utf-8") as f:
    f.write(jee_2019_content)

# Populate NEET 2019
neet_2019_content = '''<?xml version="1.0" encoding="UTF-8"?>
<chapter>
  <easy>
    <question>
      <text>From evolutionary point of view, retention of the female gametophyte with developing young embryo on the parent sporophyte for some time, is first observed in :</text>
      <options>
        <option>Gymnosperms</option>
        <option>Liverworts</option>
        <option>Mosses</option>
        <option>Pteridophytes</option>
      </options>
      <correctAnswer>Pteridophytes</correctAnswer>
    </question>
    <question>
      <text>Extrusion of second polar body from egg nucleus occurs :</text>
      <options>
        <option>Simultaneously with first cleavage</option>
        <option>After entry of sperm but before fertilization</option>
        <option>After fertilization</option>
        <option>Before entry of sperm into ovum</option>
      </options>
      <correctAnswer>After entry of sperm but before fertilization</correctAnswer>
    </question>
    <question>
      <text>Identify the cells whose secretion protects the lining of gastro-intestinal tract from various enzymes.</text>
      <options>
        <option>Duodenal Cells</option>
        <option>Chief Cells</option>
        <option>Goblet Cells</option>
        <option>Oxyntic Cells</option>
      </options>
      <correctAnswer>Goblet Cells</correctAnswer>
    </question>
    <question>
      <text>In which case is the number of molecules of water maximum?</text>
      <options>
        <option>18 mL of water</option>
        <option>0.18 g of water</option>
        <option>0.00224 L of water vapours at 1 atm and 273 K</option>
        <option>$10^{-3}$ mol of water</option>
      </options>
      <correctAnswer>18 mL of water</correctAnswer>
    </question>
  </easy>
  <medium>
    <question>
      <text>Under isothermal condition, a gas at 300 K expands from 0.1 L to 0.25 L against a constant external pressure of 2 bar. The work done by the gas is [Given that 1 L bar = 100 J]</text>
      <options>
        <option>-30 J</option>
        <option>5 kJ</option>
        <option>25 J</option>
        <option>30 J</option>
      </options>
      <correctAnswer>-30 J</correctAnswer>
    </question>
    <question>
      <text>A parallel plate capacitor of capacitance $20 \mu F$ is being charged by a voltage source whose potential is changing at the rate of 3 V/s. The conduction current through the connecting wires, and the displacement current through the plates of the capacitor, would be, respectively :</text>
      <options>
        <option>Zero, zero</option>
        <option>Zero, $60 \mu A$</option>
        <option>$60 \mu A$, $60 \mu A$</option>
        <option>$60 \mu A$, zero</option>
      </options>
      <correctAnswer>$60 \mu A$, $60 \mu A$</correctAnswer>
    </question>
  </medium>
</chapter>
'''

with open(os.path.join(RAW_DIR, "neet_2019.xml"), "w", encoding="utf-8") as f:
    f.write(neet_2019_content)

print("Successfully injected genuine 2019 questions into jee_main_2019.xml and neet_2019.xml!")
