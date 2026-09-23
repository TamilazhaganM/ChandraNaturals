/**
 * Centralized Product Data for Chandra Naturals MVP
 * Contains ONLY products that exist in the local src/assets folders.
 * Pure, clean product names without buzzwords (no heritage, royal, handcrafted).
 */

// 1. Thokku's Assets
import tomatoMixImg from "../assets/Thokku's/tomato_mix_.jpg";
import curryLeafMixImg from "../assets/Thokku's/curry_leaf_mix_.jpg";
import mudakathanMixImg from "../assets/Thokku's/mudakathan_mix_.jpg";
import pirandaiMixImg from "../assets/Thokku's/pirandai_mix_.jpg";
import mulaikattiyaPayaruMixImg from "../assets/Thokku's/mulaikattiya_payaru_mix_.jpg";
import poonduMilaguMixImg from "../assets/Thokku's/poondu_milagu_.jpg";
import mudavattukalMixImg from "../assets/Thokku's/mudavattukal_mix.jpg";
import onionMixImg from "../assets/Thokku's/onion_mix_.jpg";
import prawnThokkuImg from "../assets/Thokku's/prawn_thokku_.jpg";
import vathakuzhambuMixImg from "../assets/Thokku's/vathakuzhambu_mix_.jpg";

// 2. Health Mix & Ghee Assets
import healthMixImg from "../assets/Health Mix & Ghee/hd_health_mix_1789817240085.jpg";
import pureCowGheeImg from "../assets/Health Mix & Ghee/hd_pure_cow_ghee_1789817523651.jpg";
import karuppukavuniPedestalImg from "../assets/Health Mix & Ghee/karuppukavuni_pedestal_.jpg";

// 3. Dosa Batters Assets
import poongarDosaImg from "../assets/Dosa Batters/hd_poongar_dosa_1789817696629.jpg";
import rathasaliDosaImg from "../assets/Dosa Batters/hd_rathasali_dosa_1789817349310.jpg";
import thillanayagamDosaImg from "../assets/Dosa Batters/hd_thillanayagam_dosa_1789817295945.jpg";

// 4. Masalas & Spice Powders Assets
import corianderPowderImg from "../assets/Masalas & Spice Powders/hd_coriander_powder_1790169993156.jpg";
import garamMasalaImg from "../assets/Masalas & Spice Powders/hd_garam_masala_1790170100941.jpg";
import mudavanPodiImg from "../assets/Masalas & Spice Powders/hd_mudavan_podi_1789817926384.jpg";
import murungaiKeeraiPodiImg from "../assets/Masalas & Spice Powders/hd_murungai_keerai_podi_1789817878222.jpg";
import pirandaiIdliPodiImg from "../assets/Masalas & Spice Powders/hd_pirandai_idli_podi_1790171319996.jpg";
import sambarPowderImg from "../assets/Masalas & Spice Powders/hd_sambar_powder_1790171374821.jpg";
import kashmiriChiliPowderImg from "../assets/Masalas & Spice Powders/kashmiri-chili-powder-hd.jpg";

// 5. Banners Assets
import bannerTomatoPoondu from "../assets/Banners/Tomato and poondu.png";
import bannerPirandaiMudakathan from "../assets/Banners/Pirandai and mudakathan.png";
import bannerGhee from "../assets/Banners/Ghee.png";

export const productCategories = [
  {
    id: "thokku",
    name: "Thokku Varieties",
    subtitle: "Slow-Cooked Relishes",
    tagline: "Pounded spices, sun-cured aromatics, and cold-pressed gingelly oil.",
    description: "Every batch of our thokku is slow-simmered in small pots using traditional recipes.",
    image: tomatoMixImg
  },
  {
    id: "health-mix-ghee",
    name: "Health Mix & Ghee",
    subtitle: "Pure Nourishment & Ghee",
    tagline: "Sprouted grains and cow ghee slow-churned from curd.",
    description: "Nourish your family with sprouted multi-grain mixes, black rice porridge, and pure cow ghee.",
    image: pureCowGheeImg
  },
  {
    id: "dosa-batters",
    name: "Dosa Batters",
    subtitle: "Fermented Batters",
    tagline: "Stone-ground heirloom rice naturally fermented overnight.",
    description: "Batters prepared with indigenous paddy varieties like Poongar, Rathasali, and Thillanayagam.",
    image: rathasaliDosaImg
  },
  {
    id: "masalas-spices",
    name: "Masalas & Spice Powders",
    subtitle: "Spice Blends & Podis",
    tagline: "Stone-ground whole spice blends roasted on iron tawa.",
    description: "Masala blends, single-origin ground spices, and rice & idli podis stone-ground fresh.",
    image: sambarPowderImg
  },
  {
    id: "skin-hair",
    name: "Skin and Hair Care",
    subtitle: "Botanical Care",
    tagline: "Formulations from native medicinal plants.",
    description: "Botanical skincare and haircare crafted from native medicinal plants. Fresh batches coming soon!",
    image: murungaiKeeraiPodiImg
  },
  {
    id: "combos",
    name: "Combo Bundles",
    subtitle: "Value Packs & Sets",
    tagline: "Paired kitchen collections and gift packs.",
    description: "Combinations of our signature thokkus, pure cow ghee, batters, and spice podis.",
    image: bannerTomatoPoondu
  }
];

export const products = [
  // ==========================================
  // 1. THOKKU VARIETIES (10 Products from Assets)
  // ==========================================
  {
    id: "tomato-thokku",
    name: "Tomato Mix",
    category: "thokku",
    price: 1,
    compareAtPrice: 240,
    weight: "250g",
    weightOptions: [
      { label: "250g Glass Jar", multiplier: 1.0, price: 1 },
      { label: "500g Glass Jar", multiplier: 1.0, price: 1 },
      { label: "1 kg Family Pack", multiplier: 1.0, price: 1 }
    ],
    image: tomatoMixImg,
    shortDescription: "Country tomatoes slow-reduced until thick and fragrant with aromatic curry leaves.",
    description: "Sun-ripened indigenous country tomatoes reduced to a velvety, rich consistency over a slow flame. Infused with roasted spices, curry leaves, and cold-pressed sesame oil.",
    ingredients: ["Country Tomatoes", "Cold-Pressed Gingelly Oil", "Guntur Red Chilli", "Mustard Seeds", "Curry Leaves", "Tamarind Pulp", "Rock Salt", "Fenugreek", "Asafoetida"],
    howToUse: "An instant companion for idlis, rotis, poori, or mixed directly with steaming rice.",
    storage: "Keep in a cool, dry cupboard. Keep refrigerated once opened.",
    shelfLife: "6 Months from date of packing",
    isVeg: true,
    badge: "₹1 Live Test",
    available: true,
    rating: 4.9,
    reviewCount: 128
  },
  {
    id: "curry-leaf-thokku",
    name: "Curry Leaf Mix",
    category: "thokku",
    price: 260,
    compareAtPrice: 295,
    weight: "250g",
    image: curryLeafMixImg,
    shortDescription: "Fresh curry leaves slow-roasted with black pepper, cumin, and cold-pressed gingelly oil.",
    description: "Rich in natural iron and antioxidants, prepared using fresh curry leaves roasted slowly with stone-ground spices, tamarind, and wood-pressed oil.",
    ingredients: ["Fresh Curry Leaves", "Cold-Pressed Gingelly Oil", "Black Pepper", "Cumin Seeds", "Tamarind Pulp", "Guntur Red Chilli", "Himalayan Rock Salt", "Asafoetida"],
    howToUse: "Mix with hot steamed rice and melted cow ghee. Pairs wonderfully with curd rice and idlis.",
    storage: "Store in a cool, dry place. Refrigerate after opening.",
    shelfLife: "8 Months from date of packing",
    isVeg: true,
    badge: "Iron Rich",
    available: true,
    rating: 4.9,
    reviewCount: 94
  },
  {
    id: "mudakathan-thokku",
    name: "Mudakathan Mix",
    category: "thokku",
    price: 270,
    compareAtPrice: 310,
    weight: "250g",
    image: mudakathanMixImg,
    shortDescription: "Joint-care medicinal greens sautéed with shallots, tamarind, and cold-pressed gingelly oil.",
    description: "Mudakathan (Balloon Vine) is used in traditional wellness for joint comfort. Simmered with country tamarind, shallots, and roasted spices.",
    ingredients: ["Fresh Mudakathan Leaves", "Cold-Pressed Gingelly Oil", "Small Onions (Shallots)", "Tamarind Extract", "Red Chilli", "Roasted Fenugreek", "Mustard", "Rock Salt"],
    howToUse: "Toss with hot rice, spread over warm dosas, or enjoy with idlis and porridge.",
    storage: "Store in a cool dry area. Refrigerate after opening.",
    shelfLife: "8 Months from date of packing",
    isVeg: true,
    badge: "Joint Care",
    available: true,
    rating: 5.0,
    reviewCount: 112
  },
  {
    id: "pirandai-thokku",
    name: "Pirandai Mix",
    category: "thokku",
    price: 280,
    compareAtPrice: 320,
    weight: "250g",
    image: pirandaiMixImg,
    shortDescription: "Tender adamant creeper stems roasted with whole spices to enhance gut health and bone strength.",
    description: "Pirandai is celebrated for digestion and bone wellness. Tender stems are roasted with tamarind and stone-ground spices in cold-pressed sesame oil.",
    ingredients: ["Tender Pirandai Stems", "Cold-Pressed Sesame Oil", "Tamarind Pulp", "Red Chillies", "Urad Dal", "Mustard Seeds", "Fenugreek", "Rock Salt", "Asafoetida"],
    howToUse: "Consume 1 spoonful with hot rice and ghee as the first course of your meal.",
    storage: "Keep in a cool dry place away from moisture. Refrigerate once opened.",
    shelfLife: "9 Months from date of packing",
    isVeg: true,
    badge: "Gut Health",
    available: true,
    rating: 4.9,
    reviewCount: 146
  },
  {
    id: "poondu-milagu-thokku",
    name: "Poondu Milagu",
    category: "thokku",
    price: 290,
    compareAtPrice: 330,
    weight: "250g",
    image: poonduMilaguMixImg,
    shortDescription: "Country garlic cloves simmered with black pepper, tamarind, and cold-pressed gingelly oil.",
    description: "Native garlic simmered with crushed Tellicherry black pepper, country tamarind, and wood-pressed gingelly oil. Warming and comforting.",
    ingredients: ["Country Garlic", "Tellicherry Black Pepper", "Cold-Pressed Gingelly Oil", "Tamarind Pulp", "Guntur Red Chilli", "Roasted Fenugreek", "Mustard Seeds", "Rock Salt", "Asafoetida"],
    howToUse: "Stir 1-2 spoons with hot steamed rice and melted ghee, or pair with idli and dosas.",
    storage: "Store in a cool, dry cupboard. Refrigerate after opening.",
    shelfLife: "9 Months from date of packing",
    isVeg: true,
    badge: "Immunity",
    available: true,
    rating: 5.0,
    reviewCount: 168
  },
  {
    id: "mulaikattiya-payaru-thokku",
    name: "Mulaikattiya Payaru Mix",
    category: "thokku",
    price: 250,
    compareAtPrice: 285,
    weight: "250g",
    image: mulaikattiyaPayaruMixImg,
    shortDescription: "Sprouted green gram cooked with native spices, shallots, and ginger-garlic for wholesome protein.",
    description: "Nutrient-dense sprouted whole moong beans cooked with spices, curry leaves, and unrefined oil. A protein-packed relish.",
    ingredients: ["Sprouted Green Gram (Moong)", "Cold-Pressed Oil", "Country Shallots", "Curry Leaves", "Ginger", "Garlic", "Whole Spices", "Rock Salt"],
    howToUse: "Enjoy with roti, curd rice, dosas, or with warm millets.",
    storage: "Store in cool dry cupboard. Refrigerate after opening.",
    shelfLife: "6 Months from date of packing",
    isVeg: true,
    badge: "Protein Rich",
    available: true,
    rating: 4.8,
    reviewCount: 88
  },
  {
    id: "mudavattukal-thokku",
    name: "Mudavattukal Mix",
    category: "thokku",
    price: 295,
    compareAtPrice: 340,
    weight: "250g",
    image: mudavattukalMixImg,
    shortDescription: "Mountain fern rhizome used in traditional medicine for knee joint relief and mobility.",
    description: "Mudavattukal (fern root) is used in traditional healing for joint ache and mobility. Simmered with country tamarind, gingelly oil, and roasted spices.",
    ingredients: ["Mudavattukal Kizhangu (Fern Rhizome)", "Cold-Pressed Gingelly Oil", "Country Shallots", "Tamarind Pulp", "Guntur Red Chilli", "Roasted Fenugreek", "Mustard Seeds", "Rock Salt", "Asafoetida"],
    howToUse: "Stir 1 spoonful into hot rice with cow ghee, or serve alongside steamed idlis and dosas.",
    storage: "Keep in a cool, dry place. Store refrigerated after opening.",
    shelfLife: "9 Months from date of packing",
    isVeg: true,
    badge: "Joint Care",
    available: true,
    rating: 5.0,
    reviewCount: 135
  },
  {
    id: "onion-thokku",
    name: "Onion Mix",
    category: "thokku",
    price: 260,
    compareAtPrice: 300,
    weight: "250g",
    image: onionMixImg,
    shortDescription: "Small onions slow-cooked to caramel sweetness with tangy tamarind and cold-pressed gingelly oil.",
    description: "Small onions (chinna vengayam) cooked in wood-pressed gingelly oil until caramelized, then spiced with roasted mustard, fenugreek, and red chillies.",
    ingredients: ["Small Onions (Shallots)", "Cold-Pressed Gingelly Oil", "Tamarind Extract", "Dry Red Chilli", "Mustard Seeds", "Curry Leaves", "Fenugreek", "Himalayan Rock Salt", "Asafoetida"],
    howToUse: "Pairs with curd rice, hot rotis, plain parathas, and breakfast idli-dosa.",
    storage: "Store in a cool dry area away from direct sunlight. Refrigerate once opened.",
    shelfLife: "8 Months from date of packing",
    isVeg: true,
    badge: "Popular Pick",
    available: true,
    rating: 4.9,
    reviewCount: 106
  },
  {
    id: "prawn-thokku",
    name: "Prawn Thokku",
    category: "thokku",
    price: 360,
    compareAtPrice: 420,
    weight: "250g",
    image: prawnThokkuImg,
    shortDescription: "Coastal bay prawns cooked in caramelized shallots, tomatoes, and stone-ground spices.",
    description: "Succulent bay prawns cooked in cold-pressed sesame oil with shallots, tomatoes, Tellicherry pepper, and Chettinad spices.",
    ingredients: ["Bay Prawns", "Cold-Pressed Gingelly Oil", "Shallots", "Tomatoes", "Ginger-Garlic Paste", "Fennel", "Tellicherry Black Pepper", "Red Chilli", "Curry Leaves", "Sea Salt"],
    howToUse: "Mix directly with hot steamed rice. Excellent spread for dosa, parotta, or roti.",
    storage: "Keep in a cool dry place. Keep refrigerated after opening.",
    shelfLife: "6 Months from date of packing",
    isVeg: false,
    badge: "Seafood Special",
    available: true,
    rating: 5.0,
    reviewCount: 172
  },
  {
    id: "vathakuzhambu-thokku",
    name: "Vathakuzhambu Mix",
    category: "thokku",
    price: 270,
    compareAtPrice: 310,
    weight: "250g",
    image: vathakuzhambuMixImg,
    shortDescription: "Sundakkai and manathakkali berries simmered in aged tamarind and wood-pressed sesame oil.",
    description: "Sundakkai (turkey berry) and Manathakkali (black nightshade) berries simmered in aged tamarind pulp with freshly ground spices.",
    ingredients: ["Sundakkai Vathal (Turkey Berry)", "Manathakkali Vathal", "Cold-Pressed Gingelly Oil", "Aged Tamarind Pulp", "Coriander Seeds", "Toor Dal", "Red Chilli", "Fenugreek", "Mustard", "Curry Leaves", "Jaggery", "Rock Salt", "Asafoetida"],
    howToUse: "Stir 1-2 tablespoons with hot steamed rice and melted cow ghee or sesame oil.",
    storage: "Store in a cool dry cupboard. Refrigerate after opening.",
    shelfLife: "9 Months from date of packing",
    isVeg: true,
    badge: "Feast Favorite",
    available: true,
    rating: 4.9,
    reviewCount: 118
  },

  // ==========================================
  // 2. HEALTH MIX & GHEE (3 Products from Assets)
  // ==========================================
  {
    id: "a2-bilona-ghee",
    name: "Pure Cow Ghee",
    category: "health-mix-ghee",
    price: 680,
    compareAtPrice: 750,
    weight: "350ml",
    weightOptions: [
      { label: "250ml Glass Jar", multiplier: 0.75, price: 510 },
      { label: "350ml Glass Jar", multiplier: 1.0, price: 680 },
      { label: "500ml Glass Jar", multiplier: 1.4, price: 950 },
      { label: "1 Litre Jar", multiplier: 2.7, price: 1840 }
    ],
    image: pureCowGheeImg,
    shortDescription: "Curd churned using wooden bilona, clarified over low fire with curry leaves.",
    description: "Prepared from indigenous cow milk using the Bilona method. Curd is hand-churned in wooden churners to extract makkhan, which is gently clarified over slow fire. Naturally granular texture.",
    ingredients: ["Pure Cultured Cow Milk Fat (A2 Ghee)", "Curry Leaf Infusion"],
    howToUse: "Drizzle 1-2 teaspoons over steaming rice, dosas, dal, or warm milk.",
    storage: "Store at room temperature in a dry place. Do not refrigerate.",
    shelfLife: "12 Months from date of packing",
    isVeg: true,
    badge: "Bilona Ghee",
    available: true,
    rating: 5.0,
    reviewCount: 230
  },
  {
    id: "sprouted-health-mix",
    name: "Health Mix",
    category: "health-mix-ghee",
    price: 340,
    compareAtPrice: 390,
    weight: "500g",
    weightOptions: [
      { label: "500g Pack", multiplier: 1.0, price: 340 },
      { label: "1 kg Pack", multiplier: 1.9, price: 650 }
    ],
    image: healthMixImg,
    shortDescription: "Sprouted finger millet, pearl millet, foxtail, roasted grams, almonds, and dry ginger.",
    description: "A multigrain porridge powder. Whole grains and millets are soaked, sprouted, solar-dried, roasted on iron tawa, and ground with cardamoms and dry ginger.",
    ingredients: ["Sprouted Ragi (Finger Millet)", "Sprouted Kambu (Pearl Millet)", "Thinai (Foxtail Millet)", "Sprouted Green Gram", "Roasted Bengal Gram", "Almonds", "Cashews", "Dry Ginger (Sukku)", "Green Cardamom"],
    howToUse: "Mix 2 tbsp with 200ml water or milk. Cook on medium heat for 3-5 mins until smooth porridge forms.",
    storage: "Store in an airtight container after opening. Protect from dampness.",
    shelfLife: "9 Months from date of packing",
    isVeg: true,
    badge: "Sprouted 14-Grain",
    available: true,
    rating: 4.9,
    reviewCount: 189
  },
  {
    id: "karuppu-kavuni-mix",
    name: "Karuppu Kavuni Mix",
    category: "health-mix-ghee",
    price: 360,
    compareAtPrice: 410,
    weight: "500g",
    image: karuppukavuniPedestalImg,
    shortDescription: "Black rice roasted and blended with sprouted millets, nuts, and dry ginger.",
    description: "Karuppu Kavuni (Black Rice) is rich in anthocyanin antioxidants. Ground with sprouted grains and spices for daily health.",
    ingredients: ["Karuppu Kavuni Rice", "Sprouted Ragi", "Sprouted Moong", "Almonds", "Cardamom", "Dry Ginger"],
    howToUse: "Boil 2 tablespoons in water or milk for 5 minutes to prepare porridge.",
    storage: "Store in an airtight container away from moisture.",
    shelfLife: "9 Months from date of packing",
    isVeg: true,
    badge: "Black Rice",
    available: true,
    rating: 5.0,
    reviewCount: 118
  },

  // ==========================================
  // 3. DOSA BATTERS (3 Products from Assets)
  // ==========================================
  {
    id: "poongar-dosa-batter",
    name: "Poongar Dosa Batter",
    category: "dosa-batters",
    price: 140,
    compareAtPrice: 165,
    weight: "1 kg Fresh Pouch",
    image: poongarDosaImg,
    shortDescription: "Naturally fermented batter made from Poongar red rice.",
    description: "Stone-ground using unpolished Poongar paddy and whole black urad dal. Naturally slow-fermented overnight without soda or yeast.",
    ingredients: ["Poongar Rice", "Whole Black Gram (Urad Dal)", "Fenugreek Seeds", "Water", "Rock Salt"],
    howToUse: "Spread over hot seasoned tawa. Drizzle cow ghee or sesame oil. Cook until golden and crispy.",
    storage: "Keep chilled in refrigerator (2°C - 5°C). Use within 5 days of delivery.",
    shelfLife: "5 Days refrigerated",
    isVeg: true,
    badge: "Red Rice Batter",
    available: true,
    rating: 5.0,
    reviewCount: 148
  },
  {
    id: "rathasali-dosa-batter",
    name: "Rathasali Dosa Batter",
    category: "dosa-batters",
    price: 150,
    compareAtPrice: 180,
    weight: "1 kg Fresh Pouch",
    image: rathasaliDosaImg,
    shortDescription: "Stone-ground red rice batter for crisp, fragrant dosas.",
    description: "Rathasali is an ancient red rice recorded in traditional wellness treatises. Stone-ground and fermented in small batches.",
    ingredients: ["Rathasali Red Rice", "Urad Dal", "Fenugreek Seeds", "Water", "Rock Salt"],
    howToUse: "Ladle onto cast iron tawa for thin crisp dosas or fluffy uttapams.",
    storage: "Keep refrigerated. Seal pouch tightly after each pour.",
    shelfLife: "5 Days refrigerated",
    isVeg: true,
    badge: "Red Rice Batter",
    available: true,
    rating: 4.9,
    reviewCount: 164
  },
  {
    id: "thillanayagam-dosa-batter",
    name: "Thillanayagam Dosa Batter",
    category: "dosa-batters",
    price: 135,
    compareAtPrice: 160,
    weight: "1 kg Fresh Pouch",
    image: thillanayagamDosaImg,
    shortDescription: "Indigenous paddy batter ground on stone grinders for light, fluffy, crispy dosas.",
    description: "Thillanayagam is an indigenous paddy celebrated for gentle digestion and earthy taste. Ground on granite stones with urad dal and fenugreek.",
    ingredients: ["Thillanayagam Rice", "Urad Dal", "Fenugreek Seeds", "Water", "Sea Salt"],
    howToUse: "Ideal for making crispy dosas, soft idlis, and paniyaram.",
    storage: "Keep refrigerated at 4°C. Consume fresh.",
    shelfLife: "5 Days refrigerated",
    isVeg: true,
    badge: "Traditional Batter",
    available: true,
    rating: 4.8,
    reviewCount: 92
  },

  // ==========================================
  // 4. MASALAS & SPICE POWDERS (7 Products from Assets)
  // ==========================================
  {
    id: "sambar-powder",
    name: "Sambar Powder",
    category: "masalas-spices",
    price: 180,
    compareAtPrice: 210,
    weight: "250g",
    image: sambarPowderImg,
    shortDescription: "Roasted blend of Byadgi chilli, coriander, cumin and curry leaves for rich sambar.",
    description: "Recipe using Byadgi red chillies for color, whole coriander and cumin roasted with urad and chana dal, then stone-ground to coarse powder.",
    ingredients: ["Byadgi Red Chilli", "Coriander Seeds", "Cumin", "Urad Dal", "Chana Dal", "Black Pepper", "Curry Leaves", "Turmeric", "Asafoetida"],
    howToUse: "Add 1-1.5 tsp per serving during sambar cooking. Also excellent in rasam and curries.",
    storage: "Keep in a dry airtight container away from moisture.",
    shelfLife: "12 Months from date of packing",
    isVeg: true,
    badge: "Spice Blend",
    available: true,
    rating: 4.9,
    reviewCount: 154
  },
  {
    id: "coriander-powder",
    name: "Coriander Powder",
    category: "masalas-spices",
    price: 120,
    compareAtPrice: 145,
    weight: "200g",
    image: corianderPowderImg,
    shortDescription: "Sun-dried whole coriander seeds stone-ground at low temperatures to lock in essential oils.",
    description: "Whole coriander seeds cleaned, sun-cured, and slowly stone-milled at cold temperatures to protect volatile oils.",
    ingredients: ["100% Pure Coriander (Malli) Seeds"],
    howToUse: "Essential base spice for curries, gravies, rasams, and marinades.",
    storage: "Store in an airtight container away from heat and sunlight.",
    shelfLife: "12 Months from date of packing",
    isVeg: true,
    badge: "Pure Spice",
    available: true,
    rating: 4.9,
    reviewCount: 88
  },
  {
    id: "garam-masala",
    name: "Garam Masala",
    category: "masalas-spices",
    price: 195,
    compareAtPrice: 230,
    weight: "100g",
    image: garamMasalaImg,
    shortDescription: "Whole spices dry-roasted on iron skillets for unmatched warmth and aroma.",
    description: "Stone-ground from whole green cardamom, black cardamom, Tellicherry pepper, cinnamon, star anise, cloves, and mace.",
    ingredients: ["Green Cardamom", "Black Cardamom", "Cinnamon", "Cloves", "Star Anise", "Mace", "Nutmeg", "Shahi Jeera", "Tellicherry Black Pepper", "Bay Leaves"],
    howToUse: "Pinch 1/2 tsp at the final stage of simmering curries or gravies.",
    storage: "Seal tightly after opening to preserve aroma.",
    shelfLife: "12 Months from date of packing",
    isVeg: true,
    badge: "Spice Blend",
    available: true,
    rating: 4.8,
    reviewCount: 97
  },
  {
    id: "mudavan-podi",
    name: "Mudavan Podi",
    category: "masalas-spices",
    price: 190,
    compareAtPrice: 220,
    weight: "150g",
    image: mudavanPodiImg,
    shortDescription: "Mountain fern root roasted with lentils, black pepper, and curry leaves for joint vitality.",
    description: "Gunpowder made with Mudavattukal (fern root), roasted grams, Tellicherry pepper, and cumin. Traditionally eaten with rice and ghee.",
    ingredients: ["Mudavattukal Kizhangu", "Roasted Chana Dal", "Urad Dal", "Tellicherry Black Pepper", "Cumin", "Curry Leaves", "Red Chilli", "Rock Salt", "Asafoetida"],
    howToUse: "Mix 1-2 spoons with steaming rice and warm ghee, or sprinkle over hot idlis and dosas.",
    storage: "Store in an airtight jar in a cool dry cabinet.",
    shelfLife: "9 Months from date of packing",
    isVeg: true,
    badge: "Rice Podi",
    available: true,
    rating: 5.0,
    reviewCount: 114
  },
  {
    id: "murungai-keerai-podi",
    name: "Murungai Keerai Podi",
    category: "masalas-spices",
    price: 175,
    compareAtPrice: 205,
    weight: "150g",
    image: murungaiKeeraiPodiImg,
    shortDescription: "Shade-dried drumstick leaves roasted with lentils, garlic, and red chillies.",
    description: "Tender moringa tree leaves shade-dried to retain natural nutrients, roasted with lentils, garlic cloves, and sesame.",
    ingredients: ["Moringa Leaves (Murungai)", "Roasted Urad Dal", "Roasted Chana Dal", "Garlic Cloves", "Red Chilli", "Cumin", "White Sesame Seeds", "Rock Salt", "Asafoetida"],
    howToUse: "Toss with hot rice and ghee or use with cold-pressed sesame oil for idli-dosa.",
    storage: "Keep in a cool dry place away from humidity.",
    shelfLife: "9 Months from date of packing",
    isVeg: true,
    badge: "Idli Podi",
    available: true,
    rating: 4.9,
    reviewCount: 132
  },
  {
    id: "pirandai-idli-podi",
    name: "Pirandai Idli Podi",
    category: "masalas-spices",
    price: 185,
    compareAtPrice: 215,
    weight: "150g",
    image: pirandaiIdliPodiImg,
    shortDescription: "Adamant creeper stems roasted with urad dal, sesame, and red chillies for digestion.",
    description: "Pirandai stems cleaned and roasted until aromatic with dals, sesame seeds, and dried red chillies.",
    ingredients: ["Pirandai", "Roasted Urad Dal", "Roasted Bengal Gram", "White Sesame Seeds", "Red Chilli", "Curry Leaves", "Rock Salt", "Asafoetida"],
    howToUse: "Dip hot idlis or dosas in pirandai podi mixed with cold-pressed gingelly oil or cow ghee.",
    storage: "Store in a dry airtight container.",
    shelfLife: "9 Months from date of packing",
    isVeg: true,
    badge: "Idli Podi",
    available: true,
    rating: 5.0,
    reviewCount: 140
  },
  {
    id: "kashmiri-chili-powder",
    name: "Kashmiri Chili Powder",
    category: "masalas-spices",
    price: 180,
    compareAtPrice: 210,
    weight: "200g",
    image: kashmiriChiliPowderImg,
    shortDescription: "Stemless Kashmiri chillies stone-ground to impart a deep natural red glow and mild heat.",
    description: "Kashmiri red chillies stone-ground for natural crimson coloration and mild sweetness. Zero added color or additives.",
    ingredients: ["100% Pure Sun-Dried Kashmiri Chillies"],
    howToUse: "Provides appetizing red color and mild warmth to curries, gravies, and marinades.",
    storage: "Store in cool dark pantry in airtight glass jar.",
    shelfLife: "12 Months from date of packing",
    isVeg: true,
    badge: "Pure Spice",
    available: true,
    rating: 4.9,
    reviewCount: 121
  }
];

// Curated Artisanal Combo Offers (Using only assets from src/assets)
export const comboOffers = [
  {
    id: "tomato-poondu-duo",
    name: "Tomato & Poondu Thokku Duo",
    subtitle: "Tomato Mix + Poondu Milagu",
    price: 499,
    compareAtPrice: 570,
    savings: "Save ₹71",
    weight: "2 × 250g Glass Jars",
    image: bannerTomatoPoondu,
    description: "Tomato mix paired with warming garlic and black pepper relish.",
    badge: "Duo Pack",
    isVeg: true,
    productIds: ["tomato-thokku", "poondu-milagu-thokku"]
  },
  {
    id: "pirandai-mudakathan-duo",
    name: "Pirandai & Mudakathan Duo",
    subtitle: "Pirandai Mix + Mudakathan Mix",
    price: 520,
    compareAtPrice: 590,
    savings: "Save ₹70",
    weight: "2 × 250g Glass Jars",
    image: bannerPirandaiMudakathan,
    description: "Medicinal greens duo for natural joint comfort and digestive wellness.",
    badge: "Greens Duo",
    isVeg: true,
    productIds: ["pirandai-thokku", "mudakathan-thokku"]
  },
  {
    id: "thokku-heritage-trio",
    name: "Thokku Trio Pack",
    subtitle: "Tomato + Curry Leaf + Pirandai",
    price: 690,
    compareAtPrice: 790,
    savings: "Save ₹100",
    weight: "3 × 250g Glass Jars",
    image: tomatoMixImg,
    description: "Three thokkus in one pack: Tomato Mix, Curry Leaf Mix, and Pirandai Mix.",
    badge: "Trio Pack",
    isVeg: true,
    productIds: ["tomato-thokku", "curry-leaf-thokku", "pirandai-thokku"]
  },
  {
    id: "dosa-batter-podi-combo",
    name: "Dosa & Podi Breakfast Box",
    subtitle: "Rathasali Batter + Pirandai Podi + Cow Ghee",
    price: 890,
    compareAtPrice: 1015,
    savings: "Save ₹125",
    weight: "1kg Batter + 150g Podi + 350ml Ghee",
    image: rathasaliDosaImg,
    description: "Rathasali red rice dosa batter paired with Pirandai idli podi and pure cow ghee.",
    badge: "Breakfast Box",
    isVeg: true,
    productIds: ["rathasali-dosa-batter", "pirandai-idli-podi", "a2-bilona-ghee"]
  },
  {
    id: "wellness-starter-box",
    name: "Ghee & Health Mix Box",
    subtitle: "Pure Cow Ghee + Health Mix",
    price: 940,
    compareAtPrice: 1090,
    savings: "Save ₹150",
    weight: "350ml Ghee + 500g Mix",
    image: bannerGhee,
    description: "Pure cow ghee combined with sprouted 14-grain health mix powder.",
    badge: "Value Set",
    isVeg: true,
    productIds: ["a2-bilona-ghee", "sprouted-health-mix"]
  },
  {
    id: "masala-collection",
    name: "Masala Collection",
    subtitle: "Sambar + Coriander + Garam Masala",
    price: 450,
    compareAtPrice: 535,
    savings: "Save ₹85",
    weight: "3 × Full Size Packs",
    image: sambarPowderImg,
    description: "Three essential kitchen masalas: Sambar powder, coriander powder, and garam masala.",
    badge: "Kitchen Pack",
    isVeg: true,
    productIds: ["sambar-powder", "coriander-powder", "garam-masala"]
  }
];
