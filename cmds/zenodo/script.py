import json
import requests
import datetime
import os

access_token = os.getenv('ZENODO_ACCESS_TOKEN')
original_id = int(os.getenv('ZENODO_ORIGINAL_ID'))
zenodo_url = os.getenv('ZENODO_URL', 'https://zenodo.org')
zenodo_files = '/tmp/opentosca-vintner-zenodo-files'
vintner_version = os.getenv('VINTNER_VERSION', 'asdfasdf')
log_line = '--------------------------------------------------'

if access_token is None:
    raise Exception('ZENODO_ACCESS_TOKEN not defined')

if vintner_version is None:
    raise Exception('ZENODO_ACCESS_TOKEN not defined')


def create_version(id):
    print(log_line)
    print('Creating a new version')
    r = requests.post(zenodo_url + '/api/deposit/depositions/' + str(id) + '/actions/newversion', params={'access_token': access_token})
    print(r.status_code)
    print(r.json())
    print('Version created')
    return r.json()

def delete_files(version):
    print(log_line)
    print('Deleting existing files')
    if 'files' in version:
        for file in version['files']:
            delete_file(version, file)


def delete_file(version, file):
    print(log_line)
    print('Deleting file ' + file['filename'])
    r = requests.delete(file['links']['self'], params={'access_token': access_token})
    print(r.status_code)
    print(r.content)
    print('File deleted')


def publish_version(version):
    print(log_line)
    print('Publishing version ' + str(version['id']))
    r = requests.post(version['links']['publish'], params={'access_token': access_token})
    print(r.status_code)
    print(r.json())
    print('Version published')


def set_metadata(version):
    print(log_line)
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

    r = requests.put(version['links']['self'], data=json.dumps(data), headers=headers, params={'access_token': access_token})
    print(r.status_code)
    print(r.json())
    print('Metadata set')


def upload_files(version):
    print(log_line)
    print('Uploading files')
    files = [file for file in os.listdir(zenodo_files) if os.path.isfile(os.path.join(zenodo_files, file))]
    for file in files:
        upload_file(version, file)
    print('Files uploaded')


def upload_file(version, file):
    print(log_line)
    print('Uploading file ' + file)

    with open(os.path.join(zenodo_files, file), "rb") as fp:
        r = requests.put(
            "%s/%s" % (version['links']['bucket'], file),
            data=fp,
            params={'access_token': access_token},
        )

    print(r.status_code)
    print(r.json())
    print('File uploaded')


def current_date():
    return datetime.datetime.now().isoformat()[0:10]


def main():
    print('Publishing new Zenodo release')

    version = create_version(original_id)
    delete_files(version)
    set_metadata(version)
    upload_files(version)
    publish_version(version)

    print('Zenodo relase published')

main()