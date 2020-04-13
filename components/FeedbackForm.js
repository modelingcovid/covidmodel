import * as React from 'react';
import css from 'styled-jsx/css';
import {theme} from '../styles';

const {useState} = React;

const googleScriptURL =
  'https://script.google.com/macros/s/AKfycby5j8Vkhn6fuOgta11uHXDm_4ysCOA3i1JqcR_Wd592mJl-8wvJ/exec';

const styles = css`
  .form {
    padding: 10px;
    display: flex;
    flex-direction: column;
    border: 1px solid var(--color-gray1);
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

  .close {
    border: none;
    margin-right: ${theme.spacing[2]};
    color: var(--color-gray2);
  }
  .headers {
    display: flex;
    justify-content: space-between;
  }
`;

export function FeedbackForm() {
  const [isOpen, setOpen] = useState(false);

  return !isOpen ? (
    <button onClick={(_) => setOpen(true)}>Leave us feedback</button>
  ) : (
    <form className="form" method="post" action={googleScriptURL}>
      <style jsx>{styles}</style>
      <h3>Leave us feedback</h3>
      <label for="email">Email</label>
      <input
        type="email"
        className="input"
        name="email"
        placeholder="Optional"
      />
      <label for="feedback_text">How could this site improve?</label>
      <textarea className="input" name="feedback_text" />
      {typeof window !== 'undefined' ? (
        <input type="hidden" name="url" value={window.location.pathname} />
      ) : null}
      <div className="right">
        <button className="close" onClick={(_) => setOpen(false)}>
          Cancel
        </button>
        <button className="button" type="submit">
          Send
        </button>
      </div>
    </form>
  );
}
