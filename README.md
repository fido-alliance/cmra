# Credential Manager Reference Architecture (CMRA)

FIDO Alliance Digital Credentials Technical Working Group repo for the CMRA specification.

## Development

The following are required before continuing:

- [mise](https://mise.jdx.dev/getting-started.html#installing-mise-cli)

### Setup

Run the following commands to set up your local development environment to work on these specifications:

```sh
mise setup
```

The bikeshed build process will start and re-run on subsequent changes to the related **.bs** file. A corresponding **.html** file will be generated locally (i.e. bikeshed will build **cmra.bs** to **cmra.html**.)

### Viewing the Rendered Specs Locally

```sh
mise serve
```

The specification will be viewable at <http://localhost:8000/cmra.html>
