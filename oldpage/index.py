#Read every html file in the htmz directory except index.html and inject the content of the file into the index.html file.)

import os
import re
import shutil

is_hot_reload = len(os.sys.argv) > 1 and os.sys.argv[1] == 'hot-reload'

generated_at = 0
outdated_files = []

def check_outdated_files(directory, file_extension=''):
    for filename in os.listdir(directory):
        if filename.endswith(file_extension):
            file_path = os.path.join(directory, filename)
            file_created_at = os.path.getmtime(file_path)
            if file_created_at > generated_at:
                outdated_files.append(filename)

if os.path.exists('generated-html') and is_hot_reload:
    generated_at = os.path.getctime('generated-html')

    # Check html and css files in htmz directory
    check_outdated_files('htmz', ('.html', '.css'))

    # Check files in assets directories
    assets_directories = ['assets/img', 'assets/pdf', 'assets/js']
    for directory in assets_directories:
        check_outdated_files(directory)
    

    

# Delete the generated-html directory if it exists
if os.path.exists('generated-html') and (len(outdated_files) > 0 or not is_hot_reload):
    shutil.rmtree('generated-html')
    print('generated-html directory has been deleted')
else:
    print('generated-html directory is up to date')
    os.sys.exit(0)
# Create the generated-html directory
os.mkdir('generated-html')
# Open the index.html file
with open('htmz/index.html', 'r') as file:
    index_content = file.read()
    index_content = index_content.replace('#main', '')
    index_content = index_content.replace('./home.html', './index.html')
    index_content = index_content.replace('href="./index.html" class="active"', 'href="./index.html"')
    # Remove iframe-tag
    index_content = re.sub(r'<iframe.*</iframe>', '', index_content, flags=re.DOTALL)
    # Loop through the htmz directory
    for filename in os.listdir('htmz'):
        # Check if the file is an html file and not index.html
        if filename.endswith('.html') and filename != 'index.html':
            # Open the file
            with open(f'htmz/{filename}', 'r') as file:
                # Read the content of the file
                file_content = file.read()
                # Inject the content of the file into the index.html file
                new_file_content = index_content.replace(f'<main id="main"></main>', file_content)
                # Check if the file is the home.html file
                if filename == 'home.html':
                    # Inject the class active into the home.html link
                    new_file_content = new_file_content.replace(f'href="./index.html', f'href="./index.html" class="active"')
                else:
                    new_file_content = new_file_content.replace(f'href="./{filename}"', f'href="./{filename}" class="active"')
                
                # Write the new content to new file
                with open(f'generated-html/{filename}', 'w') as file:
                    file.write(new_file_content)
                    print(f'{filename} has been injected into index.html')
    # Rename the home.html file to index.html
    os.rename('generated-html/home.html', 'generated-html/index.html')
    # Copy reset and style.css to the generated-html directory using shutil
    shutil.copy('htmz/reset.css', 'generated-html/reset.css')
    shutil.copy('htmz/style.css', 'generated-html/style.css')
    print('reset.css and style.css has been copied to the generated-html directory')
    # Copy assets directory to the generated-html directory using shutil
    shutil.copytree('assets/img', 'generated-html/img')
    shutil.copytree('assets/pdf', 'generated-html/pdf')
    print('img directory has been copied to the generated-html directory')
    # Copy the js directory to the generated-html directory using shutil
    shutil.copy('assets/js/main.js', 'generated-html/main.js')
    print('main.js has been copied to the generated-html directory')
    # Copy Robots.txt to the generated-html directory using shutil
    shutil.copy('htmz/robots.txt', 'generated-html/robots.txt')
    print('robots.txt has been copied to the generated-html directory')


# Check if argument "hot-reload" is passed

if is_hot_reload:
    print("Hot-reload is enabled")
    # Make http request to the server
    import urllib.request
    reloaded_files = ' '.join(outdated_files)
    print(f'Outdated files: {reloaded_files}')
    # Url encode the reloaded_files
    reloaded_files = urllib.parse.quote(reloaded_files)

    with urllib.request.urlopen(f'http://localhost:8080/reload?r={reloaded_files}') as response:
        html = response.read()
        print("Sending hot-reload request to the server...")
     