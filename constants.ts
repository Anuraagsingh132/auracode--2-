
export const SUPPORTED_LANGUAGES = [
  { id: 'javascript', name: 'JavaScript', filename: 'script.js' },
  { id: 'typescript', name: 'TypeScript', filename: 'script.ts' },
  { id: 'python', name: 'Python', filename: 'script.py' },
  { id: 'html', name: 'HTML', filename: 'index.html' },
  { id: 'cpp', name: 'C++', filename: 'main.cpp' },
  { id: 'java', name: 'Java', filename: 'Main.java' },
  { id: 'go', name: 'Go', filename: 'main.go' },
  { id: 'dart', name: 'Dart', filename: 'main.dart' },
  { id: 'kotlin', name: 'Kotlin', filename: 'App.kt' },
  { id: 'markdown', name: 'Markdown', filename: 'README.md' },
];

export const README_CONTENT = `# Welcome to AuraCode!

This is a dynamic workspace where you can code in multiple languages.

- **Create Files**: Click the '+' icon in the Explorer to create a new file. The language is automatically detected from the extension (e.g., \`.js\`, \`.py\`).
- **Run Python**: Run Python files directly in the browser thanks to Pyodide!
- **Switch Files**: Simply click on a file in the Explorer to open it in the editor.
- **Run Code**: With a code file active, press the "Run" button or use the shortcut \`Cmd/Ctrl+Enter\`.
- **Live Preview**: Run HTML files to see a live preview in the I/O panel.
- **AI Assistance**: Highlight any piece of code to get an explanation, or use the "Ask Aura to Debug" button when you encounter an error.

Happy coding!
`;

export const DEFAULT_CODES: { [key: string]: string } = {
  javascript: `// A function to find the sum of numbers in an array.
// Try changing the code to see different outputs or errors.
function sumArray(numbers) {
  if (!Array.isArray(numbers)) {
    // This check prevents the error. Try removing it!
    throw new TypeError("Input must be an array of numbers.");
  }
  
  let total = 0;
  for (let i = 0; i < numbers.length; i++) {
    total += numbers[i];
  }
  return total;
}

// Successful execution:
const myNumbers = [1, 5, 9, 11, 24];
console.log(\`Result: \${sumArray(myNumbers)}\`);

// To see an error, uncomment the line below, then click "Run".
// The "Ask Aura to Debug" button will appear in the Error tab.
// console.log(sumArray("this is not an array"));
`,
  typescript: `// TypeScript code is transpiled to JavaScript before execution.
// You can use modern features like types, interfaces, and enums.

interface User {
  name: string;
  id: number;
}

const user: User = {
  name: 'Aura',
  id: 1,
};

function greetUser(user: User): string {
  return \`Hello, \${user.name}!\`;
}

console.log(greetUser(user));

// To see a transpilation error, try introducing a syntax error.
// For example, uncomment the line below.
// const x: = 10;
`,
  python: `# A simple Python script to demonstrate execution and imports.
import json

def process_data(data_string):
  """
  Parses a JSON string, extracts names, and prints a greeting for each.
  """
  try:
    data = json.loads(data_string)
    names = [item['name'] for item in data['users']]
    for name in names:
      print(f"Hello, {name} from Python!")
  except json.JSONDecodeError:
    print("Error: Invalid JSON data provided.")
  except KeyError:
    print("Error: 'users' key not found in JSON data.")

# Example of a valid JSON string
json_data = """
{
  "users": [
    { "name": "Alice", "id": 1 },
    { "name": "Bob", "id": 2 }
  ]
}
"""

process_data(json_data)

# To see an error, try passing malformed JSON:
# process_data('{"users": [{"name": "Chris"}]')
`,
  html: `<!DOCTYPE html>
<html>
  <head>
    <title>AuraCode Preview</title>
    <style>
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
                     Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
        background-color: #f0f2f5;
        color: #1c1e21;
        padding: 2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh;
        margin: 0;
      }
      .container {
        text-align: center;
        background-color: #fff;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      }
      h1 {
        color: #7f5af0; /* Aura accent */
      }
      button {
        background-color: #7f5af0;
        color: white;
        border: none;
        padding: 10px 20px;
        border-radius: 5px;
        cursor: pointer;
        font-size: 16px;
        margin-top: 1rem;
      }
      button:hover {
        background-color: #9d86f7;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>Hello from AuraCode!</h1>
      <p>This is a live preview of your HTML file.</p>
      <button onclick="showAlert()">Click Me</button>
    </div>

    <script>
      function showAlert() {
        alert('JavaScript is running in the preview!');
      }
    </script>
  </body>
</html>
`,
  cpp: `// A simple C++ program to demonstrate output.
// Note: Full compilation and I/O handling would happen on a server.
// This is a simulation of running C++ code.
#include <iostream>
#include <vector>
#include <string>

int main() {
    std::vector<std::string> msg {"Hello", "C++", "World", "from", "AuraCode!"};

    for (const std::string& word : msg) {
        std::cout << word << " ";
    }
    std::cout << std::endl;
    
    // Uncomment the line below to simulate a compilation error
    // std::cout << "This line has an error" << error << std::endl;

    return 0;
}
`,
  java: `// A simple Java program to demonstrate output.
// Note: This simulates running a Main class.
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java World from AuraCode!");

        // To see an error, uncomment the line below.
        // System.out.println(message); 
    }
}`,
  go: `// A simple Go program to demonstrate output.
package main

import "fmt"

func main() {
    fmt.Println("Hello, Go World from AuraCode!")

    // To see an error, uncomment the line below.
    // fmt.Println(x)
}`,
  dart: `// Dart execution is simulated for this environment.
// The code is not actually run, but its structure is validated.

void main() {
  var name = 'AuraCode';
  print('Hello, $name! This is Dart.');
  
  // This is a demonstration. A full Dart environment would require a server-side compiler.
  for (int i = 0; i < 3; i++) {
    print('Loop iteration $i');
  }

  // To simulate an error, uncomment the line below.
  // cause_error;
}
`,
  kotlin: `// Kotlin/JS execution is simulated for this environment.
// The code is not run, but is used for demonstration purposes.

fun main() {
    val name = "AuraCode"
    println("Hello, $name! This is Kotlin.")

    val items = listOf("Apple", "Banana", "Cherry")
    for (item in items) {
        println("Item: $item")
    }

    // A real Kotlin/JS setup requires a build process.
    // Uncomment the line below to simulate an error.
    // val error = unknownFunction()
}
`,
  markdown: README_CONTENT,
};