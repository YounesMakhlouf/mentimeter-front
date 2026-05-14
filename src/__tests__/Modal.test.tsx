import {fireEvent, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {describe, expect, it, vi} from 'vitest';
import Modal from '../components/Modal';

describe('Modal', () => {
    it('opens the native dialog when `open` flips to true', () => {
        const {rerender, container} = render(
            <Modal open={false} onClose={() => {}}><p>content</p></Modal>,
        );
        const dialog = container.querySelector('dialog');
        expect(dialog).not.toBeNull();
        expect(dialog?.open).toBe(false);

        rerender(<Modal open={true} onClose={() => {}}><p>content</p></Modal>);
        expect(dialog?.open).toBe(true);
        expect(screen.getByText('content')).toBeInTheDocument();
    });

    it('closes the native dialog when `open` flips back to false', () => {
        const {rerender, container} = render(
            <Modal open={true} onClose={() => {}}><p>content</p></Modal>,
        );
        const dialog = container.querySelector('dialog')!;
        expect(dialog.open).toBe(true);

        rerender(<Modal open={false} onClose={() => {}}><p>content</p></Modal>);
        expect(dialog.open).toBe(false);
    });

    it('calls onClose when the X button is clicked', async () => {
        const onClose = vi.fn();
        const user = userEvent.setup();
        render(<Modal open={true} onClose={onClose}><p>content</p></Modal>);

        await user.click(screen.getByRole('button', {name: /close/i}));
        expect(onClose).toHaveBeenCalled();
    });

    it('calls onClose when the backdrop is clicked (target === dialog)', () => {
        const onClose = vi.fn();
        const {container} = render(
            <Modal open={true} onClose={onClose}><p>content</p></Modal>,
        );
        const dialog = container.querySelector('dialog')!;

        // Clicking on the dialog itself simulates a click on the ::backdrop
        // (the browser attributes backdrop clicks to the host element).
        fireEvent.click(dialog);
        expect(onClose).toHaveBeenCalled();
    });

    it('does NOT call onClose when content inside the dialog is clicked', async () => {
        const onClose = vi.fn();
        const user = userEvent.setup();
        render(
            <Modal open={true} onClose={onClose}>
                <button>inside</button>
            </Modal>,
        );

        await user.click(screen.getByRole('button', {name: /inside/i}));
        expect(onClose).not.toHaveBeenCalled();
    });

    it('calls onClose when the dialog dispatches a `close` event (ESC, native close)', () => {
        const onClose = vi.fn();
        const {container} = render(
            <Modal open={true} onClose={onClose}><p>content</p></Modal>,
        );
        const dialog = container.querySelector('dialog')!;

        dialog.dispatchEvent(new Event('close'));
        expect(onClose).toHaveBeenCalled();
    });

    it('renders CloseBtn last in DOM so initial focus lands on body content, not the X', () => {
        const {container} = render(
            <Modal open={true} onClose={() => {}}>
                <button>first</button>
                <button>second</button>
            </Modal>,
        );

        const buttons = container.querySelectorAll('button');
        // Three buttons total: first, second, then Close.
        expect(buttons).toHaveLength(3);
        expect(buttons[0]).toHaveTextContent('first');
        expect(buttons[buttons.length - 1]).toHaveAccessibleName('Close');
    });
});
