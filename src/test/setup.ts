import '@testing-library/jest-dom/vitest';
import {afterEach} from 'vitest';
import {cleanup} from '@testing-library/react';

// jsdom <26 doesn't implement HTMLDialogElement.showModal / close. Modal.tsx
// uses both. Polyfill the minimum needed: toggle the `open` attribute and
// fire the matching events, so component logic that watches for them works.
const dialogProto = HTMLDialogElement.prototype as unknown as Record<string, unknown>;
if (typeof dialogProto.showModal !== 'function') {
    dialogProto.showModal = function (this: HTMLDialogElement) {
        this.setAttribute('open', '');
    };
}
if (typeof dialogProto.close !== 'function') {
    dialogProto.close = function (this: HTMLDialogElement) {
        if (!this.hasAttribute('open')) return;
        this.removeAttribute('open');
        this.dispatchEvent(new Event('close'));
    };
}

afterEach(() => {
    cleanup();
    localStorage.clear();
});
