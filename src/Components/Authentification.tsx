import {useActionState, useState} from 'react';
import styled from 'styled-components';
import {Link, Navigate, useNavigate} from "react-router";
import {reauthSocket} from "../socket.ts";
import {API_URL, isTokenValid, setAuth} from "../api.ts";
import {Button, Card, Input, Logo, ShapeField, ShapeIcon, Sticker} from "../design";

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

const Page = styled.div`
    position: relative;
    height: 100%;
    min-height: 100vh;
    overflow-x: hidden;
`;

const Header = styled.header`
    position: relative;
    padding: 1.375rem 3rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 2;
`;

const Wrap = styled.div`
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr;
    max-width: 67.5rem;
    margin: 2rem auto;
    padding: 0 1.5rem;

    @media (min-width: 50rem) {
        grid-template-columns: 1fr 1fr;
    }
`;

const BrandPanel = styled(Card)<{$mode: 'login' | 'register'}>`
    background: ${({$mode}) => $mode === 'login' ? 'var(--brand)' : 'var(--ink)'};
    color: #fff;
    border-radius: var(--r-lg) var(--r-lg) 0 0;
    padding: 3rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    transition: background .4s ease;
    min-height: 32.5rem;

    @media (min-width: 50rem) {
        border-radius: var(--r-lg) 0 0 var(--r-lg);
    }
`;

const FormPanel = styled(Card)`
    border-radius: 0 0 var(--r-lg) var(--r-lg);
    padding: 2.25rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    background: var(--card);

    @media (min-width: 50rem) {
        border-radius: 0 var(--r-lg) var(--r-lg) 0;
        padding: 3rem 3.5rem;
    }
`;

const Field = styled.label`
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    font-weight: 600;
    font-size: 0.875rem;
`;

const ErrorBlock = styled.div`
    color: #bc2525;
    font-weight: 600;
    font-size: 0.875rem;
`;

const Switch = styled.div`
    text-align: center;
    color: var(--ink-mute);
    font-size: 0.875rem;
    margin-top: 0.5rem;

    a {
        color: var(--brand);
        font-weight: 700;
        margin-left: 0.25rem;
    }
`;

const Authentification = () => {
    const [signIn, setSignIn] = useState(true);
    const navigate = useNavigate();

    const loginAction = async (_prev: string | null, formData: FormData): Promise<string | null> => {
        const email = formData.get('email');
        const password = formData.get('password');
        let data;
        try {
            data = await post('login', {email, password});
        } catch {
            return "Couldn't reach the server. Check your connection and try again.";
        }
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
        let data;
        try {
            data = await post('register', {email, password});
        } catch {
            return "Couldn't reach the server. Check your connection and try again.";
        }
        if (data.status || data.statusCode) return errorFrom(data);
        setSignIn(true);
        return null;
    };

    const [loginError, loginFormAction, loginPending] = useActionState(loginAction, null);
    const [registerError, registerFormAction, registerPending] = useActionState(registerAction, null);

    if (isTokenValid()) {
        return <Navigate to='/home'/>;
    }

    const mode: 'login' | 'register' = signIn ? 'login' : 'register';

    return (
        <Page>
            <ShapeField density={10} opacity={0.16} seed={5}/>
            <Header>
                <Link to="/"><Button $variant="ghost">← Back</Button></Link>
                <Logo size={26}/>
                <div style={{width: 80}}/>
            </Header>
            <Wrap>
                <BrandPanel $mode={mode}>
                    <div>
                        <Sticker color="var(--opt-c)" rotate={-5}>{signIn ? 'Welcome back' : 'Hey, friend'}</Sticker>
                        <h1 style={{fontSize: '3rem', marginTop: '1.5rem', color: '#fff'}}>
                            {signIn ? 'Pick up where you left off.' : "Let's get your classroom buzzing."}
                        </h1>
                        <p style={{fontSize: '1rem', opacity: 0.85, marginTop: '1rem', lineHeight: 1.5}}>
                            {signIn
                                ? 'Your quizzes, drafts, and class history are waiting.'
                                : 'Free for teachers. Unlimited players per game. No credit card.'}
                        </p>
                    </div>
                    <div style={{display: 'flex', gap: 14, alignItems: 'flex-end'}}>
                        <ShapeIcon kind="circle" size={56} color="var(--opt-a)"/>
                        <ShapeIcon kind="square" size={48} color="var(--opt-b)"/>
                        <ShapeIcon kind="triangle" size={64} color="var(--opt-c)"/>
                        <ShapeIcon kind="diamond" size={52} color="var(--opt-d)"/>
                    </div>
                </BrandPanel>

                {signIn ? (
                    <FormPanel as="form" action={loginFormAction}>
                        <h2 style={{fontSize: '2rem'}}>Log in</h2>
                        <p style={{color: 'var(--ink-mute)', fontSize: '0.9375rem', marginTop: '-0.5rem'}}>
                            Use your email and password.
                        </p>
                        <Field>
                            <span>Email</span>
                            <Input name="email" type="email" placeholder="you@school.edu" required/>
                        </Field>
                        <Field>
                            <span>Password</span>
                            <Input name="password" type="password" placeholder="••••••••" required/>
                        </Field>
                        {loginError && <ErrorBlock>{loginError}</ErrorBlock>}
                        <Button type="submit" $variant="primary" $size="lg" disabled={loginPending} style={{marginTop: '0.75rem'}}>
                            {loginPending ? 'Logging in…' : 'Log in →'}
                        </Button>
                        <Switch>
                            New to QuizUp?
                            <a onClick={() => setSignIn(false)}>Sign up</a>
                        </Switch>
                    </FormPanel>
                ) : (
                    <FormPanel as="form" action={registerFormAction}>
                        <h2 style={{fontSize: '2rem'}}>Create account</h2>
                        <p style={{color: 'var(--ink-mute)', fontSize: '0.9375rem', marginTop: '-0.5rem'}}>
                            Just an email and a password — that's it.
                        </p>
                        <Field>
                            <span>Email</span>
                            <Input name="email" type="email" placeholder="you@school.edu" required/>
                        </Field>
                        <Field>
                            <span>Password</span>
                            <Input name="password" type="password" placeholder="••••••••" required/>
                        </Field>
                        {registerError && <ErrorBlock>{registerError}</ErrorBlock>}
                        <Button type="submit" $variant="primary" $size="lg" disabled={registerPending} style={{marginTop: '0.75rem'}}>
                            {registerPending ? 'Creating…' : 'Create account →'}
                        </Button>
                        <Switch>
                            Already have an account?
                            <a onClick={() => setSignIn(true)}>Log in</a>
                        </Switch>
                    </FormPanel>
                )}
            </Wrap>
        </Page>
    );
};

export default Authentification;
