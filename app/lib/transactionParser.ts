export type ParsedTransaction = {
  amount: number;
  type: "expense" | "income";
  category: string;
  merchant: string | null;
  date: string | null;
  accountType?: "cash" | "bank" | "upi";
  goalName?: string | null;
};

export function parseTransactionInput(input: string): ParsedTransaction {
  const lowercaseInput = input.toLowerCase();
  
  // 1. Determine Type
  let type: "expense" | "income" = "expense";
  if (lowercaseInput.includes("credited") || lowercaseInput.includes("received") || lowercaseInput.includes("salary") || lowercaseInput.includes("income")) {
    type = "income";
  }

  // 2. Extract Amount
  let amount = 0;
  // Handle "spent 500", "Rs 500", "500rs", etc.
  const numMatches = input.match(/(?:rs\.?|inr|₹|spent)?\s*([\d,]+(?:\.\d+)?)(?:\s*rs)?/gi);
  if (numMatches) {
    let extractedAmount = 0;
    for (const match of numMatches) {
      const cleanNum = parseFloat(match.replace(/[^\d.]/g, ''));
      if (!isNaN(cleanNum) && cleanNum > extractedAmount) {
        extractedAmount = cleanNum;
      }
    }
    amount = extractedAmount;
  }

  // 3. Extract Account Type
  let accountType: "cash" | "bank" | "upi" | undefined;
  if (lowercaseInput.includes("cash")) accountType = "cash";
  else if (lowercaseInput.includes("upi") || lowercaseInput.includes("gpay") || lowercaseInput.includes("phonepe") || lowercaseInput.includes("paytm")) accountType = "upi";
  else if (lowercaseInput.includes("bank") || lowercaseInput.includes("card") || lowercaseInput.includes("atm")) accountType = "bank";

  // 4. Extract Merchant & Category
  let merchant: string | null = null;
  let category = type === "income" ? "income" : "other";

  const foodKeywords = ["swiggy", "zomato", "eat", "restaurant", "food", "lunch", "dinner", "breakfast", "cafe", "chai", "tea", "coffee"];
  const travelKeywords = ["uber", "ola", "travel", "cab", "flight", "irctc", "petrol", "fuel", "train", "metro", "auto"];
  const shopKeywords = ["amazon", "flipkart", "myntra", "shopping", "store", "supermarket", "grocery", "blinkit", "zepto"];
  const utilityKeywords = ["bill", "recharge", "electricity", "broadband", "water", "jio", "airtel", "vi", "wifi"];
  const entertainmentKeywords = ["movie", "netflix", "prime", "spotify", "cinema", "ticket", "hotstar"];
  const emiKeywords = ["emi", "loan", "rent", "mortgage", "installments"];

  // Handle "at [Merchant]" or "on [Merchant]" or "to [Merchant]"
  const merchantMatch = input.match(/(?:at|to|on)\s+([a-zA-Z0-9\s]{2,15})(?:\s|$|via)/i);
  if (merchantMatch && merchantMatch[1]) {
    const candidate = merchantMatch[1].trim();
    // Exclude common prepositions/words
    if (!["the", "your", "my", "this", "some", "a", "an", "on", "in", "at", "to", "via"].includes(candidate.toLowerCase())) {
      merchant = candidate;
    }
  }

  // Refine Category based on keywords or merchant
  const findCategory = (str: string) => {
    if (foodKeywords.some(k => str.includes(k))) return "food";
    if (travelKeywords.some(k => str.includes(k))) return "transport";
    if (shopKeywords.some(k => str.includes(k))) return "shopping";
    if (utilityKeywords.some(k => str.includes(k))) return "utilities";
    if (entertainmentKeywords.some(k => str.includes(k))) return "entertainment";
    if (emiKeywords.some(k => str.includes(k))) return "housing";
    return null;
  };

  const detectedCat = findCategory(lowercaseInput) || (merchant ? findCategory(merchant.toLowerCase()) : null);
  if (detectedCat) category = detectedCat;

  // 5. Extract Date
  let date: string | null = null;
  const dateMatch = input.match(/on\s+(\d{1,2}(?:st|nd|rd|th)?\s+[a-zA-Z]{3,10})/i);
  if (dateMatch && dateMatch[1]) {
    date = dateMatch[1];
  }

  // 6. Extract Goal Link
  let goalName: string | null = null;
  if (lowercaseInput.includes("for") || lowercaseInput.includes("goal") || lowercaseInput.includes("to")) {
    const goalMatch = input.match(/(?:for|goal|to)\s+([a-zA-Z0-9\s]{2,15})(?:\s|$)/i);
    if (goalMatch && goalMatch[1]) {
      goalName = goalMatch[1].trim();
    }
  }

  return { amount, type, category, merchant, date, accountType, goalName };
}
