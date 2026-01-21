
import { Course } from './types';

export const COURSES: Course[] = [
  {
    id: 'intro-ai',
    title: 'Foundations of AI',
    description: 'Master the fundamental building blocks of intelligence in the digital age.',
    icon: '🧠',
    color: 'bg-blue-100 text-blue-600',
    lessons: [
      {
        id: 'what-is-ai',
        title: 'The Spark of Logic',
        duration: '5 min',
        imageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4628c9759?auto=format&fit=crop&q=80&w=1200',
        content: `AI isn't magic; it's the art of teaching machines to recognize patterns. While a calculator follows strict rules, an AI model explores a universe of data to make predictions. Think of it as giving a computer 'intuition' based on math.`,
        quiz: [
          {
            question: "How does AI differ from traditional software?",
            options: ["It uses faster electricity", "It learns from data patterns", "It is always 100% correct", "It only works on robots"],
            answerIndex: 1
          }
        ]
      },
      {
        id: 'neural-nets',
        title: 'Neural Architecture',
        duration: '10 min',
        imageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?auto=format&fit=crop&q=80&w=1200',
        content: `Modern AI is inspired by the human brain. We build 'Neural Networks'—layers of digital neurons that pass information back and forth. By adjusting the 'weights' between these neurons, the machine becomes smarter with every example it sees.`,
        quiz: [
          {
            question: "What inspired the structure of modern AI models?",
            options: ["The Steam Engine", "The Human Brain", "Crystal Formations", "Solar Systems"],
            answerIndex: 1
          }
        ]
      }
    ]
  },
  {
    id: 'gen-ai',
    title: 'Generative Frontier',
    description: 'Learn how machines create art, code, and language from thin air.',
    icon: '✨',
    color: 'bg-purple-100 text-purple-600',
    lessons: [
      {
        id: 'llm-basics',
        title: 'The Power of Prediction',
        duration: '12 min',
        imageUrl: 'https://images.unsplash.com/photo-1614728263952-84ea256f9679?auto=format&fit=crop&q=80&w=1200',
        content: `Large Language Models (LLMs) are essentially super-powered autocomplete. By reading nearly everything ever written, they understand the statistical probability of words. When you ask a question, they aren't 'searching'—they are creating.`,
        quiz: [
          {
            question: "What is the core mechanic of a Large Language Model?",
            options: ["Copying from Wikipedia", "Statistical word prediction", "Randomly picking letters", "Connecting to a human operator"],
            answerIndex: 1
          }
        ]
      }
    ]
  },
  {
    id: 'ethics-ai',
    title: 'Digital Ethics',
    description: 'Building a future where AI is safe, fair, and helpful for everyone.',
    icon: '⚖️',
    color: 'bg-emerald-100 text-emerald-600',
    lessons: [
      {
        id: 'bias-check',
        title: 'The Mirror of Data',
        duration: '7 min',
        imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1200',
        content: `AI reflects the data we give it. If our data contains biases, the AI will learn them too. Responsible AI development means constantly checking the 'mirror' to ensure our digital assistants treat everyone fairly.`,
        quiz: [
          {
            question: "Why is bias a problem in AI?",
            options: ["It makes the computer slow", "It reflects human unfairness in code", "It costs more money", "It breaks the hardware"],
            answerIndex: 1
          }
        ]
      }
    ]
  }
];
