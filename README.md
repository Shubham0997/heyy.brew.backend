# Heyy Brew Backend

Node.js/Express backend for Heyy Brew with OpenAI integration for structured coffee recipe generation.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   PORT=3001
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

## Endpoints

- `POST /api/beans/analyze`: Extract bean details from description.
- `POST /api/recipes/generate`: Generate a brewing recipe based on beans and equipment.
- `GET /api/equipment`: List available brewing equipment.
