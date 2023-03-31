
import * as vscode from 'vscode';

type EnumerateOptions = {
    start: number;
};

export function enumerate(editor: vscode.TextEditor, opts: EnumerateOptions) {
    editor.edit(edit => {
        editor.selections.forEach((selection, index) => {
            edit.replace(selection, '' + (opts.start + index));
        });
    });
}

function inferSequenceFromFirstSelection(selection: string): (index: number) => string {
    if (/^(0|[1-9][0-9]*)$/.test(selection)) {
        // Decimal integer
        const start = parseInt(selection);
        return (index) => '' + (start + index);
    }
    if (/^((0| )[0-9]+)$/.test(selection)) {
        // Decimal integer with leading zeros or spaces
        const pad = selection[0];
        const length = selection.length;
        const start = parseInt(selection);
        return (index) => ('' + (start + index)).padStart(length, pad);
    }
    if (/^0b(0|1[01]*)$/.test(selection)) {
        // Binary integer
        const start = parseInt(selection.slice(2), 2);
        return (index) => `0b${(start + index).toString(2)}`;
    }
    if (/^0b0[01]+$/.test(selection)) {
        // Binary integer with leading zeros
        const pad = '0';
        const length = selection.length - 2;
        const start = parseInt(selection.slice(2), 2);
        return (index) => `0b${(start + index).toString(2).padStart(length, pad)}`;
    }
    if (/^0o(0|1[01]*)$/.test(selection)) {
        // Octal integer
        const start = parseInt(selection.slice(2), 8);
        return (index) => `0o${(start + index).toString(8)}`;
    }
    if (/^0o0[01]+$/.test(selection)) {
        // Octal integer with leading zeros
        const pad = '0';
        const length = selection.length - 2;
        const start = parseInt(selection.slice(2), 8);
        return (index) => `0o${(start + index).toString(8).padStart(length, pad)}`;
    }
    if (/^0x(0|[1-9A-F][0-9A-F]*)$/.test(selection)) {
        // Hexadecimal integer (uppercase)
        const start = parseInt(selection.slice(2), 16);
        return (index) => `0x${(start + index).toString(16).toUpperCase()}`;
    }
    if (/^0x(0|[1-9a-f][0-9a-f]*)$/.test(selection)) {
        // Hexadecimal integer (lowercase)
        const start = parseInt(selection.slice(2), 16);
        return (index) => `0x${(start + index).toString(16).toLowerCase()}`;
    }
    if (/^0x0[0-9A-F]+$/.test(selection)) {
        // Hexadecimal integer with leading zeros (uppercase)
        const pad = '0';
        const length = selection.length - 2;
        const start = parseInt(selection.slice(2), 16);
        return (index) =>`0x${(start + index).toString(16).padStart(length, pad).toUpperCase()}`;
    }
    if (/^0x0[0-9a-f]+$/.test(selection)) {
        // Hexadecimal integer with leading zeros (lowercase)
        const pad = '0';
        const length = selection.length - 2;
        const start = parseInt(selection.slice(2), 16);
        return (index) =>`0x${(start + index).toString(16).padStart(length, pad).toLowerCase()}`;
    }
    if (/^[a-z]$/.test(selection)) {
        // lowercase letter
        const codePointA = 97;
        const offset = (selection.codePointAt(0) || codePointA) - codePointA;
        return (index) => String.fromCodePoint(codePointA + (offset + index) % 26);
    }
    if (/^[A-Z]$/.test(selection)) {
        // uppercase letter
        const codePointA = 65;
        const offset = (selection.codePointAt(0) || codePointA) - codePointA;
        return (index) => String.fromCodePoint(codePointA + (offset + index) % 26);
    }
    return () => 'failed to infer sequence';
}

export function inferAndEnumerate(editor: vscode.TextEditor) {
    editor.edit(edit => {
        const selection = editor.selection;
        const range = new vscode.Range(selection.start, selection.end);
        const text = editor.document.getText(range);
        const sequence = inferSequenceFromFirstSelection(text);
        editor.selections.forEach((selection, index) => {
            edit.replace(selection, sequence(index));
        });
    });
}
