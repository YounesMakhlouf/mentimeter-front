import '@testing-library/jest-dom/vitest';
import {afterEach} from 'vitest';
import {cleanup} from '@testing-library/react';

// jsdom (as of v29) does not implement <dialog>.showModal()/close().
// Stub them so components that use the native modal can be tested.
if (typeof HTMLDialogElement !== 'undefined') {
    if (!HTMLDialogElement.prototype.showModal) {
        HTMLDialogElement.prototype.showModal = function () {
            this.setAttribute('open', '');
        };
    }
    if (!HTMLDialogElement.prototype.close) {
        HTMLDialogElement.prototype.close = function () {
            this.removeAttribute('open');
            this.dispatchEvent(new Event('close'));
        };
    }
}

afterEach(() => {
    cleanup();
    localStorage.clear();
});
