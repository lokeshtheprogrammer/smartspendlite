export type ParsedTransaction = {
  amount: number;
  type: "expense" | "income";
  category: string;
  merchant: string | null;
  date: string | null;
};

export function parseTransactionInput(input: string): ParsedTransaction {
  const lowercaseInput = input.toLowerCase();
  
  // 1. Determine Type
  let type: "expense" | "income" = "expense";
  if (lowercaseInput.includes("credited") || lowercaseInput.includes("received") || lowercaseInput.includes("salary")) {
    type = "income";
  }

  // 2. Extract Amount
  let amount = 0;
  // Match things like Rs.500, Rs 500, INR 500, ₹500, or just 500
  // Look for the largest number if there are multiple
  const numMatches = input.match(/(?:rs\.?|inr|₹)?\s*([\d,]+(?:\.\d+)?)/gi);
  if (numMatches && numMatches.length > 0) {
    // Find the first matching amount-like structure, or fallback to the largest number
    let extractedAmount = 0;
    for (const match of numMatches) {
      const cleanNum = parseFloat(match.replace(/[^\d.]/g, ''));
      if (!isNaN(cleanNum) && cleanNum > extractedAmount) {
        extractedAmount = cleanNum;
      }
    }
    amount = extractedAmount;
  }

  // 3. Extract Merchant & Category
  let merchant: string | null = null;
  // Project specific categories: food, transport, shopping, utilities, housing, entertainment, other
  let category = type === "income" ? "income" : "other";

  const foodKeywords = ["swiggy", "zomato", "eat", "restaurant", "food", "lunch", "dinner", "breakfast", "cafe"];
  const travelKeywords = ["uber", "ola", "travel", "cab", "flight", "irctc", "petrol", "fuel", "train"];
  const shopKeywords = ["amazon", "flipkart", "myntra", "shopping", "store", "supermarket"];
  const utilityKeywords = ["bill", "recharge", "electricity", "broadband", "water", "jio", "airtel"];
  const entertainmentKeywords = ["movie", "netflix", "prime", "spotify", "cinema", "ticket"];
  const emiKeywords = ["emi", "loan", "rent", "mortgage", "installments", "installment"];
  
  // Try to find known merchants
  const allMerchants = ["swiggy", "zomato", "amazon", "flipkart", "uber", "ola", "myntra", "irctc", "netflix", "spotify"];
  for (const m of allMerchants) {
    if (lowercaseInput.includes(m)) {
      merchant = m.charAt(0).toUpperCase() + m.slice(1);
      break;
    }
  }

  // If no merchant found from list, but we have "at [Merchant]" or "to [Merchant]"
  if (!merchant) {
    const atMatch = input.match(/(?:at|to)\s+([a-zA-Z0-9_]+)/i);
    if (atMatch && atMatch[1] && !["the", "your", "my", "a"].includes(atMatch[1].toLowerCase())) {
      merchant = atMatch[1].trim();
    }
  }

  // Determine Category based on keywords
  if (emiKeywords.some(k => lowercaseInput.includes(k))) category = "emi";
  else if (foodKeywords.some(k => lowercaseInput.includes(k))) category = "food";
  else if (travelKeywords.some(k => lowercaseInput.includes(k))) category = "transport";
  else if (shopKeywords.some(k => lowercaseInput.includes(k))) category = "shopping";
  else if (utilityKeywords.some(k => lowercaseInput.includes(k))) category = "utilities";
  else if (entertainmentKeywords.some(k => lowercaseInput.includes(k))) category = "entertainment";

  // 4. Extract Date (simple pattern matching for 25-Apr, etc)
  let date: string | null = null;
  const dateMatch = input.match(/on\s+(\d{1,2}-[a-zA-Z]{3})/i);
  if (dateMatch && dateMatch[1]) {
    date = dateMatch[1];
  }

  return {
    amount,
    type,
    category,
    merchant,
    date
  };
}
