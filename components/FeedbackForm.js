import * as React from 'react';
import css from 'styled-jsx/css';

const googleScriptURL = "https://script.google.com/macros/s/AKfycby5j8Vkhn6fuOgta11uHXDm_4ysCOA3i1JqcR_Wd592mJl-8wvJ/exec";

export function FeedbackForm() {
  return (
    <form method="post" action={googleScriptURL}>
      <label for="email">Email</label>
      <input name="email" />
      <label for="feedback_text">Feedback</label>
      <textarea name="feedback_text" />
      { (typeof window !== 'undefined') ? <input type="hidden" name="url" value={window.location.pathname} /> : null}
      <button type="submit">Send</button>
    </form>
  );
}
