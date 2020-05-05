import * as React from 'react';
import Link from 'next/link';
import {Instruction} from '../content';
import {DateModelRun} from '../modeling';

export function Contact() {
  return (
    <Instruction className="instruction-sparse">
      <strong>Questions? Feedback?</strong> Contact us at{' '}
      <a href="mailto:info@modelingcovid.com">info@modelingcovid.com</a>
      <br />
      <br />
      <strong>
        Model run on <DateModelRun />
      </strong>
      <br />
      <Link href="/about">
        <a>Recent & upcoming changes</a>
      </Link>
    </Instruction>
  );
}
