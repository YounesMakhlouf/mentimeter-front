import {ChangeEvent, useState} from 'react';
import {Navigate, useLocation, useNavigate} from "react-router";
import {FaTrash} from "react-icons/fa";
import styled from "styled-components";
import {authFetch} from "../api.ts";
import {Button, Card, Chip, Input, OPT_META, ShapeIcon} from "../design";
import {TOPIC_KEYS, formatTopic} from "../topics.ts";

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
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    padding: 0.875rem 1.5rem;
    border-bottom: 2.5px solid var(--ink);
    background: var(--card);

    @media (min-width: 50rem) {
        flex-wrap: nowrap;
    }
`;

const NameInput = styled(Input)`
    max-width: 23.75rem;
    font-weight: 700;
    font-size: var(--step-0);
    padding: 0.625rem 0.875rem;
`;

const TopicSelect = styled.select`
    appearance: none;
    border: 2.5px solid var(--line);
    background: var(--card);
    color: var(--ink);
    border-radius: var(--r-md);
    padding: 0.625rem 0.875rem;
    font-size: var(--step--1);
    font-weight: 600;
    font-family: var(--body);
    box-shadow: inset 0 -3px 0 rgba(0, 0, 0, .06);
`;

const Counter = styled.span`
    color: var(--ink-mute);
    font-size: var(--step--2);
    font-weight: 600;
`;

const Body = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto 1fr;
    overflow: hidden;

    @media (min-width: 50rem) {
        grid-template-columns: 13.75rem 1fr;
        grid-template-rows: none;
    }
    @media (min-width: 68.75rem) {
        grid-template-columns: 16.25rem 1fr;
    }
`;

const QuestionList = styled.aside`
    border-right: 2.5px solid var(--ink);
    background: var(--card);
    padding: 0.75rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    overflow: auto;
`;

const QuestionTab = styled.button<{$active: boolean}>`
    padding: 0.75rem;
    text-align: left;
    display: flex;
    gap: 0.625rem;
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
    font-size: var(--step-0);
    font-weight: 800;
    width: 1.375rem;
    flex: none;
`;

const TabText = styled.span`
    flex: 1;
    font-size: var(--step--2);
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
    padding: 0.875rem 0.75rem;
    margin-top: 0.25rem;
    color: var(--ink);
    font-weight: 700;
    font-family: var(--body);
    border-radius: var(--r-md);
    cursor: pointer;
`;

const Editor = styled.section`
    overflow: auto;
    padding: 2rem;
    background: var(--paper);
`;

const EditorInner = styled.div`
    max-width: 45rem;
    margin: 0 auto;
`;

const EditorHeader = styled.div`
    display: flex;
    gap: 0.625rem;
    align-items: center;
    margin-bottom: 1.125rem;
`;

const StepLabel = styled.span`
    font-family: var(--display);
    font-size: var(--step--1);
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
    padding: 1.5rem;
    width: 100%;
    box-shadow: inset 0 -3px 0 rgba(0, 0, 0, .06);
    outline: none;
    font-size: var(--step-2);
    font-weight: 700;
    line-height: 1.25;
    resize: vertical;
    font-family: var(--display);
    letter-spacing: -0.01em;
    &:focus { box-shadow: var(--shadow-sm); }
`;

const OptionsGrid = styled.div`
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.875rem;
    margin-top: 1.5rem;

    @media (min-width: 43.75rem) {
        grid-template-columns: 1fr 1fr;
    }
`;

const OptionTile = styled(Card)<{$bg: string; $ink: string; $correct: boolean}>`
    background: ${({$bg}) => $bg};
    color: ${({$ink}) => $ink};
    padding: 1.125rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    outline: ${({$correct}) => $correct ? '0.25rem solid var(--ink)' : 'none'};
    outline-offset: 2px;
`;

const OptionInput = styled.input`
    flex: 1;
    background: transparent;
    border: none;
    outline: none;
    color: inherit;
    font-size: var(--step-0);
    font-weight: 600;
    font-family: inherit;
    min-width: 0;
`;

const CorrectToggle = styled.button<{$correct: boolean; $bg: string; $ink: string}>`
    width: 2rem;
    height: 2rem;
    border-radius: 999px;
    border: 2.5px solid ${({$ink}) => $ink};
    background: ${({$correct, $ink}) => $correct ? $ink : 'transparent'};
    color: ${({$correct, $bg}) => $correct ? $bg : 'inherit'};
    cursor: pointer;
    font-weight: 800;
    font-size: var(--step--1);
    line-height: 1;
    flex: none;
`;

const ErrorBlock = styled.div`
    color: #bc2525;
    font-weight: 600;
    margin-top: 0.875rem;
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
                <Button $variant="ghost" type="button" onClick={() => navigate('/home')}>← Exit</Button>
                <NameInput
                    value={quizName}
                    onChange={(e) => setQuizName(e.target.value)}
                />
                <TopicSelect value={topic} onChange={(e) => setTopic(e.target.value)}>
                    <option value="">Select topic…</option>
                    {TOPIC_KEYS.map((key) => (
                        <option key={key} value={key}>{formatTopic(key)}</option>
                    ))}
                </TopicSelect>
                <Counter>{questions.length} question{questions.length === 1 ? '' : 's'}</Counter>
                <div style={{flex: 1}}/>
                <Button $variant="primary" type="button" onClick={handleSubmit}>▶ Save &amp; finish</Button>
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
                                fontSize: 'var(--step--2)',
                                padding: '2px 0.5rem',
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
                            <Button
                                type="button"
                                $variant="ghost"
                                onClick={() => deleteQuestion(active)}
                                disabled={questions.length === 1}
                                style={{opacity: questions.length === 1 ? 0.4 : 1}}
                            ><FaTrash/></Button>
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
            </Body>
        </Page>
    );
}

export default BuildQuiz;
