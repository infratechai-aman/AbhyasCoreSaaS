import os

RAW_DIR = "raw_questions"

# Populate JEE Main 2023
jee_2023_content = '''<?xml version="1.0" encoding="UTF-8"?>
<chapter>
  <medium>
    <question>
      <text>Let $\vec{a} = 2\hat{i} + 3\hat{j} + 4\hat{k}$, $\vec{b} = \hat{i} - 2\hat{j} - 2\hat{k}$ and $\vec{c} = -\hat{i} + 4\hat{j} + 3\hat{k}$. If $\vec{d}$ is a vector perpendicular to both $\vec{b}$ and $\vec{c}$, and $\vec{a}\cdot\vec{d} = 18$, then find $|\vec{a} \times \vec{d}|^2$.</text>
      <options>
        <option>720</option>
        <option>700</option>
        <option>680</option>
        <option>640</option>
      </options>
      <correctAnswer>720</correctAnswer>
    </question>
    <question>
      <text>Shortest distance between the lines $\frac{x-1}{2} = \frac{y+2}{3} = \frac{z-1}{4}$ and $\frac{x-2}{3} = \frac{y-4}{4} = \frac{z+1}{5}$ is:</text>
      <options>
        <option>$\frac{1}{\sqrt{6}}$</option>
        <option>$\frac{1}{\sqrt{3}}$</option>
        <option>$\frac{1}{\sqrt{2}}$</option>
        <option>$\frac{2}{\sqrt{3}}$</option>
      </options>
      <correctAnswer>$\frac{1}{\sqrt{6}}$</correctAnswer>
    </question>
    <question>
      <text>A block of mass 10 kg is placed on a rough inclined plane of inclination $30^\circ$. If the coefficient of friction is 0.5, the minimum force required to move the block up the plane is (Take $g = 10 \text{ m/s}^2$)</text>
      <options>
        <option>93.3 N</option>
        <option>100 N</option>
        <option>50 N</option>
        <option>43.3 N</option>
      </options>
      <correctAnswer>93.3 N</correctAnswer>
    </question>
    <question>
      <text>The magnetic field at the center of a circular coil of radius r and carrying current i is $B$. If the radius is doubled and current is halved, the new magnetic field will be :</text>
      <options>
        <option>$B</option>
        <option>$B/2$</option>
        <option>$B/4$</option>
        <option>$2B$</option>
      </options>
      <correctAnswer>$B/4$</correctAnswer>
    </question>
    <question>
      <text>For a first order reaction, the time required for 99% completion is how many times the time required for 90% completion?</text>
      <options>
        <option>2</option>
        <option>3</option>
        <option>4</option>
        <option>1.5</option>
      </options>
      <correctAnswer>2</correctAnswer>
    </question>
    <question>
      <text>Which of the following compounds is most basic in aqueous medium?</text>
      <options>
        <option>NH3</option>
        <option>CH3NH2</option>
        <option>(CH3)2NH</option>
        <option>(CH3)3N</option>
      </options>
      <correctAnswer>(CH3)2NH</correctAnswer>
    </question>
  </medium>
  <hard>
    <question>
      <text>Let $A$ be a $3\times3$ matrix such that $|A|=2$. If $B = 2A^{-1}$, then the value of $|adj(B)|$ is :</text>
      <options>
        <option>$16</option>
        <option>$64</option>
        <option>$256</option>
        <option>$1024</option>
      </options>
      <correctAnswer>$16$</correctAnswer>
    </question>
    <question>
      <text>An LCR series circuit has $R=100\Omega$, $X_C=200\Omega$ and $X_L=100\Omega$. The power factor of the circuit is :</text>
      <options>
        <option>1</option>
        <option>0.5</option>
        <option>0.707</option>
        <option>0</option>
      </options>
      <correctAnswer>0.707</correctAnswer>
    </question>
  </hard>
</chapter>
'''

with open(os.path.join(RAW_DIR, "jee_main_2023.xml"), "w", encoding="utf-8") as f:
    f.write(jee_2023_content)

# Populate NEET 2023
neet_2023_content = '''<?xml version="1.0" encoding="UTF-8"?>
<chapter>
  <easy>
    <question>
      <text>Upon stimulation of skeletal muscle, calcium is immediately made available for binding to troponin from :</text>
      <options>
        <option>Blood</option>
        <option>Lymph</option>
        <option>Sarcoplasmic reticulum</option>
        <option>Bone</option>
      </options>
      <correctAnswer>Sarcoplasmic reticulum</correctAnswer>
    </question>
    <question>
      <text>In tissue culture experiments, leaf mesophyll cells are put in a culture medium to form callus. This phenomenon may be called as :</text>
      <options>
        <option>Dedifferentiation</option>
        <option>Development</option>
        <option>Senescence</option>
        <option>Differentiation</option>
      </options>
      <correctAnswer>Dedifferentiation</correctAnswer>
    </question>
    <question>
      <text>Broad palm with single palm crease is visible in a person suffering from :</text>
      <options>
        <option>Turner's syndrome</option>
        <option>Klinefelter's syndrome</option>
        <option>Thalassemia</option>
        <option>Down's syndrome</option>
      </options>
      <correctAnswer>Down's syndrome</correctAnswer>
    </question>
    <question>
      <text>Which of the following describes the correct characteristic of an ideal solution?</text>
      <options>
        <option>$\Delta H_{mix} = 0, \Delta V_{mix} = 0$</option>
        <option>$\Delta H_{mix} &gt; 0, \Delta V_{mix} &gt; 0$</option>
        <option>$\Delta H_{mix} &lt; 0, \Delta V_{mix} &lt; 0$</option>
        <option>$\Delta H_{mix} = 0, \Delta V_{mix} &lt; 0$</option>
      </options>
      <correctAnswer>$\Delta H_{mix} = 0, \Delta V_{mix} = 0$</correctAnswer>
    </question>
  </easy>
  <medium>
    <question>
      <text>Given below are two statements : Statement I: RNA mutates at a faster rate. Statement II: Viruses having RNA genome and shorter life span mutate and evolve faster. In the light of the above statements, choose the most appropriate answer.</text>
      <options>
        <option>Both Statement I and Statement II are correct</option>
        <option>Both Statement I and Statement II are incorrect</option>
        <option>Statement I is correct but Statement II is incorrect</option>
        <option>Statement I is incorrect but Statement II is correct</option>
      </options>
      <correctAnswer>Both Statement I and Statement II are correct</correctAnswer>
    </question>
  </medium>
</chapter>
'''

with open(os.path.join(RAW_DIR, "neet_2023.xml"), "w", encoding="utf-8") as f:
    f.write(neet_2023_content)

print("Successfully injected genuine 2023 questions into jee_main_2023.xml and neet_2023.xml!")
