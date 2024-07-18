# My personal Website

<a href="https://ericwu.me">ericwu.me</a>

![image](https://github.com/user-attachments/assets/38e4b0b4-b942-4e46-9248-4423e820bba9)

![Google Chrome 2024-07-12 22 33 34](https://github.com/user-attachments/assets/7949a952-580f-4577-ab7f-e7ccfc1dd57e)

Built using Next.js 14. The website features a blog powered by the Notion API, serving as the CMS. The design is inspired by Nev Flynn's Bento design, focusing on simplicity and user-friendly interfaces.

## Features

- **Next.js 14**: Utilizes the latest features of Next.js for fast rendering and efficient SEO optimization.
- **Notion API**: Integrates Notion as a headless CMS to manage and retrieve blog content dynamically.
- **Responsive Bento Design**: Adopts the aesthetic and functional principles of Bento design, customized for a unique look and feel.

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v16.x or later recommended)
- npm or yarn

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/itsEricWu/ericwu.me.git
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory and add the following variables:
   ```plaintext
    OPENAI_API_KEY=exampleAPIKey
    NEXT_PUBLIC_MAPBOX_TOKEN=exampleAPIKey
    NEXT_PUBLIC_FIREBASE_API_KEY=exampleAPIKey
   ```

### Running the project

To run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Deployment

This website is ready to be deployed on platforms like Vercel, Netlify, or any other platform that supports Next.js. Follow the deployment documentation of your chosen platform for specific instructions.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=itsEricWu/ericwu.me&type=Date)](https://star-history.com/#itsEricWu/ericwu.me&Date)

## Contributing

Contributions are welcome! For major changes, please open an issue first to discuss what you would like to change.
