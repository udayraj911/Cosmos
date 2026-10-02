import { QuizQuestion } from './types';

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  // ==========================================
  // NORMAL QUESTIONS (1 to 50)
  // ==========================================
  {
    id: 1,
    question: 'What is the closest star to Earth?',
    options: ['Alpha Centauri', 'Sirius', 'Proxima Centauri', 'Sol (The Sun)'],
    answerIndex: 3,
    explanation: 'Sol (The Sun) is our closest star. Beyond our solar system, Proxima Centauri is the nearest.',
    category: 'normal'
  },
  {
    id: 2,
    question: 'How many planets are in our solar system?',
    options: ['7', '8', '9', '10'],
    answerIndex: 1,
    explanation: 'There are exactly 8 official planets. Pluto was reclassified as a dwarf planet in 2006.',
    category: 'normal'
  },
  {
    id: 3,
    question: 'What is the largest planet in our solar system?',
    options: ['Saturn', 'Neptune', 'Jupiter', 'Uranus'],
    answerIndex: 2,
    explanation: 'Jupiter is the massive gas giant, hosting over twice the mass of all other planets combined.',
    category: 'normal'
  },
  {
    id: 4,
    question: 'What is a light year?',
    options: ['The time it takes light to orbit the Sun', 'The distance light travels in one year', 'The age of light since the Big Bang', 'The speed of light in deep vacuum space'],
    answerIndex: 1,
    explanation: 'A light-year is a unit of astronomical distance, measuring roughly 9.5 trillion kilometers.',
    category: 'normal'
  },
  {
    id: 5,
    question: 'What causes a black hole to form?',
    options: ['The collision of two hyper-massive planets', 'The thermodynamic cooling of a white dwarf star', 'The gravitational collapse of an extremely massive star core', 'The sudden expansion of dark matter filaments'],
    answerIndex: 2,
    explanation: 'When stars with massive cores run out of fuel, gravity wins, collapsing the core into a singularity.',
    category: 'normal'
  },
  {
    id: 6,
    question: 'What is dark matter?',
    options: ['Matter that has been swallowed by black holes', 'Invisible matter detectable strictly through gravitational effects', 'Dust sheets blocking light in interstellar clouds', 'Protons that have decayed into passive states'],
    answerIndex: 1,
    explanation: 'Dark matter does not interact with electromagnetic light, but is tracked because its gravity binds galaxies.',
    category: 'normal'
  },
  {
    id: 7,
    question: 'In what year did the first human step onto the Moon?',
    options: ['1961', '1965', '1969', '1972'],
    answerIndex: 2,
    explanation: 'Neil Armstrong stepped onto the Lunar surface on July 20, 1969, during the Apollo 11 mission.',
    category: 'normal'
  },
  {
    id: 8,
    question: 'What is the Milky Way?',
    options: ['The solar accretion disk surrounding the sun', 'Our home spiral galaxy', 'The local cluster of planets near Andromeda', 'The gas stream left by comets crossing Earth\'s orbit'],
    answerIndex: 1,
    explanation: 'The Milky Way is our barred spiral galaxy, holding about 100 billion solar systems.',
    category: 'normal'
  },
  {
    id: 9,
    question: 'What is time dilation?',
    options: ['The tendency of clocks to fail in solar storm lines', 'Earth spinning faster over historical eras', 'Time slowing down near massive gravity or at high speeds', 'An illusion of time based on coordinate distance'],
    answerIndex: 2,
    explanation: 'Time is relative. Clocks tick slower in strong gravitational fields and when traveling close to light-speed.',
    category: 'normal'
  },
  {
    id: 10,
    question: 'What was the first artificial satellite launched into orbit?',
    options: ['Sputnik 1', 'Explorer 1', 'Vanguard 1', 'Telstar'],
    answerIndex: 0,
    explanation: 'Sputnik 1 was launched by the Soviet Union on October 4, 1957, initiating the Space Age.',
    category: 'normal'
  },
  {
    id: 11,
    question: 'Which is the hottest planet in our solar system?',
    options: ['Mercury', 'Venus', 'Mars', 'Jupiter'],
    answerIndex: 1,
    explanation: 'Venus is the hottest because its thick carbon dioxide atmosphere traps intense solar heat.',
    category: 'normal'
  },
  {
    id: 12,
    question: 'What is a neutron star?',
    options: ['A star structured strictly out of hydrogen molecules', 'A hyper-compressed stellar core containing collapsed degenerate matter', 'A young planetesimal accumulation', 'A black hole accretion ring segment'],
    answerIndex: 1,
    explanation: 'Formed from supernovae, they hold up to 1.4-2 solar masses inside a city-sized radius.',
    category: 'normal'
  },
  {
    id: 13,
    question: 'What is the "event horizon" of a black hole?',
    options: ['The peak brightness region of the accretion disk', 'The furthest gravitational pull distance', 'The point of no return where escape speed exceeds light speed', 'The core point of infinite curvature densities'],
    answerIndex: 2,
    explanation: 'Beyond the event horizon, space-time paths curve inward so heavily that nothing can escape.',
    category: 'normal'
  },
  {
    id: 14,
    question: 'Which space telescope was successfully launched in 2021 as Hubble\'s successor?',
    options: ['Kepler Space Telescope', 'James Webb Space Telescope', 'Spitzer Telescope', 'Chandra Observatory'],
    answerIndex: 1,
    explanation: 'The James Webb Space Telescope (JWST) launched on Christmas Day 2021 to observe infrared light.',
    category: 'normal'
  },
  {
    id: 15,
    question: 'What is quantum entanglement?',
    options: ['Particles colliding inside stars to fuel fusion', 'Static interference on radio bands from cosmic webs', 'Instant state links between twin particles crossing distance', 'A method of compressing atoms into dark states'],
    answerIndex: 2,
    explanation: 'Entangled particles share states instantly, coined "spooky action at a distance" by Einstein.',
    category: 'normal'
  },
  {
    id: 16,
    question: 'What is the estimated age of our universe?',
    options: ['4.6 Billion Years', '10.2 Billion Years', '13.8 Billion Years', '20.0 Billion Years'],
    answerIndex: 2,
    explanation: 'Analyses of cosmic expansion and CMB radiation estimate the age to be 13.8 billion years.',
    category: 'normal'
  },
  {
    id: 17,
    question: 'What is a wormhole in physics?',
    options: ['A planetary tube created by high-speed asteroid tunnels', 'A theoretical tunnel crossing spacetime coordinates shortcut', 'A gaseous cloud connecting binary stellar systems', 'The spin axis of a rotating black hole core'],
    answerIndex: 1,
    explanation: 'Wormholes are theoretical mathematical tunnels allowed by relativity, bridging separate spacetime regions.',
    category: 'normal'
  },
  {
    id: 18,
    question: 'What is the name of the largest volcano in our solar system?',
    options: ['Mauna Kea (Earth)', 'Olympus Mons (Mars)', 'Mount Etna (Earth)', 'Loki Patera (Io)'],
    answerIndex: 1,
    explanation: 'Olympus Mons is a massive shield volcano on Mars, standing about 22 kilometers tall.',
    category: 'normal'
  },
  {
    id: 19,
    question: 'What is the Big Bang?',
    options: ['The collision of the Milky Way and Andromeda', 'The expanding source event of spacetime starting 13.8 billion years ago', 'The sound of a collapsing supergiant star supernova', 'A sudden wave of gamma rays from active cores'],
    answerIndex: 1,
    explanation: 'The Big Bang is the primordial expansion event that launched space, time, and matter.',
    category: 'normal'
  },
  {
    id: 20,
    question: 'What is Hawking radiation?',
    options: ['Lethal protons emitted by active pulsar beams', 'Slow mass evaporation from black holes due to quantum virtual particles', 'The background microwave light left by inflation', 'Charged solar wind streams shaping auroras'],
    answerIndex: 1,
    explanation: 'Proposed by Stephen Hawking, quantum particle pairs near the event horizon trigger gradual black hole decay.',
    category: 'normal'
  },
  {
    id: 21,
    question: 'In what year was Pluto reclassified as a dwarf planet?',
    options: ['2000', '2004', '2006', '2010'],
    answerIndex: 2,
    explanation: 'The International Astronomical Union redefined "planet" in 2006, placing Pluto as a dwarf.',
    category: 'normal'
  },
  {
    id: 22,
    question: 'What is the Oort Cloud?',
    options: ['The carbon ring surrounding Saturn\'s outer moon lines', 'A theoretical giant sphere of icy comets surrounding our solar system', 'The stellar dust lane inside the Milky Way center', 'A collection of black holes in the Virgo cluster'],
    answerIndex: 1,
    explanation: 'The Oort cloud is a colossal gravitational swarm of icy planetesimals, sourcing long-period comets.',
    category: 'normal'
  },
  {
    id: 23,
    question: 'What was the first human-built space station, launched in 1971?',
    options: ['Skylab', 'Salyut 1', 'Mir', 'International Space Station'],
    answerIndex: 1,
    explanation: 'Salyut 1 was orbiting under Soviet command in 1971, marking the start of long-term orbital habitation.',
    category: 'normal'
  },
  {
    id: 24,
    question: 'What is a pulsar?',
    options: ['A giant flashing star nearing carbon collapse', 'A rapidly spinning neutron star venting electromagnetic beams', 'A planetesimal reflecting solar flares intensely', 'An artificial probe generating grid signals'],
    answerIndex: 1,
    explanation: 'Pulsars are spinning magnetic neutron stars. Their beams swing across Earth like lighthouses.',
    category: 'normal'
  },
  {
    id: 25,
    question: 'What is cosmic inflation?',
    options: ['The accelerating price of space exploration rocket components', 'A theory of rapid, hyper-exponential expansion in the initial fraction of a second', 'Dust expanding into nebulae after stellar collapse', 'The dilution of dark energy in expanded space'],
    answerIndex: 1,
    explanation: 'Inflation expanded the cosmos by a massive scale factor in roughly 10^-32 seconds.',
    category: 'normal'
  },
  {
    id: 26,
    question: 'How many moons does Saturn currently have confirmed?',
    options: ['62', '82', '95', '146'],
    answerIndex: 3,
    explanation: 'Saturn leads with 146 confirmed moons, heavily mapped by robotic missions.',
    category: 'normal'
  },
  {
    id: 27,
    question: 'What is the speed of light in a vacuum?',
    options: ['150,000 km/s', '299,792 km/s', '450,000 km/s', '1,079,000 km/s'],
    answerIndex: 1,
    explanation: 'Light moves at roughly 300,000 kilometers per second, forming the cosmic speed limit.',
    category: 'normal'
  },
  {
    id: 28,
    question: 'How far away is the Andromeda Galaxy (M31) from us?',
    options: ['10,000 Light Years', '1.2 Million Light Years', '2.537 Million Light Years', '10.5 Million Light Years'],
    answerIndex: 2,
    explanation: 'Andromeda is around 2.5 million light-years away, detectable via high-end consumer optics.',
    category: 'normal'
  },
  {
    id: 29,
    question: 'What is dark energy?',
    options: ['Gravity fields leaking into bulk dimensions', 'The energy emitted by black hole singularities', 'A mysterious vacuum pressure accelerating the expansion of the universe', 'The potential thermal footprint of mirror universes'],
    answerIndex: 2,
    explanation: 'Dark energy is a smooth background pressure driving galaxies away from each other at increasing rates.',
    category: 'normal'
  },
  {
    id: 30,
    question: 'What was the name of the first robotic rover to arrive on Mars?',
    options: ['Sojourner', 'Spirit', 'Curiosity', 'Perseverance'],
    answerIndex: 0,
    explanation: 'Sojourner landed on July 4, 1997, as part of the Mars Pathfinder mission.',
    category: 'normal'
  },
  {
    id: 31,
    question: 'What is a magnetar?',
    options: ['A planet bound strictly by diamond-carbon lattices', 'A neutron star with an extremely powerful magnetic field', 'An iron asteroid generating stable magnetic fields', 'A space exploration probe seeking solar dust maps'],
    answerIndex: 1,
    explanation: 'Magnetars are neutron stars with magnetic field strengths trillions of times greater than Earth.',
    category: 'normal'
  },
  {
    id: 32,
    question: 'What does the Kardashev scale measure?',
    options: ['The gravity indices of extreme black holes', 'The sub-atomic vibration frequency of superstrings', 'A theoretical civilization\'s level of technological energy handling', 'The expansion velocity of parallel dimension clusters'],
    answerIndex: 2,
    explanation: 'Created by Nikolai Kardashev, it scores civilizations by planetary, stellar, and galactic energy use.',
    category: 'normal'
  },
  {
    id: 33,
    question: 'What is multiverse theory?',
    options: ['The belief that the Milky Way contains multiple smaller sun rings', 'A model hosting multiple bubble or parallel universes', 'The structure of dark matter filaments overlapping', 'The historical system of gravity working reversely'],
    answerIndex: 1,
    explanation: 'It suggests our observable space is just one of many distinct, potentially parallel universes.',
    category: 'normal'
  },
  {
    id: 34,
    question: 'What historical achievement did Voyager 1 record in 2012?',
    options: ['Orbiting Saturn\'s ring system for primary details', 'Landing a container on an interstellar comet', 'Becoming the first human object to enter interstellar space', 'Directly imaging the central SAGITTARIUS A* black hole'],
    answerIndex: 2,
    explanation: 'Voyager 1 crossed the heliopause in August 2012, venturing into interstellar coordinate spaces.',
    category: 'normal'
  },
  {
    id: 35,
    question: 'What is the Chandrasekhar limit?',
    options: ['The maximum speed of spacecraft in planetary systems', 'The maximum mass threshold of a stable white dwarf (1.4 solar masses)', 'The distance limits of gravitational lens focus', 'The minimum temperatures required for quantum atomic state pairings'],
    answerIndex: 1,
    explanation: 'Above 1.4 solar masses, electron degeneracy cannot balance gravity, collapsing white dwarfs.',
    category: 'normal'
  },
  {
    id: 36,
    question: 'What is gravitational lensing?',
    options: ['A technique to polish optical telescope mirror coatings', 'Gravity warping light beams around massive bodies like a lens', 'Dust scattering blue sunlight in atmospheric shields', 'Black holes radiating extreme energy paths outward'],
    answerIndex: 1,
    explanation: 'Mass curves spacetime. Photons traveling past massive targets bend, creating lens distortions.',
    category: 'normal'
  },
  {
    id: 37,
    question: 'What is the typical orbital altitude of the International Space Station?',
    options: ['150 km', '400 km', '1,000 km', '36,000 km'],
    answerIndex: 1,
    explanation: 'The ISS orbits around 400 kilometers high, traveling at roughly 27,600 km/h.',
    category: 'normal'
  },
  {
    id: 38,
    question: 'In theoretical physics, what is a white hole?',
    options: ['An active neutron star with a silicon core', 'A cooling remnants of a massive yellow dwarf', 'A theoretical time-reversed black hole that only ejects matter', 'A pocket of pure baryonic light inside dark energy voids'],
    answerIndex: 2,
    explanation: 'White holes are mathematical twins of black holes, letting matter and light exit but not enter.',
    category: 'normal'
  },
  {
    id: 39,
    question: 'What is the theoretical principle of the Alcubierre Warp Drive?',
    options: ['Compressing the local coordinate speed of atoms inside spacecraft engines', 'Bending space, contracting it ahead of the ship and expanding it behind', 'Triggering quantum entanglement pairs across destinations to teleport', 'Exciting dark matter filaments to create gravity slingshots'],
    answerIndex: 1,
    explanation: 'It contracts space ahead and expands it behind to travel faster than light without violating relativity.',
    category: 'normal'
  },
  {
    id: 40,
    question: 'What causes planetary auroras like the Northern Lights?',
    options: ['Liquid nitrogen streams reflecting lunar white light', 'Solar wind charged particles colliding with magnetosphere gas', 'Atmospheric greenhouse gases warming under solar friction', 'Ice crystal halos scattering light in troposphere layers'],
    answerIndex: 1,
    explanation: 'Charged particles from the sun strike atmospheric atoms, releasing glowing lines of visible light.',
    category: 'normal'
  },
  {
    id: 41,
    question: 'What is the "Great Attractor"?',
    options: ['A supergiant black hole in the Milky Way center', 'A gravitational anomaly pulling galaxies toward a colossal cluster region', 'An asteroid belt capturing rogue moons systematically', 'The initial singularity state from cyclic inflation'],
    answerIndex: 1,
    explanation: 'An immense mass anomaly in intergalactic space pulling of galaxies toward its position.',
    category: 'normal'
  },
  {
    id: 42,
    question: 'Which major galaxy is destined to merge with ours in 4.5 billion years?',
    options: ['Triangulum Galaxy', 'Centaurus A', 'Andromeda Galaxy', 'Sombrero Galaxy'],
    answerIndex: 2,
    explanation: 'Andromeda (M31) is heading toward us, and will merge to form Milkdromeda.',
    category: 'normal'
  },
  {
    id: 43,
    question: 'What does a "stellar nursery" refer to?',
    options: ['A region of high density black hole singularity fields', 'A giant dust and gas cloud (nebula) where new stars are born', 'A planetary ring collecting young cooling planetesimal chunks', 'An orbital tracking station mapping solar wind orbits'],
    answerIndex: 1,
    explanation: 'A nebula (like Orion) where gas folds together under gravity, forming protostars.',
    category: 'normal'
  },
  {
    id: 44,
    question: 'What question does the famous Fermi Paradox ask?',
    options: ['Why does time dilute near massive black holes?', 'How long do dark matter filaments expand?', 'If alien life is highly probable, where is everyone?', 'Why do strings vibrate in 11 dimensions?'],
    answerIndex: 2,
    explanation: 'The Fermi Paradox notes the contradiction between cosmic high probability of alien civilizations and zero detection.',
    category: 'normal'
  },
  {
    id: 45,
    question: 'What is cosmological nucleosynthesis?',
    options: ['A process of black holes condensing atoms into dark state layers', 'The creation of atomic cores (like Helium) inside stars or during the early universe', 'The erosion of silicon crusts under intense planetary solar heat', 'A method of synthesizing sub-atomic virtual particles in labs'],
    answerIndex: 1,
    explanation: 'Nucleosynthesis is the chemical synthesis of protons/neutrons to build nuclei.',
    category: 'normal'
  },
  {
    id: 46,
    question: 'What does CMB stand for in astrophysics?',
    options: ['Centuries-old Meteorite Bombardment', 'Cosmic Microwave Background (primordial radiation)', 'Crystalline Matter Binding energy', 'Chandra Magnetar Beacon spectrum'],
    answerIndex: 1,
    explanation: 'The Cosmic Microwave Background is relic radiation dating back count to 380,000 years post-Big-Bang.',
    category: 'normal'
  },
  {
    id: 47,
    question: 'What is "spaghettification" in black hole relativity?',
    options: ['Hot gas clouds winding into spiral galactic arms shape', 'Atomic lattices stretching vertically under extreme gravitational force differentials', 'The creation of long tube-like wormhole structures', 'Probes spinning out of control inside a vacuum field'],
    answerIndex: 1,
    explanation: 'The extreme tidal gravity pulls the feet faster than the head, stretching anything into long spaghetti shapes.',
    category: 'normal'
  },
  {
    id: 48,
    question: 'What is a Dyson Sphere?',
    options: ['An magnetic compass used to navigate gravitational wave fields', 'A theoretical megastructure wrapping a star to capture its energy output', 'A clean sphere of pure dark energy pushing universe expansion', 'The atmospheric protective layer surrounding Earth'],
    answerIndex: 1,
    explanation: 'Proposed by Freeman Dyson, Type II civilizations would construct spheres around parent stars.',
    category: 'normal'
  },
  {
    id: 49,
    question: 'Which rocket was used to launch the James Webb Space Telescope?',
    options: ['Saturn V', 'Falcon Heavy', 'Ariane 5', 'Space Launch System (SLS)'],
    answerIndex: 2,
    explanation: 'JWST was launched on an Ariane 5 rocket from French Guiana on December 25, 2021.',
    category: 'normal'
  },
  {
    id: 50,
    question: 'What is the estimated diameter of the observable universe?',
    options: ['13.8 Billion Light Years', '46 Billion Light Years', '93 Billion Light Years', '350 Billion Light Years'],
    answerIndex: 2,
    explanation: 'Due to ongoing spatial expansion over 13.8B years, the current observable diameter is roughly 93 Billion Light Years.',
    category: 'normal'
  },

  // ==========================================
  // ADVANCED QUESTIONS (51 to 100)
  // Topics: Quantum Mechanics (51-67), Advanced Space (68-84), Subconscious Mind & Perception (85-100)
  // ==========================================
  
  // -- ADVANCED QUANTUM MECHANICS (51 to 67, 17 questions) --
  {
    id: 51,
    question: 'What is the fundamental resolution of the Double-Slit Experiment when observers measure which slit a particle passes through?',
    options: [
      'The particles move faster due to observer thermodynamic energy',
      'The wave function collapses, and the interference pattern disappears, turning into a particle-like distribution',
      'The screen shifts in phase due to quantum friction',
      'Nothing changes; observations have no physical effect on wave behavior'
    ],
    answerIndex: 1,
    explanation: 'Measuring or observing "which-way" information collapses the wave function superposition, forcing particles to act as classical bullets and destroying the interference fringes.',
    category: 'advanced'
  },
  {
    id: 52,
    question: 'Which theorem mathematically disproves local realism, showing quantum entanglement cannot be explained by hidden local variables?',
    options: ['Bell\'s Theorem', 'Heisenberg Uncertainty Formulation', 'Planck\'s Constant Corollary', 'No-Cloning Theorem'],
    answerIndex: 0,
    explanation: 'Bell\'s Theorem (and subsequent experimental violations of Bell inequalities) proved that no local hidden variable theory can reproduce the predictions of quantum mechanics.',
    category: 'advanced'
  },
  {
    id: 53,
    question: 'What is the physical cause behind Quantum Tunneling?',
    options: [
      'Particles speed up beyond light speed temporarily to break walls',
      'The wave function spans across a thin potential barrier, giving a non-zero probability of find a particle on the other side',
      'Microscopic worms eat paths in atomic boundaries',
      'Symmetric spin reversals push particles with explosive kinetic force'
    ],
    answerIndex: 1,
    explanation: 'In quantum tunneling, the wave function of a particle decays exponentially within a potential barrier but remains non-zero. Hence, there is a probability it appears on the opposite side.',
    category: 'advanced'
  },
  {
    id: 54,
    question: 'According to Heisenberg\'s Uncertainty Principle, what two physical variables cannot be simultaneously measured with absolute precision?',
    options: [
      'Spin direction and mass density',
      'Position and momentum (or energy and time)',
      'Wavelength and thermal energy',
      'Charge and quantum spin index'
    ],
    answerIndex: 1,
    explanation: 'The uncertainty product of position and momentum (or energy and time) must always exceed h-bar over two, meaning absolute precision in one variable strips precision from the other.',
    category: 'advanced'
  },
  {
    id: 55,
    question: 'What does Schrodinger\'s Wave Equation actually describe?',
    options: [
      'The continuous physical trajectory of an accelerated atom',
      'The probability amplitude of a quantum state over spacetime coordinates',
      'The gravity drag coefficient of superstrings in higher dimensions',
      'The mechanical pressure of light waves in a stellar core'
    ],
    answerIndex: 1,
    explanation: 'Schrodinger\'s equation models how the quantum state (wave function) of a physical system changes dynamically over time. The square of its amplitude yields probability densities.',
    category: 'advanced'
  },
  {
    id: 56,
    question: 'What is the "Superposition Principle" in quantum mechanics?',
    options: [
      'The rule that two objects cannot occupying the exact same space',
      'The capability of a system to exist in multiple potential states or configurations simultaneously until a measurement is made',
      'The physical placement of heavy quarks above lighter antiquarks',
      'The gravitational attraction of multiple parallel universe membranes'
    ],
    answerIndex: 1,
    explanation: 'Superposition states that any two or more quantum states can be added together ("superposed") to yield another valid quantum state. Measurement forces a choice among these states.',
    category: 'advanced'
  },
  {
    id: 57,
    question: 'What is the No-Cloning Theorem in quantum mechanics?',
    options: [
      'A bio-ethical regulation forbidding cloning of researchers',
      'The mathematical proof that it is impossible to create an identical copy of an arbitrary unknown quantum state',
      'The rule that twins cannot share the same molecular coordinate spaces',
      'The statement that quantum computers cannot backup their memory tracks'
    ],
    answerIndex: 1,
    explanation: 'The No-Cloning Theorem is a fundamental tenet of quantum information. If you could copy an unknown state, you could bypass Heisenberg\'s uncertainty via multiple parallel trials.',
    category: 'advanced'
  },
  {
    id: 58,
    question: 'What unit of quantum information represents a superposition of both 0 and 1 states simultaneously?',
    options: ['Trifecta', 'Qubit', 'Byte', 'Proton Bit'],
    answerIndex: 1,
    explanation: 'A Qubit (Quantum Bit) can exist in state |0>, |1>, or any linear combination of both, enabling quantum algorithms to run massive parallel state searches.',
    category: 'advanced'
  },
  {
    id: 59,
    question: 'In quantum electrodynamics, what force-carrier photon is exchanged during electromagnetic interactions?',
    options: ['Gluon', 'W Boson', 'Virtual Photon', 'Graviton'],
    answerIndex: 2,
    explanation: 'Electromagnetic forces are conceptually negotiated via the exchange of virtual photons between charged particles.',
    category: 'advanced'
  },
  {
    id: 60,
    question: 'What is the Planck Constant?',
    options: [
      'The speed at which cosmic background radiation cools',
      'The physical constant representing the quantum of electromagnetic action (6.626 x 10^-34 J·s)',
      'The maximum diameter of a neutron star',
      'The rate of light expansion post-Big Bang'
    ],
    answerIndex: 1,
    explanation: 'The Planck Constant relates the energy of a photon to its frequency, establishing the scale of quantum-mechanical behavior of nature.',
    category: 'advanced'
  },
  {
    id: 61,
    question: 'What occurs during "Quantum Decoherence"?',
    options: [
      'Atoms breaking apart due to absolute zero cold',
      'The transition of a quantum system into a classical system due to environmental interactions and information leakage',
      'The conversion of dark matter into heavy elements inside pulsars',
      'A coordinate error when two wave packets combine in a vaccum'
    ],
    answerIndex: 1,
    explanation: 'Decoherence is the interaction of a quantum system with its environment, which destroys the phase relationship of the superposition, leaving it appearing classical.',
    category: 'advanced'
  },
  {
    id: 62,
    question: 'What quantum model describes the vacuum of space as a boiling sea of virtual particles popping into and out of existence?',
    options: ['Quantum Field Theory (Vacuum Fluctuations)', 'Thermodynamic Friction Principle', 'Boyle\'s Vacuum Law', 'Quantum Spin Glass Theory'],
    answerIndex: 0,
    explanation: 'Vacuum fluctuations in Quantum Field Theory state that the vacuum is never completely empty, but hosts transient virtual particle-antiparticle pairs due to the energy-time uncertainty.',
    category: 'advanced'
  },
  {
    id: 63,
    question: 'Which fundamental force quantum carrier is described by QCD (Quantum Chromodynamics)?',
    options: ['Photons (Electromagnetism)', 'Gluons (Strong Nuclear Force)', 'Gravitrons (Gravity)', 'Weak Bosons'],
    answerIndex: 1,
    explanation: 'Gluons carry the color charge of the strong nuclear force, binding quarks together to form protons and neutrons.',
    category: 'advanced'
  },
  {
    id: 64,
    question: 'What is the "Many-Worlds Interpretation" of quantum mechanics proposed by Hugh Everett?',
    options: [
      'The physical reality of planets orbiting multiple stars across our galaxy',
      'The theory that every quantum measurement branch actually splits the universe into separate, parallel physical realities',
      'The belief that ancient cultures built teleporters to travel space',
      'The coordinate model mapping parallel solar orbits around black holes'
    ],
    answerIndex: 1,
    explanation: 'The Many-Worlds Interpretation suggests there is no actual collapse of the wave function; instead, all possible outcome paths occur collectively in branching, non-communicating parallel worlds.',
    category: 'advanced'
  },
  {
    id: 65,
    question: 'What are "Anyons" in quantum statistical mechanics?',
    options: [
      'Highly unstable dark matter fragments with zero gravity',
      'Quasiparticles in two-dimensional space that are neither bosons nor fermions',
      'The heavy chemical blocks making up Venusian atmospheric crust',
      'Antiproton streams captured by solar winds'
    ],
    answerIndex: 1,
    explanation: 'In 2D systems, anyons have fractional statistics where exchanging two particles changes the phase of the system by a factor that is not just +1 (bosons) or -1 (fermions).',
    category: 'advanced'
  },
  {
    id: 66,
    question: 'What unique feature of "Spin" defines a Quark or a Lepton?',
    options: ['They hold fractional electric spins', 'They have half-integer spin (1/2), classifying them as Fermions', 'They have zero spin, making them perfect scalars', 'They possess infinite spins based on speed'],
    answerIndex: 1,
    explanation: 'All matter-building blocks (quarks, electrons, neutrophils) possess spin 1/2, meaning they obey the Pauli Exclusion Principle and are categorized as Fermions.',
    category: 'advanced'
  },
  {
    id: 67,
    question: 'What is the primary thermodynamic issue that a quantum computer circumvents to scale computational memory?',
    options: [
      'The absolute zero operating limitation of server chips',
      'The exponential resource scaling requirement of classical systems (Hilbert space dimension scales as 2^N)',
      'The extreme gravity fields generated by high voltage silicon boards',
      'The speed limit of optical transmission cables'
    ],
    answerIndex: 1,
    explanation: 'Classical computers require exponentially growing resources to simulate larger quantum states, whereas quantum computer registers scale linearly because N qubits hold 2^N state superpositions.',
    category: 'advanced'
  },

  // -- ADVANCED SPACE concepts & astrophysics (68 to 84, 17 questions) --
  {
    id: 68,
    question: 'What is the "Penrose Process" of a rotating Kerr Black Hole?',
    options: [
      'The thermonuclear evaporation of orbiting iron asteroids',
      'A theoretical mechanism where objects can extract rotational kinetic energy from the ergosphere',
      'The geometric collapse of an event horizon into a torus ring',
      'The alignment of dual pulsar beams along orbital planes'
    ],
    answerIndex: 1,
    explanation: 'A Kerr black hole has an ergosphere outside its horizon. By throwing an object inside and splitting it, one piece can fall in while the other exits with more energy than the original object had.',
    category: 'advanced'
  },
  {
    id: 69,
    question: 'What physical anomaly is detected in the Cosmic Microwave Background (CMB) known as the "Cold Spot"?',
    options: [
      'A massive coordinate hole left by an explosive ancient asteroid',
      'A colossal region of the universe that is significantly colder than average, hinting at extreme supervoids or potential global multiverses',
      'A dense pocket of ice crystals shielding solar wind detectors',
      'A stellar graveyard where ancient companion galaxies decayed'
    ],
    answerIndex: 1,
    explanation: 'The CMB Cold Spot is a large, unexplained anomaly with temperatures lower than the typical cosmic background fluctuation guidelines, potentially caused by a giant supervoid.',
    category: 'advanced'
  },
  {
    id: 70,
    question: 'What is the significance of the "Jeans Mass" inside interstellar gas clouds?',
    options: [
      'The maximum weight of carbon planetary dust sheets',
      'The critical mass threshold where internal gas thermal pressure can no longer resist gravitational collapse, triggering star formation',
      'The total energy of relativistic electrons in a magnetic field',
      'The orbital size limit of standard hydrogen gas streams'
    ],
    answerIndex: 1,
    explanation: 'If a pocket in a gas cloud exceeds the Jeans Mass, gravity wins over thermal velocity, causing the cloud fragment to collapse and ignite as a protostar.',
    category: 'advanced'
  },
  {
    id: 71,
    question: 'How do "Gravitational Waves" travel through spacetime, as detected by LIGO?',
    options: [
      'As high-frequency radio wind streams carrying plasma codes',
      'As ripples of expanding and contracting spacetime curvature propagating at the speed of light',
      'As magnetic shifts altering the chemical crust of planets',
      'As shockwaves of sound traveling through interstellar wisps'
    ],
    answerIndex: 1,
    explanation: 'Gravitational waves are quadrupole disturbances in spacetime generated by accelerated massive bodies (like colliding black holes) that stretch and squeeze space as they propagate at light-speed.',
    category: 'advanced'
  },
  {
    id: 72,
    question: 'What is the "Bekenstein-Hawking Entropy" formula of a black hole proportional to?',
    options: [
      'The black hole\'s total mass density cubed',
      'The surface area of its event horizon (A)',
      'The velocity of its relativistic jets',
      'The age of its surrounding accretion disk'
    ],
    answerIndex: 1,
    explanation: 'entropy (S) = k * A / 4 * l_P^2. Black hole entropy is directly proportional to the area of the event horizon, not its volume, which inspired the Holographic Principle.',
    category: 'advanced'
  },
  {
    id: 73,
    question: 'What is "Spacetime Frame-Dragging" (the Lense-Thirring effect)?',
    options: [
      'The tendency of satellites to lose orbital altitude due to atmosphere friction',
      'The twisting of spacetime coordinate grids caused by the rapid rotation of a massive object',
      'The visual distortion of light near stellar optical arrays',
      'The slow decay of stellar time clocks on Earth\'s surface'
    ],
    answerIndex: 1,
    explanation: 'Relativity predicts that any rotating mass drag space-time along with it. This frame-dragging twists the trajectories of nearby orbits, measured by precision gyro satellites.',
    category: 'advanced'
  },
  {
    id: 74,
    question: 'What does the "Friedmann-Lemaître-Robertson-Walker (FLRW)" metric describe in general relativity?',
    options: [
      'The atomic geometry of neutron degenerated matter',
      'A homogeneous, isotropic expanding or contracting universe',
      'The spiral trajectory of stellar dust into singularities',
      'The magnetic field lines surrounding rotating magnetars'
    ],
    answerIndex: 1,
    explanation: 'The FLRW metric is a exact solution to Einstein\'s field equations, setting the standard cosmological model of a uniformly filled cosmic space.',
    category: 'advanced'
  },
  {
    id: 75,
    question: 'What is the primary nucleosynthesis process that produces elements heavier than iron, such as gold and platinum, during neutron star mergers?',
    options: ['The Triple-Alpha Process', 'The r-process (rapid neutron capture)', 'The CNO Cycle', 'Thermonuclear Carbon Fusion'],
    answerIndex: 1,
    explanation: 'Merging neutron stars offer a hyper-dense sea of free neutrons. Rapid neutron capture (the r-process) lets atomic nuclei swallow neutrons massively before decaying into heavy gold and platinum.',
    category: 'advanced'
  },
  {
    id: 76,
    question: 'What represents the "Hubble Tension" in modern precision cosmology?',
    options: [
      'The mechanical strain on space telescope support structures',
      'The discrepancy in the measured rate of cosmic expansion (H0) between local distance-ladder methods and early-universe CMB measurements',
      'The friction of dark matter slowing down outer galactic halos',
      'The gravity pull discrepancy between Andromeda and Andromeda-bound comets'
    ],
    answerIndex: 1,
    explanation: 'Direct measurements of nearby space (via Cepheids/Supernovae) yield H0 around 73 km/s/Mpc, while early cosmic microwave data (Planck agency) yields around 67.4, a severe statistical mismatch.',
    category: 'advanced'
  },
  {
    id: 77,
    question: 'What is the "Tolman-Oppenheimer-Volkoff (TOV) Limit"?',
    options: [
      'The maximum speed of space travel in dark energy regions',
      'The upper mass bound of a cold, non-rotating neutron star (approx. 2.17 solar masses) before collapsing into a black hole',
      'The altitude boundary separating planetary atmospheres from solar wind lines',
      'The thermal limits of spacecraft shields near blue supergiants'
    ],
    answerIndex: 1,
    explanation: 'Analogous to the Chandrasekhar limit for white dwarfs, the TOV limit dictates when neutron degeneracy can no longer survive gravity, forcing black hole creation.',
    category: 'advanced'
  },
  {
    id: 78,
    question: 'What is the "GZK Limit" in cosmic ray physics?',
    options: [
      'The fuel threshold of spacecraft engines leaving local systems',
      'The theoretical upper limit on the energy of cosmic ray protons traveling over long distances (5 x 10^19 eV)',
      'The expansion limit of dark energy pressure fronts',
      'The spin velocity limits of supergiant neutron stars'
    ],
    answerIndex: 1,
    explanation: 'The Greisen-Zatsepin-Kuzmin limit states that ultra-high-energy cosmic ray protons traveling across intergalactic distances are slowed down by interactions with the CMB photons.',
    category: 'advanced'
  },
  {
    id: 79,
    question: 'What is the physical nature of "Hawking Radiation" production?',
    options: [
      'Relativistic jets venting thermal fusion leftovers',
      'Quantum virtual particle-antiparticle pairs separate near the event horizon; one falls in, while the other escapes as real energy',
      'Heavy elements burning on the silicon crust of white dwarfs',
      'Friction of rotating accretion discs releasing intense gamma flashes'
    ],
    answerIndex: 1,
    explanation: 'Quantum fluctuations near the black hole horizon trigger the isolation of virtual pairs. The escaping particle creates real radiation, while the inward-falling negative-energy particle reduces the black hole\'s mass.',
    category: 'advanced'
  },
  {
    id: 80,
    question: 'Which theoretical concept suggests our 3D physical universe is a projection of information encoded on a distant 2D boundary?',
    options: ['The holographic principle', 'The Alcubierre projection model', 'Multidimensional String M-Theory', 'The Copernican coordinate symmetry'],
    answerIndex: 0,
    explanation: 'Derived from black hole thermodynamics and string theory, the Holographic Principle asserts that the volume of space can be fully mathematically mapped onto its surrounding boundary.',
    category: 'advanced'
  },
  {
    id: 81,
    question: 'What is the theoretical "Reissner-Nordström" model of a black hole?',
    options: [
      'A black hole with zero spin and zero mass density',
      'A black hole that possesses mass and electrical charge, but no spin',
      'A black hole that acts as a stable wormhole without curvature',
      'A binary system of collapsing neutron stars'
    ],
    answerIndex: 1,
    explanation: 'Reissner-Nordström describes static, spherically symmetric black holes with mass and electric charge, showing unique internal mathematical Cauchy horizons.',
    category: 'advanced'
  },
  {
    id: 82,
    question: 'What are "Cosmic Strings" in theoretical cosmology?',
    options: [
      'Long trails of atomic hydrogen left by early stellar collisions',
      'Theoretical one-dimensional topological defects formed during early-universe phase transitions',
      'The magnetic field lines connecting orbiting gas giants to stars',
      'The mechanical orbits of rogue planets inside dark matter clusters'
    ],
    answerIndex: 1,
    explanation: 'Cosmic strings are hypothetical, highly compressed topological defects which have massive linear densities, stretching across light-years and bending spacetime around them.',
    category: 'advanced'
  },
  {
    id: 83,
    question: 'What is "Nucleosynthesis" blocking (the Iron Peak)?',
    options: [
      'Iron absorbing solar streams to block standard planetary views',
      'Fusion of iron requires importing external energy rather than releasing it, meaning stars cannot fuse iron to sustain physical collapse',
      'Iron atoms repulsing light waves under intense gravity fields',
      'The oxidation of asteroid cores in frozen methane lines'
    ],
    answerIndex: 1,
    explanation: 'Iron has the highest binding energy per nucleon. Stars can fuse lighter elements to produce energy, but fusing iron consumes energy, causing a catastrophic internal collapse.',
    category: 'advanced'
  },
  {
    id: 84,
    question: 'What is the "Planck Epoch"?',
    options: [
      'The final cooling era in the universe\'s geometric death run',
      'The initial period of the universe (0 to 10^-43 seconds) where all four fundamental forces were unified',
      'The orbit path of standard spacecraft entering solar fields',
      'The thermal peak of white dwarf stars'
    ],
    answerIndex: 1,
    explanation: 'The Planck Epoch is the earliest period of time. Under these extreme energy densities, gravity and the other quantum forces were unified under an unformulated quantum gravity theory.',
    category: 'advanced'
  },

  // -- ADVANCED SUBCONSCIOUS MIND, PERCEPTION & ASTROBIOLOGY/PSYCHOLOGY (85 to 100, 16 questions) --
  {
    id: 85,
    question: 'What neuro-cognitive network is highly active during daydreaming, mind-wandering, and cosmic contemplation, but suppressed during focused execution?',
    options: ['The Central Executive Network (CEN)', 'The Default Mode Network (DMN)', 'The Vestibular Balance Loop', 'The Primary Auditory Cortex'],
    answerIndex: 1,
    explanation: 'The Default Mode Network (DMN) is a network of interacting brain regions that activates when a human is thinking about themselves, imagining scenarios, remembering, or pondering the cosmos.',
    category: 'advanced'
  },
  {
    id: 86,
    question: 'How does the professional psychological phenomenon known as the "Overview Effect" alter an astronaut\'s cognitive state upon viewing Earth from orbit?',
    options: [
      'It triggers severe claustrophobia and optical hallucinations',
      'It creates a profound cognitive shift, characterized by an overwhelming sense of global unity, fragile beauty, and cosmic scale',
      'It induces sudden retro-amnesia regarding localized ground conflicts',
      'It dulls creative thinking and promotes mechanical, repetitive habits'
    ],
    answerIndex: 1,
    explanation: 'The Overview Effect is a documented cognitive shift reported by space travelers, sparking an intense appreciation for planetary biological fragility and mutual human connection.',
    category: 'advanced'
  },
  {
    id: 87,
    question: 'What subconscious mechanism in the human visual cortex generates "Phosphenes" (flashes of light) reported by astronauts in complete dark sleep during space journeys?',
    options: [
      'Micro-capsules of water leaking inside retinal layers',
      'Cosmic rays and energetic particles passing through the eyeball and striking the retina directly',
      'Static discharge from space explorer suits',
      'Subconscious memory leaks from ancient daylight experiences'
    ],
    answerIndex: 1,
    explanation: 'In deep space, high-energy cosmic rays traveling at relativistic speeds penetrate spacecraft walls and the human skull, triggering phosphenes in the visual pathway.',
    category: 'advanced'
  },
  {
    id: 88,
    question: 'What is the "Default Mode Network" (DMN) function during Lucid Dreaming?',
    options: [
      'It shuts down entirely to block high-frequency dream loops',
      'It retains active connectivity while the dorsolateral prefrontal cortex rewakens, enabling conscious self-awareness within a dream',
      'It forces rapid eye movements to align with virtual motor signals',
      'It filters out external sounds to shield sensory sleep'
    ],
    answerIndex: 1,
    explanation: 'Lucid dreaming represents a hybrid state of consciousness. While the deep DMN crafts the dream environment, prefrontal regions re-engage to provide waking self-reflective logic.',
    category: 'advanced'
  },
  {
    id: 89,
    question: 'What is "Sensory Gating", and how does the brain\'s subconscious filter handle background cosmic noise or rhythmic engine hums during long space flights?',
    options: [
      'The physical closure of ear canal membranes in extreme gravity',
      'The thalamocortical filter system blocks repetitive, non-threat sensory stimuli to prevent cognitive overload',
      'A conscious breathing exercise mimicking slow brainwave frequencies',
      'The decay of auditory sensory cells under radiation fields'
    ],
    answerIndex: 1,
    explanation: 'Sensory gating is a subconscious neurological process of filtering out redundant environmental noise (like constant spacecraft fan hums), managed largely by the thalamus.',
    category: 'advanced'
  },
  {
    id: 90,
    question: 'How do "Circadian Rhythms" change inside a human subconscious when deprived of Earth\'s 24-hour solar day cues (such as in deep cave systems or deep space)?',
    options: [
      'They freeze permanently, forcing a random wake-sleep scramble',
      'They "free-run," naturally drifting to a cycle slightly longer than 24 hours (approx. 24.2 to 24.5 hours)',
      'They compress instantly to a high-speed 12-hour cycle',
      'They synchronize perfectly with the orbit speed of the ISS'
    ],
    answerIndex: 1,
    explanation: 'Deprived of sunlight-entrainment triggers, the human master pacemaker clock (SCN) free-runs, drifting slightly beyond 24 hours but maintaining organized long-term patterns.',
    category: 'advanced'
  },
  {
    id: 91,
    question: 'What cognitive bias causes astronomers to subconsciously match raw astronomical shapes to familiar terrestrial objects (like seeing a "Face on Mars")?',
    options: ['The Bandwagon Effect', 'Pareidolia (a form of Apophenia)', 'Anchoring Heuristic', 'The Dunning-Kruger Displaced Slope'],
    answerIndex: 1,
    explanation: 'Pareidolia is the psychological tendency of the human subconscious to perceive meaningful patterns (especially human faces) in random or ambiguous visual stimuli.',
    category: 'advanced'
  },
  {
    id: 92,
    question: 'What physiological shift in the subconscious regulation of vestibular balance causes "Space Adaptation Syndrome" (space sickness)?',
    options: [
      'The chemical breakdown of inner ear receptor fluids in stellar cold',
      'The mismatch of gravitational sensory input between the visual eyes and the weightless vestibular otolith organs',
      'The psychological fear of endless void atmospheres',
      'The elevation of cerebrospinal fluid pressure pushing on optic nerves'
    ],
    answerIndex: 1,
    explanation: 'In microgravity, the otolith organs no longer pull down as they do on Earth. The visual system sees normal rooms, but the vestibular system reports freefall, causing sensory conflict.',
    category: 'advanced'
  },
  {
    id: 93,
    question: 'What unique brainwave state, typically peaking at 4-8 Hz, is associated with deep hypnagogia, subconscious memory consolidation, and high-creativity cosmic imagination?',
    options: ['Beta Waves', 'Theta Waves', 'Delta Waves', 'High Gamma Waves'],
    answerIndex: 1,
    explanation: 'Theta brainwave states are active during deep meditation, light sleep, and hypnotic states, serving as a gateway to subconscious memory retrieval and innovative pattern synthesis.',
    category: 'advanced'
  },
  {
    id: 94,
    question: 'What is "Neuroplasticity" adaptation under microgravity conditions?',
    options: [
      'The physical expansion of individual neurons due to vacuum expansion',
      'The subconscious remodeling of motor and sensory neural tracks as the brain learns to navigate a three-dimensional floating environment',
      'The temporary shutdown of synapse connections to conserve battery chemicals',
      'The transformation of white brain matter to grey cells under radiation'
    ],
    answerIndex: 1,
    explanation: 'The human brain is highly adaptive. Deprived of normal walking cues, it reorganizes its sensory-motor maps to coordinate zero-G movement, establishing new neural branch connections.',
    category: 'advanced'
  },
  {
    id: 95,
    question: 'In psychological survival studies, what is "Third Quarter Effect" reported by crews in isolated and confined environments?',
    options: [
      'A sharp increase in motor reflex speeds during the final quarter of missions',
      'A psychological phenomenon where morale and interpersonal relations drop mid-way through a long mission, regardless of total duration',
      'The physical illusion of planetary systems appearing compressed during late night hours',
      'The collective craving for Earth food after exactly three months of space rations'
    ],
    answerIndex: 1,
    explanation: 'Confined researchers (in submarines or Antarctic bases) of long duration exhibit a psychological decline in motivation and group cohesion once they pass the midpoints of isolation.',
    category: 'advanced'
  },
  {
    id: 96,
    question: 'What mental process represents the conscious observation and regulation of one\'s own subconscious cognitive systems (such as self-correcting a bias in star analysis)?',
    options: ['Semantic Priming', 'Metacognition', 'Subliminal Gating', 'Retrograde Extrapolations'],
    answerIndex: 1,
    explanation: 'Metacognition is "thinking about thinking," enabling astronauts and scientists to monitor their own mental fatigue, emotional biases, and logical processes.',
    category: 'advanced'
  },
  {
    id: 97,
    question: 'According to sleep science, what primary chemical messenger compiles dream scripts in the subconscious by binding to serotonin pathways during REM sleep?',
    options: ['Adrenaline', 'DMT (Dimethyltryptamine) / Endogenous Neurotransmitters', 'Insulin', 'Thyroxine'],
    answerIndex: 1,
    explanation: 'REM sleep features rapid firing of serotonin-related checkpoints in the brain stem and cerebral cortex, triggering dream events and high associations of emotional/experiential elements.',
    category: 'advanced'
  },
  {
    id: 98,
    question: 'How does long-term isolation in space affect the brain\'s "Hippocampus" according to extreme environment neurology?',
    options: [
      'It increases physical size to store the vastness of space coordinates',
      'It can undergo structural atrophy and reduction in neurogenesis due to chronic stress, sensory monotony, and lack of diverse physical interaction',
      'It switches memory tracks to retrieve childhood events exclusively',
      'It solidifies into rigid, non-flexible mineral structures'
    ],
    answerIndex: 1,
    explanation: 'Sensory deprivation and social monotony lead to drop-offs in brain-derived neurotrophic factors (BDNF), triggering hippocampal atrophy that impairs spatial navigation and memory.',
    category: 'advanced'
  },
  {
    id: 99,
    question: 'What sensory phenomenon describes the rare subconscious integration where an astronomer "hears" the colors of a nebula or "sees" the frequencies of radio waves?',
    options: ['Aphasia', 'Synesthesia', 'Anosmia', 'Micropsia'],
    answerIndex: 1,
    explanation: 'Synesthesia is a neurological condition where stimulation of one cognitive pathway leads to involuntary experiences in a secondary sensory pathway, such as crossing sound and light perception.',
    category: 'advanced'
  },
  {
    id: 100,
    question: 'What is the "Chronostasis" illusion, where the subconscious brain misinterprets the duration of the very first second you look at a ticking space clock?',
    options: [
      'The mechanical lag of digital quartz crystals under battery shift',
      'The perceived "stopped-clock" effect, where the first second appears abnormally stretched because the brain pre-dates visual perception during saccadic eye movements',
      'Earth spinning slower due to gravitational tidal drag from the Moon',
      'A lapse of consciousness triggered by high magnetic fields'
    ],
    answerIndex: 1,
    explanation: 'Chronostasis is a temporal illusion where the brain cuts out blurry visual input during rapid eye movements (saccades) and fills in the gap with the next resting image, stretching that first second.',
    category: 'advanced'
  }
];
