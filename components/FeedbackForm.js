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
    margin-bottom: ${theme.spacing[0]};
    margin-top: ${theme.spacing[0]};
    padding: ${theme.spacing[0]};
    border: 1px solid var(--color-gray1);
  }
  .feedback-text {
    min-height: 100px;
  }

  .button {
    padding: 10px;
    border: 1px solid;
  }
  .right {
    text-align: end;
  }
  .button-row {
    margin-top: ${theme.spacing[0]};
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
  .fixed-bottom-right {
    position: fixed;
    bottom: 15px;
    right: 15px;
  }
  .overlayed {
    z-index: 51;
    background-color: white;
  }
  button.subtle {
    color: var(--color-gray2);
  }
  .title {
    margin-top: ${theme.spacing[0]};
    margin-bottom: ${theme.spacing[0]};
  }
  @media only screen and (max-width: 1300px) {
    .hidden-in-narrow {
      display: none;
    }
  }
`;


function queryParams(params) {
  return Object.keys(params)
          .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(params[k]))
          .join('&');
}

function submitFeedback(email, text) {
  const payload = {
    email: email,
    feedback_text: text,
    url: window.location.pathname,
  };
  return fetch(googleScriptURL + '?' + queryParams(payload));
}


export function FeedbackForm() {
  const [isOpen, setOpen] = useState(false);
  const [isPending, setPending] = useState(false);
  const [isThankYou, setThankYou] = useState(false);

  const closeAndThank = () => {
      setPending(false);
      setThankYou(true);
      setTimeout((_) => {
          setThankYou(false);
      }, 2000);
      setOpen(false);
  };

  const onSubmit = (e) => {
    if (!isPending) {
      setPending(true);
      const email = document.getElementById('feedback-email').value;
      const feedbackText = document.getElementById('feedback-text').value;
      submitFeedback(email, feedbackText).then((_) => {
          setPending(false);
          closeAndThank();
      }).catch((e) => {
          console.log("POST to Google Script failed");
          console.error(e);
          setPending(false);
          closeAndThank();
      });
    }
  };

  return (
    <div className="hidden-in-narrow fixed-bottom-right overlayed">
      <style jsx>{styles}</style>
      {!isOpen ? (
        <button className="button subtle" onClick={(_) => setOpen(true)}>
          {isThankYou ? "Thank you!" :  "Leave us feedback"}
        </button>
      ) : (
        <form className="form" method="post" action={googleScriptURL}>
          <h3 className="title">Leave us feedback</h3>
          <input
            id="feedback-email"
            type="email"
            className="input"
            name="email"
            placeholder="Email (Optional)"
          />
          <textarea
            id="feedback-text"
            className="input feedback-text"
            name="feedback_text"
            placeholder="How could we improve this site?"
          />
          <div className="button-row right">
            <button className="close" onClick={(_) => setOpen(false)}>
              Cancel
            </button>
            {isPending ? (
              <button className="button" type="button">
                Sending...
              </button>
            ) : (
              <button onClick={onSubmit} className="button" type="button">
                Send
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}
