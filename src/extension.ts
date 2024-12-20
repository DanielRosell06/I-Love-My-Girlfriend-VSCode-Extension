import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { exec } from 'child_process';

class SimpleWebviewViewProvider implements vscode.WebviewViewProvider {
  public static readonly viewType = 'ilovemygirlfriend.openview';

  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = this.getSimpleWebviewContent(webviewView.webview);

    webviewView.webview.onDidReceiveMessage((message) => {
      if (message.command === 'openFolder') {
        const imagesPath = path.join(this._extensionUri.fsPath, 'images');
        this.openFolder(imagesPath);
      }
    });
  }

  private getSimpleWebviewContent(webview: vscode.Webview): string {
    const imagePath = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'images', 'doom0.png'));

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              text-align: center;
            }
            img {
              max-width: 100%;
              height: auto;
            }
            button {
              margin-top: 20px;
              padding: 10px 20px;
              font-size: 16px;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
          <h1>I Love My Girlfriend!</h1>
          <img src="${imagePath}" alt="My Girlfriend" />
          <button id="openFolder">Open Images Folder</button>
          <script>
            const vscode = acquireVsCodeApi();
            document.getElementById('openFolder').addEventListener('click', () => {
              vscode.postMessage({ command: 'openFolder' });
            });
          </script>
        </body>
      </html>
    `;
  }

  private openFolder(folderPath: string): void {
    if (!fs.existsSync(folderPath)) {
      vscode.window.showErrorMessage(`Folder not found: ${folderPath}`);
      return;
    }

    const platform = os.platform();

    if (platform === 'win32') {
      exec(`start "" "${folderPath}"`);
    } else if (platform === 'darwin') {
      exec(`open "${folderPath}"`);
    } else {
      exec(`xdg-open "${folderPath}"`);
    }
  }
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new SimpleWebviewViewProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      SimpleWebviewViewProvider.viewType,
      provider
    )
  );

  let disposableShowSimplePanel = vscode.commands.registerCommand(
    "ilovemygirlfriend.openview.focus",
    () => {
      vscode.commands.executeCommand('workbench.view.extension.custom-activitybar');
    }
  );

  context.subscriptions.push(disposableShowSimplePanel);
}

export function deactivate() {}
