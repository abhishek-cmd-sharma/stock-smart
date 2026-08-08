export interface ParsedVoiceCommand {
  quantity: number | null;
  productName: string | null;
  matchedProduct: any | null;
  error?: string;
}

const textToNumberMap: Record<string, number> = {
  "one": 1, "two": 2, "three": 3, "four": 4, "five": 5,
  "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
  "eleven": 11, "twelve": 12, "thirteen": 13, "fourteen": 14,
  "fifteen": 15, "sixteen": 16, "seventeen": 17, "eighteen": 18,
  "nineteen": 19, "twenty": 20, "thirty": 30, "forty": 40, "fifty": 50,
  "a": 1, "an": 1
};

export function parseVoiceCommand(transcript: string, inventory: any[]): ParsedVoiceCommand {
  const lowerTranscript = transcript.toLowerCase().trim();
  
  if (!lowerTranscript) {
    return { quantity: null, productName: null, matchedProduct: null, error: "No speech detected." };
  }

  // Common phrases to remove from the beginning to isolate the actual intent
  let cleanedTranscript = lowerTranscript;
  const prefixesToRemove = ["i sold", "sold", "sell", "selling", "please sell", "just sold", "today i sold"];
  for (const prefix of prefixesToRemove) {
    if (cleanedTranscript.startsWith(prefix)) {
      cleanedTranscript = cleanedTranscript.substring(prefix.length).trim();
      break;
    }
  }

  // Extract quantity
  let quantity: number | null = null;
  let remainingText = cleanedTranscript;

  // Regex to match a number at the beginning or anywhere in the sentence
  // Example: "5 parle g" or "five parle g"
  const quantityRegex = /\b(\d+|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|a|an)\b/;
  const match = cleanedTranscript.match(quantityRegex);

  if (match) {
    const rawNum = match[1];
    if (/\d+/.test(rawNum)) {
      quantity = parseInt(rawNum, 10);
    } else {
      quantity = textToNumberMap[rawNum] || null;
    }
    // Remove the quantity from the text to isolate the product name
    remainingText = cleanedTranscript.replace(rawNum, "").trim();
  } else {
    // If no explicit quantity was stated, default to 1
    quantity = 1;
  }

  // Clean up remaining text to find the product name
  // Remove filler words like "of", "packets of", "bottles of", "items of"
  const fillerRegex = /\b(packets? of|bottles? of|items? of|pieces? of|boxes? of|of|biscuits? of|biscuit|packet|bottle)\b/g;
  remainingText = remainingText.replace(fillerRegex, "").trim();

  // If we couldn't find a product name
  if (!remainingText) {
    return { 
      quantity, 
      productName: null, 
      matchedProduct: null, 
      error: "Could not understand the product name." 
    };
  }

  const productNameExtracted = remainingText;

  // Match with inventory
  const matchedProduct = findBestMatch(productNameExtracted, inventory);

  if (!matchedProduct) {
    return {
      quantity,
      productName: productNameExtracted,
      matchedProduct: null,
      error: `Could not find a product matching "${productNameExtracted}" in your inventory.`
    };
  }

  return {
    quantity,
    productName: productNameExtracted,
    matchedProduct,
  };
}

function findBestMatch(searchText: string, inventory: any[]): any | null {
  const query = searchText.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  
  // 1. Exact match (case insensitive)
  const exactMatch = inventory.find(p => p.name.toLowerCase().replace(/[^a-z0-9\s]/g, "") === query);
  if (exactMatch) return exactMatch;

  // 2. Starts with match
  const startsWithMatch = inventory.find(p => p.name.toLowerCase().replace(/[^a-z0-9\s]/g, "").startsWith(query));
  if (startsWithMatch) return startsWithMatch;

  // 3. Includes match
  const includesMatch = inventory.find(p => p.name.toLowerCase().replace(/[^a-z0-9\s]/g, "").includes(query) || query.includes(p.name.toLowerCase().replace(/[^a-z0-9\s]/g, "")));
  if (includesMatch) return includesMatch;

  // 4. Token-based match (match most words)
  const queryTokens = query.split(/\s+/).filter(t => t.length > 1);
  let bestMatch = null;
  let maxScore = 0;

  for (const product of inventory) {
    const productTokens = product.name.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((t: string) => t.length > 1);
    let score = 0;
    
    for (const token of queryTokens) {
      if (productTokens.some((pt: string) => pt.includes(token) || token.includes(pt))) {
        score++;
      }
    }

    if (score > maxScore && score > 0) {
      maxScore = score;
      bestMatch = product;
    }
  }

  // Arbitrary threshold: must match at least 1 significant token if it's a multi-word query
  if (bestMatch && maxScore > 0) {
    return bestMatch;
  }

  return null;
}
