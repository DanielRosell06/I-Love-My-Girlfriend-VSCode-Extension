import * as vscode from 'vscode';
import * as path from 'path';

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
          </style>
        </head>
        <body>
          <h1>I Love My Girlfriend!</h1>
          <img src="${imagePath}" alt="My Girlfriend" />
        </body>
      </html>
    `;
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