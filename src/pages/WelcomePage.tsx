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
    padding: 22px 48px;
`;

const NavActions = styled.div`
    display: flex;
    gap: 10px;
`;

const Hero = styled.div`
    position: relative;
    z-index: 2;
    display: grid;
    grid-template-columns: 1fr;
    gap: 64px;
    padding: 24px;
    max-width: 1280px;
    margin: 0 auto;
    align-items: center;

    @media (min-width: 900px) {
        grid-template-columns: 1.15fr 1fr;
        padding: 32px 64px 64px;
    }
`;

const Headline = styled.h1`
    font-size: clamp(56px, 7.2vw, 104px);
    margin: 24px 0;
    font-weight: 800;
`;

const Highlight = styled.span`
    background: var(--opt-a);
    color: #fff;
    padding: 0 14px;
    border-radius: 14px;
    display: inline-block;
    transform: rotate(-1.5deg);
    border: 3px solid var(--ink);
    box-shadow: var(--shadow-sm);
`;

const Phrase = styled.p`
    font-size: 22px;
    line-height: 1.4;
    color: var(--ink-soft);
    max-width: 540px;
    margin-bottom: 36px;
    min-height: 64px;
`;

const PinRow = styled(Card)`
    padding: 12px;
    display: flex;
    gap: 10px;
    align-items: center;
    max-width: 540px;
    border-radius: 999px;
`;

const PinLabel = styled.span`
    padding-left: 14px;
    font-weight: 700;
    color: var(--ink-mute);
`;

const PinInput = styled.input`
    flex: 1;
    border: none;
    outline: none;
    font-size: 22px;
    font-weight: 700;
    padding: 10px 4px;
    font-family: var(--body);
    background: transparent;
    color: var(--ink);
    min-width: 0;
`;

const PinSubmit = styled(InkButton)`
    border-radius: 999px;
    padding: 14px 28px;
`;

const PreviewArea = styled.div`
    display: none;
    @media (min-width: 900px) {
        display: block;
        position: relative;
        height: 460px;
    }
`;

const QuestionPreview = styled(Card)`
    position: absolute;
    top: 20px;
    left: 30px;
    padding: 18px;
    transform: rotate(-4deg);
    width: 240px;
    background: var(--opt-a);
    color: #fff;
    border-radius: 20px;
`;

const LeaderboardPreview = styled(Card)`
    position: absolute;
    top: 140px;
    right: 0;
    padding: 22px;
    transform: rotate(3deg);
    width: 280px;
    animation-delay: 0.1s;
`;

const StreakPreview = styled(Card)`
    position: absolute;
    bottom: 10px;
    left: 0;
    padding: 16px 20px;
    transform: rotate(-2deg);
    display: flex;
    align-items: center;
    gap: 14px;
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
                        <div style={{fontSize: 12, fontWeight: 700, opacity: 0.8, letterSpacing: '.06em'}}>
                            QUESTION 03 / 08
                        </div>
                        <div style={{fontFamily: 'var(--display)', fontSize: 22, fontWeight: 800, marginTop: 6}}>
                            Which planet has the most moons?
                        </div>
                        <div style={{display: 'flex', gap: 6, marginTop: 14}}>
                            {OPT_META.map((o) => (
                                <ShapeIcon key={o.letter} kind={o.shape} size={22} color="rgba(255,255,255,.95)"/>
                            ))}
                        </div>
                    </QuestionPreview>

                    <LeaderboardPreview className="pop-in">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                            <span style={{fontFamily: 'var(--display)', fontSize: 18, fontWeight: 800}}>🏆 Leaderboard</span>
                            <span style={{
                                fontSize: 11, padding: '3px 8px', borderRadius: 999,
                                border: '2px solid var(--line)', fontWeight: 600,
                            }}>LIVE</span>
                        </div>
                        {[
                            {n: 'Maya', s: 8420},
                            {n: 'Kenji', s: 8100},
                            {n: 'Priya', s: 7950},
                        ].map((p, i) => (
                            <div key={i} style={{display: 'flex', alignItems: 'center', gap: 10, marginTop: 12}}>
                                <span style={{fontFamily: 'var(--display)', width: 22, fontSize: 18, fontWeight: 800}}>{i + 1}</span>
                                <Avatar name={p.n} size={32}/>
                                <span style={{flex: 1, fontWeight: 600}}>{p.n}</span>
                                <span style={{fontFamily: 'var(--display)', fontVariantNumeric: 'tabular-nums', fontWeight: 700}}>
                                    {p.s.toLocaleString()}
                                </span>
                            </div>
                        ))}
                    </LeaderboardPreview>

                    <StreakPreview className="pop-in">
                        <div style={{fontFamily: 'var(--display)', fontVariantNumeric: 'tabular-nums', fontSize: 36, fontWeight: 800}}>
                            +1,200
                        </div>
                        <div style={{fontSize: 13, lineHeight: 1.2}}>
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
