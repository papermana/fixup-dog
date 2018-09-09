# fixup-dog

> A GitHub App built with [Probot](https://github.com/probot/probot) that's a watchdog for fixup commits in your PRs!

What are fixup commits? It's very simple — just read [this](https://dev.to/smichaelsen/fixing-git-commits---you-always-did-it-wrong-4oi2).

Fixup commits are awesome but you may forget you have some and merge your branch without squashing them. In an ideal world, Github would autosquash on merge but that doesn't happen. So we can use this app.

Remember to add fixup-dog where it says "Require status checks to pass before merging" in section "Branch protection rules" in your repo's settings.

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Contributing

If you have suggestions for how fixup-dog could be improved, or want to report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2018 Dominik Rowicki <dominik.rowicki@netguru.co>
