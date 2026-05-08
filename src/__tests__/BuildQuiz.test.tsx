import {describe, expect, it, vi, beforeEach} from 'vitest';
import {render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {MemoryRouter, Route, Routes} from 'react-router';
import BuildQuiz from '../Components/BuildQuiz';
import * as api from '../api';

const renderAt = (state?: {quizName: string}) =>
    render(
        <MemoryRouter initialEntries={[{pathname: '/build', state}]}>
            <Routes>
                <Route path="/build" element={<BuildQuiz/>}/>
                <Route path="/home" element={<div>home page</div>}/>
            </Routes>
        </MemoryRouter>,
    );

describe('BuildQuiz', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('redirects to /home when no quizName is in route state', () => {
        renderAt(undefined);
        expect(screen.getByText('home page')).toBeInTheDocument();
    });

    it('shows the quiz name in the editable name input', () => {
        renderAt({quizName: 'My Quiz'});
        expect(screen.getByDisplayValue('My Quiz')).toBeInTheDocument();
    });

    it('renders four answer options by default', () => {
        renderAt({quizName: 'Q1'});
        expect(screen.getAllByPlaceholderText(/^Answer [ABCD]$/)).toHaveLength(4);
    });

    it('refuses to submit without a topic', async () => {
        const spy = vi.spyOn(api, 'authFetch');
        const user = userEvent.setup();
        renderAt({quizName: 'Q1'});

        await user.click(screen.getByRole('button', {name: /save.*finish/i}));

        expect(screen.getByText(/Pick a topic/i)).toBeInTheDocument();
        expect(spy).not.toHaveBeenCalled();
    });

    it('refuses to submit when no option is marked correct', async () => {
        const spy = vi.spyOn(api, 'authFetch');
        const user = userEvent.setup();
        renderAt({quizName: 'Q1'});

        await user.selectOptions(screen.getByRole('combobox'), 'geography');
        await user.type(screen.getByPlaceholderText(/Type your question/i), 'What is 1+1?');
        const optionInputs = screen.getAllByPlaceholderText(/^Answer [ABCD]$/);
        for (let i = 0; i < 4; i++) await user.type(optionInputs[i], `opt${i}`);
        await user.click(screen.getByRole('button', {name: /save.*finish/i}));

        expect(screen.getByText(/correct one selected/i)).toBeInTheDocument();
        expect(spy).not.toHaveBeenCalled();
    });

    it('submits with the right wire format and navigates home on success', async () => {
        const spy = vi.spyOn(api, 'authFetch').mockResolvedValueOnce({});
        const user = userEvent.setup();
        renderAt({quizName: 'Capitals'});

        await user.selectOptions(screen.getByRole('combobox'), 'geography');
        await user.type(screen.getByPlaceholderText(/Type your question/i), 'Capital of France?');
        const optionInputs = screen.getAllByPlaceholderText(/^Answer [ABCD]$/);
        await user.type(optionInputs[0], 'Paris');
        await user.type(optionInputs[1], 'Berlin');
        await user.type(optionInputs[2], 'London');
        await user.type(optionInputs[3], 'Madrid');
        // Click the "mark correct" toggle on the first option (it's not a radio, it's a button with no name)
        const correctToggles = screen.getAllByTitle(/Mark correct|Correct$/);
        await user.click(correctToggles[0]);
        await user.click(screen.getByRole('button', {name: /save.*finish/i}));

        await waitFor(() => expect(screen.getByText('home page')).toBeInTheDocument());
        expect(spy).toHaveBeenCalledTimes(1);
        const [path, init] = spy.mock.calls[0];
        expect(path).toBe('/quizzes');
        const body = JSON.parse((init as RequestInit).body as string);
        expect(body).toMatchObject({
            name: 'Capitals',
            topic: 'geography',
            questions: [{
                question: 'Capital of France?',
                options: [
                    {label: 'Paris', isCorrect: true},
                    {label: 'Berlin', isCorrect: false},
                    {label: 'London', isCorrect: false},
                    {label: 'Madrid', isCorrect: false},
                ],
                correctAnswer: 'Paris',
            }],
        });
        expect(body.userEmail).toBeUndefined();
    });
});
