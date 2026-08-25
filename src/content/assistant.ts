/**
 * ============================================================================
 * ASSISTANT CONTENT
 * ============================================================================
 *
 * Every word the assistant says or shows. Tone of voice lives here, so a
 * different brand can sound completely different without any code changing.
 */

export const assistantCopy = {
  /** Shown in the wide bar before anything has been typed. */
  placeholder: 'Ask anything...',

  /** Shown inside the console's own input once it is open. */
  consolePlaceholder: 'Ask anything...',

  /** The example spoken query, used to demonstrate voice input. */
  demoQuery: 'Necklaces for summer wedding in Italy',

  /** What the assistant says once it has found something. */
  answer: 'These pieces scream Italian summer. Which are your vibe?',

  /** Accessible labels. Never displayed, but read aloud by screen readers. */
  labels: {
    open: 'Open the shopping assistant',
    close: 'Close the shopping assistant',
    expand: 'Expand to full screen',
    collapse: 'Return to the smaller view',
    save: 'Save this piece',
    voice: 'Ask by voice',
    submit: 'Send',
  },
} as const;
