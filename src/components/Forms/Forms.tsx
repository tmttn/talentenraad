import React from 'react';

function Forms() {
    return (
        <>
            <form className='hidden' name="feedback" netlify netlify-honeypot="bot-field" hidden>
                <textarea name="feedback"></textarea>
                <input name="email"></input>
            </form>
        </>
        );
};

export default Forms;