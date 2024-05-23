import React from 'react';

function Forms() {
    return (
        <>
            <form className='hidden' name="feedback" data-netlify="true">
                <textarea name="feedback"></textarea>
                <input name="email"></input>
            </form>
        </>
        );
};

export default Forms;