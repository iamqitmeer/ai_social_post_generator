'use server';
import axios from 'axios';
import * as cheerio from 'cheerio';

export async function scrapeAndGenerate(url, existingPosts, options) {
  const { tone, platform, language, postVariations, audience, cta, customInstructions, hashtagStrategy, includeImagePrompt } = options;

  if (!url || !url.startsWith('http')) {
    return { error: "Please provide a valid, full URL (including http/https)." };
  }

  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    const { data } = await axios.get(proxyUrl, { timeout: 15000, headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36' }});

    if (data.status.http_code !== 200) {
      return { error: `Failed to fetch URL. Status: ${data.status.http_code}. The site may be blocking scrapers.`};
    }

    const html = data.contents;
    const $ = cheerio.load(html);

    const title = $('title').text() || $('h1').first().text() || "No title found";
    const description = $('meta[name="description"]').attr('content') || "No description found";

    $('script, style, noscript, svg, nav, footer, header, aside, form, img, iframe').remove();
    const bodyText = $('body').text().trim().replace(/\s\s+/g, ' ').substring(0, 6000);

    const scrapedContent = `
      Title: ${title}
      Description: ${description}
      Body Content Preview: ${bodyText}
    `;

    const prompt = `
      You are a world-class social media strategist and content creator AI. Your task is to generate a set of social media posts based on the provided website content and a detailed set of user-defined parameters.

      **CRITICAL INSTRUCTIONS:**
      1.  **OUTPUT FORMAT:** Your entire response MUST be a single, valid JSON object. Do not include any text, markdown, or explanations outside of this JSON object. The object must have a key "posts" which is an array of objects. Each object in the "posts" array must have the following keys:
          - "variation": (String) The specific type of post from the requested variations.
          - "content": (String) The generated post text.
          - "engagementScore": (Number) A simulated score from 1-100 indicating the post's potential for engagement.
          ${includeImagePrompt ? '- "imagePrompt": (String) A descriptive prompt for a text-to-image AI (e.g., Midjourney, DALL-E) that visually represents the post\'s content. This should be creative and detailed.' : ''}
      2.  **LANGUAGE & TONE:** Write all posts in **${language}** with a **'${tone}'** tone.
      3.  **PLATFORM OPTIMIZATION:** Tailor each post for **'${platform}'**.
          - 'X (Twitter)': Max 280 characters. Punchy, uses relevant hashtags.
          - 'LinkedIn': 500-1000 characters. Professional, insightful, encourages discussion.
          - 'Instagram': Visually descriptive caption. Use popular hashtags and a clear CTA.
          - 'Threads': Casual, conversational, designed to start a dialogue.
          - 'Facebook': Engaging, slightly longer than Twitter, can include questions or a strong CTA.
      4.  **HASHTAG STRATEGY:** Apply a '${hashtagStrategy}' hashtag strategy.
      5.  **AUDIENCE & CTA:** The target audience is **'${audience || 'a general audience'}'**. If a Call to Action is provided, incorporate it naturally. CTA: **'${cta || 'None provided'}'**.
      6.  **CUSTOM INSTRUCTIONS:** Adhere to these user instructions: **'${customInstructions || 'None provided'}'**.
      7.  **POST VARIATIONS:** Generate exactly one post for EACH of the following requested variations: ${JSON.stringify(postVariations)}. Ensure each post is unique and genuinely reflects its variation type (e.g., a 'Poll' should be a poll, a 'Quote' should extract or create a powerful quote).
      8.  **AVOID DUPLICATION:** Do not generate posts that are substantially similar to these existing posts: ${JSON.stringify(existingPosts.map(p => p.content))}

      **Website Content to Analyze:**
      ${scrapedContent}
    `;
    
    // FIX: Use process.env.GEMINI_API_KEY directly for server-side actions.
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
        return { error: "GEMINI_API_KEY is not configured on the server." };
    }

   const geminiResponse = await axios.post(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiApiKey}`,
  {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      responseMimeType: "application/json",
      temperature: 0.8,
      topP: 0.95,
    }
  },
  {
    timeout: 30000,
  }
);

    
    const rawResponse = geminiResponse.data.candidates[0].content.parts[0].text;
    const result = JSON.parse(rawResponse);
    
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
      const data = error.response.data;
      console.error("API Error Details:", data);
      if (status === 500) {
        return { error: `API Error: ${status} (Internal Server Error). This often indicates an issue with the API key or backend services.` };
      }
      if (status === 403) {
        return { error: `Network Error: ${status}. The content source is likely protected and cannot be scraped.` };
      }
       if (status === 400) {
        return { error: `API Error: ${status}. Bad request. Check your API key and the prompt structure.` };
      }
      return { error: `API or Network Error: ${status}. Please check your API key and network connection.` };
    }
    if (error.message.includes('JSON')) {
        return { error: "An error occurred while parsing the AI's response. It may have returned invalid JSON."};
    }
    return { error: error.message || "An unknown error occurred during generation." };
  }
}