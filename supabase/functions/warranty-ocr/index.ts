
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

    console.log('OCR_API_KEY is present and configured');

    // Parse request body
    const requestData = await req.json();
    console.log('Request received with data:', Object.keys(requestData));
    
    const { fileBase64 } = requestData;
    if (!fileBase64) {
      console.error('No file data provided in request');
      return new Response(
        JSON.stringify({ error: 'No file data provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract file data
    const base64Data = fileBase64.split(',')[1];
    console.log('Base64 data extracted, length:', base64Data.length);

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

    console.log('OCR API response status:', ocrResponse.status);
    const ocrData = await ocrResponse.json();
    console.log('OCR response received:', JSON.stringify(ocrData).substring(0, 200) + '...');
    
    if (ocrData.ErrorMessage) {
      console.error('OCR API returned an error:', ocrData.ErrorMessage);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: ocrData.ErrorMessage,
          rawText: ocrData.ParsedResults?.[0]?.ParsedText || null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Process OCR data to extract warranty information
    const parsedData = extractWarrantyInfo(ocrData);
    console.log('Extracted warranty info:', parsedData);
    
    return new Response(
      JSON.stringify({
        ...parsedData,
        rawText: ocrData.ParsedResults?.[0]?.ParsedText || null
      }),
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
    console.log('No parsed results in OCR data');
    return result;
  }

  // Get the parsed text
  const parsedText = ocrData.ParsedResults[0].ParsedText;
  if (!parsedText) {
    console.log('No parsed text in OCR results');
    return result;
  }

  console.log('OCR parsed text:', parsedText);

  // Extract information using regex and natural language processing
  const lines = parsedText.split('\n').map(line => line.trim());
  
  // More aggressive pattern matching
  // Find product name - look for any line that might contain a product name
  const productRegex = /product\s*(?:name)?[:\s]+([^\n]+)/i;
  const itemRegex = /item[:\s]+([^\n]+)/i;
  const modelRegex = /model[:\s]+([^\n]+)/i;
  const nameRegex = /name[:\s]+([^\n]+)/i;
  
  // Find manufacturer
  const manufacturerRegex = /manufacturer[:\s]+([^\n]+)/i;
  const brandRegex = /brand[:\s]+([^\n]+)/i;
  const companyRegex = /(?:by|from)\s+([A-Z][a-zA-Z\s]+)(?:,|\.|$)/i;
  
  // Find dates - more flexible date patterns
  const purchaseDateRegex = /(?:purchase|bought|acquired)(?:\s*date)?[:\s]+([^\n]+)/i;
  const dateOfPurchaseRegex = /date\s+of\s+purchase[:\s]+([^\n]+)/i;
  
  const expiryDateRegex = /(?:expiry|expiration|warranty\s+end)(?:\s*date)?[:\s]+([^\n]+)/i;
  const warrantyUntilRegex = /warranty(?:\s+valid)?(?:\s+until)?[:\s]+([^\n]+)/i;
  const validUntilRegex = /valid\s+until[:\s]+([^\n]+)/i;
  
  // Find description
  const descriptionRegex = /description[:\s]+([^\n]+)/i;
  const coverageRegex = /coverage[:\s]+([^\n]+)/i;
  const warrantyCoverageRegex = /warranty\s+(?:covers|includes)[:\s]+([^\n]+)/i;

  // Extract item name from full text if not found in lines
  const fullTextProductMatch = parsedText.match(productRegex);
  const fullTextItemMatch = parsedText.match(itemRegex);
  const fullTextModelMatch = parsedText.match(modelRegex);
  const fullTextNameMatch = parsedText.match(nameRegex);
  
  if (fullTextProductMatch && fullTextProductMatch[1]) {
    result.itemName = fullTextProductMatch[1].trim();
    console.log('Found product name in full text:', result.itemName);
  } else if (fullTextItemMatch && fullTextItemMatch[1]) {
    result.itemName = fullTextItemMatch[1].trim();
    console.log('Found item name in full text:', result.itemName);
  } else if (fullTextModelMatch && fullTextModelMatch[1]) {
    result.itemName = fullTextModelMatch[1].trim();
    console.log('Found model in full text:', result.itemName);
  } else if (fullTextNameMatch && fullTextNameMatch[1]) {
    result.itemName = fullTextNameMatch[1].trim();
    console.log('Found name in full text:', result.itemName);
  }
  
  // Try to find the first capitalized multi-word sequence as potential product name
  if (!result.itemName) {
    const capitalizedProductPattern = /([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\s+(?:TV|Refrigerator|Washing Machine|Dryer|Microwave|Oven|Dishwasher|[A-Z0-9-]+))/;
    const capitalizedMatch = parsedText.match(capitalizedProductPattern);
    if (capitalizedMatch && capitalizedMatch[1]) {
      result.itemName = capitalizedMatch[1].trim();
      console.log('Found capitalized product name:', result.itemName);
    }
  }

  // Extract manufacturer from full text
  const fullTextManufacturerMatch = parsedText.match(manufacturerRegex);
  const fullTextBrandMatch = parsedText.match(brandRegex);
  const fullTextCompanyMatch = parsedText.match(companyRegex);
  
  if (fullTextManufacturerMatch && fullTextManufacturerMatch[1]) {
    result.manufacturer = fullTextManufacturerMatch[1].trim();
    console.log('Found manufacturer in full text:', result.manufacturer);
  } else if (fullTextBrandMatch && fullTextBrandMatch[1]) {
    result.manufacturer = fullTextBrandMatch[1].trim();
    console.log('Found brand in full text:', result.manufacturer);
  } else if (fullTextCompanyMatch && fullTextCompanyMatch[1]) {
    result.manufacturer = fullTextCompanyMatch[1].trim();
    console.log('Found company in full text:', result.manufacturer);
  }

  // Extract dates from full text
  const fullTextPurchaseDateMatch = parsedText.match(purchaseDateRegex) || parsedText.match(dateOfPurchaseRegex);
  if (fullTextPurchaseDateMatch && fullTextPurchaseDateMatch[1]) {
    result.purchaseDate = fullTextPurchaseDateMatch[1].trim();
    console.log('Found purchase date in full text:', result.purchaseDate);
  }
  
  const fullTextExpiryDateMatch = parsedText.match(expiryDateRegex) || 
                                parsedText.match(warrantyUntilRegex) || 
                                parsedText.match(validUntilRegex);
  if (fullTextExpiryDateMatch && fullTextExpiryDateMatch[1]) {
    result.expiryDate = fullTextExpiryDateMatch[1].trim();
    console.log('Found expiry date in full text:', result.expiryDate);
  }

  // Extract description from full text
  const fullTextDescriptionMatch = parsedText.match(descriptionRegex) || 
                                 parsedText.match(coverageRegex) || 
                                 parsedText.match(warrantyCoverageRegex);
  if (fullTextDescriptionMatch && fullTextDescriptionMatch[1]) {
    result.description = fullTextDescriptionMatch[1].trim();
    console.log('Found description in full text:', result.description);
  }

  // Look for date patterns in all lines
  if (!result.purchaseDate || !result.expiryDate) {
    const datePattern = /\b(?:\d{1,2}[-\/\.]\d{1,2}[-\/\.]\d{2,4}|\d{2,4}[-\/\.]\d{1,2}[-\/\.]\d{1,2}|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{2,4}|\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{2,4})\b/i;
    
    let dates: string[] = [];
    
    // Extract all dates from the text
    for (const line of lines) {
      const match = line.match(datePattern);
      if (match) {
        dates.push(match[0]);
      }
    }
    
    // If we found at least one date but don't have purchase date
    if (dates.length > 0 && !result.purchaseDate) {
      result.purchaseDate = dates[0];
      console.log('Using first detected date as purchase date:', result.purchaseDate);
    }
    
    // If we found at least two dates but don't have expiry date
    if (dates.length > 1 && !result.expiryDate) {
      result.expiryDate = dates[1];
      console.log('Using second detected date as expiry date:', result.expiryDate);
    }
  }

  // Look for any phrases describing what the warranty covers
  if (!result.description) {
    const coveragePatterns = [
      /warranty covers ([^.]+)\./i,
      /coverage includes ([^.]+)\./i,
      /covers ([^.]+) for a period of/i,
      /this warranty ([^.]+)\./i
    ];
    
    for (const pattern of coveragePatterns) {
      const match = parsedText.match(pattern);
      if (match && match[1]) {
        result.description = match[1].trim();
        console.log('Found warranty coverage description:', result.description);
        break;
      }
    }
  }

  // If we still don't have a description, use a fallback
  if (!result.description && result.itemName) {
    // Create a generic description based on the product name
    result.description = `Standard warranty coverage for ${result.itemName}`;
    console.log('Using generic description based on product name');
  }

  // If we found any data, consider it a success
  if (result.itemName || result.manufacturer || result.purchaseDate || result.expiryDate || result.description) {
    result.success = true;
    console.log('Successfully extracted warranty information');
  } else {
    console.log('No warranty information extracted');
  }
  
  return result;
}
