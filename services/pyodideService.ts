
// services/pyodideService.ts

declare global {
  interface Window {
    loadPyodide: (options?: { indexURL: string }) => Promise<Pyodide>;
  }
}

interface Pyodide {
  runPython: (code: string) => any;
  runPythonAsync: (code: string) => Promise<any>;
  // For stdout/stderr redirection
  globals: {
    get: (key: string) => any;
    set: (key: string, value: any) => void;
  }
}

let pyodideInstance: Pyodide | null = null;
let pyodideLoadingPromise: Promise<Pyodide> | null = null;

/**
 * Loads the Pyodide runtime if it's not already loaded.
 * Returns the Pyodide instance.
 */
async function getPyodide(): Promise<Pyodide> {
  if (pyodideInstance) {
    return pyodideInstance;
  }

  if (pyodideLoadingPromise) {
    return pyodideLoadingPromise;
  }

  if (!window.loadPyodide) {
    throw new Error("Pyodide script not loaded. Please check index.html.");
  }

  console.log("Loading Pyodide runtime...");
  // The loadPyodide function is globally available from the script in index.html
  pyodideLoadingPromise = window.loadPyodide({
    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/"
  }).then((pyodide) => {
    console.log("Pyodide loaded successfully.");
    pyodideInstance = pyodide;
    return pyodide;
  }).catch(err => {
    console.error("Failed to load Pyodide", err);
    pyodideLoadingPromise = null; // Reset on failure to allow retry
    throw err;
  });

  return pyodideLoadingPromise;
}

/**
 * Runs a Python code string using Pyodide and captures stdout/stderr.
 * @param code The Python code to run.
 * @returns An object containing the output and any error messages.
 */
export async function runPythonCode(code: string): Promise<{ output: string; error: string | null }> {
    const pyodide = await getPyodide();

    // Reset stdout/stderr buffers
    pyodide.runPython(`
import sys, io
sys.stdout = io.StringIO()
sys.stderr = io.StringIO()
    `);

    try {
        await pyodide.runPythonAsync(code);
        const stdout = pyodide.runPython("sys.stdout.getvalue()");
        const stderr = pyodide.runPython("sys.stderr.getvalue()");
        
        return {
            output: stdout,
            error: stderr || null
        };

    } catch (e: any) {
        // This catches fatal errors, like syntax errors that Pyodide can't handle in runPythonAsync
        const stderr = pyodide.runPython("sys.stderr.getvalue()");
        return {
            output: '',
            error: stderr ? `${stderr}\n${e.message}`.trim() : e.message
        }
    }
}
