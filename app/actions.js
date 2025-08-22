'use server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeAndGenerate(url, existingPosts, options) {
  const { tone, platform, language, postVariations } = options;

  if (!url || !url.startsWith('http')) {
    return { error: "Please provide a valid, full URL (including http/https)." };
  }

  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(proxyUrl, { timeout: 15000 });

    if (data.status.http_code !== 200) {
      return { error: `Failed to fetch URL. Status: ${data.status.http_code}. The site may be blocking scrapers.`};
    }

    const html = data.contents;
    const $ = cheerio.load(html);

    const title = $('title').text() || $('h1').first().text() || "No title found";
    const description = $('meta[name="description"]').attr('content') || "No description found";

    $('script, style, noscript, svg, nav, footer, header, aside, form').remove();
    const bodyText = $('body').text().trim().replace(/\s\s+/g, ' ').substring(0, 6000);

    const scrapedContent = `
      Title: ${title}
      Description: ${description}
      Body Content Preview: ${bodyText}
    `;

    const prompt = `
      You are an expert social media strategist. Your task is to generate a set of social media posts based on the provided website content, tailored to specific requirements.

      **CRITICAL INSTRUCTIONS:**
      1.  **OUTPUT FORMAT:** Your entire response MUST be a single, valid JSON object. The object should have a key "scrapedSummary" containing a brief, one-sentence summary of the provided content, and a key "posts" which is an array of objects. Each object in the "posts" array must have two keys: "variation" (a string indicating the post type) and "content" (the generated post string).
      2.  **LANGUAGE STYLE:** Use clear, simple, and direct language. Avoid jargon and overly complex words. The tone should be natural and easy to understand.
      3.  **POST VARIATIONS:** Generate one post for EACH of the following requested variations: ${JSON.stringify(postVariations)}.
      4.  **LANGUAGE:** Write all posts in ${language}.
      5.  **TONE:** Adopt a '${tone}' tone.
      6.  **PLATFORM OPTIMIZATION:** Tailor each post's content and length for the specified platform: '${platform}'.
          - For 'X (Twitter)': Strictly under 280 characters. Short, punchy, and include 2-3 relevant hashtags.
          - For 'LinkedIn': Professional, detailed post (around 500-800 characters). Provide insights, encourage discussion, and use professional hashtags.
          - For 'Instagram': A visually descriptive, engaging caption of medium length. Use 5-7 popular hashtags and a clear call-to-action.
          - For 'Threads': Short, casual, conversational, and perfect for starting a dialogue.

      **Website Content to Analyze:**
      ${scrapedContent}
    `;
    
    const geminiResponse = await axios.post(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.75,
        }
      }, {
        timeout: 25000,
      });

    const parsedResponse = geminiResponse.data.candidates[0].content.parts[0].text;
    const result = JSON.parse(parsedResponse);
    result.posts = result.posts.map(post => ({ ...post, id: Math.random().toString(36).substring(2, 9) }));
    result.scrapedInfo = { title, description };

    return { result };

  } catch (error) {
    console.error("Error in scrapeAndGenerate:", error);
    if (error.code === 'ECONNABORTED') {
      return { error: "The request timed out. The target website or the AI model might be slow." };
    }
    if (error.response) {
      const status = error.response.status;
      if (status === 403) {
        return { error: `Network Error: ${status}. The content source is likely protected and cannot be scraped.` };
      }
      return { error: `API or Network Error: ${status}. Please check your API key and network connection.` };
    }
    return { error: error.message || "An unknown error occurred during generation." };
  }
}