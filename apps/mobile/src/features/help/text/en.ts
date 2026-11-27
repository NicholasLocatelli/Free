import type { HelpSectionId, SectionText } from "./sections";

/** Help Center texts in English. Same rules as the Italian source (text/it.ts). */
export const EN_SECTIONS: Readonly<Record<HelpSectionId, SectionText>> = {
  urge: {
    title: "I have an urge right now",
    summary: "Things you can do in the next few minutes.",
    body: [
      "Urges tend to rise, peak and then fade. You don't have to decide anything right now.",
      "• Wait 15 minutes and watch the urge without acting on it.",
      "• Breathe slowly for a minute.",
      "• Change your surroundings: go out, walk, move away from your phone or the place where you gamble.",
      "• Text or call someone you trust.",
      "• Remember why you started this journey.",
      "• Make it harder to reach money and cards straight away.",
      'From the Today screen, "I have an urge" guides you through breathing and waiting.',
    ],
  },
  "after-relapse": {
    title: "I gambled",
    summary: "What you can do after a relapse.",
    body: [
      "A relapse does not erase the progress you have made. Your previous periods and the milestones you reached stay in your history.",
      "• If you can, record the relapse: it helps you recognise difficult moments.",
      "• Think about what came before: a feeling, a place, a person, money being available.",
      "• Talking to someone you trust can help.",
      "• If you are worried about the money spent, a treatment service can help with that too.",
    ],
  },
  professional: {
    title: "Find professional help",
    summary: "Services, helplines and groups.",
    body: [
      "You don't have to face this alone: there are specialised services, helplines and self-help groups.",
    ],
  },
  protect: {
    title: "Tools to protect yourself",
    summary: "Fewer chances to gamble.",
    body: [
      "Putting distance between you and gambling makes difficult moments easier to get through.",
      "• Many banks let you set limits or blocks on payments: ask yours.",
      "• Turn off notifications, emails and apps from betting sites or casinos.",
    ],
  },
  emergency: {
    title: "If you are in danger",
    summary: "Emergencies and someone to talk to now.",
    body: [
      "If you or someone else is in immediate danger, call the emergency number now.",
      "If you are struggling and need to talk, there are people who will listen.",
    ],
  },
  faq: {
    title: "Frequently asked questions",
    summary: "Privacy, the money estimate, relapses.",
    body: [],
    faq: [
      {
        question: "Is this app a form of therapy?",
        answer:
          'No. It is a personal tool to follow your journey. For professional support you can contact the services listed in "Find professional help".',
      },
      {
        question: "If I relapse, do I lose everything?",
        answer:
          "No. The previous period stays in your history with its milestones, and the total time keeps counting.",
      },
      {
        question: "Who can see my data?",
        answer:
          "No one: it stays on this phone. The app has no accounts and does not send your data over the internet.",
      },
      {
        question: "Is the money shown real?",
        answer:
          "It is an estimate based on what you told us. You can change it or turn it off in Settings.",
      },
      {
        question: "Can I change the start date?",
        answer: "Yes, in Settings → Start of the current period.",
      },
    ],
  },
  about: {
    title: "About the app",
    summary: "What it does and what it doesn't.",
    body: [
      "This app is not therapy and does not replace a professional.",
      "Your data stays on your phone: no account, no advertising, nothing sent over the internet.",
      "Sources of help are checked against official sources; each card shows the source and the date it was checked.",
    ],
  },
};
