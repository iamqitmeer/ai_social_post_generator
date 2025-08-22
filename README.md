# AI Social Post Generator

This is an AI tool that creates social media posts for you. It turns any article or blog post into ready-to-use social media posts. Just give it a link, and it writes the posts for you.

## Key Features

-   **Create Posts from any Link**: Just paste a URL, and the AI will read the content.
-   **Customize Everything**:
    -   **Tone**: Choose how you want the posts to sound (Professional, Witty, Casual, etc.).
    -   **Platform**: Get posts optimized for X (Twitter), LinkedIn, Instagram, and more.
    -   **Language**: Create posts in English, Spanish, French, and other languages.
    -   **Post Types**: Select different styles like questions, summaries, or hooks.
-   **Smart AI Features**:
    -   **AI Image Ideas**: Get ideas for images to go with your posts.
    -   **Engagement Score**: See a score that guesses how well your post might do.
-   **Easy to Use Interface**:
    -   **Edit Posts Directly**: Click on any post to change the text.
    -   **Regenerate Single Posts**: Don't like one post? Click a button to rewrite just that one.
    -   **Download Your Posts**: Export all your posts as a CSV file.

## Tech Stack

-   **Framework**: Next.js 14
-   **Language**: JavaScript
-   **Styling**: Tailwind CSS
-   **Animations**: Framer Motion
-   **Web Scraping**: Cheerio & Axios
-   **AI Model**: Google Gemini API

## Getting Started

Follow these steps to run the project on your own computer.

### You will need:

-   Node.js (version 18 or higher)

### Step 1: Clone the Repository

First, clone the project to your computer. Open your terminal and run:

```bash
git clone https://github.com/iamqitmeer/ai_social_post_generator.git
cd ai_social_post_generator
```

### Step 2: Install Dependencies

Next, install the necessary packages for the project to run.

```bash
npm install
```

### Step 3: Set Up Your API Key

The app needs a Google Gemini API key to work.

1.  In the main project folder, create a new file named `.env.local`.
2.  Inside this file, add your API key like this:

    ```
    GEMINI_API_KEY="YOUR_GOOGLE_GEMINI_API_KEY_HERE"
    ```

3.  **Important**: You can get your free API key from [Google AI Studio](https://aistudio.google.com/app/apikey).

### Step 4: Run the App

Finally, you can start the application.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the app.

## How It Works

1.  **You provide a URL** and choose your settings (like tone and platform).
2.  **The app reads the content** from the URL you provided.
3.  **It sends the content** and your settings to the Google Gemini AI.
4.  **The AI writes the social media posts** based on your rules.
5.  **The posts appear on the screen** for you to use, edit, or download.