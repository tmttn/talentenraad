import React from 'react';

function Forms() {
    return (
        <>
            <form className='hidden' name="feedback" data-netlify="true">
                <input type="hidden" name="form-name" value="feedback" />
                <textarea name="feedback"></textarea>
                <input name="email"></input>
            </form>
        </>
        );
};

export default Forms;