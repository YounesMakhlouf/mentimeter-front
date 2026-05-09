import {useEffect, useState} from "react";
import styled from "styled-components";
import EnterQuizCodeForm from "../Components/EnterQuizCodeForm.tsx";
import Modal from "../Components/Modal.tsx";
import {socket, QuestionPayload} from "../socket.ts";
import {Link, useNavigate} from "react-router";
import {Card, GhostButton, InkButton, PrimaryButton} from "../design/styled.ts";
import {Avatar, Logo, ShapeField, ShapeIcon, Sticker} from "../design/primitives.tsx";
import {OPT_META} from "../design/tokens.ts";

const Page = styled.div`
    position: relative;
    min-height: 100vh;
    overflow-x: hidden;
`;

const TopNav = styled.header`
    position: relative;
    z-index: 2;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1.375rem 3rem;
`;

const NavActions = styled.div`
    display: flex;
    gap: 0.625rem;
`;

const Hero = styled.div`
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr;
    gap: 4rem;
    padding: 1.5rem;
    max-width: 80rem;
    margin: 0 auto;
    align-items: center;

    @media (min-width: 56.25rem) {
        grid-template-columns: 1.15fr 1fr;
        padding: 2rem 4rem 4rem;
    }
`;

const Headline = styled.h1`
    font-size: clamp(3.5rem, 7.2vw, 6.5rem);
    margin: 1.5rem 0;
    font-weight: 800;
`;

const Highlight = styled.span`
    background: var(--opt-a);
    color: #fff;
    padding: 0 0.875rem;
    border-radius: 0.875rem;
    display: inline-block;
    transform: rotate(-1.5deg);
    border: 3px solid var(--ink);
    box-shadow: var(--shadow-sm);
`;

const Phrase = styled.p`
    font-size: 1.375rem;
    line-height: 1.4;
    color: var(--ink-soft);
    max-width: 33.75rem;
    margin-bottom: 2.25rem;
    min-height: 4rem;
`;

const PinRow = styled(Card)`
    padding: 0.75rem;
    display: flex;
    gap: 0.625rem;
    align-items: center;
    max-width: 33.75rem;
    border-radius: 999px;
`;

const PinLabel = styled.span`
    padding-left: 0.875rem;
    font-weight: 700;
    color: var(--ink-mute);
`;

const PinInput = styled.input`
    flex: 1;
    border: none;
    outline: none;
    font-size: 1.375rem;
    font-weight: 700;
    padding: 0.625rem 0.25rem;
    font-family: var(--body);
    background: transparent;
    color: var(--ink);
    min-width: 0;
`;

const PinSubmit = styled(InkButton)`
    border-radius: 999px;
    padding: 0.875rem 1.75rem;
`;

const PreviewArea = styled.div`
    display: none;
    @media (min-width: 56.25rem) {
        display: block;
        position: relative;
        height: 28.75rem;
    }
`;

const QuestionPreview = styled(Card)`
    position: absolute;
    top: 1.25rem;
    left: 1.875rem;
    padding: 1.125rem;
    transform: rotate(-4deg);
    width: 15rem;
    background: var(--opt-a);
    color: #fff;
    border-radius: 1.25rem;
`;

const LeaderboardPreview = styled(Card)`
    position: absolute;
    top: 8.75rem;
    right: 0;
    padding: 1.375rem;
    transform: rotate(3deg);
    width: 17.5rem;
    animation-delay: 0.1s;
`;

const StreakPreview = styled(Card)`
    position: absolute;
    bottom: 0.625rem;
    left: 0;
    padding: 1rem 1.25rem;
    transform: rotate(-2deg);
    display: flex;
    align-items: center;
    gap: 0.875rem;
    animation-delay: 0.2s;
    background: var(--opt-d);
`;

const phrases = [
    'Are you a quiz whiz?',
    'Run quizzes your class will actually remember.',
    'Press play. Watch the room light up.',
    'Live answers. Loud podiums. Lessons that stick.',
];

function WelcomePage() {
    const [open, setOpen] = useState(false);
    const [code, setCode] = useState('');
    const [phraseIdx, setPhraseIdx] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        const t = setInterval(() => setPhraseIdx((i) => (i + 1) % phrases.length), 3800);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const onQuestion = (data: QuestionPayload) => {
            navigate('/qspage', {state: {payload: data}});
        };
        socket.on('question', onQuestion);
        return () => {
            socket.off('question', onQuestion);
        };
    }, [navigate]);

    const closeModal = () => setOpen(false);

    return (
        <Page>
            <ShapeField density={14} opacity={0.22} seed={3}/>
            <TopNav>
                <Logo size={28}/>
                <NavActions>
                    <Link to="/authentication"><GhostButton>Log in</GhostButton></Link>
                    <Link to="/authentication"><PrimaryButton>Get started</PrimaryButton></Link>
                </NavActions>
            </TopNav>

            <Hero>
                <div>
                    <Sticker color="var(--opt-c)" rotate={-4}>For teachers · Free forever</Sticker>
                    <Headline>
                        Make every <Highlight>question</Highlight><br/>count.
                    </Headline>
                    <Phrase key={phraseIdx} className="slide-up">{phrases[phraseIdx]}</Phrase>

                    <PinRow as="div">
                        <PinLabel>Game PIN</PinLabel>
                        <PinInput
                            placeholder="123 456"
                            value={code}
                            maxLength={9}
                            onChange={(e) => setCode(e.target.value.replace(/[^\d ]/g, ''))}
                        />
                        <PinSubmit onClick={() => setOpen(true)} type="button">Enter →</PinSubmit>
                    </PinRow>
                </div>

                <PreviewArea>
                    <QuestionPreview className="pop-in">
                        <div style={{fontSize: '0.75rem', fontWeight: 700, opacity: 0.8, letterSpacing: '.06em'}}>
                            QUESTION 03 / 08
                        </div>
                        <div style={{fontFamily: 'var(--display)', fontSize: '1.375rem', fontWeight: 800, marginTop: '0.375rem'}}>
                            Which planet has the most moons?
                        </div>
                        <div style={{display: 'flex', gap: 6, marginTop: '0.875rem'}}>
                            {OPT_META.map((o) => (
                                <ShapeIcon key={o.letter} kind={o.shape} size={22} color="rgba(255,255,255,.95)"/>
                            ))}
                        </div>
                    </QuestionPreview>

                    <LeaderboardPreview className="pop-in">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <span style={{fontFamily: 'var(--display)', fontSize: '1.125rem', fontWeight: 800}}>🏆 Leaderboard</span>
                            <span style={{
                                fontSize: '0.6875rem', padding: '3px 0.5rem', borderRadius: 999,
                                border: '2px solid var(--line)', fontWeight: 600,
                            }}>LIVE</span>
                        </div>
                        {[
                            {n: 'Maya', s: 8420},
                            {n: 'Kenji', s: 8100},
                            {n: 'Priya', s: 7950},
                        ].map((p, i) => (
                            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: '0.75rem'}}>
                                <span style={{fontFamily: 'var(--display)', width: 22, fontSize: '1.125rem', fontWeight: 800}}>{i + 1}</span>
                                <Avatar name={p.n} size={32}/>
                                <span style={{flex: 1, fontWeight: 600}}>{p.n}</span>
                                <span style={{fontFamily: 'var(--display)', fontVariantNumeric: 'tabular-nums', fontWeight: 700}}>
                                    {p.s.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </LeaderboardPreview>

                    <StreakPreview className="pop-in">
                        <div style={{fontFamily: 'var(--display)', fontVariantNumeric: 'tabular-nums', fontSize: '2.25rem', fontWeight: 800}}>
                            +1,200
                        </div>
                        <div style={{fontSize: '0.8125rem', lineHeight: 1.2}}>
                            <div style={{fontWeight: 700}}>5-streak!</div>
                            <div style={{color: 'var(--ink-mute)'}}>Speed bonus unlocked</div>
                        </div>
                    </StreakPreview>

                    <div style={{position: 'absolute', bottom: 80, right: 60, animation: 'wiggle 2.4s ease-in-out infinite'}}>
                        <ShapeIcon kind="triangle" size={64} color="var(--opt-c)"/>
                    </div>
                </PreviewArea>
            </Hero>

            <Modal open={open} onClose={closeModal}>
                <EnterQuizCodeForm initialCode={code.replace(/\D/g, '')}/>
            </Modal>
        </Page>
    );
}

export default WelcomePage;
