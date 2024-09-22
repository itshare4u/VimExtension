import * as vscode from 'vscode';
import { exec } from 'child_process';
let lastCursorStyle: vscode.TextEditorCursorStyle | undefined;
let disabledFlag = false;
let lastDisabledFlag = false;
// Function to activate the extension
export function activate(context: vscode.ExtensionContext) {
    // Create an output channel
    const outputChannel = vscode.window.createOutputChannel('Vim Extension');
    outputChannel.appendLine('Extension activated');
    vscode.window.onDidChangeTextEditorOptions(async (e) => {
        if (lastCursorStyle !== e.options.cursorStyle) {
            if (e.options.cursorStyle === 1) {
                lastDisabledFlag = disabledFlag;
                disabledFlag = true;
            } else {
                disabledFlag = lastDisabledFlag;
            }
            lastCursorStyle = e.options.cursorStyle;
        }
    });
    // Register an event listener for when the active text editor changes
    vscode.window.onDidChangeActiveTextEditor((editor) => {
        if (!editor) {
            return;
        }
        handleInputMethodSwitch();
        disabledFlag = false;
    });

    // Register an event listener for when the user clicks in the code editor
    vscode.window.onDidChangeTextEditorSelection((e) => {
        if (disabledFlag) {
            return;
        }
        if (e && !e.selections[0].isEmpty) {
            return;
        }
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            return;
        } 
        handleInputMethodSwitch();
    });

}

export async function handleInputMethodSwitch() {
    // Get configuration settings from vim.autoSwitchInputMethod
    const config = vscode.workspace.getConfiguration('vim.autoSwitchInputMethod');
    const obtainIMCmd = config.get<string>('obtainIMCmd', '/opt/homebrew/bin/im-select');
    const switchIMCmd = config.get<string>('switchIMCmd', '/opt/homebrew/bin/im-select {im}');
    const defaultIM = config.get<string>('defaultIM', 'com.apple.keylayout.ABC');

    // Execute the command to obtain the current input method
    exec(obtainIMCmd, (error, stdout, stderr) => {
        if (error) {
            vscode.window.showErrorMessage(`Error obtaining input method: ${stderr}`);
            return;
        }

        const currentIM = stdout.trim();
        // If the current input method is different from the default, switch to the default input method
        if (currentIM !== defaultIM) {
            exec(switchIMCmd.replace('{im}', defaultIM), (error, stdout, stderr) => {
                if (error) {
                    vscode.window.showErrorMessage(`Error switching input method: ${stderr}`);
                }
            });
        }
    });
}
export function deactivate() { }