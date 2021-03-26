
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
