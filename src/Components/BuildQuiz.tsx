import {ChangeEvent, useState} from 'react';
import {Navigate, useLocation, useNavigate} from "react-router";
import {FaTrash} from "react-icons/fa";
import styled from "styled-components";
import {authFetch} from "../api.ts";
import {Card, Chip, GhostButton, Input, PrimaryButton} from "../design/styled.ts";
import {ShapeIcon} from "../design/primitives.tsx";
import {OPT_META} from "../design/tokens.ts";

const Topics = {
    ANIMALS: 'animals',
    SCIENCE: 'science',
    PHYSICS: 'physics',
    BIOLOGY: 'biology',
    CHEMISTRY: 'chemistry',
    MATH: 'math',
    GEOGRAPHY: 'geography',
    HISTORY: 'history',
    SPORTS: 'sports',
    MOVIES: 'movies',
    MUSIC: 'music',
    LITERATURE: 'literature',
    ART: 'art',
    POLITICS: 'politics',
    PROGRAMMING: 'programming',
    SPACE: 'space',
} as const;

interface QuestionDraft {
    text: string;
    options: string[];
    correctIndex: number | null;
}

const blankQuestion = (): QuestionDraft => ({
    text: '',
    options: ['', '', '', ''],
    correctIndex: null,
});

const Page = styled.div`
    display: grid;
    grid-template-rows: auto 1fr;
    height: 100vh;
    overflow: hidden;
`;

const TopBar = styled.header`
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 24px;
    border-bottom: 2.5px solid var(--ink);
    background: var(--card);

    @media (max-width: 800px) {
        flex-wrap: wrap;
    }
`;

const NameInput = styled(Input)`
    max-width: 380px;
    font-weight: 700;
    font-size: 18px;
    padding: 10px 14px;
`;

const TopicSelect = styled.select`
    appearance: none;
    border: 2.5px solid var(--line);
    background: var(--card);
    color: var(--ink);
    border-radius: var(--r-md);
    padding: 10px 14px;
    font-size: 15px;
    font-weight: 600;
    font-family: var(--body);
    box-shadow: inset 0 -3px 0 rgba(0, 0, 0, .06);
`;

const Counter = styled.span`
    color: var(--ink-mute);
    font-size: 13px;
    font-weight: 600;
`;

const Body = styled.div`
    display: grid;
    grid-template-columns: 260px 1fr 280px;
    overflow: hidden;

    @media (max-width: 1100px) {
        grid-template-columns: 220px 1fr;
    }
    @media (max-width: 800px) {
        grid-template-columns: 1fr;
        grid-template-rows: auto 1fr;
    }
`;

const QuestionList = styled.aside`
    border-right: 2.5px solid var(--ink);
    background: var(--card);
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    overflow: auto;
`;

const QuestionTab = styled.button<{$active: boolean}>`
    padding: 12px;
    text-align: left;
    display: flex;
    gap: 10px;
    align-items: flex-start;
    cursor: pointer;
    background: ${({$active}) => $active ? 'var(--brand)' : 'var(--card)'};
    color: ${({$active}) => $active ? '#fff' : 'var(--ink)'};
    box-shadow: ${({$active}) => $active ? 'var(--shadow-md)' : 'var(--shadow-sm)'};
    border: 2.5px solid var(--ink);
    border-radius: var(--r-lg);
    font-family: inherit;
`;

const TabIndex = styled.span`
    font-family: var(--display);
    font-size: 18px;
    font-weight: 800;
    width: 22px;
    flex: none;
`;

const TabText = styled.span`
    flex: 1;
    font-size: 13px;
    font-weight: 500;
    line-height: 1.3;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
`;

const AddTabBtn = styled.button`
    border: 2.5px dashed var(--ink);
    background: transparent;
    box-shadow: none;
    padding: 14px 12px;
    margin-top: 4px;
    color: var(--ink);
    font-weight: 700;
    font-family: var(--body);
    border-radius: var(--r-md);
    cursor: pointer;
`;

const Editor = styled.section`
    overflow: auto;
    padding: 32px;
    background: var(--paper);
`;

const EditorInner = styled.div`
    max-width: 720px;
    margin: 0 auto;
`;

const EditorHeader = styled.div`
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 18px;
`;

const StepLabel = styled.span`
    font-family: var(--display);
    font-size: 14px;
    color: var(--ink-mute);
    font-weight: 700;
    letter-spacing: .06em;
    text-transform: uppercase;
`;

const QuestionTextarea = styled.textarea`
    appearance: none;
    border: 2.5px solid var(--line);
    background: var(--card);
    color: var(--ink);
    border-radius: var(--r-md);
    padding: 24px;
    width: 100%;
    box-shadow: inset 0 -3px 0 rgba(0, 0, 0, .06);
    outline: none;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.25;
    resize: vertical;
    font-family: var(--display);
    letter-spacing: -0.01em;
    &:focus { box-shadow: var(--shadow-sm); }
`;

const OptionsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-top: 24px;

    @media (max-width: 700px) {
        grid-template-columns: 1fr;
    }
`;

const OptionTile = styled(Card)<{$bg: string; $ink: string; $correct: boolean}>`
    background: ${({$bg}) => $bg};
    color: ${({$ink}) => $ink};
    padding: 18px;
    display: flex;
    align-items: center;
    gap: 12px;
    outline: ${({$correct}) => $correct ? '4px solid var(--ink)' : 'none'};
    outline-offset: 2px;
`;

const OptionInput = styled.input`
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: inherit;
    font-size: 18px;
    font-weight: 600;
    font-family: inherit;
    min-width: 0;
`;

const CorrectToggle = styled.button<{$correct: boolean; $bg: string; $ink: string}>`
    width: 32px;
    height: 32px;
    border-radius: 999px;
    border: 2.5px solid ${({$ink}) => $ink};
    background: ${({$correct, $ink}) => $correct ? $ink : 'transparent'};
    color: ${({$correct, $bg}) => $correct ? $bg : 'inherit'};
    cursor: pointer;
    font-weight: 800;
    font-size: 16px;
    line-height: 1;
    flex: none;
`;

const Inspector = styled.aside`
    border-left: 2.5px solid var(--ink);
    background: var(--card);
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    overflow: auto;

    @media (max-width: 1100px) { display: none; }
`;

const InspectorTitle = styled.h3`
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: .06em;
    color: var(--ink-mute);
`;

const ErrorBlock = styled.div`
    color: #bc2525;
    font-weight: 600;
    margin-top: 14px;
`;

function BuildQuiz() {
    const location = useLocation();
    const navigate = useNavigate();
    const initialName: string = location.state?.quizName ?? '';
    const [quizName, setQuizName] = useState(initialName);
    const [topic, setTopic] = useState<string>('');
    const [questions, setQuestions] = useState<QuestionDraft[]>([blankQuestion()]);
    const [active, setActive] = useState(0);
    const [errorMessage, setErrorMessage] = useState('');

    if (!initialName) {
        return <Navigate to="/home" replace/>;
    }

    const updateQ = (idx: number, patch: Partial<QuestionDraft>) => {
        setQuestions((prev) => prev.map((q, i) => (i === idx ? {...q, ...patch} : q)));
    };

    const addQuestion = () => {
        setQuestions((prev) => [...prev, blankQuestion()]);
        setActive(questions.length);
    };

    const deleteQuestion = (idx: number) => {
        if (questions.length === 1) return;
        const next = questions.filter((_, i) => i !== idx);
        setQuestions(next);
        setActive(Math.min(active, next.length - 1));
    };

    const handleOptionChange = (qIdx: number, optIdx: number, event: ChangeEvent<HTMLInputElement>) => {
        const q = questions[qIdx];
        const options = q.options.map((o, i) => (i === optIdx ? event.target.value : o));
        updateQ(qIdx, {options});
    };

    const handleCorrectChange = (qIdx: number, optIdx: number) => {
        updateQ(qIdx, {correctIndex: optIdx});
    };

    const handleSubmit = () => {
        if (!topic) {
            setErrorMessage('Pick a topic before saving.');
            return;
        }
        const allValid = questions.every((q) => q.text.trim() && q.correctIndex !== null && q.options.every((o) => o.trim()));
        if (!allValid) {
            setErrorMessage('Each question needs text, four answers, and a correct one selected.');
            return;
        }
        const quizData = {
            name: quizName,
            code: null,
            topic,
            questions: questions.map((q) => ({
                question: q.text,
                options: q.options.map((option, index) => ({
                    label: option,
                    isCorrect: index === q.correctIndex,
                })),
                correctAnswer: q.options[q.correctIndex!],
            })),
        };

        authFetch('/quizzes', {
            method: 'POST',
            body: JSON.stringify(quizData),
        })
            .then(() => navigate('/home'))
            .catch((error) => {
                console.error('Error:', error);
                setErrorMessage('Failed to save quiz. Please try again.');
            });
    };

    const q = questions[active];

    return (
        <Page>
            <TopBar>
                <GhostButton type="button" onClick={() => navigate('/home')}>← Exit</GhostButton>
                <NameInput
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                />
                <TopicSelect value={topic} onChange={(e) => setTopic(e.target.value)}>
                    <option value="">Select topic…</option>
                    {Object.entries(Topics).map(([key, value]) => (
                        <option key={key} value={value}>{key.charAt(0) + key.slice(1).toLowerCase()}</option>
                    ))}
                </TopicSelect>
                <Counter>{questions.length} question{questions.length === 1 ? '' : 's'}</Counter>
                <div style={{flex: 1}}/>
                <PrimaryButton type="button" onClick={handleSubmit}>▶ Save &amp; finish</PrimaryButton>
            </TopBar>

            <Body>
                <QuestionList>
                    {questions.map((qq, i) => (
                        <QuestionTab
                            key={i}
                            $active={i === active}
                            type="button"
                            onClick={() => setActive(i)}
                        >
                            <TabIndex>{i + 1}</TabIndex>
                            <TabText>
                                {qq.text || <span style={{opacity: 0.5}}>Untitled question</span>}
                            </TabText>
                            <Chip as="span" style={{
                                fontSize: 10,
                                padding: '2px 8px',
                                flex: 'none',
                                background: i === active ? 'var(--ink)' : 'var(--paper)',
                                color: i === active ? 'var(--paper)' : 'var(--ink)',
                            }}>{qq.correctIndex !== null ? '✓' : '·'}</Chip>
                        </QuestionTab>
                    ))}
                    <AddTabBtn type="button" onClick={addQuestion}>＋ Add question</AddTabBtn>
                </QuestionList>

                <Editor>
                    <EditorInner>
                        <EditorHeader>
                            <StepLabel>Question {active + 1} of {questions.length}</StepLabel>
                            <div style={{flex: 1}}/>
                            <GhostButton
                                type="button"
                                onClick={() => deleteQuestion(active)}
                                disabled={questions.length === 1}
                                style={{opacity: questions.length === 1 ? 0.4 : 1}}
                            ><FaTrash/></GhostButton>
                        </EditorHeader>
                        <QuestionTextarea
                            value={q.text}
                            onChange={(e) => updateQ(active, {text: e.target.value})}
                            rows={2}
                            placeholder="Type your question…"
                        />
                        <OptionsGrid>
                            {q.options.map((opt, i) => {
                                const m = OPT_META[i];
                                const isCorrect = q.correctIndex === i;
                                return (
                                    <OptionTile
                                        key={i}
                                        $bg={m.colorVar}
                                        $ink={m.inkVar}
                                        $correct={isCorrect}
                                    >
                                        <ShapeIcon
                                            kind={m.shape}
                                            size={32}
                                            color={m.inkVar === '#ffffff' ? 'rgba(255,255,255,.85)' : 'rgba(0,0,0,.85)'}
                                        />
                                        <OptionInput
                                            value={opt}
                                            placeholder={`Answer ${m.letter}`}
                                            onChange={(e) => handleOptionChange(active, i, e)}
                                            style={{color: m.inkVar}}
                                        />
                                        <CorrectToggle
                                            type="button"
                                            $correct={isCorrect}
                                            $bg={m.colorVar}
                                            $ink={m.inkVar}
                                            onClick={() => handleCorrectChange(active, i)}
                                            title={isCorrect ? 'Correct' : 'Mark correct'}
                                        >{isCorrect ? '✓' : ''}</CorrectToggle>
                                    </OptionTile>
                                );
                            })}
                        </OptionsGrid>
                        {errorMessage && <ErrorBlock>{errorMessage}</ErrorBlock>}
                    </EditorInner>
                </Editor>

                <Inspector>
                    <InspectorTitle>Tips</InspectorTitle>
                    <p style={{fontSize: 14, lineHeight: 1.5, color: 'var(--ink-soft)'}}>
                        Each question needs four answers and one marked correct. Players see the four shape buttons —
                        circle, square, triangle, diamond — in those colors.
                    </p>
                    <Card style={{background: 'var(--opt-c)', padding: 14, marginTop: 8}}>
                        <div style={{fontFamily: 'var(--display)', fontSize: 16, fontWeight: 800}}>✨ Multiple-choice only</div>
                        <p style={{fontSize: 12, marginTop: 4, lineHeight: 1.4}}>
                            More question types are coming. For now, every question is a four-option pick.
                        </p>
                    </Card>
                </Inspector>
            </Body>
        </Page>
    );
}

export default BuildQuiz;
