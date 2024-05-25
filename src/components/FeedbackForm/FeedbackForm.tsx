import { useForm } from '@formspree/react';
import React from 'react'

export default function FeedbackForm() {
  const [state, handleSubmit, reset] = useForm('feedback');
  if (state.succeeded) {
    return <div>Thank you for signing up!</div>;
  }

  return (
    <form onSubmit={handleSubmit}>
      <p>
        <label>
          Je e-mailadres:
          <br />
          <input type="email" name="email" />
        </label>
      </p>
      <p>
        <label>
          Je bericht:
          <br />
          <textarea name="message" />
        </label>
      </p>
      <p>
        <button type="submit" disabled={state.submitting}>Versturen</button>
      </p>
    </form>
  )
}