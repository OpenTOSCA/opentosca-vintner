# Contributing

Contributions are very much welcome. 
But please follow our guidelines and read the [development guidelines]({{ fix_url('development')}}){target=_blank}.

## Branch Naming Convention

Branches should be names as follows

- `fix/short-title` for bug fixes
- `feature/short-title` for features
- `refactor/short-title` for refactoring
- `project/short-title` for thesis, EnPro or StuPro


## Squash and Merge

Please squash your commits into a single commit with a short but meaningful message and delete the branch afterwards.

## Signed Commits

Commits are required to be signed.
Therefore, you need to register a signing key. 
Your can enable auto-signing for a specific repository with the following command

```
git config commit.gpgsign true
```

For more information see [Telling Git About Your Signing Key](https://docs.github.com/en/authentication/managing-commit-signature-verification/telling-git-about-your-signing-key){target=_blank'} and [Signing Commits](https://docs.github.com/en/authentication/managing-commit-signature-verification/signing-commits){target=_blank}.

## License

Add your name to the `LICENSE` file.