# Credential Manager Reference Architecture (CMRA)

FIDO Alliance Digital Credentials Technical Working Group repo for the CMRA document.

## Latest Working Draft

- **HTML Working Draft:** <https://fido-alliance.github.io/cmra/cmra.html>

## Development

The following are required before continuing:

- [mise](https://mise.jdx.dev/getting-started.html#installing-mise-cli)

### Setup

Run the following commands to set up your local development environment to work on this document:

```sh
mise setup
```

The bikeshed build process will start and re-run on subsequent changes to the **.bs** file. A corresponding **.html** file will be generated locally (i.e. bikeshed will build **cmra.bs** to **cmra.html**.)

### Viewing the Rendered Document Locally

```sh
mise serve
```

The document will be viewable at <http://localhost:8000/cmra.html>
