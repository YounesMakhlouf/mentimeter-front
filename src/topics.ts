export const TOPIC_KEYS = [
    'animals',
    'art',
    'biology',
    'chemistry',
    'geography',
    'history',
    'literature',
    'math',
    'movies',
    'music',
    'physics',
    'politics',
    'programming',
    'science',
    'space',
    'sports',
] as const;

export type TopicKey = typeof TOPIC_KEYS[number];

export const formatTopic = (topic: string): string =>
    topic ? topic.charAt(0).toUpperCase() + topic.slice(1).toLowerCase() : topic;
