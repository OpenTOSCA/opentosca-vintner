# Contributing

Contributions are very much welcome. 
But please follow our guidelines and read [Development](development.md){target=_blank} and our [Code of Conduct](code-of-conduct.md){target=_blank}.

## Branch Naming Convention

Branches should be names as follows

- `fix/short-title` for bug fixes
- `docs/short-title` for documentations
- `feature/short-title` for features
- `refactor/short-title` for refactoring
- `project/short-title` for thesis, EnPro or StuPro

## Squash and Merge

Please squash your commits into a single commit with a short but meaningful message and delete the branch afterwards.
The commit message should not have a link to the merge request.

## Signed Commits

Commits are required to be signed.
Therefore, you need to register a signing key.
For more information see [Generating a new GPG key](https://docs.github.com/en/authentication/managing-commit-signature-verification/generating-a-new-gpg-key){target=_blank}, [Adding a GPG key to your GitHub account](https://docs.github.com/en/authentication/managing-commit-signature-verification/adding-a-gpg-key-to-your-github-account){target=_blank}, [Telling Git About Your Signing Key](https://docs.github.com/en/authentication/managing-commit-signature-verification/telling-git-about-your-signing-key){target=_blank} and [Signing Commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits){target=_blank}.

You can enable auto-signing for a specific repository with the following command

```linenums="1"
git config commit.gpgsign true
```

## License

Add your name to the `LICENSE` file.