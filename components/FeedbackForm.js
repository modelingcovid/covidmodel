import * as React from 'react';
import css from 'styled-jsx/css';
import {theme} from '../styles';

const googleScriptURL = "https://script.google.com/macros/s/AKfycby5j8Vkhn6fuOgta11uHXDm_4ysCOA3i1JqcR_Wd592mJl-8wvJ/exec";

const styles = css`
  .form {
    padding: 10px;
    display: flex;
    flex-direction: column;
    border: 2px solid var(--color-gray1);
    min-width: 300px;
    max-width: 500px;
    padding: ${theme.spacing[1]} ${theme.spacing[1]};
  }

  .input {
    margin-bottom: ${theme.spacing[1]};
    margin-top: ${theme.spacing[0]};
    padding: ${theme.spacing[0]};
    border: 1px solid var(--color-gray1);
  }

  .button {
    border: none;
  }
  .right {
    text-align: end;
  }
`;

export function FeedbackForm() {
  return (
    <form className="form" method="post" action={googleScriptURL}>
      <style jsx>{styles}</style>
      <h3>Leave us feedback</h3>
      <label for="email">Email</label>
      <input type="email" className="input" name="email" placeholder="Optional" />
      <label for="feedback_text">How could this site improve?</label>
      <textarea className="input" name="feedback_text" />
      { (typeof window !== 'undefined') ? <input type="hidden" name="url" value={window.location.pathname} /> : null}
      <div className="right">
        <button className="button" type="submit">Send</button>
      </div>
    </form>
  );
}
