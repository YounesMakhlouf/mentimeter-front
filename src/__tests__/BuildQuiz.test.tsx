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

    it('renders the quiz name from route state', () => {
        renderAt({quizName: 'My Quiz'});
        expect(screen.getByText('Quiz Name: My Quiz')).toBeInTheDocument();
    });

    it('refuses to submit when no option is marked correct', async () => {
        const spy = vi.spyOn(api, 'authFetch');
        const user = userEvent.setup();
        renderAt({quizName: 'Q1'});

        await user.type(screen.getByPlaceholderText('Enter question'), 'What is 1+1?');
        await user.type(screen.getByPlaceholderText('Enter option'), '2');
        await user.click(screen.getByRole('button', {name: /submit quiz/i}));

        expect(screen.getByText(/must have a correct answer/i)).toBeInTheDocument();
        expect(spy).not.toHaveBeenCalled();
    });

    it('only allows one correct answer per question (radio behaviour)', async () => {
        const user = userEvent.setup();
        renderAt({quizName: 'Q1'});

        await user.click(screen.getByRole('button', {name: /add option/i}));
        const radios = screen.getAllByRole('radio');
        expect(radios).toHaveLength(2);

        await user.click(radios[0]);
        expect(radios[0]).toBeChecked();
        expect(radios[1]).not.toBeChecked();

        await user.click(radios[1]);
        expect(radios[0]).not.toBeChecked();
        expect(radios[1]).toBeChecked();
    });

    it('submits with the right wire format and navigates home on success', async () => {
        const spy = vi.spyOn(api, 'authFetch').mockResolvedValueOnce({});
        const user = userEvent.setup();
        renderAt({quizName: 'Capitals'});

        await user.selectOptions(screen.getByRole('combobox'), 'geography');
        await user.type(screen.getByPlaceholderText('Enter question'), 'Capital of France?');
        await user.click(screen.getByRole('button', {name: /add option/i}));
        const optionInputs = screen.getAllByPlaceholderText('Enter option');
        await user.type(optionInputs[0], 'Paris');
        await user.type(optionInputs[1], 'Berlin');
        const radios = screen.getAllByRole('radio');
        await user.click(radios[0]);
        await user.click(screen.getByRole('button', {name: /submit quiz/i}));

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
                ],
                correctAnswer: 'Paris',
            }],
        });
        expect(body.userEmail).toBeUndefined();
    });
});
