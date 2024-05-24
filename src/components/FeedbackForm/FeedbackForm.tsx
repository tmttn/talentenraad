import React, { useState } from 'react';

function FeedbackForm() {

    const[state, setState] = useState({ feedback: "", email: ""})

    const encode = (data: {[key: string]: string}) => {
        return Object.keys(data)
            .map(key => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
            .join("&");
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        fetch("/", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: encode({ "form-name": "feedback", ...state })
          })
            .then(() => alert("Success!"))
            .catch(error => alert(error));
    
    };

    const handleTextAreaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setState({ ...state, [e.target.name]: e.target.value });
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setState({ ...state, [e.target.name]: e.target.value });
    }


    return (
        <form name="feedback" method="POST" data-netlify="true" onSubmit={handleSubmit}>
            <input type="hidden" name="form-name" value="feedback"/>
            <div>
                <label htmlFor="feedback">Vul je vraag of idee in:</label>
                <textarea id="feedback" name="feedback" required onChange={handleTextAreaChange}/>
            </div>
            <div>
                <label htmlFor="email">Vul je e-mailadres in:</label>
                <input type="email" id="email" name="email" required onChange={handleChange}/>
            </div>
            <button type="submit">Verzenden</button>
        </form>
    );
};

export default FeedbackForm;