import {FC, useState} from 'react';
import * as Components from './Component.tsx';
import {Navigate, useNavigate} from "react-router";
import {reauthSocket} from "../socket.js";

interface AuthentificationProps {
    signIn: boolean;
    toggle: (signIn: boolean) => void;
}

const Authentification: FC<AuthentificationProps> = ({signIn, toggle}) => {
    const [inputDetails, setInputDetails] = useState([]);
    const [error, setError] = useState([]);
    const navigate = useNavigate()
    console.log(localStorage)
    const handleInputChange = (event) => {
        const {name, value} = event.target;
        setInputDetails(prevState => ({
            ...prevState, [name]: value
        }));
    };

    const handleFormSubmit = (event, action) => {
        event.preventDefault();
        console.log(inputDetails)
        fetch(`http://localhost:3000/authentication/${action}`, {
            method: "POST", body: JSON.stringify(inputDetails), headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                console.log("data : ", data);
                if (!data['status'] && !data['statusCode']) {
                    localStorage.setItem('loginInfo', JSON.stringify(data));
                    if (data['accessToken']) {
                        localStorage.setItem('token', data['accessToken']);
                    }
                    reauthSocket();
                    navigate('/home')
                } else {
                    const errorMessages = Array.isArray(data.message) ? data.message : [data.message];
                    setError(errorMessages)
                    console.log("errors:", errorMessages)

                }
            });
    }
    return (<>
        {!localStorage.getItem('loginInfo') ? <div className="centered_div">
            <Components.Container>
                <Components.SignUpContainer signinin={signIn}>
                    <Components.Form onSubmit={(event) => handleFormSubmit(event, 'register')}>
                        <Components.Title>Create Account</Components.Title>
                        <Components.Input name="email" type='email' placeholder='Email'
                                          onChange={handleInputChange}/>
                        <Components.Input name="password" type='password' placeholder='Password'
                                          onChange={handleInputChange}/>
                        <Components.Button>Sign Up</Components.Button>
                        {error && <Components.Paragraph>
                            <ul style={Components.errorStyle}>
                                {error[0]}
                            </ul>
                        </Components.Paragraph>}
                    </Components.Form>

                </Components.SignUpContainer>

                <Components.SignInContainer signinin={signIn}>
                    <Components.Form onSubmit={(event) => handleFormSubmit(event, 'login')}>
                        <Components.Title>Sign in</Components.Title>
                        <Components.Input name="email" type='email' placeholder='Email'
                                          onChange={handleInputChange}/>
                        <Components.Input name="password" type='password' placeholder='Password'
                                          onChange={handleInputChange}/>
                        {/*<Components.Anchor href='#'>Forgot your password?</Components.Anchor>*/}
                        <Components.Button>Sign In</Components.Button>
                        {error && <Components.Paragraph>
                            <ul style={Components.errorStyle}>
                                {error[0]}
                            </ul>
                        </Components.Paragraph>}
                    </Components.Form>

                </Components.SignInContainer>
                <Components.OverlayContainer signinin={signIn}>
                    <Components.Overlay signinin={signIn}>
                        <Components.LeftOverlayPanel signinin={signIn}>
                            <Components.Title>Welcome Back!</Components.Title>
                            <Components.Paragraph>
                                To keep connected with us please login
                            </Components.Paragraph>
                            <Components.GhostButton onClick={() => toggle(true)}>
                                Sign In
                            </Components.GhostButton>
                        </Components.LeftOverlayPanel>

                        <Components.RightOverlayPanel signinin={signIn}>
                            <Components.Title>Hey, Friend!</Components.Title>
                            <Components.Paragraph>
                                Don't have an account ? sign up Now !!!
                            </Components.Paragraph>
                            <Components.GhostButton onClick={() => toggle(false)}>
                                Sign Up
                            </Components.GhostButton>
                        </Components.RightOverlayPanel>
                    </Components.Overlay>
                </Components.OverlayContainer>
            </Components.Container>
        </div> : <Navigate to='/home'/>}
    </>);
};

export default Authentification;