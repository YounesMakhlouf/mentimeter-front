import styled from 'styled-components';
import {Link, isRouteErrorResponse, useRouteError} from 'react-router';
import {Button, Logo, Page, ShapeField, Sticker} from '../design';

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
    margin: 0.5rem 0;
`;

const Detail = styled.p`
    color: var(--ink-mute);
    font-size: var(--step--1);
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
                    <Button type="button" $variant="primary" $size="lg">
                        Take me home →
                    </Button>
                </Link>
            </Body>
        </Page>
    );
}
