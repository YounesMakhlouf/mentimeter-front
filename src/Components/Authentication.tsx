import {useActionState, useState} from 'react';
import styled from 'styled-components';
import {Link, Navigate, useNavigate} from "react-router";
import {reauthSocket} from "../socket.ts";
import {API_URL, isTokenValid, setAuth} from "../api.ts";
import {Button, Card, ErrorText, Input, Logo, Page, ShapeField, ShapeIcon, Sticker} from "../design";

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

const Header = styled.header.attrs({className: 'wrapper'})`
    --wrapper-max: 67.5rem;
    position: relative;
    padding-block: 1.375rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    z-index: 2;
`;

const Wrap = styled.div.attrs({className: 'wrapper'})`
    --wrapper-max: 67.5rem;
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr;
    margin-block: 2rem;

    @media (min-width: 50rem) {
        grid-template-columns: 1fr 1fr;
    }
`;

const BrandPanel = styled(Card)<{$mode: 'login' | 'register'}>`
    display: none;

    @media (min-width: 50rem) {
        display: flex;
        background: ${({$mode}) => $mode === 'login' ? 'var(--brand)' : 'var(--ink)'};
        color: #fff;
        border-radius: var(--r-lg) 0 0 var(--r-lg);
        padding: 3rem;
        flex-direction: column;
        justify-content: space-between;
        transition: background .4s ease;
        min-height: 32.5rem;
    }
`;

const FormPanel = styled(Card)`
    border-radius: var(--r-lg);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: var(--gap-4);
    background: var(--card);

    @media (min-width: 50rem) {
        border-radius: 0 var(--r-lg) var(--r-lg) 0;
        padding: 3rem 3.5rem;
    }
`;

const Field = styled.label`
    display: flex;
    flex-direction: column;
    gap: var(--gap-2);
    font-weight: 600;
    font-size: var(--step--1);
`;

const HeaderSpacer = styled.div`
    width: 5rem;
`;

const BrandTitle = styled.h1`
    font-size: var(--step-4);
    margin-top: 1.5rem;
    color: #fff;
`;

const BrandBlurb = styled.p`
    font-size: var(--step--1);
    opacity: 0.85;
    margin-top: 1rem;
    line-height: 1.5;
`;

const ShapeRow = styled.div`
    display: flex;
    gap: var(--gap-4);
    align-items: flex-end;
`;

const FormSubtle = styled.p`
    color: var(--ink-mute);
    font-size: var(--step--1);
    margin-top: -0.5rem;
`;

const SubmitButton = styled(Button).attrs({type: 'submit', $variant: 'primary' as const, $size: 'lg' as const})`
    margin-top: 0.75rem;
`;

const Switch = styled.div`
    text-align: center;
    color: var(--ink-mute);
    font-size: var(--step--1);
    margin-top: 0.5rem;

    a {
        color: var(--brand);
        font-weight: 700;
        margin-left: 0.25rem;
    }
`;

const Authentication = () => {
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
                <HeaderSpacer/>
            </Header>
            <Wrap>
                <BrandPanel $mode={mode}>
                    <div>
                        <Sticker color="var(--opt-c)" rotate={-5}>{signIn ? 'Welcome back' : 'Hey, friend'}</Sticker>
                        <BrandTitle>
                            {signIn ? 'Pick up where you left off.' : "Let's get your classroom buzzing."}
                        </BrandTitle>
                        <BrandBlurb>
                            {signIn
                                ? 'Your quizzes, drafts, and class history are waiting.'
                                : 'Free for teachers. Unlimited players per game. No credit card.'}
                        </BrandBlurb>
                    </div>
                    <ShapeRow>
                        <ShapeIcon kind="circle" size={56} color="var(--opt-a)"/>
                        <ShapeIcon kind="square" size={48} color="var(--opt-b)"/>
                        <ShapeIcon kind="triangle" size={64} color="var(--opt-c)"/>
                        <ShapeIcon kind="diamond" size={52} color="var(--opt-d)"/>
                    </ShapeRow>
                </BrandPanel>

                {signIn ? (
                    <FormPanel as="form" action={loginFormAction}>
                        <h2>Log in</h2>
                        <FormSubtle>Use your email and password.</FormSubtle>
                        <Field>
                            <span>Email</span>
                            <Input name="email" type="email" placeholder="you@school.edu" required/>
                        </Field>
                        <Field>
                            <span>Password</span>
                            <Input name="password" type="password" placeholder="••••••••" required/>
                        </Field>
                        {loginError && <ErrorText>{loginError}</ErrorText>}
                        <SubmitButton disabled={loginPending}>
                            {loginPending ? 'Logging in…' : 'Log in →'}
                        </SubmitButton>
                        <Switch>
                            New to QuizUp?
                            <a onClick={() => setSignIn(false)}>Sign up</a>
                        </Switch>
                    </FormPanel>
                ) : (
                    <FormPanel as="form" action={registerFormAction}>
                        <h2>Create account</h2>
                        <FormSubtle>Just an email and a password — that's it.</FormSubtle>
                        <Field>
                            <span>Email</span>
                            <Input name="email" type="email" placeholder="you@school.edu" required/>
                        </Field>
                        <Field>
                            <span>Password</span>
                            <Input name="password" type="password" placeholder="••••••••" required/>
                        </Field>
                        {registerError && <ErrorText>{registerError}</ErrorText>}
                        <SubmitButton disabled={registerPending}>
                            {registerPending ? 'Creating…' : 'Create account →'}
                        </SubmitButton>
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

export default Authentication;
