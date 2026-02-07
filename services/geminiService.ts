
import { GoogleGenAI, Type } from "@google/genai";
import { InvoiceExtractionResult, DocType } from "../types";

export const extractDocumentData = async (
  base64Data: string, 
  mimeType: string, 
  userCategories: string[],
  docType: DocType
): Promise<InvoiceExtractionResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  let instructions = "";
  if (docType === DocType.INVOICE) {
    const categoryContext = userCategories.length > 0 
      ? `Choose 'category' ONLY from: ${userCategories.join(', ')}. If none fits, use 'Geral'.`
      : "Categorize this expense logically.";
    
    instructions = `
      Extract invoice details from this Portuguese document. 
      ${categoryContext}
      
      CRITICAL - VAT DEDUCTIBILITY (CIVA rules):
      Identify 'vatDeductibility' as a number (0, 50, or 100) based on Portuguese Law:
      - 100: Equipment, Tools, SaaS, Marketing, Electricity, Communications, Logistics.
      - 50: Diesel (Gasóleo) fuel.
      - 0: Business Meals (Refeições), Gasoline, Alcohol, Tobacco, Luxury items.
      
      Extract also the 'documentNumber' (often labeled as Nº Fatura, Factura Nº, or Document Number).
      
      Return JSON with date, supplier, documentNumber, totalAmount, vatAmount, vatDeductibility, and category.
    `;
  } else if (docType === DocType.BANK_STATEMENT) {
    instructions = `This is a bank statement. Extract bank name (supplier) and date. Set vatAmount/totalAmount to 0. Return JSON.`;
  } else {
    instructions = `Extract basic date and supplier details. Return JSON.`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        {
          inlineData: {
            data: base64Data.split(',')[1],
            mimeType: mimeType
          }
        },
        {
          text: instructions
        }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING, description: "YYYY-MM-DD" },
          supplier: { type: Type.STRING },
          documentNumber: { type: Type.STRING, description: "The invoice or document reference number" },
          totalAmount: { type: Type.NUMBER },
          vatAmount: { type: Type.NUMBER },
          vatDeductibility: { type: Type.NUMBER, description: "0, 50 or 100" },
          category: { type: Type.STRING }
        },
        required: ["date", "supplier", "category"]
      }
    }
  });

  try {
    const text = response.text || '{}';
    return JSON.parse(text) as InvoiceExtractionResult;
  } catch (error) {
    console.error("Gemini failed:", error);
    throw new Error("Erro na análise fiscal da IA.");
  }
};
