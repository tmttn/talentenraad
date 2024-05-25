import React from 'react';
import { useForm, ValidationError } from '@formspree/react';

const FeedbackForm: React.FC = () => {
  const [state, handleSubmit] = useForm("xgegbngw");

  if (state.succeeded) {
    return (
      <div role="alert" className="alert alert-success">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 stroke-current shrink-0" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p>Bedankt! We hebben je bericht goed ontvangen.</p>
      </div>);
  }

  return (
    <form onSubmit={handleSubmit} className="md:min-w-[500px] sm:min-w-full flex flex-col gap-5">
      <label className='form-control'>
        <div className='label'>
          <span className="label-text">Vul je e-mailadres in:</span>
        </div>
        <input
          id="email"
          type="email"
          name="email"
          className="w-full bg-slate-50 input input-bordered"
        />
        <ValidationError
          prefix="Email"
          field="email"
          errors={state.errors}
        />
      </label>

      <label className='form-control'>
        <div className='label'>
          <span className="label-text">Vul je bericht in:</span>
        </div>
        <textarea
          id="message"
          name="message"
          className="h-24 textarea textarea-bordered bg-slate-50"
        />
        <ValidationError
          prefix="Message"
          field="message"
          errors={state.errors}
        />
      </label>

      <div className="flex justify-end">
        <button type="submit" disabled={state.submitting} className="btn btn-primary">
          Verzenden
        </button>
      </div>
    </form>
  );
}

export default FeedbackForm;