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
                access_key: '{{SELF.user_name }}',
                secret_key: '{{SELF.user_password }}',
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
                access_key: '{{SELF.user_name }}',
                secret_key: '{{SELF.user_password }}',
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
