import os

RAW_DIR = "raw_questions"

def write_xml(year, is_jee, content):
    prefix = "jee_main" if is_jee else "neet"
    path = os.path.join(RAW_DIR, f"{prefix}_{year}.xml")
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

# 2017
write_xml(2017, True, '''<?xml version="1.0" encoding="UTF-8"?>
<chapter><medium>
<question>
<text>If, for a positive integer n, the quadratic equation $x(x+1) + (x+1)(x+2) + ... + (x+\overline{n-1})(x+n) = 10n$ has two consecutive integral solutions, then n is equal to :</text>
<options><option>9</option><option>10</option><option>11</option><option>12</option></options>
<correctAnswer>11</correctAnswer>
</question>
</medium></chapter>''')

write_xml(2017, True, '''<?xml version="1.0" encoding="UTF-8"?>
<chapter><medium>
<question>
<text>A man grows into a giant such that his linear dimensions increase by a factor of 9. Assuming that his density remains same, the stress in the leg will change by a factor of :</text>
<options><option>9</option><option>81</option><option>1/9</option><option>1/81</option></options>
<correctAnswer>9</correctAnswer>
</question>
</medium></chapter>''')

write_xml(2017, False, '''<?xml version="1.0" encoding="UTF-8"?>
<chapter><medium>
<question>
<text>DNA replication in bacteria occurs:</text>
<options><option>Within nucleolus</option><option>Prior to fission</option><option>Just before transcription</option><option>During S phase</option></options>
<correctAnswer>Prior to fission</correctAnswer>
</question>
</medium></chapter>''')

# 2016
write_xml(2016, True, '''<?xml version="1.0" encoding="UTF-8"?>
<chapter><medium>
<question>
<text>The integral $\int \frac{2x^{12} + 5x^9}{(x^5 + x^3 + 1)^3} dx$ is equal to:</text>
<options><option>$\frac{x^{10}}{2(x^5+x^3+1)^2} + C$</option><option>$\frac{x^5}{2(x^5+x^3+1)^2} + C$</option><option>$\frac{-x^{10}}{2(x^5+x^3+1)^2} + C$</option><option>$\frac{-x^5}{2(x^5+x^3+1)^2} + C$</option></options>
<correctAnswer>$\frac{x^{10}}{2(x^5+x^3+1)^2} + C$</correctAnswer>
</question>
</medium></chapter>''')

write_xml(2016, False, '''<?xml version="1.0" encoding="UTF-8"?>
<chapter><medium>
<question>
<text>Which of the following would appear as the pioneer organisms on bare rocks?</text>
<options><option>Mosses</option><option>Green algae</option><option>Lichens</option><option>Liverworts</option></options>
<correctAnswer>Lichens</correctAnswer>
</question>
</medium></chapter>''')

# 2015
write_xml(2015, True, '''<?xml version="1.0" encoding="UTF-8"?>
<chapter><medium>
<question>
<text>Let $\alpha$ and $\beta$ be the roots of equation $x^2-6x-2=0$. If $a_n = \alpha^n - \beta^n$, for $n \ge 1$, then the value of $\frac{a_{10} - 2a_8}{2a_9}$ is equal to:</text>
<options><option>6</option><option>1</option><option>2</option><option>3</option></options>
<correctAnswer>3</correctAnswer>
</question>
</medium></chapter>''')

write_xml(2015, False, '''<?xml version="1.0" encoding="UTF-8"?>
<chapter><medium>
<question>
<text>The structures that help some bacteria to attach to rocks and/or host tissues are:</text>
<options><option>Mesosomes</option><option>Holdfast</option><option>Rhizoids</option><option>Fimbriae</option></options>
<correctAnswer>Fimbriae</correctAnswer>
</question>
</medium></chapter>''')

# 2014
write_xml(2014, True, '''<?xml version="1.0" encoding="UTF-8"?>
<chapter><medium>
<question>
<text>If $X$ is a Poisson variate such that $P(X=1) = P(X=2)$, then $P(X=4)$ is :</text>
<options><option>$2e^{-2}/3$</option><option>$e^{-2}/3$</option><option>$e^{-2}/4$</option><option>$2e^{-2}/5$</option></options>
<correctAnswer>$2e^{-2}/3$</correctAnswer>
</question>
</medium></chapter>''')

write_xml(2014, False, '''<?xml version="1.0" encoding="UTF-8"?>
<chapter><medium>
<question>
<text>Which one of the following fungi contains hallucinogens?</text>
<options><option>Morchella esculenta</option><option>Amanita muscaria</option><option>Neurospora sp.</option><option>Ustilago sp.</option></options>
<correctAnswer>Amanita muscaria</correctAnswer>
</question>
</medium></chapter>''')

# 2013
write_xml(2013, True, '''<?xml version="1.0" encoding="UTF-8"?>
<chapter><medium>
<question>
<text>Distance between two parallel planes $2x + y + 2z = 8$ and $4x + 2y + 4z + 5 = 0$ is</text>
<options><option>3/2</option><option>5/2</option><option>7/2</option><option>9/2</option></options>
<correctAnswer>7/2</correctAnswer>
</question>
</medium></chapter>''')

write_xml(2013, False, '''<?xml version="1.0" encoding="UTF-8"?>
<chapter><medium>
<question>
<text>The eye of octopus and eye of cat show different patterns of structure, yet they perform similar function. This is an example of :</text>
<options><option>Analogous organs that have evolved due to convergent evolution.</option><option>Analogous organs that have evolved due to divergent evolution.</option><option>Homologous organs that have evolved due to convergent evolution.</option><option>Homologous organs that have evolved due to divergent evolution.</option></options>
<correctAnswer>Analogous organs that have evolved due to convergent evolution.</correctAnswer>
</question>
</medium></chapter>''')

# 2012 
write_xml(2012, True, '''<?xml version="1.0" encoding="UTF-8"?>
<chapter><medium>
<question>
<text>If the simple harmonic motion is represented by $\frac{d^2x}{dt^2} + \alpha x = 0$, its time period is:</text>
<options><option>$2\pi\alpha$</option><option>$2\pi/\sqrt{\alpha}$</option><option>$2\pi\sqrt{\alpha}$</option><option>$2\pi/\alpha$</option></options>
<correctAnswer>$2\pi/\sqrt{\alpha}$</correctAnswer>
</question>
</medium></chapter>''')

write_xml(2012, False, '''<?xml version="1.0" encoding="UTF-8"?>
<chapter><medium>
<question>
<text>Which one of the following organisms is scientifically correctly named, correctly printed according to the International Rules of Nomenclature and correctly described?</text>
<options><option>Musca domestica - The common house lizard, a reptile.</option><option>Plasmodium falciparum - A protozoan pathogen causing the most serious type of malaria.</option><option>Felis tigris - The Indian tiger, well protected in Gir forests.</option><option>E.coli - Full name Entamoeba coli, a commonly occurring bacterium in human intestine.</option></options>
<correctAnswer>Plasmodium falciparum - A protozoan pathogen causing the most serious type of malaria.</correctAnswer>
</question>
</medium></chapter>''')

# 2011 
write_xml(2011, True, '''<?xml version="1.0" encoding="UTF-8"?>
<chapter><medium>
<question>
<text>Let A and B be two symmetric matrices of order 3. Statement-1: $A(BA)$ and $(AB)A$ are symmetric matrices. Statement-2: $AB$ is symmetric matrix if matrix multiplication of A and B is commutative.</text>
<options><option>Statement-1 is true, Statement-2 is false.</option><option>Both are true.</option><option>Statement-1 is false, Statement-2 is true.</option><option>Both are false.</option></options>
<correctAnswer>Both are true.</correctAnswer>
</question>
</medium></chapter>''')

write_xml(2011, False, '''<?xml version="1.0" encoding="UTF-8"?>
<chapter><medium>
<question>
<text>The purplish red pigment rhodopsin contained in the rods type of photoreceptor cells of the human eye, is a derivative of:</text>
<options><option>Vitamin A</option><option>Vitamin B1</option><option>Vitamin C</option><option>Vitamin D</option></options>
<correctAnswer>Vitamin A</correctAnswer>
</question>
</medium></chapter>''')

# 2010
write_xml(2010, True, '''<?xml version="1.0" encoding="UTF-8"?>
<chapter><medium>
<question>
<text>Let $f: (-1, 1) \rightarrow R$ be a differentiable function with $f(0)=0$. If $y=f(x)$ satisfies $f'(x) = \frac{1}{x^2+1}$, then what is $\lim_{x \to 0} \frac{x f(x)}{1-\cos x}$?</text>
<options><option>0</option><option>1</option><option>2</option><option>1/2</option></options>
<correctAnswer>2</correctAnswer>
</question>
</medium></chapter>''')

write_xml(2010, False, '''<?xml version="1.0" encoding="UTF-8"?>
<chapter><medium>
<question>
<text>In unilocular ovary with a single ovule, the placentation is :</text>
<options><option>Marginal</option><option>Basal</option><option>Free central</option><option>Axile</option></options>
<correctAnswer>Basal</correctAnswer>
</question>
</medium></chapter>''')

print("Successfully injected genuine questions into 2017 to 2010!")
