
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get API key from environment
    const OCR_API_KEY = Deno.env.get('OCR_SPACE_API_KEY');
    if (!OCR_API_KEY) {
      throw new Error('OCR_SPACE_API_KEY is not set in environment');
    }

    // Parse request body
    const { fileBase64 } = await req.json();
    if (!fileBase64) {
      return new Response(
        JSON.stringify({ error: 'No file data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract file data
    const base64Data = fileBase64.split(',')[1];

    // Call OCR.space API
    console.log('Calling OCR.space API');
    const formData = new FormData();
    formData.append('apikey', OCR_API_KEY);
    formData.append('base64Image', `data:image/png;base64,${base64Data}`);
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('OCREngine', '2');

    const ocrResponse = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: formData
    });

    const ocrData = await ocrResponse.json();
    console.log('OCR response received');

    // Process OCR data to extract warranty information
    const parsedData = extractWarrantyInfo(ocrData);
    
    return new Response(
      JSON.stringify(parsedData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing OCR:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Function to extract warranty information from OCR data
function extractWarrantyInfo(ocrData: any) {
  const result = {
    success: false,
    itemName: null,
    manufacturer: null,
    purchaseDate: null,
    expiryDate: null,
    description: null,
  };

  if (!ocrData.ParsedResults || ocrData.ParsedResults.length === 0) {
    return result;
  }

  // Get the parsed text
  const parsedText = ocrData.ParsedResults[0].ParsedText;
  if (!parsedText) {
    return result;
  }

  // Extract information using regex and natural language processing
  const lines = parsedText.split('\n').map(line => line.trim());
  
  // Find product name
  const productRegex = /product\s*name[:\s]+([^\n]+)/i;
  const itemRegex = /item[:\s]+([^\n]+)/i;
  const modelRegex = /model[:\s]+([^\n]+)/i;
  
  // Find manufacturer
  const manufacturerRegex = /manufacturer[:\s]+([^\n]+)/i;
  const brandRegex = /brand[:\s]+([^\n]+)/i;
  
  // Find dates
  const purchaseDateRegex = /purchase\s*date[:\s]+([^\n]+)/i;
  const boughtDateRegex = /(bought|purchased)(\s+on)?[:\s]+([^\n]+)/i;
  
  const expiryDateRegex = /expir(y|ation)\s*date[:\s]+([^\n]+)/i;
  const warrantyUntilRegex = /warranty(\s+valid)?\s+until[:\s]+([^\n]+)/i;
  
  // Find description
  const descriptionRegex = /description[:\s]+([^\n]+)/i;
  const coverageRegex = /coverage[:\s]+([^\n]+)/i;

  // Extract data from text
  for (const line of lines) {
    // Extract item name
    if (!result.itemName) {
      const productMatch = line.match(productRegex);
      const itemMatch = line.match(itemRegex);
      const modelMatch = line.match(modelRegex);
      
      if (productMatch && productMatch[1]) {
        result.itemName = productMatch[1].trim();
      } else if (itemMatch && itemMatch[1]) {
        result.itemName = itemMatch[1].trim();
      } else if (modelMatch && modelMatch[1]) {
        result.itemName = modelMatch[1].trim();
      }
    }
    
    // Extract manufacturer
    if (!result.manufacturer) {
      const manufacturerMatch = line.match(manufacturerRegex);
      const brandMatch = line.match(brandRegex);
      
      if (manufacturerMatch && manufacturerMatch[1]) {
        result.manufacturer = manufacturerMatch[1].trim();
      } else if (brandMatch && brandMatch[1]) {
        result.manufacturer = brandMatch[1].trim();
      }
    }
    
    // Extract purchase date
    if (!result.purchaseDate) {
      const purchaseDateMatch = line.match(purchaseDateRegex);
      const boughtDateMatch = line.match(boughtDateRegex);
      
      if (purchaseDateMatch && purchaseDateMatch[1]) {
        result.purchaseDate = purchaseDateMatch[1].trim();
      } else if (boughtDateMatch && boughtDateMatch[3]) {
        result.purchaseDate = boughtDateMatch[3].trim();
      }
    }
    
    // Extract expiry date
    if (!result.expiryDate) {
      const expiryDateMatch = line.match(expiryDateRegex);
      const warrantyUntilMatch = line.match(warrantyUntilRegex);
      
      if (expiryDateMatch && expiryDateMatch[2]) {
        result.expiryDate = expiryDateMatch[2].trim();
      } else if (warrantyUntilMatch && warrantyUntilMatch[2]) {
        result.expiryDate = warrantyUntilMatch[2].trim();
      }
    }
    
    // Extract description
    if (!result.description) {
      const descriptionMatch = line.match(descriptionRegex);
      const coverageMatch = line.match(coverageRegex);
      
      if (descriptionMatch && descriptionMatch[1]) {
        result.description = descriptionMatch[1].trim();
      } else if (coverageMatch && coverageMatch[1]) {
        result.description = coverageMatch[1].trim();
      }
    }
  }

  // If we found any data, consider it a success
  if (result.itemName || result.manufacturer || result.purchaseDate || result.expiryDate || result.description) {
    result.success = true;
  }
  
  return result;
}
