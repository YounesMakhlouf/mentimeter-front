function getRandomInt(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
}

const adj_by_letter = {
    "A": ["Adamant", "Adroit", "Amatory", "Animistic", "Antic", "Arcadian", "Attractive", "Accompanying", "Abundant", "Affected", "Annoying", "Artificial", "Auspicious", "Advantageous", "Aromatic", "Affectionate"],
    "U": ["Unyielding", "Unpleasant", "Unkempt", "Uncompromising", "Ubiquitous", "Uxorious"],
    "R": ["Resourceful", "Rebellious", "Resentful", "Restrained", "Rude", "Rebarbative", "Repellent", "Recalcitrant", "Resistant", "Redolent", "Rhadamanthine", "Risible", "Ruminative", "Reticent", "Restless", "Ravenous"],
    "S": ["Sexual", "Serene", "Sarcastic", "Shabby", "Spontaneously-combustible", "Subtle", "Seductive", "Simple", "Stilted", "Superficial", "Stupid", "Suspended", "Steep", "Speedy", "Strict", "Sagacious", "Salubrious", "Sartorial", "Sclerotic", "Serpentine", "Spasmodic", "Strident", "Sensitive", "Sharp", "Swollen"],
    "Q": ["Quality", "Quarrelsome", "Querulous", "Quiescent", "Queasy", "Quenched", "Questioning", "Quiet", "Quixotic", "Quizzical", "Quaint", "Quick"],
    "C": ["Clownish", "Crude", "Calamitous", "Caustic", "Corrosive", "Cerulean", "Comely", "Concomitant", "Contumacious", "Corpulent", "Crapulous", "Conspicuous", "Contemptuous", "Corrupting", "Cranky", "Contemplative", "Closemouthed", "Cohesive", "Compliant"],
    "F": ["Frolicsome", "Foreboding", "Flagrant", "Fastidious", "Feckless", "Fecund", "Friable", "Fulsome", "Frugal", "Flattering"],
    "B": ["Baleful", "Bellicose", "Bilious", "Boorish", "Balanced", "Brittle", "Biting", "Blunt", "Banal", "Benevolent"],
    "D": ["Deadly", "Disastrous", "Defamatory", "Didactic", "Dilatory", "Dowdy", "Detestable", "Delicate", "Dull", "Discreet", "Deceptive", "Discerning", "Discordant", "Distinct", "Devastating", "Devoted"],
    "P": ["Peevish", "Prevalent", "Peculiar", "Prolific", "Proud", "Persistent", "Puerile", "Playful", "Pretentious", "Pungent", "Parsimonious", "Pendulous", "Pernicious", "Pervasive", "Petulant", "Platitudinous", "Precipitate", "Propitious", "Puckish", "Penetrating", "Pompous"],
    "I": ["Insensitive", "Immoderate", "Irresponsible", "Inventive", "Incendiary", "Inflammatory", "Insidious", "Insolent", "Impudent", "Intransigent", "Inveterate", "Invidious", "Irksome", "Incisive", "Indecisive", "Injurious", "Ill-humored", "Impish", "Inactive", "Irritating", "Intermittent", "Inordinate", "Insatiable"],
    "O": ["Obese", "Old-fashioned", "Overdone", "Obnoxious", "Obtuse", "Obstinate", "Obtrusively"],
    "M": ["Malicious", "Meticulous", "Mannered", "Mendacious", "Meretricious", "Minatory", "Menacing", "Mordant", "Munificent"],
    "T": ["Tardy", "Talkative", "Theatrical", "Treacherous", "Tearful", "Transparent", "Tempting", "Taciturn", "Tenacious", "Tremulous", "Trembling", "Timid", "Trenchant", "Turbulent", "Tempestuous", "Turgid"],
    "E": ["Efficacious", "Effulgent", "Egregious", "Endemic", "Equanimous", "Execrable", "Effusive", "Excessive", "Envious", "Evocative", "Excitable"],
    "N": ["Native", "Naive", "Nefarious", "Noxious", "Nervous"],
    "W": ["Wretched", "Weak", "Wordy", "Wicked", "Widespread", "Whining", "Wise", "Winding", "Wily", "Wheedling", "Withering"],
    "G": ["Garrulous", "Guileless", "Gustatory", "Generous", "Green", "Glib"],
    "H": ["Heuristic", "Histrionic", "Hubristic", "Hot", "Habitual", "Harmful", "Healthful", "Harsh"],
    "J": ["Jejune", "Jocular", "Jesting", "Judicious", "Jealous", "Jittery", "Jocose", "Jocund", "Joking", "Jolly", "Jovial", "Joyful", "Joyous", "Jubilant", "Judgmental", "Jumpy", "Juvenile", "Jamaican"],
    "L": ["Lachrymose", "Limpid", "Loquacious", "Luminous", "Lavish", "Laughable", "Lame", "Lamentable", "Late", "Laudable", "Laughing", "Lazy", "Learned", "Leery", "Lethargic", "Levelheaded", "Liberal", "Light", "Lighthearted", "Lightsome", "Likable", "Likeable", "Lionhearted", "Lissom", "Lissome", "Listless", "Lithe", "Lithesome", "Lively", "Loathly", "Loathsome", "Logical", "Logy", "Lonely", "Lonesome", "Loutish", "Lovable", "Lovely", "Lovesome", "Loving", "Lowbred", "Loyal", "Lucky", "Lanky", "Large", "Lean", "Livid", "Local", "Long", "Loose", "Lost", "Lustrous"],
    "V": ["Verdant", "Voluble", "Voracious", "Vague", "Vain", "Valiant", "Valorous", "Vehement", "Venal", "Vengeful", "Verbose", "Versatile", "Vexatious", "Vexed", "Vexing", "Vicious", "Victorious", "Vigilant", "Vile", "Villainous", "Vindictive", "Virtuous", "Visionary", "Vivacious", "Vivid", "Volcanic", "Vulgar", "Vulnerable", "Valuable", "Venerable", "Vernal", "Vivibrant", "Vigorous", "Viscidviscous", "Voguish", "Voluptuous", "Vietnamese"],
    "Z": ["Zealous", "Zany", "Zestful", "Zesty", "Zippy", "Zaftig", "Zoftig"],
    "X": ["Xenophobic", "Xenodochial", "Xenial"],
}

const jobs = ["Curator", "Designer", "Boilermaker", "Podiatrist", "Economist", "Shampooer", "Firefighter", "Logistician", "Fundraiser", "Bailiff", "Upholsterer", "Prosthodontist", "Legislator", "Geographer", "Historian", "Telemarketer", "Psychiatrist", "Librarian", "Lawyer", "Carpenter", "Barber", "Cook", "Statistician", "Roofer", "Machinist", "Forester", "Physicist", "Concierge", "Cashier", "Editor", "Surveyor", "Optometrist", "Faller", "Hydrologist", "Drafter", "Veterinarian", "Actor", "Dancer", "Dentist", "Epidemiologist", "Model", "Sociologist", "Teller", "Audiologist", "Woodworker", "Therapist", "Phlebotomist", "Rigger", "Archivist", "Dispatcher", "Millwright", "Chemist", "Photographer", "Pipelayer", "Dishwasher", "Astronomer", "Taper", "Orderlie", "Engineer", "Anesthesiologist", "Choreographer", "Announcer", "Orthodontist", "Bartender", "Stonemason", "Electrician", "Paperhanger", "Embalmer", "Mathematician", "Baker", "Actuarie", "Chiropractor", "Psychologist", "Clerg", "Surgeon", "Glazier", "Counselor", "Microbiologist", "Pharmacist"]

function generateName() {
    const job = jobs[getRandomInt(jobs.length)]
    const letter = job.charAt(0) as keyof typeof adj_by_letter;
    const adjs = adj_by_letter[letter]
    const adj = adjs[getRandomInt(adjs.length)]
    const name = `The ${adj} ${job}`
    return name
}

export const randomPseudo = generateName()