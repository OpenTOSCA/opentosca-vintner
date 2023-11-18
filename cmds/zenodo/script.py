import json
import requests
import datetime
import os

access_token = os.getenv('ZENODO_ACCESS_TOKEN')
original_id = int(os.getenv('ZENODO_ORIGINAL_ID'))
zenodo_url = os.getenv('ZENODO_URL', 'https://zenodo.org')
zenodo_files = '/tmp/opentosca-vintner-zenodo-files'
vintner_version = os.getenv('VINTNER_VERSION')

if access_token is None:
    raise Exception('ZENODO_ACCESS_TOKEN not defined')

if vintner_version is None:
    raise Exception('ZENODO_ACCESS_TOKEN not defined')


def create_version(id):
    r = requests.post(zenodo_url + '/api/deposit/depositions/' + str(id) + '/actions/newversion', params={'access_token': access_token})
    print(r.status_code)
    print(r.json())
    data = r.json()

    # Delete all existing files
    if 'files' in data:
        for file in data['files']:
            r = requests.delete(file['links']['self'], params=params={'access_token': access_token})
            print(r.status_code)
            print(r.json())

    # Set new publish date
    set_metadata(data['id'])

    return data['id']


def publish_version(id):
    r = requests.post(zenodo_url + '/api/deposit/depositions/' + str(id) + '/actions/publish', params={'access_token': access_token})
    print(r.status_code)
    print(r.json())


def set_metadata(id):
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


def upload_files(id):
    files = [file for file in os.listdir(zenodo_files) if os.path.isfile(os.path.join(zenodo_files, file))]
    for file in files:
        upload_file(id, file)


def upload_file(id, file):
    url = zenodo_url + '/api/deposit/depositions/' + str(id) + '/files'
    data = {'name': file}
    files = {'file': open(os.path.join(zenodo_files, file), 'rb')}
    r = requests.post(url, params={'access_token': access_token}, data=data, files=files)
    print(r.status_code)
    print(r.json())


def current_date():
    return datetime.datetime.now().isoformat()[0:10]


version_id = create_version(original_id)
upload_files(version_id)
publish_version(version_id)
