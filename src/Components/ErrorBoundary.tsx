import styled from 'styled-components';
import {Link, isRouteErrorResponse, useRouteError} from 'react-router';
import {Logo, ShapeField, Sticker} from '../design/primitives.tsx';
import {PrimaryButton} from '../design/styled.ts';

const Page = styled.div`
    position: relative;
    min-height: 100vh;
    overflow-x: hidden;
`;

const Header = styled.header`
    position: relative;
    padding: 1.375rem 2rem;
    z-index: 2;
`;

const Body = styled.div`
    position: relative;
    z-index: 2;
    max-width: 45rem;
    margin: 3.75rem auto;
    padding: 2rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
`;

const Title = styled.h1`
    font-size: 2.75rem;
    margin: 0.5rem 0;

    @media (min-width: 37.5rem) {
        font-size: 4rem;
    }
`;

const Detail = styled.p`
    color: var(--ink-mute);
    font-size: 1rem;
    max-width: 30rem;
`;

const describe = (err: unknown): {title: string; detail: string} => {
    if (isRouteErrorResponse(err)) {
        if (err.status === 404) return {title: 'Page not found', detail: "We couldn't find what you were looking for."};
        return {title: `${err.status} ${err.statusText}`, detail: err.data?.toString() ?? 'Unexpected response from the server.'};
    }
    if (err instanceof Error) return {title: 'Something broke', detail: err.message};
    return {title: 'Something broke', detail: 'Try refreshing or heading back home.'};
};

export default function ErrorBoundary() {
    const error = useRouteError();
    const {title, detail} = describe(error);
    return (
        <Page>
            <ShapeField density={10} opacity={0.18} seed={42}/>
            <Header><Logo size={26}/></Header>
            <Body>
                <Sticker color="var(--opt-a)" rotate={-4}>Oops</Sticker>
                <Title>{title}</Title>
                <Detail>{detail}</Detail>
                <Link to="/">
                    <PrimaryButton type="button" style={{padding: '1rem 1.5rem', fontSize: '1.0625rem'}}>
                        Take me home →
                    </PrimaryButton>
                </Link>
            </Body>
        </Page>
    );
}
