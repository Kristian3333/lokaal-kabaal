// Recraft.ai prompt map per branche
// Style: vector_illustration -- premium, print-ready, clean, no text, no people

export const BRANCHE_PROMPTS: Record<string, string> = {
  // Persoonlijke verzorging
  'Kapper / Barbershop':
    'Professional barber scissors and straight razor, geometric minimal composition, Dutch poster style, bold lines, no text, no people, flat vector illustration',
  'Nagelstudio':
    'Elegant nail polish bottles arranged in geometric pattern, botanical accents, pastel minimal Dutch poster, no text, no people, flat vector',
  'Schoonheidsspecialist':
    'Luxury skincare bottles and cream jars, botanical elements, clean white background, Dutch minimal design, no text, no people',
  'Tattoo & Piercing':
    'Abstract ink splash with geometric fine-line botanical motifs, dark minimal poster, Dutch graphic art, no text, no people',

  // Food & Beverage
  'Restaurant':
    'Elegant ceramic plate with fork and knife, minimal food illustration, warm tones, Dutch poster style, no text, no people, flat vector',
  'Café / Bar':
    'Artisan coffee cup with steam, minimal illustration, warm amber tones, Dutch graphic design, no text, no people, flat vector',
  'Koffietentje':
    'Classic espresso cup and coffee beans scattered, warm golden minimal illustration, Dutch poster style, no text, no people',
  'Bakkerij':
    'Artisan bread loaves and pastries arranged beautifully, warm golden tones, Dutch bakery poster style, no text, no people, flat vector',
  'Slagerij':
    'Butcher knife and meat cuts in geometric arrangement, bold red accents, minimal Dutch butcher poster, no text, no people',
  'Traiteur / Catering':
    'Elegant serving dishes and cloche covers, silver and gold tones, premium minimal illustration, no text, no people, Dutch style',
  'Afhaal & Bezorging':
    'Minimal delivery scooter and takeaway boxes, bold graphic lines, Dutch poster art, no text, no people, flat vector',
  'Pizzeria':
    'Classic pizza with toppings viewed from above, Italian minimal poster style, warm red tones, no text, no people, flat vector',
  'Aziatisch restaurant':
    'Elegant chopsticks, bowl and minimal Asian pattern, clean geometric, Dutch poster interpretation, no text, no people',
  'IJssalon':
    'Artisan gelato scoops in waffle cone, pastel summer tones, minimal Italian-Dutch poster style, no text, no people',

  // Gezondheid & Sport
  'Sportschool / Fitness':
    'Geometric dumbbells and kettlebell arranged in bold pattern, dark minimal Dutch design, no text, no people, flat vector',
  'Yoga & Pilates studio':
    'Minimal yoga mat rolled with lotus botanical elements, calm earth tones, Dutch wellness poster, no text, no people',
  'Fysiotherapeut':
    'Clean anatomical spine outline with healing botanical elements, clinical minimal Dutch design, no text, no people',
  'Personal trainer':
    'Bold geometric running figure silhouette, dynamic angles, minimal Dutch sports poster, no text, flat vector illustration',
  'Dansschool':
    'Elegant ballet pointe shoes with musical notes, minimal Dutch arts poster, graceful composition, no text, no people',
  'Zwembad & Wellness':
    'Minimal swimming pool lanes from above, calm blue tones, geometric Dutch design, no text, no people, flat vector',

  // Wonen & Interieur
  'Meubelwinkel':
    'Elegant mid-century armchair in minimal illustration, warm interior tones, Dutch design aesthetic, no text, no people, flat vector',
  'Keukenwinkel':
    'Modern kitchen faucet and utensils, minimal technical illustration, Dutch design precision, no text, no people, flat vector',
  'Interieurwinkel / Woonwinkel':
    'Architectural interior sketch, plants and geometric furniture, Dutch minimalist design, no text, no people, flat vector',
  'Verfwinkel / Behangwinkel':
    'Paint brush with color swatches in minimal arrangement, Dutch poster style, clean composition, no text, no people',
  'Doe-het-zelf & Bouwmarkt':
    'Hand tools hammer wrench level arranged geometrically, industrial minimal Dutch design, no text, no people, flat vector',

  // Speciaalzaken
  'Bloemist':
    'Elegant botanical flower arrangement, single peony with leaves, Dutch still life style, premium minimal, no text, no people',
  'Cadeauwinkel':
    'Elegantly wrapped gift box with ribbon, minimal luxury illustration, Dutch design, warm tones, no text, no people',
  'Boekenwinkel':
    'Stack of books with reading glasses, minimal illustration, warm paper tones, Dutch literary poster style, no text, no people',
  'Speelgoedwinkel':
    'Classic wooden toy blocks in primary colors, playful geometric arrangement, Dutch design, no text, no people, flat vector',
  'Kinderkleding':
    'Small children clothing items in minimal flat illustration, pastel tones, Dutch design, no text, no people',
  'Boetiek / Kledingwinkel':
    'Fashion clothing rack with minimal garments, elegant Dutch boutique poster, warm neutral tones, no text, no people',
  'Schoenenwinkel':
    'Elegant shoe pair in minimal side view illustration, clean Dutch design, luxury tones, no text, no people',
  'Juwelier':
    'Diamond ring and pearl necklace minimal illustration, gold and silver tones, Dutch luxury poster, no text, no people',
  'Opticiën':
    'Elegant eyeglasses frames in geometric composition, minimal Dutch optical design, no text, no people',
  'Drogist':
    'Clean pharmacy bottles and natural ingredient elements, minimal Dutch health design, no text, no people',
  'Huisdierenwinkel':
    'Minimal pet paw print and collar, botanical elements, warm Dutch illustration style, no text, no people',
  'Rijschool':
    'Minimal car steering wheel and road signs, Dutch driving school poster style, no text, no people, flat vector',
  'Stucadoor / Afbouwbedrijf':
    'Trowel and smooth wall texture in technical minimal illustration, Dutch trades design, no text, no people',
  'Stomerij / Wasserette':
    'Clean pressed shirt and iron in minimal illustration, crisp white tones, Dutch laundry poster, no text, no people',
  'Fietsenwinkel':
    'Classic Dutch bicycle silhouette minimal, canal background outline, Dutch design iconic, no text, no people, flat vector',
};

export function buildFlyerImagePrompt(branche: string, accentkleur: string): string {
  const base =
    BRANCHE_PROMPTS[branche] ||
    `Local ${branche} business, minimal Dutch graphic poster illustration, clean geometric composition, no text, no people, flat vector`;
  return `${base}, accent color ${accentkleur}, high contrast, print-ready quality, vector illustration style`;
}
