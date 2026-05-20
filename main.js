const { app, BrowserWindow } = require('electron');
const path = require('path');
const { execSync } = require('child_process');
const fs = require('fs');

// Function to check if Ollama is installed
function isOllamaInstalled() {
  try {
    execSync('ollama --version', { stdio: 'ignore' });
    return true;
  } catch (e) {
    return false;
  }
}

// Function to install Ollama (simplified for Linux x64)
function installOllama() {
  console.log('Ollama not found. Installing...');
  // Determine platform and architecture
  const platform = process.platform;
  const arch = process.arch;
  let url = '';
  if (platform === 'linux' && arch === 'x64') {
    url = 'https://github.com/ollama/ollama/releases/latest/download/ollama-linux-amd64.tgz';
  } else if (platform === 'darwin' && arch === 'arm64') {
    url = 'https://github.com/ollama/ollama/releases/latest/download/ollama-darwin-arm64.tgz';
  } else if (platform === 'darwin' && arch === 'x64') {
    url = 'https://github.com/ollama/ollama/releases/latest/download/ollama-darwin-amd64.tgz';
  } else if (platform === 'win32' && arch === 'x64') {
    url = 'https://github.com/ollama/ollama/releases/latest/download/ollama-windows-amd64.zip';
  } else {
    throw new Error(`Unsupported platform: ${platform} ${arch}`);
  }
  // Download and extract (simplified; in production use proper extraction)
  console.log(`Downloading from ${url}`);
  // For brevity, we assume the user will install manually or we use a helper.
  // In a real app, you would download and extract to a known location.
  // Here we just instruct the user.
  console.log(`Please install Ollama manually from ${url} and restart the app.`);
  process.exit(1);
}

// Function to pull the gemma2:2b model
function pullGemmaModel() {
  console.log('Pulling gemma2:2b model...');
  try {
    execSync('ollama pull gemma2:2b', { stdio: 'inherit' });
    console.log('Model pulled successfully.');
  } catch (e) {
    console.error('Failed to pull model:', e.message);
    // Not fatal; maybe model already exists or user can pull later.
  }
}

// Ensure Ollama is installed and model is ready
if (!isOllamaInstalled()) {
  installOllama();
} else {
  pullGemmaModel();
}

// Create the browser window when Electron is ready
function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  // Load the Next.js app (assuming it's built and served locally)
  // For development, we can load from http://localhost:3000
  // For production, we load the built files.
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:3000');
  } else {
    win.loadFile(path.join(__dirname, '../out/index.html'));
  }

  // Open DevTools in development
  if (process.env.NODE_ENV === 'development') {
    win.webContents.openDevTools();
  }
}

// Quit when all windows are closed, except on macOS
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});