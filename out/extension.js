"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const os = __importStar(require("os"));
const child_process_1 = require("child_process");
class SimpleWebviewViewProvider {
    constructor(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    resolveWebviewView(webviewView, context, _token) {
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
    getSimpleWebviewContent(webview) {
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
    openFolder(folderPath) {
        if (!fs.existsSync(folderPath)) {
            vscode.window.showErrorMessage(`Folder not found: ${folderPath}`);
            return;
        }
        const platform = os.platform();
        if (platform === 'win32') {
            (0, child_process_1.exec)(`start "" "${folderPath}"`);
        }
        else if (platform === 'darwin') {
            (0, child_process_1.exec)(`open "${folderPath}"`);
        }
        else {
            (0, child_process_1.exec)(`xdg-open "${folderPath}"`);
        }
    }
}
SimpleWebviewViewProvider.viewType = 'ilovemygirlfriend.openview';
function activate(context) {
    const provider = new SimpleWebviewViewProvider(context.extensionUri);
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(SimpleWebviewViewProvider.viewType, provider));
    let disposableShowSimplePanel = vscode.commands.registerCommand("ilovemygirlfriend.openview.focus", () => {
        vscode.commands.executeCommand('workbench.view.extension.custom-activitybar');
    });
    context.subscriptions.push(disposableShowSimplePanel);
}
function deactivate() { }
//# sourceMappingURL=extension.js.map