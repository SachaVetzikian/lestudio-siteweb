// Témoignages réels du site, triés par richesse : vidéo → photo → texte.
// Citations verbatim reprises telles quelles depuis src/content/temoignages/
// (marqueurs ** de mise en gras retirés) — non reformulées.
export type ReviewVariant = "video" | "photo" | "text";

export type Review = {
  id: string;
  name: string;
  affiliation: string;
  quote: string;
  variant: ReviewVariant;
  imageSrc?: string;
  thumbnailSrc?: string;
  videoSrc?: string;
  /** Still frame shown behind the play button before the video is started. */
  posterSrc?: string;
};

export const reviews: Review[] = [
  // --- Vidéo (2) ---
  {
    id: "julien-roman",
    name: "Julien Roman",
    affiliation: "Créateur de contenu Crypto",
    variant: "video",
    videoSrc: "/assets/uploads/temoignage-julien-roman.mp4",
    posterSrc: "/assets/uploads/photo-julien-roman.webp",
    thumbnailSrc: "/assets/uploads/photo-julien-roman.webp",
    quote:
      "Mon site internet est monté en gamme, j'ai eu que des supers retours, franchement merci beaucoup pour le travail. J'ai eu beaucoup de demandes qui n'étaient pas incluses dans la prestation et tu les as dépassées sans souci. Ce qui a été appréciable, c'est la prise de lead car je manque cruellement de temps, et tu n'as pas attendu d'avoir des retours pour avancer. J'ai que des bons retours sur mon nouveau site. Merci encore Sacha !",
  },
  {
    id: "florian-piat",
    name: "Florian Piat",
    affiliation: "E-commerçant · Caalme",
    variant: "video",
    videoSrc: "/assets/uploads/temoignage-florian-piat.mp4",
    posterSrc: "/assets/uploads/photo-florian-piat.webp",
    thumbnailSrc: "/assets/uploads/photo-florian-piat.webp",
    quote:
      "Tes recommandations stratégiques et ton expertise technique en UX/UI ont été remplies de valeur. Tu as non seulement agi en tant que prestataire, mais tu t'es véritablement investi dans le succès de notre projet, comme si c'était le tien. C'est une qualité rare et précieuse que je tiens à souligner.",
  },

  // --- Photo (6) ---
  {
    id: "fatima-bouhelalem",
    name: "Fatima Bouhelalem",
    affiliation: "Directrice UX · Yves Rocher",
    variant: "photo",
    imageSrc: "/assets/uploads/photo-fatima-bouhelalem.webp",
    thumbnailSrc: "/assets/uploads/photo-fatima-bouhelalem.webp",
    quote:
      "Sacha, en tant qu'UX/UI designer au sein de mon équipe chez Yves Rocher, a rapidement saisi les enjeux du e-commerce de la marque. Grâce à son expertise et à sa capacité d'analyse, il a su assimiler les comportements propres à nos divers marchés, afin de concevoir des parcours optimaux pour nos clients. Sa créativité exceptionnelle se manifeste particulièrement lors de briefs complexes. Sa qualité première réside dans son approche pédagogique, permettant même aux moins expérimentés de s'impliquer pleinement lors des ateliers qu'il a animés.",
  },
  {
    id: "teddy-herbaut",
    name: "Teddy Herbaut",
    affiliation: "CMO · Arrago",
    variant: "photo",
    imageSrc: "/assets/uploads/photo-teddy-herbaut.webp",
    thumbnailSrc: "/assets/uploads/photo-teddy-herbaut.webp",
    quote:
      "Si vous cherchez un professionnel réactif et compétent, c'est par ici. Sacha est un spécialiste qui prend le temps d'écouter et comprendre les demandes de sa clientèle (ce qui est plutôt rare aujourd'hui). Je suis très satisfait de ses prestations tant sur le plan UI que UX. Son offre par abonnement est pratique et à un tarif plus que correct.",
  },
  {
    id: "romain-morice",
    name: "Romain Morice",
    affiliation: "Fondateur · Triumvirat",
    variant: "photo",
    imageSrc: "/assets/uploads/photo-romain-triumvirat.webp",
    thumbnailSrc: "/assets/uploads/photo-romain-triumvirat.webp",
    quote:
      "Sacha est un véritable professionnel qui intègre parfaitement les besoins de ses clients et s'adapte à leur rythme. C'est toujours un plaisir de travailler avec LeStudio.",
  },
  {
    id: "matthieu-caffin",
    name: "Matthieu C.",
    affiliation: "Directeur · Cargo School",
    variant: "photo",
    imageSrc: "/assets/uploads/photo-matthieu-caffin.webp",
    thumbnailSrc: "/assets/uploads/photo-matthieu-caffin.webp",
    quote:
      "Une très bonne expérience sur toute la durée du projet. Sacha a été à l'écoute, force de proposition et efficace à chaque étape. Très satisfait du résultat final !",
  },
  {
    id: "killian-olivier",
    name: "Killian Olivier",
    affiliation: "Fondateur · Contestio",
    variant: "photo",
    imageSrc: "/assets/uploads/photo-killian-olivier.webp",
    thumbnailSrc: "/assets/uploads/photo-killian-olivier.webp",
    quote:
      "Sacha a fait un super travail en prototypant notre webapp. Il a su transformer nos idées en une interface utilisateur intuitive. Professionnel, réactif et à l'écoute, il a grandement facilité notre projet. Nous le recommandons vivement pour ses compétences en UX/UI design.",
  },
  {
    id: "raphael-ghikh",
    name: "Raphaël Ghikh",
    affiliation: "Fondateur · Elevia",
    variant: "photo",
    imageSrc: "/assets/uploads/photo-raphael-elevia.webp",
    thumbnailSrc: "/assets/uploads/photo-raphael-elevia.webp",
    quote:
      "Sacha a réalisé la landing page de mon SaaS en cours de développement et j'en suis ravi ! Il est force de proposition, talentueux et à l'écoute. C'était un vrai plaisir que de lui confier cette mission et à l'avenir je referai appel à ses services pour sûr. Si vous avez besoin d'un site, vous pouvez foncer les yeux fermés !",
  },

  // --- Texte seul (17) ---
  {
    id: "farah-kraled",
    name: "Farah Kraled",
    affiliation: "Product Designer · Spideo",
    variant: "text",
    quote:
      "Précis, efficace, fluide : on a pu atteindre nos objectifs de refonte de la toolbox et d'ajout de la nouvelle feature sur notre SaaS. Autrement, bonne expérience dans l'ensemble, délais respectés, réactivité, feedbacks respectés, livrables propres... Merci, on refera appel à toi !",
  },
  {
    id: "yoann-curt",
    name: "Yoann Curt",
    affiliation: "Fondateur · Magicbook",
    variant: "text",
    quote:
      "L'offre de Sacha est vraiment top ! J'ai fait appel à lui pour designer une app mobile. Il a travaillé avec nous pendant 1 mois à coup de quelques heures par jour. Ça permet de faire mâturer les idées entre chaque session et ça se voit. Les choses sont posées dès le début, on peut suivre l'avancement et faire des retours en instantané. J'avais une petite idée de ce que je voulais avoir comme rendu mais il a sublimé la chose. Si vous cherchez un super designer, n'hésitez plus, je recommande Sacha sans hésiter.",
  },
  {
    id: "dylan-nchoh",
    name: "Dylan Nchoh",
    affiliation: "Co-fondateur · VFoot",
    variant: "text",
    quote:
      "Je suis ravi d'avoir pu travailler avec Sacha pour mon projet personnel. Quelqu'un de très disponible, qui n'hésite pas à apporter ses idées, donner sa vision tout au long du processus de création, et à l'écoute. On sent qu'il a à cœur de satisfaire le client et c'est rare de nos jours.",
  },
  {
    id: "maxence-jollivet",
    name: "Maxence Jollivet",
    affiliation: "Fondateur · Harvest Hub",
    variant: "text",
    quote:
      "Sacha a la capacité de travailler dans des délais très serrés tout en proposant la meilleure qualité possible. Son niveau en UX/UI est stratosphérique : une veille permanente et complète des compétiteurs, un savoir d'habitudes de consommation digitales. Il dispose réellement d'une baguette magique afin de transformer vos clients, multiplier vos ventes et enfin donner cet effet wow. Je recommande !",
  },
  {
    id: "eddy-castets",
    name: "Eddy Castets",
    affiliation: "Entrepreneur",
    variant: "text",
    quote:
      "Sacha a été extrêmement bienveillant, il m'a écouté et conseillé concernant mes problématiques. C'est un vrai crack en UX/UI. Merci Sacha pour ton travail !",
  },
  {
    id: "geoffrey-bourcois",
    name: "Geoffrey Bourcois",
    affiliation: "Product Manager",
    variant: "text",
    quote:
      "Sacha est super disponible et maîtrise parfaitement les problématiques design. Il a fourni un travail de qualité sur un délai assez court, ce fut un plaisir de le solliciter et de collaborer avec lui.",
  },
  {
    id: "david-bellaiche",
    name: "David Bellaïche",
    affiliation: "CEO · Mediapronos",
    variant: "text",
    quote:
      "Travail sérieux et professionnel. Livraison dans les délais. À l'écoute.",
  },
  {
    id: "kevin-breban",
    name: "Kevin Breban",
    affiliation: "Développeur Freelance",
    variant: "text",
    quote:
      "Ayant collaboré avec Sacha plus de deux ans, je peux affirmer que ses compétences en UX/UI design sont au top. Il saura toujours trouver la meilleure solution que ce soit en termes d'expérience utilisateur ou d'identité visuelle. Bref, je recommande.",
  },
  {
    id: "nawel-m",
    name: "Nawel M.",
    affiliation: "Coach en développement personnel",
    variant: "text",
    quote:
      "Sacha m'a accompagné dans le lancement de mon activité de coaching sur Instagram. Son expertise technique et humaine a été précieuse pour créer une identité visuelle percutante et une stratégie éditoriale efficace. Je recommande vivement sa collaboration ! Merci Sacha.",
  },
  {
    id: "arnaud-roncari",
    name: "Arnaud Roncari",
    affiliation: "Développeur Freelance",
    variant: "text",
    quote:
      "Que ce soit pour le branding de votre LinkedIn, ou pour une refonte visuelle de votre site, Sacha est l'UX/UI dont vous avez besoin. Son travail est qualitatif. La communication est top et j'ai même eu les résultats en avance ! N'hésitez pas !",
  },
  {
    id: "michele-chappert",
    name: "Michèle Chappert",
    affiliation: "Coach en nutrition · Solopreneur",
    variant: "text",
    quote:
      "Sacha est un expert en design mais ses compétences vont encore plus loin. Il m'a accompagné tout au long de mon lancement : landing page, identité visuelle ainsi que la stratégie pour mes réseaux sociaux. Merci pour ta proximité et ton professionnalisme. Je ne peux que le recommander.",
  },
  {
    id: "hugo-penazzo",
    name: "Hugo Penazzo",
    affiliation: "Co-fondateur · Squasar Club",
    variant: "text",
    quote:
      "Notre collaboration avec Sacha a été incroyable. Dès le début, j'ai pu sentir son expertise en design et ses recommandations UX ont été essentielles pour le nouveau site de notre agence. La mission consistait à créer le site vitrine de notre agence, et Sacha l'a parfaitement intégré sur Webflow. Un grand merci, Sacha, je ne peux que te recommander !",
  },
  {
    id: "rod-goupil",
    name: "Rod Goupil",
    affiliation: "Client particulier",
    variant: "text",
    quote:
      "Le studio a réalisé pour nous un chalet à Passy. Ils sont très réactifs et créatifs. La collaboration a été agréable et rassurante.",
  },
  {
    id: "blanche",
    name: "Blanche",
    affiliation: "Cliente",
    variant: "text",
    quote:
      "Sacha et son équipe nous ont accompagnés pour la refonte de notre site internet. Le projet était ambitieux : faire de notre site un outil puissant de conversion, dans les premiers du secteur, avec un respect de notre identité de marque. Le travail de Sacha et des autres intervenants du projet (DA, UI, SEO...) a dépassé nos attentes ! Merci à eux !",
  },
  {
    id: "maxence-birembaut",
    name: "Maxence Birembaut",
    affiliation: "Développeur",
    variant: "text",
    quote:
      "J'ai travaillé avec Sacha pendant plusieurs mois. On a bossé ensemble sur un SaaS (Elevia), une app mobile (RankZone) et un site e-commerce (Riviera Club). Sur chaque projet, il m'a accompagné étape par étape, en m'aidant à prendre les bonnes décisions, autant en UX qu'en UI. Il m'a aidé à structurer mes méthodes de travail pour que je sois plus professionnel et convaincant. Humainement, c'est quelqu'un de très cool, à l'écoute, et toujours dans une démarche d'aide et de partage. J'ai appris énormément à son contact, et je recommande Sacha sans hésiter.",
  },
  {
    id: "rankzone",
    name: "RankZone",
    affiliation: "Application mobile",
    variant: "text",
    quote:
      "Je tiens à exprimer toute ma gratitude envers Sacha pour son implication remarquable dans la réalisation de la maquette de mon projet. Dès le départ, il a su comprendre mes attentes, traduire mes idées avec précision et donner vie à une vision qui me tenait particulièrement à cœur. Le résultat est au-delà de mes espérances : tout me convient parfaitement, tant dans la qualité du travail que dans l'attention portée aux détails. Au-delà du rendu final, c'est aussi l'approche humaine, la disponibilité et le sérieux de Sacha qui m'ont marqué. Travailler avec lui a été une expérience fluide, constructive et motivante. J'ai senti une réelle volonté de s'investir pleinement, de proposer des solutions pertinentes et de conduire ce début de projet avec rigueur et enthousiasme. C'est une personne en qui vous pouvez avoir entière confiance : foncez sans hésiter, vous ne serez pas déçus.",
  },
  {
    id: "lina",
    name: "Lina",
    affiliation: "Cliente",
    variant: "text",
    quote:
      "J'ai pu collaborer avec Sacha sur un projet et je recommande les yeux fermés. Il est pro, à l'écoute, réactif et toujours de bonne humeur. Il comprend vite les besoins et apporte des solutions efficaces, je recommande !",
  },
];
