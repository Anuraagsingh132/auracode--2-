
import { runPythonCode } from './pyodideService';

declare const sucrase: any;

interface ExecutionResult {
  output: string | null;
  error: string | null;
  html?: string | null;
}

/**
 * Executes user-provided JavaScript code locally.
 * @param code The JavaScript code to execute.
 * @returns A promise that resolves to an ExecutionResult object.
 */
async function runJavaScript(code: string): Promise<ExecutionResult> {
  const logs: string[] = [];
  const originalLog = console.log;
  let executionError: Error | null = null;
  
  console.log = (...args: any[]) => {
    logs.push(args.map(arg => {
      if (typeof arg === 'object' && arg !== null) {
        try {
          return JSON.stringify(arg, null, 2);
        } catch {
          return '[Circular Object]';
        }
      }
      return String(arg);
    }).join(' '));
  };

  try {
    const func = new Function(code);
    await Promise.resolve(func());
  } catch (e) {
    if (e instanceof Error) {
        executionError = e;
    } else {
        executionError = new Error('An unknown execution error occurred.');
    }
  } finally {
    console.log = originalLog;
  }

  return {
    output: logs.join('\n') || null,
    error: executionError ? `${executionError.name}: ${executionError.message}` : null,
  };
}

/**
 * Transpiles and runs TypeScript code.
 * @param code The TypeScript code to execute.
 * @returns A promise that resolves to an ExecutionResult object.
 */
async function runTypeScript(code: string): Promise<ExecutionResult> {
  if (typeof sucrase === 'undefined') {
    return {
      output: null,
      error: 'Sucrase transpiler not loaded. Please check your internet connection and the script tag in index.html.',
    };
  }
  try {
    const transformed = sucrase.transform(code, {
      transforms: ["typescript"],
      filePath: "script.ts" 
    });
    // If transpilation is successful, run the resulting JavaScript
    return await runJavaScript(transformed.code);
  } catch (e) {
    // Catch transpilation errors
    if (e instanceof Error) {
      return { output: null, error: `TypeScript Transpilation Error: ${e.message}` };
    }
    return { output: null, error: 'An unknown error occurred during TypeScript transpilation.' };
  }
}

/**
 * Prepares HTML code for rendering in the preview pane.
 * @param code The HTML code string.
 * @returns A promise that resolves to an ExecutionResult with the HTML content.
 */
async function runHtml(code: string): Promise<ExecutionResult> {
  return { output: null, error: null, html: code };
}


/**
 * Runs Python code in the browser using Pyodide.
 * @param code The Python code to execute.
 * @returns A promise that resolves to an ExecutionResult.
 */
async function runPython(code: string): Promise<ExecutionResult> {
  try {
    const { output, error } = await runPythonCode(code);
    return {
      output: output || null,
      error: error || null,
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred.';
    return {
      output: null,
      error: `Failed to execute Python code: ${errorMessage}`,
    };
  }
}

/**
 * Simulates running C++ code via a remote execution API.
 * @param code The C++ code to execute.
 * @returns A promise that resolves to a simulated ExecutionResult.
 */
async function runCpp(code: string): Promise<ExecutionResult> {
   // Simulate network delay
  await new Promise(res => setTimeout(res, 800));

  if (code.includes('error <<')) {
    return { output: null, error: "CompilationError: 'error' was not declared in this scope." };
  }

  return { output: "Hello C++ World from AuraCode! \n(Simulated C++ Execution)", error: null };
}

/**
 * Simulates running Java code via a remote execution API.
 * @param code The Java code to execute.
 * @returns A promise that resolves to a simulated ExecutionResult.
 */
async function runJava(code: string): Promise<ExecutionResult> {
  await new Promise(res => setTimeout(res, 700));

  if (code.includes('System.out.println(message)')) {
    return { output: null, error: "CompilationError: cannot find symbol\n  symbol:   variable message\n  location: class Main" };
  }

  return { output: "Hello, Java World from AuraCode!\n(Simulated Java Execution)", error: null };
}

/**
 * Simulates running Go code via a remote execution API.
 * @param code The Go code to execute.
 * @returns A promise that resolves to a simulated ExecutionResult.
 */
async function runGo(code: string): Promise<ExecutionResult> {
  await new Promise(res => setTimeout(res, 600));

  if (code.includes('fmt.Println(x)')) {
    return { output: null, error: "CompilationError: undefined: x" };
  }

  return { output: "Hello, Go World from AuraCode!\n(Simulated Go Execution)", error: null };
}

/**
 * Simulates running Dart code.
 * @param code The Dart code to execute.
 * @returns A promise that resolves to a simulated ExecutionResult.
 */
async function runDart(code: string): Promise<ExecutionResult> {
  await new Promise(res => setTimeout(res, 500));
  if (code.includes('cause_error;')) {
    return { output: null, error: "AnalysisError: The function 'cause_error' isn't defined." };
  }
  return { output: "Hello, AuraCode! This is Dart.\nLoop iteration 0\nLoop iteration 1\nLoop iteration 2\n(Simulated Dart Execution)", error: null };
}

/**
 * Simulates running Kotlin code.
 * @param code The Kotlin code to execute.
 * @returns A promise that resolves to a simulated ExecutionResult.
 */
async function runKotlin(code: string): Promise<ExecutionResult> {
  await new Promise(res => setTimeout(res, 500));
  if (code.includes('unknownFunction()')) {
    return { output: null, error: "Unresolved reference: unknownFunction" };
  }
  return { output: "Hello, AuraCode! This is Kotlin.\nItem: Apple\nItem: Banana\nItem: Cherry\n(Simulated Kotlin/JS Execution)", error: null };
}


/**
 * Executes code by delegating to the appropriate language runner.
 * @param code The source code to execute.
 * @param language The language of the source code (e.g., 'javascript', 'python').
 * @returns A promise that resolves to an ExecutionResult object.
 */
export async function runCode(code: string, language: string): Promise<ExecutionResult> {
  switch (language) {
    case 'javascript':
      return runJavaScript(code);
    case 'typescript':
      return runTypeScript(code);
    case 'html':
      return runHtml(code);
    case 'python':
      return runPython(code);
    case 'cpp':
      return runCpp(code);
    case 'java':
      return runJava(code);
    case 'go':
      return runGo(code);
    case 'dart':
      return runDart(code);
    case 'kotlin':
      return runKotlin(code);
    default:
      return {
        output: null,
        error: `Execution for ${language} is not supported yet.`,
      };
  }
}