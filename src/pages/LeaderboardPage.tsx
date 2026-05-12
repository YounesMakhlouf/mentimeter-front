import {useEffect} from 'react';
import styled from 'styled-components';
import {Navigate, useLocation, useNavigate} from 'react-router';
import {Button, Card, Confetti, Logo, Page, ShapeField, Sticker} from '../design';

const PAYLOAD_KEY = 'leaderboard:payload';

interface ScoredParticipant {
    id?: string;
    playerName?: string;
    name?: string;
    avatar?: string;
    score: number;
}

const readStored = (): ScoredParticipant[] | null => {
    const raw = sessionStorage.getItem(PAYLOAD_KEY);
    if (!raw) return null;
    try {
        return JSON.parse(raw) as ScoredParticipant[];
    } catch {
        return null;
    }
};

const Header = styled.header`
    position: relative;
    padding: 1.375rem 2rem;
    display: flex;
    align-items: center;
    justify-content: space-between;
    z-index: 2;
`;

const Wrap = styled.div.attrs({className: 'wrapper'})`
    --wrapper-max: 67.5rem;
    position: relative;
    padding-block: 0.5rem 2rem;
    z-index: 2;
`;

const TitleBlock = styled.div`
    text-align: center;
    margin-bottom: 1.75rem;
`;

const Title = styled.h1`
    margin-top: 0.75rem;
`;

const Subtitle = styled.p`
    color: var(--ink-mute);
    font-size: var(--step--1);
    margin-top: 0.375rem;
`;

const PodiumRow = styled.div`
    display: grid;
    grid-template-columns: 1fr 1.2fr 1fr;
    gap: var(--gap-4);
    align-items: flex-end;
    margin-bottom: 1.75rem;
    max-width: 45rem;
    margin-inline: auto;
`;

const PodiumCol = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--gap-2);
`;

const PodiumFace = styled.div<{$size: number}>`
    width: ${({$size}) => $size + 10}px;
    height: ${({$size}) => $size + 10}px;
    border-radius: 50%;
    background: var(--card);
    border: 3px solid var(--ink);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: ${({$size}) => $size * 0.55}px;
    box-shadow: var(--shadow-md);
`;

const PodiumName = styled.div<{$big?: boolean}>`
    font-family: var(--display);
    font-size: ${({$big}) => $big ? '1.375rem' : '1.125rem'};
    font-weight: 800;
`;

const PodiumScore = styled.div<{$big?: boolean}>`
    font-family: var(--display);
    font-variant-numeric: tabular-nums;
    font-size: ${({$big}) => $big ? '1.375rem' : '1rem'};
    font-weight: 700;
    color: var(--ink-mute);
`;

const PodiumBlock = styled.div<{$height: number; $bg: string; $ink: string}>`
    width: 100%;
    height: ${({$height}) => $height}px;
    background: ${({$bg}) => $bg};
    color: ${({$ink}) => $ink};
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding-top: 0.75rem;
    border-radius: 1rem 1rem 0 0;
    border: 2.5px solid var(--ink);
    border-bottom: none;
`;

const RestList = styled(Card)`
    overflow: hidden;
    max-width: 45rem;
    margin-inline: auto;
`;

const RestRow = styled.div`
    display: flex;
    align-items: center;
    gap: var(--gap-4);
    padding: 0.875rem 1.125rem;
    border-bottom: 1.5px solid rgba(0, 0, 0, .07);

    &:last-child { border-bottom: none; }
`;

const Rank = styled.span`
    width: 2.25rem;
    font-family: var(--display);
    font-variant-numeric: tabular-nums;
    font-size: var(--step-0);
    color: var(--ink-mute);
`;

const Face = styled.div`
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    background: var(--card);
    border: 2px solid var(--ink);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--step-1);
`;

const Bar = styled.div`
    flex: 2;
    height: 0.5rem;
    background: rgba(0, 0, 0, .06);
    border-radius: 999px;
    overflow: hidden;
    max-width: 12.5rem;
`;

const BarFill = styled.div<{$pct: number; $delay: number}>`
    height: 100%;
    width: ${({$pct}) => $pct * 100}%;
    background: var(--brand);
    transform-origin: left;
    animation: bar-grow .8s cubic-bezier(.34, 1.56, .64, 1) ${({$delay}) => $delay}s both;
`;

const ScoreCol = styled.span`
    width: 4rem;
    text-align: right;
    font-family: var(--display);
    font-variant-numeric: tabular-nums;
    font-weight: 700;
`;

const HeaderActions = styled.div`
    display: flex;
    gap: var(--gap-3);
`;

const Trophy = styled.span`
    font-size: var(--step-5);
    line-height: 1;
`;

const RestName = styled.span`
    flex: 1;
    font-weight: 600;
`;

const displayName = (p: ScoredParticipant) => p.playerName || p.name || 'Player';

const LeaderboardPage = () => {
    const {state} = useLocation();
    const navigate = useNavigate();
    const participants: ScoredParticipant[] | null = state?.payload ?? readStored();

    useEffect(() => {
        if (participants) sessionStorage.setItem(PAYLOAD_KEY, JSON.stringify(participants));
    }, [participants]);

    if (!participants) {
        return <Navigate to="/" replace/>;
    }

    const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);
    const top3 = sortedParticipants.slice(0, 3);
    const rest = sortedParticipants.slice(3);
    const max = Math.max(1, ...sortedParticipants.map((p) => p.score));

    const podiumOrder: Array<0 | 1 | 2> = [1, 0, 2];
    const heights: Record<number, number> = {0: 220, 1: 170, 2: 130};
    const colors: Record<number, string> = {
        0: 'var(--opt-c)',
        1: 'var(--opt-b)',
        2: 'var(--opt-a)',
    };
    const inks: Record<number, string> = {0: 'var(--ink)', 1: '#fff', 2: '#fff'};
    const sizes: Record<number, number> = {0: 80, 1: 64, 2: 56};
    const trophies = ['🏆', '🥈', '🥉'];

    return (
        <Page>
            <Confetti count={70}/>
            <ShapeField density={8} opacity={0.1} seed={17}/>

            <Header>
                <Logo size={26}/>
                <HeaderActions>
                    <Button $variant="ghost" onClick={() => navigate('/')}>Done</Button>
                    <Button $variant="primary" onClick={() => navigate('/home')}>↻ Host another</Button>
                </HeaderActions>
            </Header>

            <Wrap>
                <TitleBlock>
                    <Sticker color="var(--opt-c)" rotate={-3}>Final scores</Sticker>
                    <Title>Game over!</Title>
                    <Subtitle>{sortedParticipants.length} player{sortedParticipants.length === 1 ? '' : 's'} · Thanks for playing</Subtitle>
                </TitleBlock>

                {top3.length > 0 && (
                    <PodiumRow>
                        {podiumOrder.map((podiumIdx, slot) => {
                            const p = top3[podiumIdx];
                            if (!p) return <div key={slot}/>;
                            const isWinner = podiumIdx === 0;
                            return (
                                <PodiumCol key={podiumIdx} className="pop-in" style={{animationDelay: `${slot * 0.18}s`}}>
                                    <PodiumFace $size={sizes[podiumIdx]}>{p.avatar || '🎲'}</PodiumFace>
                                    <PodiumName $big={isWinner}>{displayName(p)}</PodiumName>
                                    <PodiumScore $big={isWinner}>{p.score.toLocaleString()}</PodiumScore>
                                    <PodiumBlock
                                        $height={heights[podiumIdx]}
                                        $bg={colors[podiumIdx]}
                                        $ink={inks[podiumIdx]}
                                    >
                                        <Trophy>{trophies[podiumIdx]}</Trophy>
                                    </PodiumBlock>
                                </PodiumCol>
                            );
                        })}
                    </PodiumRow>
                )}

                {rest.length > 0 && (
                    <RestList>
                        {rest.map((p, i) => {
                            const place = i + 4;
                            return (
                                <RestRow key={i}>
                                    <Rank>{place}</Rank>
                                    <Face>{p.avatar || '🎲'}</Face>
                                    <RestName>{displayName(p)}</RestName>
                                    <Bar>
                                        <BarFill $pct={p.score / max} $delay={0.05 * i}/>
                                    </Bar>
                                    <ScoreCol>{p.score.toLocaleString()}</ScoreCol>
                                </RestRow>
                            );
                        })}
                    </RestList>
                )}
            </Wrap>
        </Page>
    );
};

export default LeaderboardPage;
