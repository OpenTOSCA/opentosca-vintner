--- 
title: Secure CSAR
tags:
- Specification
---

--8<-- "enumerate.html"

# Secure Cloud Service Archive 1.0 Release Candidate

This document specifies the concept of a Secure Cloud Service Archive (sCSAR).
The specification is under active development and is not backwards compatible with any previous versions.

## Secure Cloud Service Archive

Sign the CSAR using `RSA` with `SHA256` and place the signature under the name of the CSAR appended with `.asc`.
For example, if the CSAR is named `example.csar`, then the signature file is named `example.csar.asc`.
An RSA key length of 4096 is adviced.
The CSAR and signature might be distributed in a ZIP file with the extension `.scsar` having the following structure.

| File                    | Description                                                                               |
|-------------------------|-------------------------------------------------------------------------------------------|
| `<CSAR Name>.csar`      | The CSAR.                                                                                 |
| `<CSAR Name>.csar.asc`  | The signature of the CSAR (encoded as `HEX`)                                              |
| `certificate.pem`       | The certificate (encoded as `PEM`) of the signature key used for verifying the signature. |
| `certificate-chain.pem` | The certificate chain (encoded as `PEM`).                                                 |


--8<-- "acd.md"
