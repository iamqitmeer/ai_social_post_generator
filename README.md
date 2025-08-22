# AI Social Post Generator

The ultimate tool to instantly generate high-quality, platform-optimized social media posts from any website link. This Next.js application leverages the Google Gemini API to transform any article or blog post into a suite of ready-to-publish content, saving you hours of manual work.

## ✨ GOATed Features

*   **Advanced Content Scraping**: Provide any URL, and the app intelligently scrapes the title, description, and core content, bypassing many anti-scraping measures using a proxy.
*   **Multi-Variation Generation**: Don't just get one post. Generate multiple, distinct variations from a single link:
    *   Intriguing Hooks
    *   Key Summaries
    *   Engaging Questions
    *   Actionable Takeaways
*   **Deep Customization**: Tailor your content with precision.
    *   **Tone Selection**: Choose from Engaging, Professional, Witty, or Casual.
    *   **Platform Optimization**: Get perfectly formatted content for X (Twitter), LinkedIn, Instagram, or Threads, with appropriate length and hashtag conventions.
    *   **Multi-Language Support**: Generate posts in English, Spanish, French, German, and more.
*   **Sophisticated UI/UX**:
    *   Built with **Next.js 14 (App Router)** and styled with **TailwindCSS**.
    *   Fluid animations powered by **Framer Motion** for a smooth, modern feel.
    *   Clean, responsive design using the **Poppins** font for excellent readability.
*   **Informative Loading & Error States**: The UI provides real-time feedback, showing whether it's scraping, analyzing, or generating. Error messages are clear and helpful.
*   **Scraped Content Preview**: See the title and description extracted from the URL before you even look at the posts.
*   **One-Click Copy**: Easily copy any generated post to your clipboard.

## 🚀 Getting Started

Follow these instructions to get the project up and running on your local machine.

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm or yarn

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/iamqitmeer/ai_social_post_generator.git
    cd ai_social_post_generator
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up environment variables:**
    Create a file named `.env.local` in the root of your project and add your Google Gemini API key. You can get a key from [Google AI Studio](https://aistudio.google.com/app/apikey).

    ```env
    NEXT_PUBLIC_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    # or
    yarn dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠️ Project Structure

*   `app/layout.js`: The root layout, including metadata and font configuration (Poppins).
*   `app/globals.css`: Global styles and TailwindCSS setup.
*   `app/page.js`: The main single-page application component containing all the UI, state management, and logic.
*   `app/actions.js`: The Next.js Server Action responsible for scraping the URL, calling the Gemini API, and returning the structured response.
*   `tailwind.config.js`: Configuration file for TailwindCSS, including custom fonts and colors.

## 💡 How It Works

1.  **URL Input**: The user provides a URL and selects their desired content parameters (tone, platform, variations).
2.  **Server Action Trigger**: The form submission triggers the `scrapeAndGenerate` Server Action.
3.  **Content Scraping**: The action uses an `allorigins.win` proxy to fetch the HTML from the target URL, helping to bypass common CORS and `403 Forbidden` errors. **Cheerio** is then used to parse the HTML and extract key text content.
4.  **Prompt Engineering**: A detailed, structured prompt is constructed, providing the Gemini API with the scraped content and a set of strict instructions on tone, platform optimization, and the required JSON output format.
5.  **Gemini API Call**: The prompt is sent to the `gemini-1.5-flash` model via an `axios` POST request, with a configuration requesting a JSON response.
6.  **Response Handling**: The JSON response from Gemini is parsed and sent back to the client component.
7.  **UI Rendering**: The React component updates its state, and Framer Motion animates the new content (scraped summary and post cards) into view.