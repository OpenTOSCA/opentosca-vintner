VERIFICATION

Verification is intended to assist the Chocolatey moderators and community in verifying that this package's contents are trustworthy.

This package contains a single binary called "vintner.exe" and its signature "vintner.exe.asc".
Verify the signature on Linux as follows.
More information see https://vintner.opentosca.org/installation/#signature

First, import our public key.

```shell
curl https://vintner.opentosca.org/vintner-release.gpg | gpg --import
```

Then verify the signature.
The binary and its signature must be located in the current directory.

```shell
gpg --verify vintner.exe.asc
```

The output should be something as follows.

```text
gpg: assuming signed data in 'vintner.exe'
gpg: Signature made Sun Oct 23 19:12:56 2022 UTC
gpg:                using RSA key 4BB862B810B792CC072D59DB964183A1485881AD
gpg: Good signature from "vintner-release" [unknown]
gpg: WARNING: This key is not certified with a trusted signature!
gpg:          There is no indication that the signature belongs to the owner.
Primary key fingerprint: 4BB8 62B8 10B7 92CC 072D  59DB 9641 83A1 4858 81AD
```
