export function BashCreateBucket() {
    return [
        'mc alias set minio {{ HOST.application_endpoint }} {{ HOST.access_key }} {{ HOST.secret_key }}',
        'mc mb minio/{{ SELF.storage_name }}',
        'mc admin user add minio {{ SELF.storage_user }} {{ SELF.storage_token }}',
        'mc admin policy attach minio readwrite user={{ SELF.storage_user }}',
    ].join(' && ')
}

export function BashDeleteBucket() {
    return [
        'mc alias set minio {{ HOST.application_endpoint }} {{ HOST.access_key }} {{ HOST.secret_key }}',
        'mc admin policy detach minio readwrite user={{ SELF.storage_user }}',
        'mc admin user rm minio {{ SELF.storage_user }}',
        'mc rm --recursive minio/{{ SELF.storage_name }}',
    ].join(` && `)
}

export function AnsibleCreateBucketTasks() {
    const auth = {
        access_key: '{{ HOST.access_key }}',
        secret_key: '{{ HOST.secret_key }}',
        url: '{{ HOST.application_endpoint }}',
    }

    return [
        // https://galaxy.ansible.com/ui/repo/published/dubzland/minio/content/module/minio_bucket/?version=1.2.0
        {
            name: 'create bucket',
            'dubzland.minio.minio_bucket': {
                name: '{{ SELF.storage_name }}',
                auth,
            },
        },
        // https://galaxy.ansible.com/ui/repo/published/dubzland/minio/content/module/minio_user/?version=1.2.0
        {
            name: 'create user',
            'dubzland.minio.minio_user': {
                access_key: '{{ SELF.storage_user }}',
                secret_key: '{{ SELF.storage_token }}',
                auth,
            },
        },
        // https://galaxy.ansible.com/ui/repo/published/dubzland/minio/content/module/minio_policy/?version=1.2.0
        {
            name: 'create policy',
            'dubzland.minio.minio_policy': {
                name: '{{ SELF.user_name }}',
                statements: [
                    {
                        effect: 'Allow',
                        action: 's3:*',
                        resource: 'arn:aws:s3:::*',
                    },
                ],
                auth,
            },
        },
    ]
}

export function AnsibleDeleteBucketTasks() {
    const auth = {
        access_key: '{{ HOST.access_key }}',
        secret_key: '{{ HOST.secret_key }}',
        url: '{{ HOST.application_endpoint }}',
    }

    return [
        {
            name: 'delete policy',
            'dubzland.minio.minio_policy': {
                name: '{{ SELF.user_name }}',
                statements: [
                    {
                        effect: 'Allow',
                        action: 's3:*',
                        resource: 'arn:aws:s3:::*',
                    },
                ],
                auth,
                state: 'absent',
            },
        },
        {
            name: 'delete user',
            'dubzland.minio.minio_user': {
                access_key: '{{ SELF.storage_user }}',
                secret_key: '{{ SELF.storage_token }}',
                auth,
                state: 'absent',
            },
        },
        {
            name: 'delete bucket',
            'dubzland.minio.minio_bucket': {
                name: '{{ SELF.storage_name }}',
                auth,
                state: 'absent',
            },
        },
    ]
}

export function TerraformMinioProviderImport() {
    return {
        source: 'aminueza/minio',
        version: '2.5.0',
    }
}

export function TerraformMinioProviderConfiguration() {
    return {
        minio_server: '{{ HOST.application_endpoint }}',
        minio_user: '{{ HOST.access_key }}',
        minio_password: '{{ HOST.secret_key }}',
    }
}

//  https://registry.terraform.io/providers/aminueza/minio/latest
export function TerraformMinoBucketResources() {
    return {
        minio_s3_bucket: {
            bucket: [
                {
                    bucket: '{{ SELF.storage_name }}',
                },
            ],
        },
        minio_iam_user: {
            user: [
                {
                    name: '{{ SELF.storage_user }}',
                    secret: '{{ SELF.storage_token }}',
                },
            ],
        },
        minio_iam_policy: {
            depends_on: ['minio_s3_bucket.bucket', 'minio_iam_user.user'],
            policy: [
                {
                    name: '{{ SELF.storage_user }}',
                    policy: `{ "Version":"2012-10-17", "Statement": [ { "Effect": "Allow", "Action": ["s3:*"], "Principal": "{{ SELF.storage_user }}", "Resource": "arn:aws:s3:::*" } ] }`,
                },
            ],
        },
    }
}
