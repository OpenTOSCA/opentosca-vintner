import json
import requests
import datetime
import os

access_token = os.getenv('ZENODO_ACCESS_TOKEN', 'H5asXH8F3sfBfx3JxbrO0MsWLbpLHi2Rxt4QwfVJZXTQoHG3a2AgYoTQztS7')
original_id = int(os.getenv('ZENODO_ORIGINAL_ID', '91'))
zenodo_url = os.getenv('ZENODO_URL', 'https://sandbox.zenodo.org')
zenodo_files = '/tmp/opentosca-vintner-zenodo-files'
vintner_version = os.getenv('VINTNER_VERSION', 'asdfasdf')

if access_token is None:
    raise Exception('ZENODO_ACCESS_TOKEN not defined')

if vintner_version is None:
    raise Exception('ZENODO_ACCESS_TOKEN not defined')


def create_version(id):
    print('Creating a new version')
    r = requests.post(zenodo_url + '/api/deposit/depositions/' + str(id) + '/actions/newversion', params={'access_token': access_token})
    print(r.status_code)
    print(r.json())

    print('Version created')
    data = r.json()

    # Delete all existing files
    if 'files' in data:
        print('Deleting existing files')
        for file in data['files']:
            print('Deleting file ' + file['filename'])
            r = requests.delete(file['links']['self'], params={'access_token': access_token})
            print(r.status_code)
            print(r.content)
            print('File deleted')

    # Set new publish date
    set_metadata(data['id'])

    return data['id']


def publish_version(id):
    print('Publishing version ' + str(id))
    r = requests.post(zenodo_url + '/api/deposit/depositions/' + str(id) + '/actions/publish', params={'access_token': access_token})
    print(r.status_code)
    print(r.json())
    print('Version published')


def set_metadata(id):
    print('Setting metadata')
    data = {"metadata": {
                 "title": "OpenTOSCA Vintner",
                 "publication_date": current_date(),
                 "access_right": "open",
                 "creators": [
                   {
                     "name": "Stötzner, Miles",
                     "affiliation": "University of Stuttgart",
                     "orcid": "0000-0003-1538-5516"
                   }
                 ],
                 "license": "apache2.0",
                 "imprint_publisher": "Zenodo",
                 "upload_type": "software",
                 "description": "OpenTOSCA Vintner is a TOSCA preprocessing and management layer which is able to deploy applications based on TOSCA orchestrator plugins. Preprocessing includes, e.g., the resolving of deployment variability. Please check out our GitHub repository: https://github.com/OpenTOSCA/opentosca-vintner",
                 "keywords": ["OpenTOSCA", "Vintner", "TOSCA", "Variability4TOSCA", "variability", "variants", "deployment", "orchestration", "management", "open-source", "open source", "cloud"],
                 "notes": "This project was partially funded by the German Federal Ministry for Economic Affairs and Climate Action (BMWK) as part of the Software-Defined Car (SofDCar) project (19S21002).",
                 "version": vintner_version,
               },
         }
    headers = {"Content-Type": "application/json"}

    r = requests.put(zenodo_url + '/api/deposit/depositions/' + str(id), data=json.dumps(data), headers=headers, params={'access_token': access_token})
    print(r.status_code)
    print(r.json())
    print('Metadata set')


def upload_files(id):
    print('Uploading files')
    files = [file for file in os.listdir(zenodo_files) if os.path.isfile(os.path.join(zenodo_files, file))]
    for file in files:
        upload_file(id, file)
    print('Files uploaded')


def upload_file(id, file):
    print('Uploading file ' + file)
    url = zenodo_url + '/api/deposit/depositions/' + str(id) + '/files'
    data = {'name': file}
    files = {'file': open(os.path.join(zenodo_files, file), 'rb')}
    r = requests.post(url, params={'access_token': access_token}, data=data, files=files)
    print(r.status_code)
    print(r.json())
    print('File uploaded')

def current_date():
    return datetime.datetime.now().isoformat()[0:10]


print('Publishing new Zenodo release')
version_id = create_version(original_id)
upload_files(version_id)
publish_version(version_id)
print('Zenodo relase published')
