import os

def count_lines_of_code(start_path):
    """
    Counts the total number of lines of code in a given directory and its subdirectories.
    Skips specified file types and directories.
    """
    total_lines = 0
    # Files and directories to ignore
    ignored_extensions = ['.pyc', '.git', '.DS_Store', '.log', '.json', '.md', '.txt', '.lock', '.xml', '.yml', '.yaml', '.toml', '.ico', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.webmanifest', '.map', '.woff', '.woff2', '.ttf', '.eot', '.scss', '.sass', '.css', '.min.css', '.eslintrc.js', '.prettierrc.js', '.editorconfig', '.browserslistrc', '.env', '.example', '.gitignore', '.npmignore', 'yarn.lock', 'package-lock.json', 'tsconfig.json']
    ignored_dirs = ['node_modules', '.git', '.vscode', '__pycache__', 'dist', 'build']

    for dirpath, dirnames, filenames in os.walk(start_path):
        # Modify dirnames in-place to skip ignored directories
        dirnames[:] = [d for d in dirnames if d not in ignored_dirs]

        for filename in filenames:
            _, ext = os.path.splitext(filename)
            if ext not in ignored_extensions:
                file_path = os.path.join(dirpath, filename)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        total_lines += len(f.readlines())
                except Exception as e:
                    print(f"Could not read file {file_path}: {e}")
    return total_lines

if __name__ == "__main__":
    frontend_path = 'D:/Projects/FYTR/frontend'
    backend_path = 'D:/Projects/FYTR/backend'

    print(f"Counting lines in {frontend_path}...")
    frontend_lines = count_lines_of_code(frontend_path)
    print(f"Total lines in frontend: {frontend_lines}")

    print(f"Counting lines in {backend_path}...")
    backend_lines = count_lines_of_code(backend_path)
    print(f"Total lines in backend: {backend_lines}")

    total_project_lines = frontend_lines + backend_lines
    print(f"\nTotal lines of code in the entire project: {total_project_lines}")
