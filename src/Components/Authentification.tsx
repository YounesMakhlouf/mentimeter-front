import {useActionState, useState} from 'react';
import * as Components from './Component.tsx';
import {errorStyle} from './component-styles.ts';
import {Navigate, useNavigate} from "react-router";
import {reauthSocket} from "../socket.ts";
import {API_URL, isTokenValid, setAuth} from "../api.ts";

const post = async (path: string, body: unknown) => {
    const res = await fetch(`${API_URL}/authentication/${path}`, {
        method: 'POST',
        body: JSON.stringify(body),
        headers: {'Content-type': 'application/json; charset=UTF-8'},
    });
    return res.json();
};

const errorFrom = (data: {message?: string | string[]}): string => {
    const msg = data.message;
    if (Array.isArray(msg)) return msg[0] ?? 'Authentication failed.';
    return msg ?? 'Authentication failed.';
};

const Authentification = () => {
    const [signIn, setSignIn] = useState(true);
    const navigate = useNavigate();

    const loginAction = async (_prev: string | null, formData: FormData): Promise<string | null> => {
        const email = formData.get('email');
        const password = formData.get('password');
        const data = await post('login', {email, password});
        if (data.status || data.statusCode) return errorFrom(data);
        if (!data.accessToken) return 'Login response missing token. Please try again.';
        setAuth(data);
        reauthSocket();
        navigate('/home');
        return null;
    };

    const registerAction = async (_prev: string | null, formData: FormData): Promise<string | null> => {
        const email = formData.get('email');
        const password = formData.get('password');
        const data = await post('register', {email, password});
        if (data.status || data.statusCode) return errorFrom(data);
        setSignIn(true);
        return null;
    };

    const [loginError, loginFormAction, loginPending] = useActionState(loginAction, null);
    const [registerError, registerFormAction, registerPending] = useActionState(registerAction, null);

    if (isTokenValid()) {
        return <Navigate to='/home'/>;
    }

    return (<div className="centered_div">
        <Components.Container>
            <Components.SignUpContainer signinin={signIn}>
                <Components.Form action={registerFormAction}>
                    <Components.Title>Create Account</Components.Title>
                    <Components.Input name="email" type='email' placeholder='Email'/>
                    <Components.Input name="password" type='password' placeholder='Password'/>
                    <Components.Button disabled={registerPending}>
                        {registerPending ? 'Signing Up…' : 'Sign Up'}
                    </Components.Button>
                    {registerError && <Components.Paragraph>
                        <ul style={errorStyle}>{registerError}</ul>
                    </Components.Paragraph>}
                </Components.Form>
            </Components.SignUpContainer>

            <Components.SignInContainer signinin={signIn}>
                <Components.Form action={loginFormAction}>
                    <Components.Title>Sign in</Components.Title>
                    <Components.Input name="email" type='email' placeholder='Email'/>
                    <Components.Input name="password" type='password' placeholder='Password'/>
                    <Components.Button disabled={loginPending}>
                        {loginPending ? 'Signing In…' : 'Sign In'}
                    </Components.Button>
                    {loginError && <Components.Paragraph>
                        <ul style={errorStyle}>{loginError}</ul>
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
                        <Components.GhostButton onClick={() => setSignIn(true)}>
                            Sign In
                        </Components.GhostButton>
                    </Components.LeftOverlayPanel>

                    <Components.RightOverlayPanel signinin={signIn}>
                        <Components.Title>Hey, Friend!</Components.Title>
                        <Components.Paragraph>
                            Don't have an account ? sign up Now !!!
                        </Components.Paragraph>
                        <Components.GhostButton onClick={() => setSignIn(false)}>
                            Sign Up
                        </Components.GhostButton>
                    </Components.RightOverlayPanel>
                </Components.Overlay>
            </Components.OverlayContainer>
        </Components.Container>
    </div>);
};

export default Authentification;
