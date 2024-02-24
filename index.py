#Read every html file in the htmz directory except index.html and inject the content of the file into the index.html file.)

import os
import re
import shutil

# Delete the generated-html directory if it exists
if os.path.exists('generated-html'):
    shutil.rmtree('generated-html')
    print('generated-html directory has been deleted')
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
    shutil.copy('html/main.js', 'generated-html/main.js')
    print('main.js has been copied to the generated-html directory')
    # Copy Robots.txt to the generated-html directory using shutil
    shutil.copy('htmz/robots.txt', 'generated-html/robots.txt')
    print('robots.txt has been copied to the generated-html directory')


# Check if argument "hot-reload" is passed
print(os.sys.argv)
if len(os.sys.argv) > 1 and os.sys.argv[1] == 'hot-reload':
    print("Hot-reload is enabled")
    # Make http request to the server
    import urllib.request
    with urllib.request.urlopen('http://localhost:8080/reload') as response:
        html = response.read()
        print("Sending hot-reload request to the server...")
     