import { ChangeEvent, CSSProperties, useState } from "react";
import { randomQuizName } from '../utils/quizname-generator.ts';
import { useNavigate } from "react-router";

export default function CreateQuizForm() {
    const [formData, setFormData] = useState({
        name: ''
    });
    const navigate = useNavigate();

    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData({ ...formData, [name]: value });
    };

    const formStyle: CSSProperties = {
        display: "flex", flexDirection: "column", justifyContent: "flex-start"
    };
    const buttonStyle = {
        width: "10em", height: "4em", borderRadius: "50px", marginTop: "1em", backgroundColor: "rgba(225,175,209,0.94)"
    }
    const inputStyle = {
        width: "100%", height: "3em", borderRadius: "50px", border: "none", paddingLeft: "1em"
    };

    return (
        <>
            <h3>Let's give your new quiz a name </h3>
            <form onSubmit={(event) => { event.preventDefault(); navigate('/build', { state: { quizName: formData.name } }) }} style={formStyle}>
                <div>
                    <input
                        style={inputStyle}
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder={randomQuizName}
                    />
                </div>
                <button style={buttonStyle}>Let's Go !</button>
            </form>
        </>
    )
}
